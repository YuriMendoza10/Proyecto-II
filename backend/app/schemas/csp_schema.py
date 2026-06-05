from datetime import time
from typing import Literal

from pydantic import BaseModel, Field, model_validator


class AvailableScheduleResponse(BaseModel):
    id: int
    name: str
    status: str
    source_type: str
    academic_period_id: int | None = None
    academic_period_code: str | None = None
    academic_program_id: int | None = None
    academic_program_name: str | None = None
    curriculum_plan_id: int | None = None
    curriculum_plan_code: str | None = None
    quality_score: float | None = None
    blocks_count: int = 0
    created_at: str | None = None
    updated_at: str | None = None
    label: str


class AcademicTimeSlot(BaseModel):
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_slot(self):
        if self.start_time >= self.end_time:
            raise ValueError("La hora de inicio de la franja debe ser menor que la hora de fin")

        if self.start_time < time(7, 0):
            raise ValueError("La franja no puede iniciar antes de las 07:00")

        if self.end_time > time(22, 0):
            raise ValueError("La franja no puede terminar después de las 22:00")

        return self


class InstitutionalCSPGenerateRequest(BaseModel):
    schedule_id: int = Field(..., gt=0)
    academic_period: str = Field(default="2026-1")

    max_solutions: int = Field(default=5, ge=1, le=50)

    use_academic_slots: bool = True
    academic_slots: list[AcademicTimeSlot] | None = None

    start_hour: time = time(7, 0)
    end_hour: time = time(22, 0)

    default_block_duration_minutes: int = Field(default=90, ge=30, le=240)
    min_block_duration_minutes: int = Field(default=60, ge=30, le=240)
    transfer_tolerance_minutes: int = Field(default=10, ge=0, le=30)

    days: list[int] = Field(default=[1, 2, 3, 4, 5, 6, 7])

    clear_existing_blocks: bool = False
    avoid_duplicate_section_blocks: bool = True

    diversity_strategy: Literal["ORDERED", "SHUFFLE", "ROTATE", "MIXED"] = "ORDERED"
    random_seed: int | None = None

    distribution_strategy: Literal["COMPACT", "BALANCED", "SPREAD"] = Field(
        default="BALANCED",
        description=(
            "Estrategia de distribución de bloques. "
            "COMPACT concentra más, BALANCED balancea por días, SPREAD distribuye más."
        ),
    )

    avoid_same_section_same_day: bool = Field(
        default=True,
        description="Evita que una misma sección tenga más de un bloque el mismo día.",
    )

    max_blocks_per_day: int | None = Field(
        default=None,
        ge=1,
        le=200,
        description="Máximo de bloques permitidos por día para este lote de generación.",
    )

    career_filter: str | None = Field(default=None)
    cycle_filter: list[int] = Field(default=[])
    course_ids: list[int] = Field(default=[])
    max_sections_to_schedule: int | None = Field(default=None, ge=1, le=500)

    @model_validator(mode="after")
    def validate_request(self):
        invalid_days = [
            day
            for day in self.days
            if day < 1 or day > 7
        ]

        if invalid_days:
            raise ValueError("Los días deben estar entre 1 y 7")

        if len(set(self.days)) != len(self.days):
            raise ValueError("No se deben repetir días")

        if self.start_hour >= self.end_hour:
            raise ValueError("La hora de inicio debe ser menor que la hora de fin")

        if len(set(self.cycle_filter)) != len(self.cycle_filter):
            raise ValueError("No se deben repetir ciclos en cycle_filter")

        invalid_cycles = [
            cycle
            for cycle in self.cycle_filter
            if cycle < 1 or cycle > 20
        ]

        if invalid_cycles:
            raise ValueError("Los ciclos deben estar entre 1 y 20")

        if len(set(self.course_ids)) != len(self.course_ids):
            raise ValueError("No se deben repetir cursos en course_ids")

        invalid_course_ids = [
            course_id
            for course_id in self.course_ids
            if course_id <= 0
        ]

        if invalid_course_ids:
            raise ValueError("Los course_ids deben ser mayores que 0")

        return self


class InstitutionalCSPSaveSelectedRequest(InstitutionalCSPGenerateRequest):
    solution_index: int = Field(
        ...,
        ge=0,
        description="Índice de la solución elegida desde el preview.",
    )


class GeneratedBlockPreview(BaseModel):
    section_id: int
    course_id: int
    teacher_id: int | None
    classroom_id: int | None
    day_of_week: int
    start_time: time
    end_time: time
    duration_minutes: int


class SolutionScorePreview(BaseModel):
    solution_index: int
    score: float
    total_blocks: int


class CSPSolutionPreview(BaseModel):
    solution_index: int
    score: float
    total_blocks: int
    blocks: list[GeneratedBlockPreview]


class InstitutionalCSPGenerateResponse(BaseModel):

    career_filter: str | None = None
    cycle_filter: list[int] = []
    course_ids: list[int] = []
    max_sections_to_schedule: int | None = None
    sections_considered: int = 0
    
    success: bool
    message: str
    schedule_id: int

    evaluated_solutions: int
    selected_solution_index: int

    generated_blocks: int
    score: float

    diversity_strategy: str
    random_seed: int | None
    distribution_strategy: str | None = None
    avoid_same_section_same_day: bool = True
    max_blocks_per_day: int | None = None

    solution_scores: list[SolutionScorePreview]
    blocks: list[GeneratedBlockPreview]


class InstitutionalCSPPreviewResponse(BaseModel):

    career_filter: str | None = None
    cycle_filter: list[int] = []
    course_ids: list[int] = []
    max_sections_to_schedule: int | None = None
    sections_considered: int = 0

    success: bool
    message: str
    schedule_id: int

    evaluated_solutions: int
    best_solution_index: int
    best_score: float

    diversity_strategy: str
    random_seed: int | None
    distribution_strategy: str | None = None
    avoid_same_section_same_day: bool = True
    max_blocks_per_day: int | None = None

    solutions: list[CSPSolutionPreview]
