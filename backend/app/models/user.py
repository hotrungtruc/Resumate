from __future__ import annotations
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    AliasChoices,
    ConfigDict,
    field_validator,
    model_validator,
)
from app.models.pyobjectid import PyObjectId


class UserRole(str, Enum):
    """User role for access control"""

    USER = "user"
    ADMIN = "admin"
    PREMIUM = "premium"


class UserTier(str, Enum):
    """Subscription tier for feature access"""

    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class ThemePreference(str, Enum):
    """UI theme preference"""

    LIGHT = "light"
    DARK = "dark"
    SYSTEM = "system"


class UserPreferences(BaseModel):
    """User preferences settings"""

    theme: ThemePreference = ThemePreference.SYSTEM
    language: str = "en"
    notifications_enabled: bool = True
    email_notifications: bool = True


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=200)
    is_active: bool = True
    avatar_url: Optional[str] = None
    google_id: Optional[str] = None
    facebook_id: Optional[str] = None
    # New fields from diagram
    role: UserRole = UserRole.USER
    tier: UserTier = UserTier.FREE
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    # Career Goals
    next_career_goal: Optional[str] = Field(None, max_length=500)
    target_title: Optional[str] = Field(None, max_length=200)
    target_date: Optional[str] = None
    salary_min: int = Field(0, ge=0)
    salary_max: int = Field(0, ge=0)
    currency: str = "US Dollar"


class UserCreate(UserBase):
    password: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """Validate password strength if provided"""
        if v is None:
            return v
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v

    @model_validator(mode="after")
    def validate_user_create(self) -> UserCreate:
        """Validate salary range"""
        if (
            self.salary_min > 0
            and self.salary_max > 0
            and self.salary_min > self.salary_max
        ):
            raise ValueError("salary_min must be less than or equal to salary_max")
        return self


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=200)
    next_career_goal: Optional[str] = Field(None, max_length=500)
    target_title: Optional[str] = Field(None, max_length=200)
    target_date: Optional[str] = None
    salary_min: Optional[int] = Field(None, ge=0)
    salary_max: Optional[int] = Field(None, ge=0)
    currency: Optional[str] = None
    # Preferences can be updated by user
    preferences: Optional[UserPreferences] = None

    @model_validator(mode="after")
    def validate_user_update(self) -> UserUpdate:
        """Validate salary range"""
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_min > self.salary_max
        ):
            raise ValueError("salary_min must be less than or equal to salary_max")
        return self


class UserInDB(UserBase):
    id: Optional[PyObjectId] = Field(
        default=None,
        validation_alias=AliasChoices("_id", "id"),
        serialization_alias="id",
    )
    hashed_password: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(from_attributes=True)
