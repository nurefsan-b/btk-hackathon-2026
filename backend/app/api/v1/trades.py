from __future__ import annotations

import asyncio
import json

import structlog
from fastapi import APIRouter, HTTPException, Request, status
from sse_starlette.sse import EventSourceResponse

from app.dependencies import DBSession
from app.schemas.trade import CreatePaperTradeRequest, TradeResponse, TriggerTradeRequest
from app.services.trading_service import TradingService

log = structlog.get_logger()

router = APIRouter()

# How long to poll before giving up (seconds)
_SSE_TIMEOUT = 300
# Polling interval (seconds)
_SSE_POLL_INTERVAL = 1.5


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
    "/status/{task_id}/stream",
    summary="Stream Celery task status via SSE",
    description=(
        "Opens a Server-Sent Events stream for the given Celery task_id. "
        "Emits a 'trade_done' event when the task completes (or 'trade_error' on failure), "
        "then closes the connection automatically. "
        "Clients should call loadData() upon receiving 'trade_done'."
    ),
)
async def stream_task_status(task_id: str, request: Request) -> EventSourceResponse:
    """
    SSE endpoint — replaces the `window.setTimeout(loadData, 2500)` pattern.

    Flow:
      1. Frontend POSTs to /trades/trigger  → gets {task_id}
      2. Frontend opens GET /trades/status/{task_id}/stream
      3. This endpoint polls the Celery result backend (Redis) every _SSE_POLL_INTERVAL s
      4. When task is READY: send event and close
      5. On disconnect or timeout: generator exits cleanly
    """

    async def _event_generator():
        from celery.result import AsyncResult  # local import to avoid circular dep

        elapsed = 0.0
        log.info("sse.stream_opened", task_id=task_id)

        while elapsed < _SSE_TIMEOUT:
            # Check if client disconnected
            if await request.is_disconnected():
                log.info("sse.client_disconnected", task_id=task_id)
                return

            result = AsyncResult(task_id)
            state = result.state  # PENDING | STARTED | SUCCESS | FAILURE | RETRY

            if state == "SUCCESS":
                payload = result.result or {}
                log.info("sse.task_success", task_id=task_id, payload=payload)
                yield {
                    "event": "trade_done",
                    "data": json.dumps({"task_id": task_id, "state": "SUCCESS", **payload}),
                }
                return

            if state == "FAILURE":
                error_msg = str(result.result) if result.result else "Unknown error"
                log.warning("sse.task_failure", task_id=task_id, error=error_msg)
                yield {
                    "event": "trade_error",
                    "data": json.dumps({"task_id": task_id, "state": "FAILURE", "error": error_msg}),
                }
                return

            # Still running — send a heartbeat so the connection stays alive
            yield {
                "event": "heartbeat",
                "data": json.dumps({"task_id": task_id, "state": state, "elapsed": round(elapsed, 1)}),
            }

            await asyncio.sleep(_SSE_POLL_INTERVAL)
            elapsed += _SSE_POLL_INTERVAL

        # Timeout — tell the client to give up and refresh manually
        log.warning("sse.timeout", task_id=task_id)
        yield {
            "event": "trade_timeout",
            "data": json.dumps({"task_id": task_id, "message": "Task timed out — please refresh."}),
        }

    return EventSourceResponse(_event_generator())


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
