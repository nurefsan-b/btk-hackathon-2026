# 🪙 MicroFon — Micro-Savings & AI-Driven Trading Platform

> **BTK Akademi Hackathon 2026**  
> Turn your spare change into smart investments — powered by Gemini AI.

---

## 📌 Problem

Millions of small transactions happen daily. The spare change from rounding (₺87.30 → ₺90.00 = **₺2.70 saved**) is invisible money that sits idle. Meanwhile, individual investors lack the time and expertise to make informed decisions.

## 💡 Solution

**MicroFon** automatically:
1. **Collects** spare change from every transaction via intelligent round-up
2. **Accumulates** weekly savings pools
3. **Analyzes** real-time financial news using Gemini AI
4. **Invests** the accumulated funds based on AI sentiment analysis — with user approval

The user does nothing. The AI agent reads financial news, evaluates market sentiment, calculates confidence scores, and proposes investment decisions with full transparency.

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Traefik    │────▶│   FastAPI    │
│  React + TS  │     │   (Proxy)    │     │   Backend    │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                         ┌──────────────────────┼──────────────┐
                         │                      │              │
                    ┌────▼─────┐         ┌──────▼───┐   ┌─────▼─────┐
                    │ Postgres │         │  Redis   │   │  Celery   │
                    │   (DB)   │         │ (Cache)  │   │ (Worker)  │
                    └──────────┘         └──────────┘   └─────┬─────┘
                                                              │
                                                        ┌─────▼─────┐
                                                        │  Gemini   │
                                                        │  AI Agent │
                                                        └───────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Tailwind CSS 4, Vite, Framer Motion, Recharts |
| **Backend** | Python, FastAPI, SQLAlchemy (async), Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **Cache & Broker** | Redis 7 |
| **Background Jobs** | Celery + Celery Beat + RedBeat |
| **AI / LLM** | Google Gemini 1.5 Pro via LangChain |
| **News Source** | NewsAPI.org (with mock fallback) |
| **Infrastructure** | Docker Compose, Traefik reverse proxy |
| **Monitoring** | Flower (Celery dashboard), Structlog |
| **Testing** | Pytest (async), httpx |

---

## 🧭 Why This Architecture?

MicroFon is designed as a demo-ready but production-conscious financial workflow:

- **FastAPI** keeps the API layer async, typed, and easy to document with OpenAPI.
- **PostgreSQL** stores users, transactions, savings pools, and paper trades as durable financial records.
- **Redis** supports Celery task brokering, short-lived 2FA/session state, and last-known-good market price caching.
- **Celery + Celery Beat** run AI and accumulation jobs in the background so slow LLM/news/market calls do not block the user interface.
- **Server-Sent Events (SSE)** notify the frontend when an AI trade task finishes, avoiding blind polling or fixed timeouts.
- **Gemini via LangChain** generates structured, explainable paper-trading decisions from market/news context.
- **NewsAPI + yfinance** provide external signals for market sentiment, asset research, and paper-trade pricing, with fallbacks for demo reliability.
- **Traefik** gives the same app a local reverse-proxy path and a deployment-oriented routing model.

The default `docker-compose.yml` is optimized for local development and demo visibility. For a tighter deployment surface, `docker-compose.prod.yml` keeps PostgreSQL, Redis, and Flower private on the Docker network and exposes only Traefik publicly.

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### 1. Clone & Configure

```bash
git clone <repo-url>
cd btk-hackathon-2026
cp .env.example .env
```

Edit `.env` and set your `GOOGLE_API_KEY`:
```
GOOGLE_API_KEY=your-actual-gemini-api-key
```

### 2. Start Everything

```bash
make setup
```

This will:
- Build all Docker containers
- Start PostgreSQL, Redis, Backend, Celery Worker, Celery Beat, Flower, and Traefik
- Run database migrations automatically

### 3. Access the App

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:5173` |
| **API Docs** | `http://api.localhost/docs` |
| **Flower** (Celery Monitor) | `http://flower.localhost` |
| **Traefik Dashboard** | `http://localhost:8080` |

### 4. Run the Transaction Simulator

```bash
cd simulator
pip install httpx
python trigger_transactions.py --interval 2
```

---

## 📂 Project Structure

```
btk-hackathon-2026/
├── backend/
│   ├── app/
│   │   ├── ai/              # Gemini agent + news fetcher
│   │   ├── api/v1/          # FastAPI routes
│   │   ├── core/            # Auth, middleware
│   │   ├── db/models/       # SQLAlchemy models
│   │   ├── repositories/    # Data access layer
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # Business logic
│   │   └── worker/tasks/    # Celery background tasks
│   ├── alembic/             # Database migrations
│   └── Dockerfile
├── frontend/
│   └── src/app/
│       ├── components/      # Reusable UI components
│       ├── lib/             # API client
│       └── pages/           # Route pages
├── simulator/               # Transaction simulator for demos
├── tests/                   # Pytest test suite
├── docker-compose.yml       # 7-service orchestration
├── Makefile                 # Developer shortcuts
└── traefik/                 # Reverse proxy config
```

---

## 🤖 How the AI Agent Works

1. **News Collection** — Fetches Turkish financial news via NewsAPI
2. **Sentiment Analysis** — Gemini analyzes headlines and evaluates market sentiment
3. **Decision Making** — Returns a structured `TradeDecision`:
   - `action`: buy / sell / hold
   - `asset`: BIST100, XAU, USD, EUR, BTC
   - `confidence_score`: 0.0 – 1.0
   - `reasoning`: Detailed explanation
4. **Execution** — Trade is persisted and marked as simulated (hackathon scope)
5. **Transparency** — User sees the full reasoning log in the AI Intelligence Hub

---

## 🧪 Testing

```bash
make test        # Run all tests
make test-cov    # Run with coverage report
```

---

## 🔧 Useful Commands

```bash
make up          # Start all containers
make down        # Stop all containers
make logs        # Stream all logs
make shell       # Bash into backend container
make shell-db    # psql into database
make migrate     # Run pending migrations
make lint        # Run ruff linter
make format      # Auto-format code
```

---

## 👥 Team

**BTK Akademi Hackathon 2026**

---

## 📄 License

This project was developed as part of the BTK Akademi Hackathon 2026.
