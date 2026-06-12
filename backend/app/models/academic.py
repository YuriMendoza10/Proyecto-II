import enum
from datetime import date

from sqlalchemy import Boolean, Date, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class AcademicPeriodStatus(str, enum.Enum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"


class Faculty(Base, TimestampMixin):
    __tablename__ = "faculties"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(180), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    academic_programs = relationship("AcademicProgram", back_populates="faculty_entity")
    academic_schedules = relationship("AcademicSchedule", back_populates="faculty_entity")


class Campus(Base, TimestampMixin):
    __tablename__ = "campuses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(180), unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    address: Mapped[str | None] = mapped_column(String(240), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    academic_programs = relationship("AcademicProgram", back_populates="campus_entity")
    classrooms = relationship("Classroom", back_populates="campus_entity")
    section_offerings = relationship("SectionOffering", back_populates="campus_entity")
    academic_schedules = relationship("AcademicSchedule", back_populates="campus_entity")


class AcademicProgramStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class CurriculumPlanStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    DRAFT = "DRAFT"


class CurriculumCourseType(str, enum.Enum):
    REQUIRED = "REQUIRED"
    GENERAL_ELECTIVE = "GENERAL_ELECTIVE"
    SPECIALTY_ELECTIVE = "SPECIALTY_ELECTIVE"
    GENERAL = "GENERAL"
    SPECIALTY = "SPECIALTY"


class PrerequisiteType(str, enum.Enum):
    REQUIRED = "REQUIRED"
    CO_REQUIRED = "CO_REQUIRED"
    RECOMMENDED = "RECOMMENDED"


class ElectiveArea(str, enum.Enum):
    IA_DATA = "IA_DATA"
    CYBERSECURITY = "CYBERSECURITY"
    DEVOPS = "DEVOPS"
    MANAGEMENT = "MANAGEMENT"


class AcademicPeriod(Base, TimestampMixin):
    __tablename__ = "academic_periods"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[AcademicPeriodStatus] = mapped_column(
        Enum(AcademicPeriodStatus), nullable=False, default=AcademicPeriodStatus.PLANNED
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    section_offerings = relationship(
        "SectionOffering", back_populates="academic_period", cascade="all, delete-orphan"
    )


class AcademicProgram(Base, TimestampMixin):
    __tablename__ = "academic_programs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    university: Mapped[str] = mapped_column(String(180), nullable=False)
    faculty: Mapped[str | None] = mapped_column(String(180), nullable=True)
    faculty_id: Mapped[int | None] = mapped_column(
        ForeignKey("faculties.id", ondelete="SET NULL"), nullable=True, index=True
    )
    campus_id: Mapped[int | None] = mapped_column(
        ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    modality: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[AcademicProgramStatus] = mapped_column(
        Enum(AcademicProgramStatus), nullable=False, default=AcademicProgramStatus.ACTIVE
    )

    curriculum_plans = relationship(
        "CurriculumPlan", back_populates="program", cascade="all, delete-orphan"
    )
    faculty_entity = relationship("Faculty", back_populates="academic_programs")
    campus_entity = relationship("Campus", back_populates="academic_programs")
    section_offerings = relationship(
        "SectionOffering", back_populates="academic_program", cascade="all, delete-orphan"
    )


class CurriculumPlan(Base, TimestampMixin):
    __tablename__ = "curriculum_plans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    program_id: Mapped[int] = mapped_column(
        ForeignKey("academic_programs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    effective_year: Mapped[int] = mapped_column(Integer, nullable=False)
    total_cycles: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    total_credits: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[CurriculumPlanStatus] = mapped_column(
        Enum(CurriculumPlanStatus), nullable=False, default=CurriculumPlanStatus.DRAFT
    )
    source_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    program = relationship("AcademicProgram", back_populates="curriculum_plans")
    curriculum_courses = relationship(
        "CurriculumCourse", back_populates="curriculum_plan", cascade="all, delete-orphan"
    )
    elective_bank_courses = relationship(
        "ElectiveBankCourse", back_populates="curriculum_plan", cascade="all, delete-orphan"
    )
    section_offerings = relationship(
        "SectionOffering", back_populates="curriculum_plan", cascade="all, delete-orphan"
    )


class CurriculumCourse(Base, TimestampMixin):
    __tablename__ = "curriculum_courses"
    __table_args__ = (
        UniqueConstraint(
            "curriculum_plan_id", "course_id", name="uq_curriculum_plan_course"
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    curriculum_plan_id: Mapped[int] = mapped_column(
        ForeignKey("curriculum_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    cycle_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    course_type: Mapped[CurriculumCourseType] = mapped_column(
        Enum(CurriculumCourseType), nullable=False, default=CurriculumCourseType.REQUIRED
    )
    credits: Mapped[int] = mapped_column(Integer, nullable=False)
    weekly_theory_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    weekly_practice_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    weekly_lab_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_suggested_elective: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    curriculum_plan = relationship("CurriculumPlan", back_populates="curriculum_courses")
    course = relationship("Course", back_populates="curriculum_courses")
    prerequisites = relationship(
        "CoursePrerequisite",
        foreign_keys="CoursePrerequisite.curriculum_course_id",
        back_populates="curriculum_course",
        cascade="all, delete-orphan",
    )
    prerequisite_for = relationship(
        "CoursePrerequisite",
        foreign_keys="CoursePrerequisite.prerequisite_course_id",
        back_populates="prerequisite_course",
        passive_deletes=True,
    )
    section_offerings = relationship(
        "SectionOffering", back_populates="curriculum_course", cascade="all, delete-orphan"
    )


class CoursePrerequisite(Base, TimestampMixin):
    __tablename__ = "course_prerequisites"
    __table_args__ = (
        UniqueConstraint(
            "curriculum_course_id",
            "prerequisite_course_id",
            name="uq_course_prerequisite_pair",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    curriculum_course_id: Mapped[int] = mapped_column(
        ForeignKey("curriculum_courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prerequisite_course_id: Mapped[int] = mapped_column(
        ForeignKey("curriculum_courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prerequisite_type: Mapped[PrerequisiteType] = mapped_column(
        Enum(PrerequisiteType), nullable=False, default=PrerequisiteType.RECOMMENDED
    )
    minimum_grade: Mapped[float | None] = mapped_column(Float, nullable=True)

    curriculum_course = relationship(
        "CurriculumCourse",
        foreign_keys=[curriculum_course_id],
        back_populates="prerequisites",
    )
    prerequisite_course = relationship(
        "CurriculumCourse",
        foreign_keys=[prerequisite_course_id],
        back_populates="prerequisite_for",
    )


class ElectiveBankCourse(Base, TimestampMixin):
    __tablename__ = "elective_bank_courses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    curriculum_plan_id: Mapped[int] = mapped_column(
        ForeignKey("curriculum_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    mention_name: Mapped[str] = mapped_column(String(160), nullable=False)
    course_name: Mapped[str] = mapped_column(String(180), nullable=False)
    credits: Mapped[int] = mapped_column(Integer, nullable=False)
    area: Mapped[ElectiveArea] = mapped_column(Enum(ElectiveArea), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    curriculum_plan = relationship("CurriculumPlan", back_populates="elective_bank_courses")
