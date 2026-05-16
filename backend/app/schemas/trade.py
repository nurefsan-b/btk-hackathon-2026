from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models.trade import TradeAction, TradeStatus


class TriggerTradeRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=64)
    saving_id: uuid.UUID | None = None


class CreatePaperTradeRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=64)
    asset: str = Field(..., min_length=1, max_length=20)
    amount: float | None = Field(None, gt=0)
    confidence_score: float = Field(0.65, ge=0, le=1)
    reasoning: str = Field(..., min_length=20, max_length=1000)


class TradeResponse(BaseModel):
    id: uuid.UUID
    user_id: str
    saving_id: uuid.UUID | None
    action: TradeAction
    asset: str
    amount_invested: float
    confidence_score: float
    reasoning: str
    status: TradeStatus
    executed_price: float | None
    profit_loss: float | None
    created_at: datetime
    executed_at: datetime | None

    model_config = {"from_attributes": True}
