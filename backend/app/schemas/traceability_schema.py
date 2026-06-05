from datetime import datetime

from pydantic import BaseModel

from app.models.traceability import AuditAction, NotificationType, RelatedEntityType, ScheduleChangeType


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: NotificationType
    related_entity_type: RelatedEntityType | None
    related_entity_id: int | None
    is_read: bool
    read_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    total: int
    notifications: list[NotificationResponse]


class UnreadCountResponse(BaseModel):
    unread_count: int


class AuditLogResponse(BaseModel):
    id: int
    user_id: int | None
    user_role: str | None
    action: AuditAction
    entity_type: str
    entity_id: int | None
    description: str
    old_values: dict | None
    new_values: dict | None
    ip_address: str | None
    user_agent: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    total: int
    logs: list[AuditLogResponse]


class PublicationHistoryResponse(BaseModel):
    id: int
    academic_schedule_id: int
    academic_period_id: int | None
    published_by_user_id: int
    previous_status: str
    new_status: str
    publication_notes: str | None
    affected_teachers_count: int
    affected_students_count: int
    affected_sections_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ChangeHistoryResponse(BaseModel):
    id: int
    schedule_change_request_id: int | None
    academic_schedule_id: int | None
    schedule_block_id: int | None
    changed_by_user_id: int
    change_type: ScheduleChangeType
    description: str
    old_values: dict | None
    new_values: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}
