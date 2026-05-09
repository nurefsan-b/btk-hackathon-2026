from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.db.models.trade import TradeAction, TradeStatus


class TriggerTradeRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=64)
    saving_id: uuid.UUID | None = None


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
