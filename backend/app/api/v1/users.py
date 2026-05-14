from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status

from app.core.security import decode_access_token
from app.db.models.user import User
from app.dependencies import DBSession
from app.repositories.user_repo import UserRepository
from app.schemas.auth import (
    PasswordChangeRequest,
    Toggle2FARequest,
    UserResponse,
    UserUpdateRequest,
)
from app.services.auth_service import AuthService

router = APIRouter()


async def get_current_user_model(
    request: Request,
    db: DBSession,
) -> User:
    auth_header = request.headers.get("Authorization", "")
    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(str(payload["sub"]))
    except (KeyError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc

    user = await UserRepository(db).get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


CurrentUser = Annotated[User, Depends(get_current_user_model)]


@router.post("/me/change-password")
async def change_password(
    payload: PasswordChangeRequest,
    user: CurrentUser,
    db: DBSession,
) -> dict:
    """Change the current user's password."""
    await AuthService(db).change_password(user, payload)
    return {"message": "Password changed successfully"}


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserUpdateRequest,
    user: CurrentUser,
    db: DBSession,
) -> UserResponse:
    """Update editable profile fields for the current user."""
    repo = UserRepository(db)
    if payload.email and payload.email != user.email:
        existing = await repo.get_by_email(payload.email)
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

    updated_user = await repo.update_profile(
        user,
        full_name=payload.full_name,
        email=payload.email,
        risk_profile=payload.risk_profile,
    )
    return UserResponse.model_validate(updated_user)


@router.post("/me/2fa/toggle", response_model=UserResponse)
async def toggle_2fa(
    payload: Toggle2FARequest,
    user: CurrentUser,
    db: DBSession,
) -> UserResponse:
    """Toggle 2FA on/off for the current user."""
    updated_user = await AuthService(db).toggle_2fa(user, payload)
    return UserResponse.model_validate(updated_user)
