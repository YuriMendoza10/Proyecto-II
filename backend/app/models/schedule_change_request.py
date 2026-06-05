import enum
from datetime import datetime, time

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


class ScheduleChangeRequestType(str, enum.Enum):
    CHANGE_TIME = "CHANGE_TIME"
    CHANGE_CLASSROOM = "CHANGE_CLASSROOM"
    SWAP_SECTION = "SWAP_SECTION"
    AVAILABILITY_CONFLICT = "AVAILABILITY_CONFLICT"
    OTHER = "OTHER"


class ScheduleChangeRequestStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"


class ScheduleChangeRequest(Base, TimestampMixin):
    __tablename__ = "schedule_change_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    schedule_block_id: Mapped[int | None] = mapped_column(
        ForeignKey("schedule_blocks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    section_offering_id: Mapped[int | None] = mapped_column(
        ForeignKey("section_offerings.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_period_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="SET NULL"), nullable=True, index=True
    )
    request_type: Mapped[ScheduleChangeRequestType] = mapped_column(
        Enum(ScheduleChangeRequestType), nullable=False
    )
    current_day_of_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    current_start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    current_end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    requested_day_of_week: Mapped[int | None] = mapped_column(Integer, nullable=True)
    requested_start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    requested_end_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[ScheduleChangeRequestStatus] = mapped_column(
        Enum(ScheduleChangeRequestStatus), nullable=False, default=ScheduleChangeRequestStatus.PENDING, index=True
    )
    coordinator_response: Mapped[str | None] = mapped_column(Text, nullable=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    teacher = relationship("Teacher", back_populates="schedule_change_requests")
    schedule_block = relationship("ScheduleBlock")
    section_offering = relationship("SectionOffering")
    academic_period = relationship("AcademicPeriod")
