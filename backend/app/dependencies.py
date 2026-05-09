from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Annotated

import redis.asyncio as aioredis
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.core.redis import RedisCache, get_async_redis
from app.db.base import async_session_factory


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async SQLAlchemy session per request."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def get_redis_cache(
    settings: Annotated[Settings, Depends(get_settings)],
) -> AsyncGenerator[RedisCache, None]:
    """Yield a RedisCache instance per request (uses app/core/redis.py)."""
    client = get_async_redis()
    try:
        yield RedisCache(client)
    finally:
        await client.aclose()


# ── Annotated type aliases for cleaner route signatures ──────────
DBSession = Annotated[AsyncSession, Depends(get_db)]
RedisCacheDep = Annotated[RedisCache, Depends(get_redis_cache)]
AppSettings = Annotated[Settings, Depends(get_settings)]
