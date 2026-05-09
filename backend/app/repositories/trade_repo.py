from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.trade import Trade, TradeAction, TradeStatus


class TradeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create(
        self,
        user_id: str,
        action: TradeAction,
        asset: str,
        amount_invested: float,
        confidence_score: float,
        reasoning: str,
        saving_id: uuid.UUID | None = None,
    ) -> Trade:
        trade = Trade(
            user_id=user_id,
            saving_id=saving_id,
            action=action,
            asset=asset,
            amount_invested=amount_invested,
            confidence_score=confidence_score,
            reasoning=reasoning,
            status=TradeStatus.PENDING,
        )
        self._session.add(trade)
        await self._session.flush()
        await self._session.refresh(trade)
        return trade

    async def mark_executed(
        self,
        trade_id: uuid.UUID,
        executed_price: float,
        status: TradeStatus = TradeStatus.EXECUTED,
    ) -> Trade | None:
        trade = await self.get_by_id(trade_id)
        if trade:
            trade.status = status
            trade.executed_price = executed_price
            trade.executed_at = datetime.now(timezone.utc)
            await self._session.flush()
        return trade

    async def get_by_id(self, trade_id: uuid.UUID) -> Trade | None:
        result = await self._session.execute(
            select(Trade).where(Trade.id == trade_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(self, user_id: str, limit: int = 20) -> list[Trade]:
        result = await self._session.execute(
            select(Trade)
            .where(Trade.user_id == user_id)
            .order_by(Trade.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())
