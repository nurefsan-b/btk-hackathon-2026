.PHONY: up down logs shell migrate makemigrations test lint format restart lock sync add-dep

# ─── Container Management ──────────────────────────────────────
up:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-worker:
	docker compose logs -f celery_worker celery_beat

# ─── Database Migrations ───────────────────────────────────────
migrate:
	docker compose exec backend alembic upgrade head

makemigrations:
	@read -p "Migration message: " msg; \
	docker compose exec backend alembic revision --autogenerate -m "$$msg"

# ─── Development ───────────────────────────────────────────────
shell:
	docker compose exec backend bash

shell-db:
	docker compose exec db psql -U $${POSTGRES_USER:-btk_user} -d $${POSTGRES_DB:-btk_hackathon}

shell-redis:
	docker compose exec redis redis-cli

# ─── Testing ───────────────────────────────────────────────────
test:
	docker compose exec backend pytest tests/ -v --tb=short

test-cov:
	docker compose exec backend pytest tests/ -v --cov=app --cov-report=html --tb=short

# ── uv Package Management ─────────────────────────────────────
lock:
	uv lock --project backend/

lock-upgrade:
	uv lock --upgrade --project backend/

sync:
	uv sync --project backend/

add-dep:
	@read -p "Package to add: " pkg; \
	uv add $$pkg --project backend/

# ── Code Quality ──────────────────────────────────────────────
lint:
	docker compose exec backend ruff check app/ tests/

format:
	docker compose exec backend ruff format app/ tests/

typecheck:
	docker compose exec backend mypy app/

# ─── Helpers ───────────────────────────────────────────────────
setup:
	cp -n .env.example .env || true
	docker compose up -d --build
	sleep 5
	docker compose exec backend alembic upgrade head
	@echo "✅  Setup complete! API: http://api.microfon.com.tr  Flower: http://flower.microfon.com.tr"

health:
	curl -s http://api.localhost/health | python3 -m json.tool
