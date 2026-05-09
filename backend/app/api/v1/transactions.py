from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import DBSession
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
    "/{user_id}",
    response_model=list[TransactionResponse],
    summary="Get user's transaction history",
)
async def list_transactions(
    user_id: str,
    db: DBSession,
    limit: int = 50,
) -> list[TransactionResponse]:
    svc = TransactionService(db)
    txs = await svc.get_user_transactions(user_id, limit)
    return [TransactionResponse.model_validate(tx) for tx in txs]
