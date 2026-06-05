from datetime import time
from typing import Literal

from pydantic import BaseModel, Field


OfferingStrategy = Literal["COMPACT", "BALANCED", "SPREAD"]


class OfferingCSPGenerateRequest(BaseModel):
    academic_period_id: int = Field(..., gt=0)
    academic_program_id: int | None = Field(default=None, gt=0)
    curriculum_plan_id: int | None = Field(default=None, gt=0)
    cycles: list[int] | str | None = Field(default=[])
    strategy: OfferingStrategy = "BALANCED"
    max_solutions: int = Field(default=3, ge=1, le=20)
    include_approved_only: bool = False
    allow_ready: bool = True
    respect_teacher_availability: bool = True
    respect_classroom_capacity: bool = True
    respect_classroom_requirements: bool = True
    avoid_same_cycle_conflicts: bool = True


class OfferingCSPBlockResponse(BaseModel):
    section_offering_id: int
    section_requirement_id: int | None = None
    course_id: int
    course_name: str
    section_code: str
    cycle_number: int
    teacher_id: int
    teacher_name: str | None = None
    classroom_id: int | None = None
    classroom_code: str | None = None
    day_of_week: int
    start_time: time
    end_time: time
    modality: str


class OfferingCSPSolutionResponse(BaseModel):
    solution_index: int
    score_total: float
    score_breakdown: dict[str, float]
    hard_conflicts: list[str]
    soft_warnings: list[str]
    classroom_usage: dict[str, int]
    teacher_load_summary: dict[str, float]
    cycle_distribution: dict[str, list[int]]
    blocks: list[OfferingCSPBlockResponse]


class OfferingCSPGenerateResponse(BaseModel):
    success: bool
    message: str
    source_type: str
    fallback_to_course_sections: bool = False
    academic_period_id: int
    offering_count: int
    solutions: list[OfferingCSPSolutionResponse]
    conflicts: list[str]
    warnings: list[str]
    quality_score: float | None = None
    score_breakdown: dict[str, float] = {}
    teacher_load_summary: dict[str, float] = {}
    classroom_usage: dict[str, int] = {}
    cycle_distribution: dict[str, list[int]] = {}


class OfferingCSPPreviewResponse(BaseModel):
    success: bool
    message: str
    source_type: str = "SECTION_OFFERINGS"
    academic_period_id: int
    academic_program_id: int | None = None
    curriculum_plan_id: int | None = None
    cycles: list[int] | str | None = []
    total_offerings: int
    ready_offerings: int
    approved_offerings: int
    eligible_offerings: int
    missing_teacher: int
    missing_classroom: int
    summary_by_cycle: list[dict] = []
    not_eligible_by_cycle: list[dict] = []
    conflicts: list[dict] = []
    warnings: list[str] = []
    can_generate: bool
    summary: dict = {}


class OfferingCSPSaveSolutionRequest(OfferingCSPGenerateRequest):
    solution_index: int = Field(default=0, ge=0)
    schedule_name: str = Field(default="Horario institucional desde ofertas", min_length=3, max_length=150)


class OfferingCSPSaveSolutionResponse(BaseModel):
    success: bool
    message: str
    schedule_id: int
    schedule_status: str
    source_type: str
    quality_score: float
    total_blocks: int
    blocks: list[OfferingCSPBlockResponse]
