import enum

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class ClassroomType(str, enum.Enum):
    THEORY = "THEORY"
    LAB = "LAB"
    AUDITORIUM = "AUDITORIUM"
    VIRTUAL = "VIRTUAL"


class Classroom(Base, TimestampMixin):
    __tablename__ = "classrooms"

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
        String(120),
        nullable=False,
    )

    capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    classroom_type: Mapped[ClassroomType] = mapped_column(
        Enum(ClassroomType),
        nullable=False,
        default=ClassroomType.THEORY,
    )

    campus: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        default="Principal",
    )

    campus_id: Mapped[int | None] = mapped_column(
        ForeignKey("campuses.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    building: Mapped[str | None] = mapped_column(
        String(80),
        nullable=True,
    )

    floor: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )

    has_projector: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    has_computers: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    schedule_blocks = relationship(
        "ScheduleBlock",
        back_populates="classroom",
    )

    section_offerings = relationship(
        "SectionOffering",
        back_populates="classroom",
    )

    campus_entity = relationship(
        "Campus",
        back_populates="classrooms",
    )
