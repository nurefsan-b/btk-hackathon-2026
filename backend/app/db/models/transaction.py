from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BankTransaction(Base):
    """Simulated incoming bank transaction."""

    __tablename__ = "bank_transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    rounded_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    round_up_diff: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(String(512), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="TRY")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
    )
