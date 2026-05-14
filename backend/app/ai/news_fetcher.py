from __future__ import annotations

import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

FINANCIAL_KEYWORDS = [
    "borsa", "hisse", "enflasyon", "faiz", "altın", "dolar", "euro",
    "BIST", "Türkiye ekonomi", "Fed", "merkez bankası", "resesyon",
]


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
async def fetch_financial_news(query: str = "Türkiye ekonomi borsa") -> list[dict]:  # type: ignore[return]
    """
    Fetch recent financial news headlines from NewsAPI.
    Retries up to 3 times with exponential backoff (tenacity).
    """
    if not settings.news_api_key:
        log.warning("news_fetcher.no_api_key", msg="Using mock news data")
        return _mock_news()

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            settings.news_api_url,
            params={
                "q": query,
                "language": "tr",
                "sortBy": "publishedAt",
                "pageSize": 10,
                "apiKey": settings.news_api_key,
            },
        )
        response.raise_for_status()
        data = response.json()
        articles = data.get("articles", [])
        log.info("news_fetcher.success", count=len(articles))
        return [
            {
                "title": a["title"],
                "description": a.get("description", ""),
                "source": (a.get("source") or {}).get("name") or "NewsAPI",
                "published_at": a.get("publishedAt") or "Latest",
            }
            for a in articles
        ]


def _mock_news() -> list[dict]:
    """Fallback mock news for development/testing without a real API key."""
    return [
        {
            "title": "Borsa İstanbul'da sert yükseliş: BIST100 endeksi rekor kırdı",
            "description": "Küresel piyasalardaki iyimserlik BIST100'ü yukarı taşıdı.",
            "source": "Demo News",
            "published_at": "5 min ago",
        },
        {
            "title": "Merkez Bankası faiz kararını açıkladı",
            "description": "TCMB politika faizini sabit tuttu, piyasalar olumlu karşıladı.",
            "source": "Demo News",
            "published_at": "18 min ago",
        },
        {
            "title": "Altın fiyatları Fed beklentileriyle geriledi",
            "description": "Ons altın 2.300 dolar sınırının altına indi.",
            "source": "Demo News",
            "published_at": "32 min ago",
        },
    ]
