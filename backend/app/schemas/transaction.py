from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class TransactionCreate(BaseModel):
    """Input schema for simulating a bank transaction."""

    user_id: str = Field(..., min_length=1, max_length=64)
    amount: float = Field(..., gt=0, description="Original transaction amount in TRY")
    merchant: str | None = Field(None, max_length=255)
    description: str | None = Field(None, max_length=512)
    currency: str = Field("TRY", max_length=3)

    @field_validator("currency")
    @classmethod
    def uppercase_currency(cls, v: str) -> str:
        return v.upper()


class TransactionResponse(BaseModel):
    """Output schema for a processed bank transaction."""

    id: uuid.UUID
    user_id: str
    amount: float
    rounded_amount: float
    round_up_diff: float
    merchant: str | None
    description: str | None
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}
