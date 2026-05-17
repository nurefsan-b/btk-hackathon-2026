from __future__ import annotations

import asyncio
import json
from typing import Any, Dict

import structlog
import yfinance as yf

from app.core.redis import RedisCache, TTL_LONG, get_async_redis

log = structlog.get_logger()

# ─── Asset → yfinance ticker mapping ─────────────────────────────────────────

TICKER_MAP: Dict[str, str] = {
    "BIST100": "XU100.IS",
    "XAU": "GC=F",
    "USD": "USDTRY=X",
    "EUR": "EURTRY=X",
    "BTC": "BTC-USD",
}

# ─── Last-resort fallback values (when both yfinance AND Redis fail) ──────────
# These are reasonable approximate values — never 0.0, which would cause
# the AI agent to make nonsensical decisions and mark-to-market to show
# fake 100% losses.
STATIC_FALLBACK_PRICES: Dict[str, Dict[str, Any]] = {
    "BIST100": {"price": 9_500.0,  "change_24h": 0.0},
    "XAU":     {"price": 2_350.0,  "change_24h": 0.0},
    "USD":     {"price": 32.5,     "change_24h": 0.0},
    "EUR":     {"price": 35.0,     "change_24h": 0.0},
    "BTC":     {"price": 68_000.0, "change_24h": 0.0},
}

# Cache TTL for "last known good" price data: 2 hours
_PRICE_CACHE_TTL = TTL_LONG * 2


# ─── Public API ───────────────────────────────────────────────────────────────

async def fetch_market_data() -> Dict[str, Dict[str, Any]]:
    """
    Fetch current prices and 24h changes for all configured assets.

    Resilience strategy (three layers):
      1. yfinance (primary) — fetched in a thread pool (sync lib)
         → On success: write to Redis cache, return data
      2. Redis cache (fallback) — last known good price (TTL 2 h)
         → On cache hit: return stale-but-valid data with a warning log
      3. STATIC_FALLBACK_PRICES (last resort)
         → Never returns 0.0; prevents ghost losses and bad AI decisions
    """
    loop = asyncio.get_event_loop()

    try:
        fresh = await loop.run_in_executor(None, _fetch_sync)
        # Check whether yfinance actually returned valid prices
        if _has_valid_prices(fresh):
            await _write_cache(fresh)
            return fresh
        # yfinance returned zeros — treat as failure and fall through
        log.warning("price_fetcher.yfinance_zero_prices", msg="All prices were 0, using cache")
    except Exception as exc:
        log.error("price_fetcher.yfinance_error", error=str(exc))

    # Layer 2: Redis cache
    cached = await _read_cache()
    if cached:
        log.warning("price_fetcher.using_cache", msg="yfinance failed, using cached prices")
        return cached

    # Layer 3: Static fallback
    log.error(
        "price_fetcher.using_static_fallback",
        msg="Both yfinance and Redis cache failed — using hardcoded fallback prices",
    )
    return dict(STATIC_FALLBACK_PRICES)


async def get_asset_price(asset: str) -> float:
    """Return a single asset's price — guaranteed non-zero."""
    data = await fetch_market_data()
    price = data.get(asset.upper(), {}).get("price", 0.0)
    if price <= 0.0:
        # Last-resort: use static fallback for this specific asset
        fallback = STATIC_FALLBACK_PRICES.get(asset.upper(), {}).get("price", 1.0)
        log.warning("price_fetcher.asset_zero_price", asset=asset, fallback=fallback)
        return fallback
    return price


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _fetch_sync() -> Dict[str, Dict[str, Any]]:
    """Synchronous yfinance fetch — runs in a thread pool executor."""
    results: Dict[str, Dict[str, Any]] = {}
    tickers = list(TICKER_MAP.values())

    try:
        data = yf.download(
            tickers,
            period="2d",
            interval="1d",
            group_by="ticker",
            progress=False,
            auto_adjust=True,
        )

        for asset, ticker in TICKER_MAP.items():
            try:
                has_ticker = (
                    ticker in data.columns.levels[0]
                    if hasattr(data.columns, "levels")
                    else ticker in data
                )
                if not has_ticker:
                    log.warning("price_fetcher.missing_ticker", ticker=ticker)
                    results[asset] = {"price": 0.0, "change_24h": 0.0}
                    continue

                ticker_data = data[ticker]
                if len(ticker_data) < 2:
                    current_price = float(ticker_data["Close"].iloc[-1])
                    results[asset] = {"price": current_price, "change_24h": 0.0}
                else:
                    current_price = float(ticker_data["Close"].iloc[-1])
                    prev_price = float(ticker_data["Close"].iloc[-2])
                    change_pct = ((current_price - prev_price) / prev_price) * 100 if prev_price else 0.0
                    results[asset] = {"price": current_price, "change_24h": round(change_pct, 4)}

            except Exception as exc:
                log.error("price_fetcher.asset_error", asset=asset, error=str(exc))
                results[asset] = {"price": 0.0, "change_24h": 0.0}

    except Exception as exc:
        log.error("price_fetcher.fetch_error", error=str(exc))
        for asset in TICKER_MAP:
            results[asset] = {"price": 0.0, "change_24h": 0.0}

    return results


def _has_valid_prices(data: Dict[str, Dict[str, Any]]) -> bool:
    """Return True only if at least one asset has a non-zero price."""
    return any(v.get("price", 0.0) > 0 for v in data.values())


async def _write_cache(data: Dict[str, Dict[str, Any]]) -> None:
    """Persist each asset's price to Redis individually (TTL = 2 h)."""
    try:
        client = get_async_redis()
        cache = RedisCache(client)
        for asset, info in data.items():
            if info.get("price", 0.0) > 0:
                key = RedisCache.key_market_price(asset)
                await cache.set(key, json.dumps(info), ttl=_PRICE_CACHE_TTL)
        await client.aclose()
        log.debug("price_fetcher.cache_written", assets=list(data.keys()))
    except Exception as exc:
        # Cache write failure is non-fatal
        log.warning("price_fetcher.cache_write_error", error=str(exc))


async def _read_cache() -> Dict[str, Dict[str, Any]] | None:
    """
    Try to read all asset prices from Redis.
    Returns None if cache is empty or Redis is unreachable.
    """
    try:
        client = get_async_redis()
        cache = RedisCache(client)
        result: Dict[str, Dict[str, Any]] = {}
        for asset in TICKER_MAP:
            key = RedisCache.key_market_price(asset)
            raw = await cache.get(key)
            if raw:
                result[asset] = json.loads(raw)
        await client.aclose()
        return result if result else None
    except Exception as exc:
        log.warning("price_fetcher.cache_read_error", error=str(exc))
        return None

