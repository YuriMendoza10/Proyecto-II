from datetime import datetime

from pydantic import BaseModel, Field

from app.models.student import StudentAcademicHistoryStatus


class StudentAcademicHistoryCreate(BaseModel):
    student_id: int = Field(..., gt=0)
    course_id: int = Field(..., gt=0)
    academic_period_id: int | None = Field(default=None, gt=0)
    status: StudentAcademicHistoryStatus
    grade: float | None = Field(default=None, ge=0, le=20)
    attempt_number: int = Field(default=1, ge=1)
    credits: int | None = Field(default=None, ge=0)
    observation: str | None = Field(default=None, max_length=500)


class StudentAcademicHistoryUpdate(BaseModel):
    course_id: int | None = Field(default=None, gt=0)
    academic_period_id: int | None = Field(default=None, gt=0)
    status: StudentAcademicHistoryStatus | None = None
    grade: float | None = Field(default=None, ge=0, le=20)
    attempt_number: int | None = Field(default=None, ge=1)
    credits: int | None = Field(default=None, ge=0)
    observation: str | None = Field(default=None, max_length=500)


class StudentAcademicHistoryRead(BaseModel):
    id: int
    student_id: int
    student_code: str
    student_name: str | None = None
    academic_program_id: int | None = None
    academic_program_name: str | None = None
    curriculum_plan_id: int | None = None
    curriculum_plan_code: str | None = None
    course_id: int
    course_code: str
    course_name: str
    academic_period_id: int | None = None
    academic_period_name: str | None = None
    status: StudentAcademicHistoryStatus
    grade: float | None = None
    attempt_number: int
    credits: int | None = None
    observation: str | None = None
    created_at: datetime
    updated_at: datetime


class StudentAcademicHistoryBulkCreate(BaseModel):
    records: list[StudentAcademicHistoryCreate] = Field(..., min_length=1, max_length=1000)


class StudentAcademicHistoryBulkResult(BaseModel):
    created: int
    updated: int
    errors: list[str]


class StudentAcademicHistoryPage(BaseModel):
    items: list[StudentAcademicHistoryRead]
    total: int
    page: int
    page_size: int
    total_pages: int


class StudentAcademicHistorySummary(BaseModel):
    student_id: int
    student_code: str
    student_name: str | None = None
    total_courses: int
    approved_courses: int
    failed_courses: int
    in_progress_courses: int
    withdrawn_courses: int
    approved_credits: int
    failed_credits: int
    current_cycle: int
    academic_program: str | None = None
    curriculum_plan: str | None = None
