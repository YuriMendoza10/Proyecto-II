from datetime import datetime

from pydantic import BaseModel, Field

from app.models.classroom import ClassroomType
from app.models.offering import (
    OfferingConflictSeverity,
    OfferingConflictType,
    OfferingModality,
    OfferingShift,
    OfferingStatus,
)


class SectionOfferingCreate(BaseModel):
    academic_period_id: int = Field(..., gt=0)
    academic_program_id: int = Field(..., gt=0)
    curriculum_plan_id: int = Field(..., gt=0)
    curriculum_course_id: int = Field(..., gt=0)
    course_id: int | None = Field(default=None, gt=0)
    section_code: str = Field(default="A", min_length=1, max_length=30)
    display_name: str | None = Field(default=None, max_length=240)
    cycle_number: int | None = Field(default=None, ge=1, le=10)
    teacher_id: int | None = Field(default=None, gt=0)
    classroom_id: int | None = Field(default=None, gt=0)
    estimated_students: int = Field(default=0, ge=0)
    capacity: int = Field(default=40, ge=0)
    modality: OfferingModality = OfferingModality.PRESENTIAL
    shift: OfferingShift = OfferingShift.FLEXIBLE
    status: OfferingStatus = OfferingStatus.DRAFT
    notes: str | None = None


class SectionOfferingUpdate(BaseModel):
    academic_period_id: int | None = Field(default=None, gt=0)
    academic_program_id: int | None = Field(default=None, gt=0)
    curriculum_plan_id: int | None = Field(default=None, gt=0)
    curriculum_course_id: int | None = Field(default=None, gt=0)
    course_id: int | None = Field(default=None, gt=0)
    section_code: str | None = Field(default=None, min_length=1, max_length=30)
    display_name: str | None = Field(default=None, max_length=240)
    cycle_number: int | None = Field(default=None, ge=1, le=10)
    teacher_id: int | None = Field(default=None, gt=0)
    classroom_id: int | None = Field(default=None, gt=0)
    estimated_students: int | None = Field(default=None, ge=0)
    capacity: int | None = Field(default=None, ge=0)
    modality: OfferingModality | None = None
    shift: OfferingShift | None = None
    status: OfferingStatus | None = None
    notes: str | None = None


class SectionOfferingStatusUpdate(BaseModel):
    status: OfferingStatus


class SectionOfferingResponse(BaseModel):
    id: int
    academic_period_id: int
    academic_period_code: str | None = None
    academic_program_id: int
    academic_program_name: str | None = None
    curriculum_plan_id: int
    curriculum_plan_code: str | None = None
    curriculum_course_id: int
    course_id: int
    course_code: str | None = None
    course_name: str | None = None
    section_code: str
    display_name: str
    cycle_number: int
    teacher_id: int | None = None
    teacher_name: str | None = None
    classroom_id: int | None = None
    classroom_code: str | None = None
    estimated_students: int
    capacity: int
    modality: OfferingModality
    shift: OfferingShift
    status: OfferingStatus
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class BulkOfferingCreate(BaseModel):
    academic_period_id: int = Field(..., gt=0)
    curriculum_plan_id: int = Field(..., gt=0)
    cycles: list[int] | None = None
    default_section_code: str = Field(default="A", min_length=1, max_length=30)
    default_modality: OfferingModality = OfferingModality.PRESENTIAL
    default_shift: OfferingShift = OfferingShift.MORNING
    default_capacity: int = Field(default=40, ge=0)
    include_electives: bool = True


class BulkOfferingResponse(BaseModel):
    created: int
    skipped_existing: int
    offerings: list[SectionOfferingResponse]


class SectionRequirementCreate(BaseModel):
    section_offering_id: int = Field(..., gt=0)
    required_classroom_type: ClassroomType | None = None
    required_equipment: str | None = Field(default=None, max_length=240)
    requires_lab: bool = False
    min_capacity: int = Field(default=0, ge=0)
    preferred_shift: OfferingShift | None = None
    notes: str | None = None


class SectionRequirementUpdate(BaseModel):
    required_classroom_type: ClassroomType | None = None
    required_equipment: str | None = Field(default=None, max_length=240)
    requires_lab: bool | None = None
    min_capacity: int | None = Field(default=None, ge=0)
    preferred_shift: OfferingShift | None = None
    notes: str | None = None


class SectionRequirementResponse(BaseModel):
    id: int
    section_offering_id: int
    required_classroom_type: ClassroomType | None = None
    required_equipment: str | None = None
    requires_lab: bool
    min_capacity: int
    preferred_shift: OfferingShift | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class OfferingConflictResponse(BaseModel):
    id: int
    section_offering_id: int | None = None
    academic_period_id: int
    conflict_type: OfferingConflictType
    severity: OfferingConflictSeverity
    message: str
    suggested_action: str | None = None
    is_resolved: bool
    offering_display_name: str | None = None
    created_at: datetime
    updated_at: datetime


class OfferingConflictAnalyzeRequest(BaseModel):
    academic_period_id: int = Field(..., gt=0)
    section_offering_id: int | None = Field(default=None, gt=0)


class OfferingConflictAnalyzeResponse(BaseModel):
    analyzed_offerings: int
    conflicts_created: int
    critical_conflicts: int
    conflicts: list[OfferingConflictResponse]


class CoordinatorDashboardResponse(BaseModel):
    active_period_id: int | None = None
    active_period_code: str | None = None
    total_offerings: int
    offerings_by_status: dict[str, int]
    offerings_without_teacher: int
    offerings_without_classroom: int
    critical_conflicts: int
    courses_by_cycle: dict[str, int]
    assigned_teachers: int
    required_classrooms: int


class OfferingsCSPPrepareRequest(BaseModel):
    academic_period_id: int = Field(..., gt=0)
    strategy: str = Field(default="BALANCED", max_length=40)
    max_solutions: int = Field(default=1, ge=1, le=20)
    cycle_numbers: list[int] | None = None
    academic_program_id: int | None = Field(default=None, gt=0)


class OfferingsCSPPrepareResponse(BaseModel):
    source: str
    academic_period_id: int
    offering_count: int
    ready_for_generation: bool
    fallback_to_course_sections: bool
    message: str
    offerings: list[SectionOfferingResponse]
