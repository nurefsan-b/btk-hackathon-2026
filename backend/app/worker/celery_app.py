from __future__ import annotations

from celery import Celery
from celery.schedules import crontab

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "btk_hackathon",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "app.worker.tasks.weekly_accumulation",
        "app.worker.tasks.trigger_ai_trade",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Europe/Istanbul",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    # ── RedBeat Scheduler Config ───────────────────────
    redbeat_redis_url=settings.redis_url,
    beat_scheduler="redbeat.RedBeatScheduler",
    beat_schedule={
        "weekly-accumulation": {
            "task": "app.worker.tasks.weekly_accumulation.accumulate_all_users",
            "schedule": crontab(hour=9, minute=0, day_of_week=1),  # Every Monday 09:00 IST
        },
    },
)
