import enum

from sqlalchemy import Boolean, CheckConstraint, Enum, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin
from app.models.classroom import ClassroomType


class OfferingModality(str, enum.Enum):
    PRESENTIAL = "PRESENTIAL"
    VIRTUAL = "VIRTUAL"
    HYBRID = "HYBRID"


class OfferingShift(str, enum.Enum):
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"
    NIGHT = "NIGHT"
    FLEXIBLE = "FLEXIBLE"


class OfferingStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    READY = "READY"
    APPROVED = "APPROVED"
    PUBLISHED = "PUBLISHED"
    CLOSED = "CLOSED"


class OfferingConflictType(str, enum.Enum):
    MISSING_TEACHER = "MISSING_TEACHER"
    MISSING_CLASSROOM = "MISSING_CLASSROOM"
    CLASSROOM_CAPACITY = "CLASSROOM_CAPACITY"
    TEACHER_NOT_AVAILABLE = "TEACHER_NOT_AVAILABLE"
    TEACHER_OVERLOAD = "TEACHER_OVERLOAD"
    CLASSROOM_TYPE_MISMATCH = "CLASSROOM_TYPE_MISMATCH"
    DUPLICATED_SECTION = "DUPLICATED_SECTION"
    UNREADY_OFFERING = "UNREADY_OFFERING"


class OfferingConflictSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class SectionOffering(Base, TimestampMixin):
    __tablename__ = "section_offerings"
    __table_args__ = (
        UniqueConstraint(
            "academic_period_id",
            "curriculum_course_id",
            "section_code",
            name="uq_offering_period_curriculum_section",
        ),
        CheckConstraint("estimated_students >= 0", name="ck_offering_estimated_students_nonnegative"),
        CheckConstraint("capacity >= 0", name="ck_offering_capacity_nonnegative"),
        CheckConstraint("cycle_number BETWEEN 1 AND 10", name="ck_offering_cycle_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    academic_period_id: Mapped[int] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_program_id: Mapped[int] = mapped_column(
        ForeignKey("academic_programs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    campus_id: Mapped[int | None] = mapped_column(
        ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    curriculum_plan_id: Mapped[int] = mapped_column(
        ForeignKey("curriculum_plans.id", ondelete="CASCADE"), nullable=False, index=True
    )
    curriculum_course_id: Mapped[int] = mapped_column(
        ForeignKey("curriculum_courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    section_code: Mapped[str] = mapped_column(String(30), nullable=False)
    display_name: Mapped[str] = mapped_column(String(240), nullable=False)
    cycle_number: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    teacher_id: Mapped[int | None] = mapped_column(
        ForeignKey("teachers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    classroom_id: Mapped[int | None] = mapped_column(
        ForeignKey("classrooms.id", ondelete="SET NULL"), nullable=True, index=True
    )
    estimated_students: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    modality: Mapped[OfferingModality] = mapped_column(
        Enum(OfferingModality), nullable=False, default=OfferingModality.PRESENTIAL
    )
    shift: Mapped[OfferingShift] = mapped_column(
        Enum(OfferingShift), nullable=False, default=OfferingShift.FLEXIBLE
    )
    status: Mapped[OfferingStatus] = mapped_column(
        Enum(OfferingStatus), nullable=False, default=OfferingStatus.DRAFT, index=True
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    academic_period = relationship("AcademicPeriod", back_populates="section_offerings")
    academic_program = relationship("AcademicProgram", back_populates="section_offerings")
    campus_entity = relationship("Campus", back_populates="section_offerings")
    curriculum_plan = relationship("CurriculumPlan", back_populates="section_offerings")
    curriculum_course = relationship("CurriculumCourse", back_populates="section_offerings")
    course = relationship("Course", back_populates="section_offerings")
    teacher = relationship("Teacher", back_populates="section_offerings")
    classroom = relationship("Classroom", back_populates="section_offerings")
    requirements = relationship(
        "SectionRequirement", back_populates="section_offering", cascade="all, delete-orphan"
    )
    conflicts = relationship(
        "OfferingConflict", back_populates="section_offering", passive_deletes=True
    )
    schedule_blocks = relationship("ScheduleBlock", back_populates="section_offering")


class SectionRequirement(Base, TimestampMixin):
    __tablename__ = "section_requirements"
    __table_args__ = (
        CheckConstraint("min_capacity >= 0", name="ck_requirement_min_capacity_nonnegative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    section_offering_id: Mapped[int] = mapped_column(
        ForeignKey("section_offerings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    required_classroom_type: Mapped[ClassroomType | None] = mapped_column(
        Enum(ClassroomType), nullable=True
    )
    required_equipment: Mapped[str | None] = mapped_column(String(240), nullable=True)
    requires_lab: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    min_capacity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    preferred_shift: Mapped[OfferingShift | None] = mapped_column(Enum(OfferingShift), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    section_offering = relationship("SectionOffering", back_populates="requirements")
    schedule_blocks = relationship("ScheduleBlock", back_populates="section_requirement")


class OfferingConflict(Base, TimestampMixin):
    __tablename__ = "offering_conflicts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    section_offering_id: Mapped[int | None] = mapped_column(
        ForeignKey("section_offerings.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_period_id: Mapped[int] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="CASCADE"), nullable=False, index=True
    )
    conflict_type: Mapped[OfferingConflictType] = mapped_column(
        Enum(OfferingConflictType), nullable=False, index=True
    )
    severity: Mapped[OfferingConflictSeverity] = mapped_column(
        Enum(OfferingConflictSeverity), nullable=False, index=True
    )
    message: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)

    section_offering = relationship("SectionOffering", back_populates="conflicts")
    academic_period = relationship("AcademicPeriod")
