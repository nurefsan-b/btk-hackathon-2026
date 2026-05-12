from __future__ import annotations

from fastapi import APIRouter

from app.api.v1 import auth, transactions, savings, trades

api_v1_router = APIRouter()

api_v1_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["auth"],
)

api_v1_router.include_router(
    transactions.router,
    prefix="/transactions",
    tags=["transactions"],
)
api_v1_router.include_router(
    savings.router,
    prefix="/savings",
    tags=["savings"],
)
api_v1_router.include_router(
    trades.router,
    prefix="/trades",
    tags=["trades"],
)
