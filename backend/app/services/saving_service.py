from __future__ import annotations

from datetime import UTC, datetime, timedelta

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.saving import WeeklySaving
from app.db.models.saving_entry import SavingEntryType
from app.repositories.saving_entry_repo import SavingEntryRepository
from app.repositories.saving_repo import SavingRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.saving import SavingsSummary

log = structlog.get_logger()


class SavingService:
    """Handles weekly accumulation of round-up savings."""

    def __init__(self, session: AsyncSession) -> None:
        self._saving_repo = SavingRepository(session)
        self._entry_repo = SavingEntryRepository(session)
        self._tx_repo = TransactionRepository(session)

    async def get_user_summary(self, user_id: str) -> SavingsSummary:
        savings = await self._saving_repo.list_by_user(user_id)
        entries = await self._entry_repo.list_by_user(user_id)
        invested = sum(
            abs(float(entry.amount))
            for entry in entries
            if entry.entry_type == SavingEntryType.INVESTMENT_DEBIT
        )
        pending = sum(float(entry.amount) for entry in entries)
        return SavingsSummary(
            user_id=user_id,
            total_pending=round(max(pending, 0), 2),
            total_invested=round(invested, 2),
            savings=savings,  # type: ignore[arg-type]
        )

    async def accumulate_weekly(self, user_id: str) -> WeeklySaving | None:
        """
        Roll up all un-accumulated round-up diffs for a user into a WeeklySaving.
        Called by Celery Beat every week (or on-demand for testing).
        """
        transactions = await self._tx_repo.list_by_user(user_id, limit=10_000)
        total_diff = sum(float(tx.round_up_diff) for tx in transactions)
        if total_diff <= 0:
            log.info("accumulate_weekly.no_diff", user_id=user_id)
            return None

        now = datetime.now(UTC)
        week_start = now - timedelta(days=7)
        saving = await self._saving_repo.create(
            user_id=user_id,
            week_start=week_start,
            week_end=now,
            total_amount=round(total_diff, 2),
        )
        log.info("accumulate_weekly.done", user_id=user_id, total=total_diff)
        return saving
