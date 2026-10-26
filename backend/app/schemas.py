
from enum import Enum
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


def to_camel(string: str) -> str:
    first, *rest = string.split("_")
    return first + "".join(word.capitalize() for word in rest)


class APIModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class UserCreate(APIModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    is_active: bool = True
    phone_number: str | None = Field(
        default=None,
        min_length=8,
        max_length=20,
    )


class UserUpdate(APIModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    is_active: bool
    phone_number: str | None = Field(
        default=None,
        min_length=8,
        max_length=20,
    )


class UserOut(APIModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

    id: int
    name: str
    email: EmailStr
    is_active: bool
    phone_number: str | None
    role: UserRole
    created_at: datetime
    updated_at: datetime


class UserListResponse(APIModel):
    items: list[UserOut]
    page: int
    page_size: int
    total: int


class ErrorResponse(APIModel):
    error_code: str
    message: str
