from __future__ import annotations

import uuid
from urllib.parse import urlencode

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.security import decode_access_token
from app.dependencies import get_db
from app.repositories.user_repo import UserRepository
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()
settings = get_settings()
log = structlog.get_logger()


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    auth_header = request.headers.get("Authorization", "")
    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(str(payload["sub"]))
    except (KeyError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user = await UserRepository(db).get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return UserResponse.model_validate(user)


@router.post("/register", response_model=AuthResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    return await AuthService(db).register(payload)


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> AuthResponse:
    return await AuthService(db).login(payload)


@router.get("/me", response_model=UserResponse)
async def me(current_user: UserResponse = Depends(get_current_user)) -> UserResponse:
    return current_user


@router.get("/google/login")
async def google_login(db: AsyncSession = Depends(get_db)) -> RedirectResponse:
    return RedirectResponse(AuthService(db).google_authorization_url())


@router.get("/google/callback")
async def google_callback(
    code: str | None = None,
    error: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> RedirectResponse:
    if error:
        return RedirectResponse(f"{settings.frontend_url}/auth/callback?{urlencode({'error': error})}")
    if not code:
        return RedirectResponse(
            f"{settings.frontend_url}/auth/callback?{urlencode({'error': 'missing_code'})}"
        )

    try:
        auth = await AuthService(db).handle_google_callback(code)
    except HTTPException as exc:
        detail = str(exc.detail)
        log.warning("google_callback_failed", status_code=exc.status_code, detail=detail)
        return RedirectResponse(
            f"{settings.frontend_url}/auth/callback?{urlencode({'error': detail})}"
        )
    except Exception as exc:
        log.exception("google_callback_failed_unexpected", error_type=type(exc).__name__)
        return RedirectResponse(
            f"{settings.frontend_url}/auth/callback?{urlencode({'error': 'google_auth_failed'})}"
        )

    return RedirectResponse(
        f"{settings.frontend_url}/auth/callback?{urlencode({'token': auth.access_token})}"
    )
