from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────
    app_env: Literal["development", "staging", "production"] = "development"
    app_debug: bool = True
    app_secret_key: str = "change-me-in-production"
    log_level: str = "INFO"

    # ── Database ───────────────────────────────────────
    postgres_host: str = "db"
    postgres_port: int = 5432
    postgres_db: str = "btk_hackathon"
    postgres_user: str = "btk_user"
    postgres_password: str = "btk_secret"
    database_url: str = (
        "postgresql+asyncpg://btk_user:btk_secret@db:5432/btk_hackathon"
    )

    # ── Redis ──────────────────────────────────────────
    redis_url: str = "redis://redis:6379/0"

    # ── Celery ─────────────────────────────────────────
    celery_broker_url: str = "redis://redis:6379/0"
    celery_result_backend: str = "redis://redis:6379/1"

    # ── AI / Gemini ────────────────────────────────────
    google_api_key: str = Field(..., description="Google Gemini API key")
    gemini_model: str = "gemini-1.5-pro"

    # ── Auth / Google OAuth ────────────────────────────
    google_client_id: str = ""
    google_client_secret: str = ""
    google_oauth_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    frontend_url: str = "http://localhost:5173"
    access_token_expire_minutes: int = 60 * 24

    # ── News API ───────────────────────────────────────
    news_api_key: str = ""
    news_api_url: str = "https://newsapi.org/v2/everything"

    # ── Trading ────────────────────────────────────────
    mock_trading_enabled: bool = True

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()
