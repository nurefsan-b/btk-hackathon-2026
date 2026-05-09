from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.saving import SavingStatus, WeeklySaving


class SavingRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        user_id: str,
        week_start: datetime,
        week_end: datetime,
        total_amount: float,
    ) -> WeeklySaving:
        saving = WeeklySaving(
            user_id=user_id,
            week_start=week_start,
            week_end=week_end,
            total_amount=total_amount,
        )
        self._session.add(saving)
        await self._session.flush()
        await self._session.refresh(saving)
        return saving

    async def get_by_id(self, saving_id: uuid.UUID) -> WeeklySaving | None:
        result = await self._session.execute(
            select(WeeklySaving).where(WeeklySaving.id == saving_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str) -> list[WeeklySaving]:
        result = await self._session.execute(
            select(WeeklySaving)
            .where(WeeklySaving.user_id == user_id)
            .order_by(WeeklySaving.week_start.desc())
        )
        return list(result.scalars().all())

    async def get_pending_by_user(self, user_id: str) -> list[WeeklySaving]:
        result = await self._session.execute(
            select(WeeklySaving).where(
                WeeklySaving.user_id == user_id,
                WeeklySaving.status == SavingStatus.PENDING,
            )
        )
        return list(result.scalars().all())

    async def mark_as_invested(self, saving_id: uuid.UUID) -> None:
        saving = await self.get_by_id(saving_id)
        if saving:
            saving.status = SavingStatus.INVESTED
            await self._session.flush()
