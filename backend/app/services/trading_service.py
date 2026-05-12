from __future__ import annotations

import uuid

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.schemas import TradeDecision
from app.db.models.trade import Trade, TradeAction, TradeStatus
from app.repositories.saving_entry_repo import SavingEntryRepository
from app.repositories.saving_repo import SavingRepository
from app.repositories.trade_repo import TradeRepository

log = structlog.get_logger()


class TradingService:
    """
    Orchestrates AI agent trade execution.

    Responsibility boundary (claude.md rule):
    - app/ai/     → prompt engineering & LLM orchestration only
    - app/services/ → ALL database reads/writes for trades
    - app/worker/  → dispatches task, then delegates to this service
    """

    def __init__(self, session: AsyncSession) -> None:
        self._trade_repo = TradeRepository(session)
        self._saving_repo = SavingRepository(session)
        self._saving_entries = SavingEntryRepository(session)

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
        mock_price: float = 100.0,
    ) -> Trade:
        """
        Persist a TradeDecision returned by the AI agent.
        Called from the Celery task — all DB writes live here, not in the task.

        Flow:
          Celery task → ai/agent.py (returns TradeDecision) → this method (writes DB)
        """
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

        # Execute (mock/simulated in hackathon scope)
        await self._trade_repo.mark_executed(
            trade.id, mock_price, TradeStatus.SIMULATED
        )
        await self._saving_entries.create_investment_debit(
            user_id=user_id,
            amount=amount,
            trade_id=trade.id,
            saving_id=saving_id,
            description=f"Simulated investment in {decision.asset}",
        )
        log.info("trade.simulated", trade_id=str(trade.id), price=mock_price)

        return trade

    async def get_trade_history(self, user_id: str, limit: int = 20) -> list[Trade]:
        return await self._trade_repo.list_by_user(user_id, limit)
