from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import DateTime, Float, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TradeAction(StrEnum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class TradeStatus(StrEnum):
    PENDING = "pending"
    PAPER = "paper"
    EXECUTED = "executed"
    FAILED = "failed"
    SIMULATED = "simulated"


class Trade(Base):
    """AI agent trade decision and execution record."""

    __tablename__ = "trades"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    saving_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )

    # ── AI Decision ──────────────────────────────────
    action: Mapped[TradeAction] = mapped_column(String(10), nullable=False)
    asset: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g. "BIST100", "XAU"
    amount_invested: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    reasoning: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Execution ─────────────────────────────────────
    status: Mapped[TradeStatus] = mapped_column(
        String(20), default=TradeStatus.PENDING, nullable=False
    )
    executed_price: Mapped[float | None] = mapped_column(Numeric(16, 4), nullable=True)
    profit_loss: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(UTC),
    )
    executed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
