from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.transaction import BankTransaction
from app.schemas.transaction import TransactionCreate


class TransactionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(self, data: TransactionCreate, rounded: float, diff: float) -> BankTransaction:
        tx = BankTransaction(
            user_id=data.user_id,
            amount=data.amount,
            rounded_amount=rounded,
            round_up_diff=diff,
            merchant=data.merchant,
            description=data.description,
            currency=data.currency,
        )
        self._session.add(tx)
        await self._session.flush()
        await self._session.refresh(tx)
        return tx

    async def get_by_id(self, tx_id: uuid.UUID) -> BankTransaction | None:
        result = await self._session.execute(
            select(BankTransaction).where(BankTransaction.id == tx_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str, limit: int = 50) -> list[BankTransaction]:
        result = await self._session.execute(
            select(BankTransaction)
            .where(BankTransaction.user_id == user_id)
            .order_by(BankTransaction.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
