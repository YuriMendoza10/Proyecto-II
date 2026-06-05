from datetime import time
from typing import Literal

from pydantic import BaseModel, Field, model_validator

PreferredShift = Literal[
    "ANY",
    "MORNING",
    "AFTERNOON",
    "NIGHT",
]


class StudentCSPPreviewRequest(BaseModel):
    student_id: int = Field(..., gt=0)
    institutional_schedule_id: int = Field(..., gt=0)

    target_credits: int | None = Field(
        default=None,
        ge=7,
        le=25,
        description="Créditos objetivo. Si es null, usa el máximo del estudiante.",
    )

    unavailable_days: list[int] = Field(
        default=[],
        description="Días en los que el estudiante no desea clases. 1=Lunes, 7=Domingo.",
    )

    selected_course_ids: list[int] = Field(
        default=[],
        description="Cursos que el estudiante desea considerar en la optimización.",
    )

    preferred_teacher_ids: list[int] = Field(
        default=[],
        description="Docentes que el estudiante prefiere para priorizar soluciones.",
    )

    avoided_teacher_ids: list[int] = Field(
        default=[],
        description="Docentes que el estudiante prefiere evitar al generar soluciones.",
    )

    require_all_selected_courses: bool = Field(
        default=False,
        description="Si es true, la solución debe incluir todos los cursos seleccionados.",
    )

    preferred_shift: PreferredShift = Field(default="ANY")

    max_solutions: int = Field(default=10, ge=1, le=50)

    transfer_tolerance_minutes: int = Field(default=10, ge=0, le=30)

    @model_validator(mode="after")
    def validate_request(self):
        invalid_days = [
            day
            for day in self.unavailable_days
            if day < 1 or day > 7
        ]

        if invalid_days:
            raise ValueError("Los días no disponibles deben estar entre 1 y 7")

        if len(set(self.unavailable_days)) != len(self.unavailable_days):
            raise ValueError("No se deben repetir días no disponibles")

        if len(set(self.selected_course_ids)) != len(self.selected_course_ids):
            raise ValueError("No se deben repetir cursos seleccionados")

        invalid_course_ids = [
            course_id
            for course_id in self.selected_course_ids
            if course_id <= 0
        ]

        if invalid_course_ids:
            raise ValueError("Los IDs de cursos seleccionados deben ser mayores que 0")

        if len(set(self.preferred_teacher_ids)) != len(self.preferred_teacher_ids):
            raise ValueError("No se deben repetir docentes preferidos")

        if len(set(self.avoided_teacher_ids)) != len(self.avoided_teacher_ids):
            raise ValueError("No se deben repetir docentes a evitar")

        invalid_preferred_teacher_ids = [
            teacher_id
            for teacher_id in self.preferred_teacher_ids
            if teacher_id <= 0
        ]

        if invalid_preferred_teacher_ids:
            raise ValueError("Los IDs de docentes preferidos deben ser mayores que 0")

        invalid_avoided_teacher_ids = [
            teacher_id
            for teacher_id in self.avoided_teacher_ids
            if teacher_id <= 0
        ]

        if invalid_avoided_teacher_ids:
            raise ValueError("Los IDs de docentes a evitar deben ser mayores que 0")

        repeated_between_preferences = set(self.preferred_teacher_ids).intersection(
            set(self.avoided_teacher_ids)
        )

        if repeated_between_preferences:
            raise ValueError(
                "Un docente no puede estar al mismo tiempo como preferido y evitado"
            )

        return self


class StudentCSPSaveSelectedRequest(StudentCSPPreviewRequest):
    solution_index: int = Field(
        ...,
        ge=0,
        description="Índice de la solución elegida desde el preview.",
    )

    name: str = Field(
        default="Horario personalizado",
        min_length=3,
        max_length=150,
    )

    is_favorite: bool = Field(default=True)


class StudentScheduleBlockPreview(BaseModel):
    schedule_block_id: int | None = None

    section_id: int | None = None
    section_offering_id: int | None = None
    section_code: str | None

    course_id: int
    course_code: str | None
    course_name: str | None
    credits: int

    teacher_id: int | None
    teacher_code: str | None
    teacher_name: str | None

    classroom_id: int | None
    classroom_code: str | None
    classroom_name: str | None

    day_of_week: int
    start_time: time
    end_time: time


class StudentScheduleScoreBreakdown(BaseModel):
    base_score: float

    credit_score: float
    used_days_score: float
    gaps_score: float
    shift_score: float
    late_classes_score: float
    compactness_score: float
    daily_balance_score: float
    weekend_score: float

    final_score: float
    details: dict


# ✅ Nueva clase de explicación
class StudentSolutionExplanationResponse(BaseModel):
    summary: str
    strengths: list[str]
    warnings: list[str]
    metrics: dict


class StudentScheduleSolutionPreview(BaseModel):
    solution_index: int
    score: float
    total_credits: int
    total_courses: int
    used_days: list[int]
    score_breakdown: StudentScheduleScoreBreakdown | None = None
    explanation: StudentSolutionExplanationResponse | None = None   # ✅ Campo agregado
    blocks: list[StudentScheduleBlockPreview]


class StudentCSPPreviewResponse(BaseModel):
    success: bool
    message: str

    student_id: int
    institutional_schedule_id: int

    evaluated_solutions: int
    best_solution_index: int
    best_score: float

    min_credits: int
    max_credits: int
    target_credits: int

    solutions: list[StudentScheduleSolutionPreview]


class StudentCSPSaveSelectedResponse(BaseModel):
    success: bool
    message: str

    student_schedule_id: int
    student_id: int
    institutional_schedule_id: int

    selected_solution_index: int
    score: float
    total_credits: int
    total_courses: int
    is_favorite: bool

    score_breakdown: StudentScheduleScoreBreakdown | None = None
    blocks: list[StudentScheduleBlockPreview]


class StudentSavedScheduleSummary(BaseModel):
    id: int
    student_id: int
    institutional_schedule_id: int
    name: str
    score: float
    is_favorite: bool
    generation_mode: str = "EXPLORATION"
    total_credits: int
    total_courses: int
    total_blocks: int


class StudentSavedScheduleDetail(BaseModel):
    id: int
    student_id: int
    institutional_schedule_id: int
    name: str
    score: float
    is_favorite: bool
    generation_mode: str = "EXPLORATION"
    total_credits: int
    total_courses: int
    total_blocks: int
    blocks: list[StudentScheduleBlockPreview]


class StudentSavedScheduleFavoriteResponse(BaseModel):
    success: bool
    message: str
    student_schedule_id: int
    student_id: int
    is_favorite: bool


class StudentOfferCourseResponse(BaseModel):
    course_id: int
    course_code: str | None = None
    course_name: str | None = None
    credits: int
    cycle: int
    career: str
    weekly_hours: int | None = None

    available_sections: int
    available_blocks: int


class StudentOfferCoursesResponse(BaseModel):
    success: bool
    message: str

    student_id: int
    institutional_schedule_id: int

    total_courses: int
    total_credits: int

    courses: list[StudentOfferCourseResponse]


class StudentOfferTeacherAvailabilityResponse(BaseModel):
    day_of_week: int
    start_time: time
    end_time: time
    is_available: bool


class StudentOfferBlockResponse(BaseModel):
    schedule_block_id: int
    classroom_id: int | None = None
    classroom_code: str | None = None
    classroom_name: str | None = None
    day_of_week: int
    start_time: time
    end_time: time


class StudentOfferSectionResponse(BaseModel):
    section_id: int
    section_code: str | None = None

    teacher_id: int | None = None
    teacher_code: str | None = None
    teacher_name: str | None = None
    teacher_specialty: str | None = None
    teacher_rating: float | None = None

    blocks: list[StudentOfferBlockResponse]
    teacher_availability: list[StudentOfferTeacherAvailabilityResponse]


class StudentOfferDetailCourseResponse(BaseModel):
    course_id: int
    course_code: str | None = None
    course_name: str | None = None
    credits: int
    cycle: int
    career: str
    weekly_hours: int | None = None

    sections: list[StudentOfferSectionResponse]


class StudentOfferDetailResponse(BaseModel):
    success: bool
    message: str

    student_id: int
    institutional_schedule_id: int

    total_courses: int
    total_sections: int
    total_blocks: int

    courses: list[StudentOfferDetailCourseResponse]
