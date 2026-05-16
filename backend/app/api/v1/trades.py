from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.dependencies import DBSession
from app.schemas.trade import CreatePaperTradeRequest, TradeResponse, TriggerTradeRequest
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


@router.post(
    "/paper",
    response_model=TradeResponse,
    status_code=201,
    summary="Open a user-selected paper position",
)
async def create_paper_trade(payload: CreatePaperTradeRequest, db: DBSession) -> TradeResponse:
    svc = TradingService(db)
    try:
        trade = await svc.create_user_paper_trade(
            user_id=payload.user_id,
            asset=payload.asset,
            amount=payload.amount,
            confidence_score=payload.confidence_score,
            reasoning=payload.reasoning,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return TradeResponse.model_validate(trade)


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
