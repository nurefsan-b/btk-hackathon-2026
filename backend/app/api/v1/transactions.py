from __future__ import annotations

from fastapi import APIRouter, Depends

from app.api.v1.auth import get_current_user
from app.dependencies import DBSession
from app.schemas.auth import UserResponse
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.services.transaction_service import TransactionService

router = APIRouter()


@router.post(
    "/",
    response_model=TransactionResponse,
    status_code=201,
    summary="Simulate a bank transaction",
    description=(
        "Accepts a transaction amount, applies round-up logic (nearest 10 TRY), "
        "records the difference as a micro-saving, and returns the processed transaction."
    ),
)
async def create_transaction(
    payload: TransactionCreate,
    db: DBSession,
) -> TransactionResponse:
    svc = TransactionService(db)
    tx = await svc.process_transaction(payload)
    return TransactionResponse.model_validate(tx)


@router.get(
    "/",
    response_model=list[TransactionResponse],
    summary="Get user's transaction history",
)
async def list_transactions(
    db: DBSession,
    limit: int = 50,
    current_user: UserResponse = Depends(get_current_user),
) -> list[TransactionResponse]:
    svc = TransactionService(db)
    txs = await svc.get_user_transactions(str(current_user.id), limit)
    return [TransactionResponse.model_validate(tx) for tx in txs]
