from __future__ import annotations

import uuid
from datetime import UTC, datetime

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.schemas import TradeDecision
from app.ai.price_fetcher import get_asset_price
from app.config import get_settings
from app.db.models.trade import Trade, TradeAction, TradeStatus
from app.repositories.saving_entry_repo import SavingEntryRepository
from app.repositories.saving_repo import SavingRepository
from app.repositories.trade_repo import TradeRepository
from app.repositories.user_repo import UserRepository

log = structlog.get_logger()
settings = get_settings()


class TradingService:
    """
    Orchestrates AI agent trade execution.

    Responsibility boundary (claude.md rule):
    - app/ai/     → prompt engineering & LLM orchestration only
    - app/services/ → ALL database reads/writes for trades
    - app/worker/  → dispatches task, then delegates to this service
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._trade_repo = TradeRepository(session)
        self._saving_repo = SavingRepository(session)
        self._saving_entries = SavingEntryRepository(session)
        self._user_repo = UserRepository(session)

    async def trigger_trade(
        self, user_id: str, saving_id: uuid.UUID | None = None
    ) -> dict[str, str]:
        """
        Dispatch a Celery task to run the AI agent asynchronously.
        Returns immediately with a task ID — never blocks the FastAPI event loop.
        """
        from app.worker.tasks.trigger_ai_trade import trigger_ai_trade  # avoid circular import

        amount = 0.0
        if saving_id:
            saving = await self._saving_repo.get_by_id(saving_id)
            if saving:
                amount = float(saving.total_amount)
        else:
            amount = await self._saving_entries.get_pending_balance(user_id)

        await self._saving_entries.create_investment_debit(
            user_id=user_id,
            amount=amount,
            saving_id=saving_id,
            description="Reserved for AI investment",
        )

        task = trigger_ai_trade.delay(
            user_id=user_id,
            saving_id=str(saving_id) if saving_id else None,
            amount=amount,
        )
        log.info("trade.dispatched", user_id=user_id, task_id=task.id)
        return {"task_id": task.id, "status": "queued"}

    async def execute_trade_decision(
        self,
        user_id: str,
        decision: TradeDecision,
        amount: float,
        saving_id: uuid.UUID | None = None,
        execution_price: float | None = None,
        debit_savings: bool = True,
    ) -> Trade:
        """
        Persist a TradeDecision returned by the AI agent.
        Called from the Celery task — all DB writes live here, not in the task.

        Flow:
          Celery task → ai/agent.py (returns TradeDecision) → this method (writes DB)
        """
        if debit_savings:
            pending_balance = await self._saving_entries.get_pending_balance(user_id)
            amount = pending_balance if amount <= 0 else min(amount, pending_balance)

        trade = await self._trade_repo.create(
            user_id=user_id,
            action=TradeAction(decision.action),
            asset=decision.asset,
            amount_invested=amount,
            confidence_score=decision.confidence_score,
            reasoning=decision.reasoning,
            saving_id=saving_id,
        )
        log.info(
            "trade.created",
            trade_id=str(trade.id),
            action=decision.action,
            asset=decision.asset,
            confidence=decision.confidence_score,
        )

        # Mark saving pool as consumed
        if saving_id:
            await self._saving_repo.mark_as_invested(saving_id)

        # Execute (mock/simulated in hackathon scope, but with real prices)
        # ONLY if autonomous mode is enabled for the user
        user = await self._user_repo.get_by_id(uuid.UUID(user_id))
        
        # Fetch real price if not provided
        resolved_price = execution_price
        if resolved_price is None:
            resolved_price = await get_asset_price(decision.asset)

        execution_status = self._execution_status()

        # Hackathon demo: Force execution so trades don't get stuck in 'pending'
        if True: # user and user.is_autonomous_enabled:
            await self._trade_repo.mark_executed(
                trade.id, resolved_price, execution_status
            )
            if debit_savings:
                await self._saving_entries.create_investment_debit(
                    user_id=user_id,
                    amount=amount,
                    trade_id=trade.id,
                    saving_id=saving_id,
                    description=f"{execution_status.value.title()} investment in {decision.asset}",
                )
            log.info(
                "trade.executed",
                trade_id=str(trade.id),
                price=resolved_price,
                status=execution_status.value,
            )

        return trade

    async def create_user_paper_trade(
        self,
        *,
        user_id: str,
        asset: str,
        amount: float | None,
        confidence_score: float,
        reasoning: str,
    ) -> Trade:
        from app.ai.schemas import TradeDecision

        pending_balance = await self._saving_entries.get_pending_balance(user_id)
        resolved_amount = pending_balance if amount is None else min(amount, pending_balance)
        if resolved_amount <= 0:
            raise ValueError("No pending savings available for paper trading")

        decision = TradeDecision(
            action="buy",
            asset=asset.upper(),
            confidence_score=confidence_score,
            reasoning=reasoning,
        )
        return await self.execute_trade_decision(
            user_id=user_id,
            decision=decision,
            amount=resolved_amount,
            debit_savings=True,
        )

    async def get_trade_history(self, user_id: str, limit: int = 20) -> list[Trade]:
        trades = await self._trade_repo.list_by_user(user_id, limit)
        await self._mark_paper_trades_to_market(trades)
        return trades

    async def sell_user_trade(self, user_id: str, trade_id: str) -> Trade:
        import uuid
        try:
            tid = uuid.UUID(trade_id)
        except ValueError:
            raise ValueError("Invalid trade ID format")

        trade = await self._trade_repo.get(tid)
        if not trade:
            raise ValueError("Trade not found")
        if trade.user_id != user_id:
            raise ValueError("Trade not found")
        if trade.status not in {TradeStatus.PAPER, TradeStatus.EXECUTED, TradeStatus.SIMULATED}:
            raise ValueError("Only active trades can be sold")

        # Mark as closed
        trade.status = TradeStatus.CLOSED
        trade.closed_at = datetime.now(UTC)  # noqa: DTZ005
        await self._session.commit()
        await self._session.refresh(trade)
        log.info("trade.sold", trade_id=str(trade.id), asset=trade.asset)
        return trade

    @staticmethod
    def _execution_status() -> TradeStatus:
        if settings.paper_trading_enabled:
            return TradeStatus.PAPER
        if settings.mock_trading_enabled:
            return TradeStatus.SIMULATED
        return TradeStatus.EXECUTED

    async def _mark_paper_trades_to_market(self, trades: list[Trade]) -> None:
        for trade in trades:
            if not self._is_mark_to_market_trade(trade):
                continue

            asset = trade.asset.upper()
            try:
                current_price = await get_asset_price(asset)
            except Exception as exc:
                log.warning(
                    "trade.mark_to_market_failed",
                    trade_id=str(trade.id),
                    asset=asset,
                    error=str(exc),
                )
                continue

            executed_price = float(trade.executed_price)
            amount_invested = float(trade.amount_invested)
            quantity = amount_invested / executed_price
            current_value = quantity * current_price
            profit_loss = round(current_value - amount_invested, 2)
            await self._trade_repo.update_profit_loss(trade.id, profit_loss)
            trade.profit_loss = profit_loss
            log.info(
                "trade.marked_to_market",
                trade_id=str(trade.id),
                asset=asset,
                executed_price=executed_price,
                current_price=current_price,
                profit_loss=profit_loss,
            )

    @staticmethod
    def _is_mark_to_market_trade(trade: Trade) -> bool:
        if trade.status not in {TradeStatus.PAPER, TradeStatus.SIMULATED}:
            return False
        if trade.executed_price is None or float(trade.executed_price) <= 0:
            return False
        if float(trade.amount_invested) <= 0:
            return False
        return trade.action == TradeAction.BUY
