from __future__ import annotations

import asyncio

import structlog

from app.worker.celery_app import celery_app

log = structlog.get_logger()


@celery_app.task(name="app.worker.tasks.weekly_accumulation.accumulate_all_users", bind=True)
def accumulate_all_users(self) -> dict:  # type: ignore[no-untyped-def]
    """
    Celery Beat task: runs every Monday at 09:00.
    Accumulates round-up savings for all users and triggers the AI trade agent.
    """
    log.info("weekly_accumulation.start")
    # Note: In production, fetch all user IDs from DB in a sync context
    # For demo, we trigger the trade agent directly
    from app.worker.tasks.trigger_ai_trade import trigger_ai_trade

    result = asyncio.run(_accumulate())
    log.info("weekly_accumulation.complete", result=result)
    return result


async def _accumulate() -> dict:
    from app.db.base import async_session_factory
    from app.services.saving_service import SavingService
    from sqlalchemy import text

    async with async_session_factory() as session:
        # Fetch all distinct user_ids
        result = await session.execute(
            text("SELECT DISTINCT user_id FROM bank_transactions")
        )
        user_ids = [row[0] for row in result.fetchall()]

    log.info("weekly_accumulation.users", count=len(user_ids))

    processed = []
    async with async_session_factory() as session:
        svc = SavingService(session)
        for user_id in user_ids:
            saving = await svc.accumulate_weekly(user_id)
            if saving:
                processed.append({"user_id": user_id, "amount": float(saving.total_amount)})
        await session.commit()

    return {"processed_users": len(processed), "details": processed}
