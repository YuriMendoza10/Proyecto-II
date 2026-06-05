from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=150)
    email: EmailStr
    role: UserRole = UserRole.STUDENT


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class PublicUserRegister(BaseModel):
    full_name: str = Field(..., min_length=3, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)

    model_config = ConfigDict(extra="forbid")


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=3, max_length=150)
    email: EmailStr | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class UserListResponse(BaseModel):
    total: int
    users: list[UserResponse]
