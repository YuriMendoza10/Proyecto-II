from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class CourseBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=30)
    name: str = Field(..., min_length=3, max_length=180)
    credits: int = Field(..., ge=1, le=6)
    cycle: int = Field(..., ge=1, le=10)
    career: str = Field(..., min_length=3, max_length=120)
    weekly_hours: int = Field(default=2, ge=1, le=10)
    is_active: bool = True

    @model_validator(mode="after")
    def validate_weekly_hours(self):
        if self.weekly_hours < self.credits:
            raise ValueError(
                "Las horas semanales no deberían ser menores que los créditos del curso"
            )
        return self


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=30)
    name: str | None = Field(default=None, min_length=3, max_length=180)
    credits: int | None = Field(default=None, ge=1, le=6)
    cycle: int | None = Field(default=None, ge=1, le=10)
    career: str | None = Field(default=None, min_length=3, max_length=120)
    weekly_hours: int | None = Field(default=None, ge=1, le=10)
    is_active: bool | None = None


class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    credits: int
    cycle: int
    career: str
    weekly_hours: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class CourseListResponse(BaseModel):
    total: int
    courses: list[CourseResponse]