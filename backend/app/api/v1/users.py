from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.core.security import decode_access_token
from app.db.models.user import User
from app.repositories.user_repo import UserRepository
from app.schemas.auth import PasswordChangeRequest, Toggle2FARequest, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()

async def get_current_user_model(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    auth_header = request.headers.get("Authorization", "")
    scheme, _, token = auth_header.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(str(payload["sub"]))
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = await UserRepository(db).get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("/me/change-password")
async def change_password(
    payload: PasswordChangeRequest,
    user: User = Depends(get_current_user_model),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Change the current user's password."""
    await AuthService(db).change_password(user, payload)
    return {"message": "Password changed successfully"}

@router.post("/me/2fa/toggle", response_model=UserResponse)
async def toggle_2fa(
    payload: Toggle2FARequest,
    user: User = Depends(get_current_user_model),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Toggle 2FA on/off for the current user."""
    updated_user = await AuthService(db).toggle_2fa(user, payload)
    return UserResponse.model_validate(updated_user)
