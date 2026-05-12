from __future__ import annotations

import asyncio
import uuid as uuid_lib

import structlog

from app.worker.celery_app import celery_app

log = structlog.get_logger()


@celery_app.task(
    name="app.worker.tasks.trigger_ai_trade.trigger_ai_trade",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def trigger_ai_trade(
    self,
    user_id: str,
    saving_id: str | None,
    amount: float,
) -> dict:  # type: ignore[no-untyped-def]
    """
    Celery task: thin coordinator.

    Responsibility:
      1. Call ai/agent.py  → get TradeDecision (LLM logic, no DB)
      2. Call TradingService → persist decision (all DB writes in service layer)

    This task intentionally has NO direct repository or model imports.
    """
    log.info("trigger_ai_trade.start", user_id=user_id, amount=amount)
    try:
        result = asyncio.run(_execute(user_id, saving_id, amount))
        log.info("trigger_ai_trade.done", **result)
        return result
    except Exception as exc:
        log.error("trigger_ai_trade.error", error=str(exc))
        raise self.retry(exc=exc) from exc


async def _execute(
    user_id: str,
    saving_id: str | None,
    amount: float,
) -> dict:
    """
    Async implementation:
      ai/agent → TradeDecision
      services/TradingService.execute_trade_decision → Trade (DB write)
    """
    from app.ai.agent import run_trading_agent
    from app.db.base import async_session_factory
    from app.services.trading_service import TradingService

    # ── Step 1: AI decision (pure LLM, no DB) ─────────────────────────────────
    try:
        decision = await run_trading_agent()
    except Exception as exc:
        from app.ai.schemas import TradeDecision

        log.warning("trigger_ai_trade.agent_fallback", error=str(exc))
        decision = TradeDecision(
            action="buy",
            asset="BIST100",
            confidence_score=0.55,
            reasoning=(
                "Gemini analysis was unavailable, so the demo risk fallback allocated "
                "the spare-change pool to BIST100."
            ),
        )

    # ── Step 2: Persist via service layer (all DB logic lives there) ───────────
    sid = uuid_lib.UUID(saving_id) if saving_id else None
    async with async_session_factory() as session:
        svc = TradingService(session)
        trade = await svc.execute_trade_decision(
            user_id=user_id,
            decision=decision,
            amount=amount,
            saving_id=sid,
            debit_savings=False,
        )
        await session.commit()

    return {
        "trade_id": str(trade.id),
        "action": decision.action,
        "asset": decision.asset,
        "confidence": decision.confidence_score,
        "amount": amount,
    }
