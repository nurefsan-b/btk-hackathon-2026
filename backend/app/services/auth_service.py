from __future__ import annotations

from urllib.parse import urlencode

import httpx
import structlog
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, PasswordChangeRequest, Toggle2FARequest

settings = get_settings()
log = structlog.get_logger()


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self._repo = UserRepository(session)

    async def register(self, payload: RegisterRequest) -> AuthResponse:
        existing = await self._repo.get_by_email(payload.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        user = await self._repo.create(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(payload.password),
            risk_profile=payload.risk_profile,
        )
        return self._auth_response(user)

    async def login(self, payload: LoginRequest) -> AuthResponse:
        user = await self._repo.get_by_email(payload.email)
        if user and not user.hashed_password and user.google_sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account uses Google sign-in. Continue with Google.",
            )
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is disabled")
        return self._auth_response(user)

    def google_authorization_url(self) -> str:
        if not settings.google_client_id:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth is not configured",
            )
        params = {
            "client_id": settings.google_client_id,
            "redirect_uri": settings.google_oauth_redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account",
        }
        return "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)

    async def handle_google_callback(self, code: str) -> AuthResponse:
        if not settings.google_client_id or not settings.google_client_secret:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Google OAuth is not configured",
            )

        async with httpx.AsyncClient(timeout=15.0) as client:
            token_response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "redirect_uri": settings.google_oauth_redirect_uri,
                    "grant_type": "authorization_code",
                },
            )
            try:
                token_response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                payload = _safe_google_error_payload(token_response)
                log.warning(
                    "google_token_exchange_failed",
                    status_code=token_response.status_code,
                    error=payload.get("error"),
                    error_description=payload.get("error_description"),
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=payload.get("error") or "google_token_exchange_failed",
                ) from exc
            google_access_token = token_response.json()["access_token"]

            profile_response = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {google_access_token}"},
            )
            try:
                profile_response.raise_for_status()
            except httpx.HTTPStatusError as exc:
                payload = _safe_google_error_payload(profile_response)
                log.warning(
                    "google_profile_fetch_failed",
                    status_code=profile_response.status_code,
                    error=payload.get("error"),
                    error_description=payload.get("error_description"),
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=payload.get("error") or "google_profile_fetch_failed",
                ) from exc
            profile = profile_response.json()

        google_sub = profile["sub"]
        email = profile["email"].lower()
        full_name = profile.get("name") or email.split("@")[0]
        avatar_url = profile.get("picture")

        user = await self._repo.get_by_google_sub(google_sub)
        if not user:
            user = await self._repo.get_by_email(email)
        if user:
            user = await self._repo.update_google_profile(
                user,
                google_sub=google_sub,
                full_name=full_name,
                avatar_url=avatar_url,
            )
        else:
            user = await self._repo.create(
                email=email,
                full_name=full_name,
                hashed_password=None,
                auth_provider="google",
                google_sub=google_sub,
                avatar_url=avatar_url,
            )

        return self._auth_response(user)

    async def change_password(self, user: User, payload: PasswordChangeRequest) -> None:
        if user.google_sub and not user.hashed_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Accounts using Google sign-in cannot change password manually",
            )
        
        if not verify_password(payload.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect",
            )
        
        new_hashed = hash_password(payload.new_password)
        await self._repo.update_password(user, new_hashed)

    async def toggle_2fa(self, user: User, payload: Toggle2FARequest) -> User:
        return await self._repo.update_2fa(user, payload.enabled)

    def _auth_response(self, user: User) -> AuthResponse:
        token = create_access_token(subject=str(user.id), extra={"email": user.email})
        return AuthResponse(access_token=token, user=user)


def _safe_google_error_payload(response: httpx.Response) -> dict[str, str]:
    try:
        data = response.json()
    except ValueError:
        return {"error": "google_oauth_error"}

    error = str(data.get("error") or "google_oauth_error")
    description = str(data.get("error_description") or "")
    return {
        "error": error[:120],
        "error_description": description[:240],
    }
