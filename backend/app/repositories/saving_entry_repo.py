from __future__ import annotations

import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.saving_entry import SavingEntry, SavingEntryType


class SavingEntryRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_round_up(
        self,
        *,
        user_id: str,
        amount: float,
        currency: str,
        transaction_id: uuid.UUID,
        description: str | None = None,
    ) -> SavingEntry | None:
        if amount <= 0:
            return None

        entry = SavingEntry(
            user_id=user_id,
            entry_type=SavingEntryType.ROUND_UP_COLLECTED,
            amount=round(amount, 2),
            currency=currency,
            transaction_id=transaction_id,
            description=description,
        )
        self._session.add(entry)
        await self._session.flush()
        await self._session.refresh(entry)
        return entry

    async def create_investment_debit(
        self,
        *,
        user_id: str,
        amount: float,
        currency: str = "TRY",
        trade_id: uuid.UUID | None = None,
        saving_id: uuid.UUID | None = None,
        description: str | None = None,
    ) -> SavingEntry | None:
        if amount <= 0:
            return None

        entry = SavingEntry(
            user_id=user_id,
            entry_type=SavingEntryType.INVESTMENT_DEBIT,
            amount=-round(amount, 2),
            currency=currency,
            trade_id=trade_id,
            saving_id=saving_id,
            description=description,
        )
        self._session.add(entry)
        await self._session.flush()
        await self._session.refresh(entry)
        return entry

    async def list_by_user(self, user_id: str) -> list[SavingEntry]:
        result = await self._session.execute(
            select(SavingEntry)
            .where(SavingEntry.user_id == user_id)
            .order_by(SavingEntry.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_pending_balance(self, user_id: str) -> float:
        result = await self._session.execute(
            select(func.coalesce(func.sum(SavingEntry.amount), 0)).where(
                SavingEntry.user_id == user_id
            )
        )
        return round(max(float(result.scalar_one()), 0.0), 2)
