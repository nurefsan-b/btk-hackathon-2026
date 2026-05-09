from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.db.models.saving import SavingStatus


class SavingResponse(BaseModel):
    id: uuid.UUID
    user_id: str
    week_start: datetime
    week_end: datetime
    total_amount: float
    status: SavingStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SavingsSummary(BaseModel):
    user_id: str
    total_pending: float
    total_invested: float
    savings: list[SavingResponse]
