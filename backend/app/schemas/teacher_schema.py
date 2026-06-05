from datetime import datetime, time

from pydantic import BaseModel, Field


class TeacherBase(BaseModel):
    user_id: int = Field(..., gt=0)
    teacher_code: str = Field(..., min_length=3, max_length=30)
    specialty: str | None = Field(default=None, max_length=150)
    max_weekly_hours: int = Field(default=24, ge=1, le=48)
    rating: float = Field(default=3.0, ge=0.0, le=5.0)


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    teacher_code: str | None = Field(default=None, min_length=3, max_length=30)
    specialty: str | None = Field(default=None, max_length=150)
    max_weekly_hours: int | None = Field(default=None, ge=1, le=48)
    rating: float | None = Field(default=None, ge=0.0, le=5.0)


class TeacherResponse(BaseModel):
    id: int
    user_id: int
    teacher_code: str
    specialty: str | None
    max_weekly_hours: int
    rating: float
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class TeacherListResponse(BaseModel):
    total: int
    teachers: list[TeacherResponse]


class TeacherAvailabilityBase(BaseModel):
    teacher_id: int = Field(..., gt=0)
    day_of_week: int = Field(..., ge=1, le=7)
    start_time: time
    end_time: time
    is_available: bool = True


class TeacherAvailabilityCreate(TeacherAvailabilityBase):
    pass


class TeacherAvailabilityUpdate(BaseModel):
    day_of_week: int | None = Field(default=None, ge=1, le=7)
    start_time: time | None = None
    end_time: time | None = None
    is_available: bool | None = None


class TeacherAvailabilityResponse(BaseModel):
    id: int
    teacher_id: int
    day_of_week: int
    start_time: time
    end_time: time
    is_available: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class TeacherAvailabilityListResponse(BaseModel):
    total: int
    availabilities: list[TeacherAvailabilityResponse]