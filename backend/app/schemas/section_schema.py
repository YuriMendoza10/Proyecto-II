from datetime import datetime

from pydantic import BaseModel, Field, model_validator


class SectionBase(BaseModel):
    course_id: int = Field(..., gt=0)
    teacher_id: int | None = Field(default=None, gt=0)
    section_code: str = Field(..., min_length=1, max_length=30)
    max_students: int = Field(default=40, ge=1, le=500)
    enrolled_students: int = Field(default=0, ge=0)

    @model_validator(mode="after")
    def validate_capacity(self):
        if self.enrolled_students > self.max_students:
            raise ValueError(
                "Los estudiantes inscritos no pueden superar el cupo máximo"
            )
        return self


class SectionCreate(SectionBase):
    pass


class SectionUpdate(BaseModel):
    course_id: int | None = Field(default=None, gt=0)
    teacher_id: int | None = Field(default=None, gt=0)
    section_code: str | None = Field(default=None, min_length=1, max_length=30)
    max_students: int | None = Field(default=None, ge=1, le=500)
    enrolled_students: int | None = Field(default=None, ge=0)


class SectionResponse(BaseModel):
    id: int
    course_id: int
    teacher_id: int | None
    section_code: str
    max_students: int
    enrolled_students: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class SectionListResponse(BaseModel):
    total: int
    sections: list[SectionResponse]