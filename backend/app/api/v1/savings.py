from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user
from app.dependencies import DBSession
from app.schemas.auth import UserResponse
from app.schemas.saving import SavingsSummary
from app.services.saving_service import SavingService

router = APIRouter()


@router.get(
    "/",
    response_model=SavingsSummary,
    summary="Get user's savings summary",
    description="Returns total pending, total invested, and full list of weekly saving records.",
)
async def get_savings(
    db: DBSession,
    current_user: UserResponse = Depends(get_current_user),
) -> SavingsSummary:
    svc = SavingService(db)
    return await svc.get_user_summary(str(current_user.id))


@router.post(
    "/accumulate",
    response_model=dict,
    summary="Manually trigger weekly accumulation (dev/test)",
)
async def trigger_accumulation(
    db: DBSession,
    current_user: UserResponse = Depends(get_current_user),
) -> dict:
    svc = SavingService(db)
    saving = await svc.accumulate_weekly(str(current_user.id))
    if not saving:
        return {"message": "No round-up diffs found to accumulate"}
    return {"saving_id": str(saving.id), "total_amount": float(saving.total_amount)}
