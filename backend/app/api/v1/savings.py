from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import DBSession
from app.schemas.saving import SavingsSummary
from app.services.saving_service import SavingService

router = APIRouter()


@router.get(
    "/{user_id}",
    response_model=SavingsSummary,
    summary="Get user's savings summary",
    description="Returns total pending, total invested, and full list of weekly saving records.",
)
async def get_savings(user_id: str, db: DBSession) -> SavingsSummary:
    svc = SavingService(db)
    return await svc.get_user_summary(user_id)


@router.post(
    "/{user_id}/accumulate",
    response_model=dict,
    summary="Manually trigger weekly accumulation (dev/test)",
)
async def trigger_accumulation(user_id: str, db: DBSession) -> dict:
    svc = SavingService(db)
    saving = await svc.accumulate_weekly(user_id)
    if not saving:
        return {"message": "No round-up diffs found to accumulate"}
    return {"saving_id": str(saving.id), "total_amount": float(saving.total_amount)}
