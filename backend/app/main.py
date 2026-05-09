from __future__ import annotations

import structlog
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.db.base import create_tables
from app.api.v1.router import api_v1_router

log = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Startup / shutdown lifecycle handler."""
    log.info("startup", env=settings.app_env)
    await create_tables()
    yield
    log.info("shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title="BTK Hackathon 2026 — Trading Platform API",
        description=(
            "Micro-savings & AI-driven algorithmic trading platform. "
            "Rounds up bank transactions and invests the difference via a Gemini-powered agent."
        ),
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
        debug=settings.app_debug,
    )

    # ── CORS (future frontend) ──────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://localhost:5173"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routes ──────────────────────────────────────────────
    app.include_router(api_v1_router, prefix="/api/v1")

    # ── Health check ────────────────────────────────────────
    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.app_env}

    # ── Global exception handler ─────────────────────────────
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        log.error("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    return app


app = create_app()
