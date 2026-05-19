from __future__ import annotations

import asyncio
import uuid as uuid_lib

import structlog

from app.worker.celery_app import celery_app

log = structlog.get_logger()

# Hard wall-clock limit for the entire task (Gemini + DB) — 90 seconds.
# Prevents the Celery worker process from hanging indefinitely when the
# Google API is unreachable from this network.
_TASK_TIMEOUT_SECONDS = 90


@celery_app.task(
    name="app.worker.tasks.trigger_ai_trade.trigger_ai_trade",
    bind=True,
    max_retries=2,           # Reduced: agent already has internal retries
    default_retry_delay=15,  # Faster retry since fallback is now instant
    soft_time_limit=_TASK_TIMEOUT_SECONDS,
    time_limit=_TASK_TIMEOUT_SECONDS + 10,
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
      1. Call ai/agent.py  → get TradeDecision (LLM with timeout + smart fallback)
      2. Call TradingService → persist decision (all DB writes in service layer)

    This task intentionally has NO direct repository or model imports.
    """
    log.info("trigger_ai_trade.start", user_id=user_id, amount=amount)
    try:
        result = asyncio.run(_execute(user_id, saving_id, amount))
        log.info("trigger_ai_trade.done", **result)
        return result
    except Exception as exc:
        log.error("trigger_ai_trade.error", error=type(exc).__name__, detail=str(exc)[:300])
        raise self.retry(exc=exc) from exc


async def _execute(
    user_id: str,
    saving_id: str | None,
    amount: float,
) -> dict:
    """
    Async implementation:
      ai/agent → TradeDecision  (Gemini with timeout OR smart deterministic fallback)
      services/TradingService.execute_trade_decision → Trade (DB write)

    The agent module now guarantees a valid TradeDecision is always returned —
    either from Gemini or from the built-in sentiment-based fallback engine.
    No bare except + hardcoded "buy BIST100" fallback needed here anymore.
    """
    from app.ai.agent import run_trading_agent
    from app.db.base import async_session_factory
    from app.services.trading_service import TradingService

    # ── Step 1: AI decision (pure LLM / fallback, no DB) ─────────────────────
    decision = await run_trading_agent()
    log.info(
        "trigger_ai_trade.decision",
        action=decision.action,
        asset=decision.asset,
        confidence=decision.confidence_score,
    )

    # ── Step 2: Persist via service layer (all DB logic lives there) ──────────
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
