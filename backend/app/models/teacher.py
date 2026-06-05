from datetime import time

from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class Teacher(Base, TimestampMixin):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )

    teacher_code: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
    )

    specialty: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    max_weekly_hours: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=24,
    )

    rating: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=3.0,
    )

    user = relationship(
        "User",
        back_populates="teacher_profile",
    )

    availabilities = relationship(
        "TeacherAvailability",
        back_populates="teacher",
        cascade="all, delete-orphan",
    )

    sections = relationship(
        "CourseSection",
        back_populates="teacher",
    )

    section_offerings = relationship(
        "SectionOffering",
        back_populates="teacher",
    )

    schedule_change_requests = relationship(
        "ScheduleChangeRequest",
        back_populates="teacher",
        cascade="all, delete-orphan",
    )


class TeacherAvailability(Base, TimestampMixin):
    __tablename__ = "teacher_availabilities"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teachers.id", ondelete="CASCADE"),
        nullable=False,
    )

    day_of_week: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    # 1=Lunes, 2=Martes, ..., 7=Domingo

    start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    end_time: Mapped[time] = mapped_column(
        Time,
        nullable=False,
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    teacher = relationship(
        "Teacher",
        back_populates="availabilities",
    )
