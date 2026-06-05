from pydantic import BaseModel, Field


class StudentCourseEnrollmentCreate(BaseModel):
    student_id: int = Field(..., gt=0)
    course_id: int = Field(..., gt=0)
    academic_period: str = Field(default="2026-1")
    academic_period_id: int | None = Field(default=None, gt=0)
    status: str = Field(default="ENROLLED")
    is_active: bool = True


class StudentCourseEnrollmentBulkCreate(BaseModel):
    student_id: int = Field(..., gt=0)
    course_ids: list[int] = Field(default=[])
    academic_period: str = Field(default="2026-1")


class StudentCourseEnrollmentResponse(BaseModel):
    id: int
    student_id: int
    course_id: int
    academic_period: str
    academic_period_id: int | None = None
    status: str
    is_active: bool

    course_code: str | None = None
    course_name: str | None = None
    credits: int | None = None
    cycle: int | None = None
    career: str | None = None
    weekly_hours: int | None = None

    class Config:
        from_attributes = True


class StudentAvailableCoursesResponse(BaseModel):
    student_id: int
    student_code: str
    student_name: str | None = None
    career: str
    current_cycle: int
    min_credits: int
    max_credits: int
    academic_period: str
    total_courses: int
    total_credits: int
    courses: list[StudentCourseEnrollmentResponse]
