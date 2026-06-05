from datetime import time

from pydantic import BaseModel, Field

from app.schemas.csp_schema import AcademicTimeSlot


class CSPDiagnosticRequest(BaseModel):
    schedule_id: int = Field(..., gt=0)
    academic_period: str = Field(..., min_length=4, max_length=30)

    use_academic_slots: bool = True
    academic_slots: list[AcademicTimeSlot] | None = None

    start_hour: time = time(7, 0)
    end_hour: time = time(22, 0)

    default_block_duration_minutes: int = Field(default=90, ge=60, le=240)
    min_block_duration_minutes: int = Field(default=60, ge=30, le=120)
    transfer_tolerance_minutes: int = Field(default=10, ge=0, le=30)

    days: list[int] = Field(default=[1, 2, 3, 4, 5, 6, 7])

    avoid_duplicate_section_blocks: bool = True


class SectionDomainDiagnostic(BaseModel):
    section_id: int
    section_code: str
    course_id: int
    course_name: str | None
    weekly_hours: int | None
    teacher_id: int | None
    teacher_code: str | None
    max_students: int

    required_blocks: list[int]
    valid_domain_options: int

    is_programmable: bool
    reasons: list[str]


class CSPDiagnosticResponse(BaseModel):
    success: bool
    schedule_id: int
    total_sections_checked: int
    programmable_sections: int
    problematic_sections: int
    summary: list[str]
    diagnostics: list[SectionDomainDiagnostic]