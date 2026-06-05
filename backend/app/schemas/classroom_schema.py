from datetime import datetime

from pydantic import BaseModel, Field

from app.models.classroom import ClassroomType


class ClassroomBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=30)
    name: str = Field(..., min_length=2, max_length=120)
    capacity: int = Field(..., ge=1, le=500)
    classroom_type: ClassroomType = ClassroomType.THEORY
    campus: str = Field(default="Principal", min_length=2, max_length=120)
    building: str | None = Field(default=None, max_length=80)
    floor: str | None = Field(default=None, max_length=20)
    has_projector: bool = False
    has_computers: bool = False
    is_active: bool = True


class ClassroomCreate(ClassroomBase):
    pass


class ClassroomUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=30)
    name: str | None = Field(default=None, min_length=2, max_length=120)
    capacity: int | None = Field(default=None, ge=1, le=500)
    classroom_type: ClassroomType | None = None
    campus: str | None = Field(default=None, min_length=2, max_length=120)
    building: str | None = Field(default=None, max_length=80)
    floor: str | None = Field(default=None, max_length=20)
    has_projector: bool | None = None
    has_computers: bool | None = None
    is_active: bool | None = None


class ClassroomResponse(BaseModel):
    id: int
    code: str
    name: str
    capacity: int
    classroom_type: ClassroomType
    campus: str
    building: str | None
    floor: str | None
    has_projector: bool
    has_computers: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ClassroomListResponse(BaseModel):
    total: int
    classrooms: list[ClassroomResponse]