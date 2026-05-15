from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

RiskProfile = Literal["low", "medium", "high"]


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    risk_profile: RiskProfile
    auth_provider: str
    avatar_url: str | None
    is_2fa_enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=8, max_length=128)
    risk_profile: RiskProfile = "medium"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if "@" not in email:
            raise ValueError("Invalid email")
        return email


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class AuthResponse(BaseModel):
    access_token: str | None = None
    token_type: str = "bearer"
    user: UserResponse
    requires_2fa: bool = False
    two_factor_token: str | None = None


class Verify2FARequest(BaseModel):
    two_factor_token: str
    code: str


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)


class Toggle2FARequest(BaseModel):
    enabled: bool


class UserUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=255)
    email: str | None = Field(default=None, min_length=3, max_length=255)
    risk_profile: RiskProfile | None = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        email = value.strip().lower()
        if "@" not in email:
            raise ValueError("Invalid email")
        return email
