from datetime import time

from pydantic import BaseModel, Field


class EnrolledCourseResponse(BaseModel):
    enrollment_id: int
    course_id: int
    course_code: str
    course_name: str
    credits: int
    cycle: int
    academic_period_id: int
    academic_period_code: str
    status: str


class PublishedEnrollmentSectionResponse(BaseModel):
    section_offering_id: int
    course_id: int
    course_code: str
    course_name: str
    credits: int
    cycle_number: int
    section_code: str
    teacher_name: str | None = None
    classroom_code: str | None = None
    modality: str
    shift: str
    capacity: int
    estimated_students: int
    institutional_schedule_id: int


class EnrollmentScheduleGenerateRequest(BaseModel):
    institutional_schedule_id: int | None = Field(default=None, gt=0)
    selected_course_ids: list[int] = Field(default=[])
    max_solutions: int = Field(default=5, ge=1, le=20)


class EnrollmentScheduleSaveRequest(EnrollmentScheduleGenerateRequest):
    solution_index: int = Field(default=0, ge=0)
    name: str = Field(default="Horario con mis cursos matriculados", min_length=3, max_length=150)
    is_favorite: bool = True


class EnrollmentScheduleBlockResponse(BaseModel):
    schedule_block_id: int
    section_offering_id: int
    course_id: int
    course_name: str
    credits: int
    section_code: str
    teacher_name: str | None = None
    classroom_code: str | None = None
    day_of_week: int
    start_time: time
    end_time: time


class EnrollmentScheduleSolutionResponse(BaseModel):
    solution_index: int
    score: float
    total_credits: int
    total_courses: int
    blocks: list[EnrollmentScheduleBlockResponse]


class EnrollmentScheduleGenerateResponse(BaseModel):
    success: bool
    message: str
    generation_mode: str
    institutional_schedule_id: int
    enrolled_course_ids: list[int]
    solutions: list[EnrollmentScheduleSolutionResponse]


class EnrollmentScheduleSaveResponse(BaseModel):
    success: bool
    message: str
    generation_mode: str
    student_schedule_id: int
    institutional_schedule_id: int
    score: float
    blocks: list[EnrollmentScheduleBlockResponse]
