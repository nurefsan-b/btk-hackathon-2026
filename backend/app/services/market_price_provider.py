from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from urllib.parse import quote

import httpx
import structlog

from app.config import get_settings
from app.core.redis import RedisCache, get_async_redis

log = structlog.get_logger()
settings = get_settings()


ASSET_SYMBOLS = {
    "BIST100": "XU100.IS",
    "XAU": "GC=F",
    "USD": "TRY=X",
    "EUR": "EURTRY=X",
    "BTC": "BTC-USD",
}

DEVELOPMENT_FALLBACK_PRICES = {
    "BIST100": 10250.0,
    "XAU": 2380.0,
    "USD": 32.5,
    "EUR": 35.1,
    "BTC": 65000.0,
}


class MarketPriceError(RuntimeError):
    """Raised when a live market price cannot be resolved."""


@dataclass(frozen=True)
class MarketPrice:
    asset: str
    symbol: str
    price: float
    currency: str
    source: str
    fetched_at: datetime


class YahooMarketPriceProvider:
    async def get_price(self, asset: str) -> MarketPrice:
        normalized_asset = asset.upper()
        symbol = ASSET_SYMBOLS.get(normalized_asset)
        if not symbol:
            raise MarketPriceError(f"Unsupported asset for market pricing: {asset}")

        cached = await self._get_cached_price(normalized_asset)
        if cached:
            return cached

        quote_data = await self._fetch_yahoo_quote(symbol)
        price = self._parse_price(symbol, quote_data)
        await self._cache_price(price)
        return price

    async def _fetch_yahoo_quote(self, symbol: str) -> dict:
        encoded_symbol = quote(symbol, safe="")
        url = f"{settings.yahoo_finance_chart_url}/{encoded_symbol}"
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params={"range": "1d", "interval": "1m"})
            response.raise_for_status()
            return response.json()

    def _parse_price(self, symbol: str, data: dict) -> MarketPrice:
        result = ((data.get("chart") or {}).get("result") or [None])[0]
        if not result:
            raise MarketPriceError(f"Yahoo returned no chart data for {symbol}")

        meta = result.get("meta") or {}
        raw_price = meta.get("regularMarketPrice") or meta.get("previousClose")
        if raw_price is None:
            raw_price = self._latest_close(result)
        if raw_price is None:
            raise MarketPriceError(f"Yahoo returned no usable price for {symbol}")

        asset = self._asset_for_symbol(symbol)
        return MarketPrice(
            asset=asset,
            symbol=symbol,
            price=float(raw_price),
            currency=str(meta.get("currency") or "TRY"),
            source="yahoo",
            fetched_at=datetime.now(UTC),
        )

    @staticmethod
    def _latest_close(result: dict) -> float | None:
        quote_data = (((result.get("indicators") or {}).get("quote") or [{}])[0])
        closes = quote_data.get("close") or []
        for value in reversed(closes):
            if value is not None:
                return float(value)
        return None

    @staticmethod
    def _asset_for_symbol(symbol: str) -> str:
        for asset, mapped_symbol in ASSET_SYMBOLS.items():
            if mapped_symbol == symbol:
                return asset
        return symbol

    async def _get_cached_price(self, asset: str) -> MarketPrice | None:
        redis_client = get_async_redis()
        try:
            cache = RedisCache(redis_client)
            raw = await cache.get(RedisCache.key_market_price(asset))
            if not raw:
                return None
            payload = json.loads(raw)
            return MarketPrice(
                asset=str(payload["asset"]),
                symbol=str(payload["symbol"]),
                price=float(payload["price"]),
                currency=str(payload["currency"]),
                source=str(payload["source"]),
                fetched_at=datetime.fromisoformat(str(payload["fetched_at"])),
            )
        except Exception as exc:
            log.debug("market_price.cache_read_failed", asset=asset, error=str(exc))
            return None
        finally:
            await redis_client.aclose()

    async def _cache_price(self, price: MarketPrice) -> None:
        redis_client = get_async_redis()
        try:
            cache = RedisCache(redis_client)
            await cache.set(
                RedisCache.key_market_price(price.asset),
                json.dumps(
                    {
                        "asset": price.asset,
                        "symbol": price.symbol,
                        "price": price.price,
                        "currency": price.currency,
                        "source": price.source,
                        "fetched_at": price.fetched_at.isoformat(),
                    }
                ),
                ttl=settings.market_price_cache_ttl_seconds,
            )
        except Exception as exc:
            log.debug(
                "market_price.cache_write_failed",
                asset=price.asset,
                error=str(exc),
            )
        finally:
            await redis_client.aclose()


async def get_market_price(asset: str) -> MarketPrice:
    try:
        return await YahooMarketPriceProvider().get_price(asset)
    except Exception as exc:
        if settings.is_production or not settings.market_price_fallback_enabled:
            raise MarketPriceError(str(exc)) from exc

        normalized_asset = asset.upper()
        symbol = ASSET_SYMBOLS.get(normalized_asset, normalized_asset)
        price = DEVELOPMENT_FALLBACK_PRICES.get(normalized_asset)
        if price is None:
            raise MarketPriceError(f"No fallback market price for {asset}") from exc

        log.warning(
            "market_price.development_fallback",
            asset=normalized_asset,
            symbol=symbol,
            error=str(exc),
        )
        return MarketPrice(
            asset=normalized_asset,
            symbol=symbol,
            price=price,
            currency="TRY",
            source="development_fallback",
            fetched_at=datetime.now(UTC),
        )
