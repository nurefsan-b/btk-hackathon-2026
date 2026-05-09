FROM python:3.12-slim

# ── uv binary (from official image — no curl/script needed) ───────────────────
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# ── System dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Layer 1: Install dependencies from lock file ───────────────────────────────
# Only pyproject.toml + uv.lock are copied here.
# Docker caches this layer — uv sync is SKIPPED on every code-only rebuild.
# uv.lock guarantees exact same versions on every build (reproducible).
COPY pyproject.toml uv.lock ./

RUN uv export --frozen --no-hashes -o /tmp/requirements.txt && \
    uv pip install --system --no-cache -r /tmp/requirements.txt

# ── Layer 2: Copy application source ──────────────────────────────────────────
# Changes here do NOT invalidate the uv layer above.
COPY . .

ENV PYTHONPATH=/app

# ── Security: non-root user ────────────────────────────────────────────────────
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
