import enum
from datetime import time

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


CASCADE_ALL_DELETE_ORPHAN = "all, delete-orphan"


class ScheduleStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    GENERATED = "GENERATED"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class ScheduleType(str, enum.Enum):
    INSTITUTIONAL = "INSTITUTIONAL"
    STUDENT = "STUDENT"


class ScheduleSourceType(str, enum.Enum):
    COURSE_SECTIONS = "COURSE_SECTIONS"
    SECTION_OFFERINGS = "SECTION_OFFERINGS"


class AcademicSchedule(Base, TimestampMixin):
    __tablename__ = "academic_schedules"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    academic_period: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )  # Ejemplo: 2026-1

    source_type: Mapped[ScheduleSourceType] = mapped_column(
        Enum(ScheduleSourceType),
        nullable=False,
        default=ScheduleSourceType.COURSE_SECTIONS,
    )

    academic_period_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    academic_program_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_programs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    campus_id: Mapped[int | None] = mapped_column(
        ForeignKey("campuses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    faculty_id: Mapped[int | None] = mapped_column(
        ForeignKey("faculties.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    curriculum_plan_id: Mapped[int | None] = mapped_column(
        ForeignKey("curriculum_plans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    schedule_type: Mapped[ScheduleType] = mapped_column(
        Enum(ScheduleType),
        nullable=False,
    )

    status: Mapped[ScheduleStatus] = mapped_column(
        Enum(ScheduleStatus),
        nullable=False,
        default=ScheduleStatus.DRAFT,
    )

    generated_by_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True,
    )

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    generation_strategy: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    quality_score: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    blocks = relationship(
        "ScheduleBlock",
        back_populates="schedule",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )

    student_schedules = relationship(
        "StudentSchedule",
        back_populates="schedule",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )

    academic_period_entity = relationship("AcademicPeriod")
    academic_program = relationship("AcademicProgram")
    campus_entity = relationship("Campus", back_populates="academic_schedules")
    faculty_entity = relationship("Faculty", back_populates="academic_schedules")
    curriculum_plan = relationship("CurriculumPlan")


class ScheduleBlock(Base, TimestampMixin):
    __tablename__ = "schedule_blocks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    schedule_id: Mapped[int] = mapped_column(
        ForeignKey("academic_schedules.id", ondelete="CASCADE"),
        nullable=False,
    )

    section_id: Mapped[int | None] = mapped_column(
        ForeignKey("course_sections.id"),
        nullable=True,
    )

    section_offering_id: Mapped[int | None] = mapped_column(
        ForeignKey("section_offerings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    section_requirement_id: Mapped[int | None] = mapped_column(
        ForeignKey("section_requirements.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    classroom_id: Mapped[int | None] = mapped_column(
        ForeignKey("classrooms.id"),
        nullable=True,
    )

    day_of_week: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )  # 1=Lunes, 2=Martes, ..., 7=Domingo

    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    conflict_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    quality_score: Mapped[float | None] = mapped_column(Float, nullable=True)

    schedule = relationship(
        "AcademicSchedule",
        back_populates="blocks",
    )

    section = relationship(
        "CourseSection",
        back_populates="schedule_blocks",
    )

    classroom = relationship(
        "Classroom",
        back_populates="schedule_blocks",
    )

    section_offering = relationship("SectionOffering", back_populates="schedule_blocks")
    section_requirement = relationship("SectionRequirement", back_populates="schedule_blocks")


class StudentSchedule(Base, TimestampMixin):
    __tablename__ = "student_schedules"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
    )

    schedule_id: Mapped[int] = mapped_column(
        ForeignKey("academic_schedules.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        default="Horario personalizado",
    )

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    is_favorite: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    generation_mode: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="EXPLORATION",
    )

    student = relationship(
        "Student",
        back_populates="student_schedules",
    )

    schedule = relationship(
        "AcademicSchedule",
        back_populates="student_schedules",
    )
    
    selected_blocks = relationship(
        "StudentScheduleBlock",
        back_populates="student_schedule",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )


class StudentScheduleBlock(Base, TimestampMixin):
    __tablename__ = "student_schedule_blocks"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    student_schedule_id: Mapped[int] = mapped_column(
        ForeignKey("student_schedules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    schedule_block_id: Mapped[int] = mapped_column(
        ForeignKey("schedule_blocks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    student_schedule = relationship(
        "StudentSchedule",
        back_populates="selected_blocks",
    )

    schedule_block = relationship("ScheduleBlock")
