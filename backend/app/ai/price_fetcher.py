from __future__ import annotations

import asyncio
import yfinance as yf
import structlog
from typing import Dict, Any

log = structlog.get_logger()

# Asset mapping for yfinance
TICKER_MAP = {
    "BIST100": "XU100.IS",
    "XAU": "GC=F",
    "USD": "USDTRY=X",
    "EUR": "EURTRY=X",
    "BTC": "BTC-USD",
}

async def fetch_market_data() -> Dict[str, Dict[str, Any]]:
    """
    Fetches current prices and 24h changes for configured assets using yfinance.
    Returns a dict mapping asset name to its price and change percentage.
    """
    loop = asyncio.get_event_loop()
    
    # yfinance is synchronous, so we run it in a thread pool
    data = await loop.run_in_executor(None, _fetch_sync)
    return data

def _fetch_sync() -> Dict[str, Dict[str, Any]]:
    results = {}
    tickers = list(TICKER_MAP.values())
    
    try:
        # Fetch data for all tickers at once
        data = yf.download(tickers, period="2d", interval="1d", group_by="ticker", progress=False)
        
        for asset, ticker in TICKER_MAP.items():
            try:
                if ticker not in data.columns.levels[0] if hasattr(data.columns, 'levels') else ticker not in data:
                    log.warning("price_fetcher.missing_ticker", ticker=ticker)
                    results[asset] = {"price": 0.0, "change_24h": 0.0}
                    continue
                
                ticker_data = data[ticker]
                if len(ticker_data) < 2:
                    # Fallback if only 1 day of data is available
                    current_price = ticker_data['Close'].iloc[-1]
                    results[asset] = {"price": float(current_price), "change_24h": 0.0}
                else:
                    current_price = ticker_data['Close'].iloc[-1]
                    prev_price = ticker_data['Close'].iloc[-2]
                    change_pct = ((current_price - prev_price) / prev_price) * 100
                    
                    results[asset] = {
                        "price": float(current_price),
                        "change_24h": float(change_pct)
                    }
            except Exception as e:
                log.error("price_fetcher.asset_error", asset=asset, error=str(e))
                results[asset] = {"price": 0.0, "change_24h": 0.0}
                
    except Exception as e:
        log.error("price_fetcher.fetch_error", error=str(e))
        # Return zeros on total failure
        for asset in TICKER_MAP:
            results[asset] = {"price": 0.0, "change_24h": 0.0}
            
    return results

async def get_asset_price(asset: str) -> float:
    """Helper to get a single asset price."""
    data = await fetch_market_data()
    return data.get(asset, {}).get("price", 100.0)
