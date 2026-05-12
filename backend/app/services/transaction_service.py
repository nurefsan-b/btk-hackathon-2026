from __future__ import annotations

import math

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.transaction import BankTransaction
from app.repositories.saving_entry_repo import SavingEntryRepository
from app.repositories.transaction_repo import TransactionRepository
from app.schemas.transaction import TransactionCreate

log = structlog.get_logger()


class TransactionService:
    """
    Business logic for processing simulated bank transactions.
    Round-up rule: amount is rounded UP to the nearest 10 TRY.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._repo = TransactionRepository(session)
        self._saving_entries = SavingEntryRepository(session)

    @staticmethod
    def calculate_round_up(amount: float, base: float = 10.0) -> tuple[float, float]:
        """
        Returns (rounded_amount, round_up_diff).
        Example: 87.3 TRY → (90.0, 2.7)
        """
        if amount % base == 0:
            # Already a round number — skip; no savings collected
            return amount, 0.0
        rounded = math.ceil(amount / base) * base
        diff = round(rounded - amount, 2)
        return rounded, diff

    async def process_transaction(self, data: TransactionCreate) -> BankTransaction:
        rounded, diff = self.calculate_round_up(data.amount)
        log.info(
            "processing_transaction",
            user_id=data.user_id,
            amount=data.amount,
            round_up=diff,
        )
        tx = await self._repo.create(data, rounded, diff)
        await self._saving_entries.create_round_up(
            user_id=data.user_id,
            amount=diff,
            currency=data.currency,
            transaction_id=tx.id,
            description=f"Round-up from {data.merchant or data.description or 'transaction'}",
        )
        return tx

    async def get_user_transactions(
        self, user_id: str, limit: int = 50
    ) -> list[BankTransaction]:
        return await self._repo.list_by_user(user_id, limit)
