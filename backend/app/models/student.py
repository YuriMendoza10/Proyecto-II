import enum

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class StudentEnrollmentStatus(str, enum.Enum):
    ENROLLED = "ENROLLED"
    RESERVED = "RESERVED"
    GRADUATED = "GRADUATED"
    WITHDRAWN = "WITHDRAWN"
    SUSPENDED = "SUSPENDED"


class StudentAcademicHistoryStatus(str, enum.Enum):
    APPROVED = "APPROVED"
    FAILED = "FAILED"
    IN_PROGRESS = "IN_PROGRESS"
    WITHDRAWN = "WITHDRAWN"
    PENDING_REVIEW = "PENDING_REVIEW"


class Student(Base, TimestampMixin):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    student_code: Mapped[str] = mapped_column(String(30), unique=True, index=True, nullable=False)
    career: Mapped[str] = mapped_column(String(120), nullable=False)
    academic_program_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_programs.id", ondelete="SET NULL"), nullable=True, index=True
    )
    curriculum_plan_id: Mapped[int | None] = mapped_column(
        ForeignKey("curriculum_plans.id", ondelete="SET NULL"), nullable=True, index=True
    )
    campus_id: Mapped[int | None] = mapped_column(
        ForeignKey("campuses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    admission_period_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="SET NULL"), nullable=True, index=True
    )
    current_cycle: Mapped[int] = mapped_column(Integer, nullable=False, default=1, index=True)
    min_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=7)
    max_credits: Mapped[int] = mapped_column(Integer, nullable=False, default=25)
    max_credits_allowed: Mapped[int | None] = mapped_column(Integer, nullable=True, default=25)
    enrollment_status: Mapped[StudentEnrollmentStatus] = mapped_column(
        Enum(StudentEnrollmentStatus),
        nullable=False,
        default=StudentEnrollmentStatus.ENROLLED,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    user = relationship("User", back_populates="student_profile")
    student_schedules = relationship(
        "StudentSchedule", back_populates="student", cascade="all, delete-orphan"
    )
    course_enrollments = relationship(
        "StudentCourseEnrollment", back_populates="student", cascade="all, delete-orphan"
    )
    academic_history = relationship(
        "StudentAcademicHistory", back_populates="student", cascade="all, delete-orphan"
    )
    academic_program = relationship("AcademicProgram")
    curriculum_plan = relationship("CurriculumPlan")
    campus = relationship("Campus")
    admission_period = relationship("AcademicPeriod")

    @property
    def student_name(self):
        return self.user.full_name if self.user else None

    @property
    def academic_program_name(self):
        return self.academic_program.name if self.academic_program else None

    @property
    def curriculum_plan_code(self):
        return self.curriculum_plan.code if self.curriculum_plan else None

    @property
    def campus_name(self):
        return self.campus.name if self.campus else None


class StudentAcademicHistory(Base, TimestampMixin):
    __tablename__ = "student_academic_history"
    __table_args__ = (
        UniqueConstraint(
            "student_id",
            "course_id",
            "academic_period_id",
            "attempt_number",
            name="uq_student_history_course_period_attempt",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_period_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[StudentAcademicHistoryStatus] = mapped_column(
        Enum(StudentAcademicHistoryStatus), nullable=False, index=True
    )
    grade: Mapped[float | None] = mapped_column(Float, nullable=True)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    credits: Mapped[int | None] = mapped_column(Integer, nullable=True)
    observation: Mapped[str | None] = mapped_column(Text, nullable=True)

    student = relationship("Student", back_populates="academic_history")
    course = relationship("Course", back_populates="academic_history")
    academic_period = relationship("AcademicPeriod")


class StudentCourseEnrollment(Base, TimestampMixin):
    __tablename__ = "student_course_enrollments"
    __table_args__ = (
        UniqueConstraint("student_id", "course_id", "academic_period", name="uq_student_course_period"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_period: Mapped[str] = mapped_column(String(20), nullable=False, default="2026-1", index=True)
    academic_period_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="SET NULL"), nullable=True, index=True
    )
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="ENROLLED")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    student = relationship("Student", back_populates="course_enrollments")
    course = relationship("Course", back_populates="student_enrollments")
    academic_period_entity = relationship("AcademicPeriod")
