from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


CASCADE_ALL_DELETE_ORPHAN = "all, delete-orphan"


class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    code: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    credits: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    cycle: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    career: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    weekly_hours: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=2,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    sections = relationship(
        "CourseSection",
        back_populates="course",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )

    student_enrollments = relationship(
        "StudentCourseEnrollment",
        back_populates="course",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )

    academic_history = relationship(
        "StudentAcademicHistory",
        back_populates="course",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )

    curriculum_courses = relationship(
        "CurriculumCourse",
        back_populates="course",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )

    section_offerings = relationship(
        "SectionOffering",
        back_populates="course",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )


class CourseSection(Base, TimestampMixin):
    __tablename__ = "course_sections"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )

    teacher_id: Mapped[int | None] = mapped_column(
        ForeignKey("teachers.id"),
        nullable=True,
    )

    section_code: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    max_students: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=40,
    )

    enrolled_students: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    course = relationship(
        "Course",
        back_populates="sections",
    )

    teacher = relationship(
        "Teacher",
        back_populates="sections",
    )

    schedule_blocks = relationship(
        "ScheduleBlock",
        back_populates="section",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
    )
