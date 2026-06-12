import enum
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin


USERS_ID_FK = "users.id"


class NotificationType(str, enum.Enum):
    INFO = "INFO"
    SUCCESS = "SUCCESS"
    WARNING = "WARNING"
    ERROR = "ERROR"
    SCHEDULE_PUBLISHED = "SCHEDULE_PUBLISHED"
    CHANGE_REQUEST = "CHANGE_REQUEST"
    OFFERING_UPDATED = "OFFERING_UPDATED"
    CSP_GENERATED = "CSP_GENERATED"
    REPORT_READY = "REPORT_READY"


class RelatedEntityType(str, enum.Enum):
    ACADEMIC_SCHEDULE = "ACADEMIC_SCHEDULE"
    SECTION_OFFERING = "SECTION_OFFERING"
    SCHEDULE_CHANGE_REQUEST = "SCHEDULE_CHANGE_REQUEST"
    STUDENT_SCHEDULE = "STUDENT_SCHEDULE"
    REPORT = "REPORT"
    OTHER = "OTHER"


class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    PUBLISH = "PUBLISH"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    GENERATE_CSP = "GENERATE_CSP"
    SAVE_SOLUTION = "SAVE_SOLUTION"
    EXPORT_REPORT = "EXPORT_REPORT"


class ScheduleChangeType(str, enum.Enum):
    REQUEST_CREATED = "REQUEST_CREATED"
    REQUEST_CANCELLED = "REQUEST_CANCELLED"
    REQUEST_APPROVED = "REQUEST_APPROVED"
    REQUEST_REJECTED = "REQUEST_REJECTED"
    BLOCK_UPDATED = "BLOCK_UPDATED"
    OFFERING_UPDATED = "OFFERING_UPDATED"


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey(USERS_ID_FK, ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[NotificationType] = mapped_column(Enum(NotificationType), nullable=False, index=True)
    related_entity_type: Mapped[RelatedEntityType | None] = mapped_column(Enum(RelatedEntityType), nullable=True)
    related_entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    is_read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, index=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey(USERS_ID_FK, ondelete="SET NULL"), nullable=True, index=True)
    user_role: Mapped[str | None] = mapped_column(String(30), nullable=True)
    action: Mapped[AuditAction] = mapped_column(Enum(AuditAction), nullable=False, index=True)
    entity_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    entity_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    old_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow, index=True)

    user = relationship("User")


class SchedulePublicationHistory(Base):
    __tablename__ = "schedule_publication_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    academic_schedule_id: Mapped[int] = mapped_column(
        ForeignKey("academic_schedules.id", ondelete="CASCADE"), nullable=False, index=True
    )
    academic_period_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_periods.id", ondelete="SET NULL"), nullable=True, index=True
    )
    published_by_user_id: Mapped[int] = mapped_column(ForeignKey(USERS_ID_FK), nullable=False, index=True)
    previous_status: Mapped[str] = mapped_column(String(30), nullable=False)
    new_status: Mapped[str] = mapped_column(String(30), nullable=False)
    publication_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    affected_teachers_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    affected_students_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    affected_sections_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    schedule = relationship("AcademicSchedule")
    academic_period = relationship("AcademicPeriod")
    published_by = relationship("User")


class ScheduleChangeHistory(Base):
    __tablename__ = "schedule_change_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    schedule_change_request_id: Mapped[int | None] = mapped_column(
        ForeignKey("schedule_change_requests.id", ondelete="SET NULL"), nullable=True, index=True
    )
    academic_schedule_id: Mapped[int | None] = mapped_column(
        ForeignKey("academic_schedules.id", ondelete="SET NULL"), nullable=True, index=True
    )
    schedule_block_id: Mapped[int | None] = mapped_column(
        ForeignKey("schedule_blocks.id", ondelete="SET NULL"), nullable=True, index=True
    )
    changed_by_user_id: Mapped[int] = mapped_column(ForeignKey(USERS_ID_FK), nullable=False, index=True)
    change_type: Mapped[ScheduleChangeType] = mapped_column(Enum(ScheduleChangeType), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    old_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    new_values: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    request = relationship("ScheduleChangeRequest")
    schedule = relationship("AcademicSchedule")
    block = relationship("ScheduleBlock")
    changed_by = relationship("User")
