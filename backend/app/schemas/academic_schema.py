from datetime import date, datetime

from pydantic import BaseModel, Field, model_validator

from app.models.academic import (
    AcademicPeriodStatus,
    AcademicProgramStatus,
    CurriculumCourseType,
    CurriculumPlanStatus,
    ElectiveArea,
    PrerequisiteType,
)


class AcademicPeriodBase(BaseModel):
    code: str = Field(..., min_length=3, max_length=20)
    name: str = Field(..., min_length=3, max_length=120)
    start_date: date | None = None
    end_date: date | None = None
    status: AcademicPeriodStatus = AcademicPeriodStatus.PLANNED
    is_active: bool = True

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValueError("La fecha inicial no puede ser posterior a la fecha final")
        return self


class AcademicPeriodCreate(AcademicPeriodBase):
    pass


class AcademicPeriodUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=3, max_length=20)
    name: str | None = Field(default=None, min_length=3, max_length=120)
    start_date: date | None = None
    end_date: date | None = None
    status: AcademicPeriodStatus | None = None
    is_active: bool | None = None


class AcademicPeriodResponse(AcademicPeriodBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class AcademicProgramBase(BaseModel):
    code: str = Field(..., min_length=2, max_length=30)
    name: str = Field(..., min_length=3, max_length=180)
    university: str = Field(..., min_length=3, max_length=180)
    faculty: str | None = Field(default=None, max_length=180)
    faculty_id: int | None = Field(default=None, gt=0)
    campus_id: int | None = Field(default=None, gt=0)
    modality: str | None = Field(default=None, max_length=80)
    status: AcademicProgramStatus = AcademicProgramStatus.ACTIVE


class AcademicProgramCreate(AcademicProgramBase):
    pass


class AcademicProgramUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=2, max_length=30)
    name: str | None = Field(default=None, min_length=3, max_length=180)
    university: str | None = Field(default=None, min_length=3, max_length=180)
    faculty: str | None = Field(default=None, max_length=180)
    faculty_id: int | None = Field(default=None, gt=0)
    campus_id: int | None = Field(default=None, gt=0)
    modality: str | None = Field(default=None, max_length=80)
    status: AcademicProgramStatus | None = None


class AcademicProgramResponse(AcademicProgramBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class CurriculumPlanBase(BaseModel):
    program_id: int = Field(..., gt=0)
    code: str = Field(..., min_length=3, max_length=40)
    name: str = Field(..., min_length=3, max_length=200)
    effective_year: int = Field(..., ge=1900, le=2200)
    total_cycles: int = Field(default=10, ge=1, le=20)
    total_credits: int = Field(..., ge=1, le=400)
    status: CurriculumPlanStatus = CurriculumPlanStatus.DRAFT
    source_note: str | None = None


class CurriculumPlanCreate(CurriculumPlanBase):
    pass


class CurriculumPlanUpdate(BaseModel):
    program_id: int | None = Field(default=None, gt=0)
    code: str | None = Field(default=None, min_length=3, max_length=40)
    name: str | None = Field(default=None, min_length=3, max_length=200)
    effective_year: int | None = Field(default=None, ge=1900, le=2200)
    total_cycles: int | None = Field(default=None, ge=1, le=20)
    total_credits: int | None = Field(default=None, ge=1, le=400)
    status: CurriculumPlanStatus | None = None
    source_note: str | None = None


class CurriculumPlanResponse(CurriculumPlanBase):
    id: int
    created_at: datetime
    updated_at: datetime
    program: AcademicProgramResponse | None = None
    model_config = {"from_attributes": True}


class CurriculumCourseBase(BaseModel):
    curriculum_plan_id: int = Field(..., gt=0)
    course_id: int = Field(..., gt=0)
    cycle_number: int = Field(..., ge=1, le=20)
    course_type: CurriculumCourseType = CurriculumCourseType.REQUIRED
    credits: int = Field(..., ge=1, le=10)
    weekly_theory_hours: int = Field(default=0, ge=0, le=20)
    weekly_practice_hours: int = Field(default=0, ge=0, le=20)
    weekly_lab_hours: int = Field(default=0, ge=0, le=20)
    is_suggested_elective: bool = False
    is_active: bool = True


class CurriculumCourseCreate(CurriculumCourseBase):
    pass


class CurriculumCourseUpdate(BaseModel):
    curriculum_plan_id: int | None = Field(default=None, gt=0)
    course_id: int | None = Field(default=None, gt=0)
    cycle_number: int | None = Field(default=None, ge=1, le=20)
    course_type: CurriculumCourseType | None = None
    credits: int | None = Field(default=None, ge=1, le=10)
    weekly_theory_hours: int | None = Field(default=None, ge=0, le=20)
    weekly_practice_hours: int | None = Field(default=None, ge=0, le=20)
    weekly_lab_hours: int | None = Field(default=None, ge=0, le=20)
    is_suggested_elective: bool | None = None
    is_active: bool | None = None


class PrerequisiteCreate(BaseModel):
    curriculum_course_id: int = Field(..., gt=0)
    prerequisite_course_id: int = Field(..., gt=0)
    prerequisite_type: PrerequisiteType = PrerequisiteType.RECOMMENDED
    minimum_grade: float | None = Field(default=None, ge=0, le=20)


class PrerequisiteResponse(PrerequisiteCreate):
    id: int
    prerequisite_course_name: str | None = None
    prerequisite_course_code: str | None = None
    created_at: datetime
    updated_at: datetime


class CurriculumCourseResponse(CurriculumCourseBase):
    id: int
    course_code: str
    course_name: str
    prerequisites: list[PrerequisiteResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


class ElectiveBankCourseBase(BaseModel):
    curriculum_plan_id: int = Field(..., gt=0)
    mention_name: str = Field(..., min_length=3, max_length=160)
    course_name: str = Field(..., min_length=3, max_length=180)
    credits: int = Field(..., ge=1, le=10)
    area: ElectiveArea
    description: str | None = None
    is_active: bool = True


class ElectiveBankCourseCreate(ElectiveBankCourseBase):
    pass


class ElectiveBankCourseUpdate(BaseModel):
    mention_name: str | None = Field(default=None, min_length=3, max_length=160)
    course_name: str | None = Field(default=None, min_length=3, max_length=180)
    credits: int | None = Field(default=None, ge=1, le=10)
    area: ElectiveArea | None = None
    description: str | None = None
    is_active: bool | None = None


class ElectiveBankCourseResponse(ElectiveBankCourseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class CurriculumPlanDetailResponse(CurriculumPlanResponse):
    courses: list[CurriculumCourseResponse]
    elective_bank_courses: list[ElectiveBankCourseResponse]


class StudentEligibleCourseResponse(CurriculumCourseResponse):
    eligible: bool
    blocking_prerequisites: list[str]
    recommended_prerequisites: list[str]


class StudentEligibleCoursesResponse(BaseModel):
    plan: CurriculumPlanResponse
    completed_course_ids: list[int]
    courses: list[StudentEligibleCourseResponse]
