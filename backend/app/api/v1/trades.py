from __future__ import annotations

from fastapi import APIRouter

from app.dependencies import DBSession
from app.schemas.trade import TradeResponse, TriggerTradeRequest
from app.services.trading_service import TradingService

router = APIRouter()


@router.post(
    "/trigger",
    response_model=dict,
    status_code=202,
    summary="Trigger AI trade agent",
    description=(
        "Dispatches the Gemini AI agent as a Celery background task. "
        "Returns immediately with a task_id. "
        "The agent will analyze news and execute a paper trade asynchronously."
    ),
)
async def trigger_trade(payload: TriggerTradeRequest, db: DBSession) -> dict:
    svc = TradingService(db)
    return await svc.trigger_trade(payload.user_id, payload.saving_id)


@router.get(
    "/{user_id}",
    response_model=list[TradeResponse],
    summary="Get user's trade history",
)
async def list_trades(
    user_id: str,
    db: DBSession,
    limit: int = 20,
) -> list[TradeResponse]:
    svc = TradingService(db)
    trades = await svc.get_trade_history(user_id, limit)
    return [TradeResponse.model_validate(t) for t in trades]
