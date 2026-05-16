from __future__ import annotations

import redis as sync_redis
import redis.asyncio as aioredis
import structlog

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

# ─── Default TTLs ─────────────────────────────────────────────────────────────
TTL_SHORT = 60          # 1 minute  — hot data (latest transaction)
TTL_MEDIUM = 300        # 5 minutes — savings summary per user
TTL_LONG = 3600         # 1 hour    — mock market prices


# ─── Async Client (FastAPI / async context) ───────────────────────────────────

def get_async_redis() -> aioredis.Redis:  # type: ignore[type-arg]
    """
    Returns a connected async Redis client.
    Use as a FastAPI dependency or in async service methods.
    """
    return aioredis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )


# ─── Sync Client (Celery tasks) ───────────────────────────────────────────────

def get_sync_redis() -> sync_redis.Redis:  # type: ignore[type-arg]
    """
    Returns a connected synchronous Redis client.
    Use inside Celery tasks (non-async context).
    """
    return sync_redis.from_url(
        settings.redis_url,
        encoding="utf-8",
        decode_responses=True,
    )


# ─── Cache Helpers ────────────────────────────────────────────────────────────

class RedisCache:
    """
    High-level async cache operations for the FastAPI layer.
    Follows the project rule: mock data cached in Redis to reduce DB load.
    """

    def __init__(self, client: aioredis.Redis) -> None:  # type: ignore[type-arg]
        self._client = client

    async def get(self, key: str) -> str | None:
        value = await self._client.get(key)
        if value is not None:
            log.debug("cache.hit", key=key)
        return value

    async def set(self, key: str, value: str, ttl: int = TTL_MEDIUM) -> None:
        await self._client.set(key, value, ex=ttl)
        log.debug("cache.set", key=key, ttl=ttl)

    async def delete(self, key: str) -> None:
        await self._client.delete(key)
        log.debug("cache.delete", key=key)

    async def exists(self, key: str) -> bool:
        return bool(await self._client.exists(key))

    async def incr(self, key: str, ttl: int = TTL_SHORT) -> int:
        """Increment a counter (e.g. rate limiting, transaction count)."""
        value = await self._client.incr(key)
        if value == 1:
            # Set TTL only on first creation
            await self._client.expire(key, ttl)
        return value

    # ── Convenience key builders ──────────────────────────────────────────────

    @staticmethod
    def key_savings_summary(user_id: str) -> str:
        return f"savings:summary:{user_id}"

    @staticmethod
    def key_market_price(asset: str) -> str:
        return f"market:price:{asset.upper()}"

    @staticmethod
    def key_mock_price(asset: str) -> str:
        return RedisCache.key_market_price(asset)

    @staticmethod
    def key_user_tx_count(user_id: str) -> str:
        return f"tx:count:{user_id}"


# ─── Sync Cache Helpers (Celery) ──────────────────────────────────────────────

class SyncRedisCache:
    """Synchronous cache helpers for Celery task context."""

    def __init__(self, client: sync_redis.Redis) -> None:  # type: ignore[type-arg]
        self._client = client

    def get(self, key: str) -> str | None:
        return self._client.get(key)

    def set(self, key: str, value: str, ttl: int = TTL_MEDIUM) -> None:
        self._client.set(key, value, ex=ttl)

    def delete(self, key: str) -> None:
        self._client.delete(key)

    def publish(self, channel: str, message: str) -> None:
        """Publish a Pub/Sub message (e.g. notify frontend of trade execution)."""
        self._client.publish(channel, message)
