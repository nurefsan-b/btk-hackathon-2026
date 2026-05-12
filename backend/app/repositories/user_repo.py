from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.user import User


class UserRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        result = await self._session.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self._session.execute(select(User).where(User.email == email.lower()))
        return result.scalar_one_or_none()

    async def get_by_google_sub(self, google_sub: str) -> User | None:
        result = await self._session.execute(select(User).where(User.google_sub == google_sub))
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        email: str,
        full_name: str,
        hashed_password: str | None,
        risk_profile: str = "medium",
        auth_provider: str = "password",
        google_sub: str | None = None,
        avatar_url: str | None = None,
    ) -> User:
        user = User(
            email=email.lower(),
            full_name=full_name,
            hashed_password=hashed_password,
            risk_profile=risk_profile,
            auth_provider=auth_provider,
            google_sub=google_sub,
            avatar_url=avatar_url,
        )
        self._session.add(user)
        await self._session.flush()
        await self._session.refresh(user)
        return user

    async def update_google_profile(
        self,
        user: User,
        *,
        google_sub: str,
        full_name: str,
        avatar_url: str | None,
    ) -> User:
        user.google_sub = google_sub
        user.full_name = full_name or user.full_name
        user.avatar_url = avatar_url
        user.auth_provider = "google"
        await self._session.flush()
        await self._session.refresh(user)
        return user
