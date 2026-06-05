from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.traceability import NotificationType
from app.models.user import User
from app.schemas.traceability_schema import NotificationListResponse, NotificationResponse, UnreadCountResponse
from app.services.notification_service import NotificationService


router = APIRouter()


@router.get("/me", response_model=NotificationListResponse)
def list_my_notifications(
    is_read: bool | None = Query(default=None),
    notification_type: NotificationType | None = Query(default=None),
    limit: int = Query(default=30, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return NotificationService(db).list_for_user(current_user.id, is_read, notification_type, limit, offset)


@router.get("/me/unread-count", response_model=UnreadCountResponse)
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return {"unread_count": NotificationService(db).unread_count(current_user.id)}


@router.patch("/read-all")
def read_all(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return NotificationService(db).mark_all_read(current_user.id)


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return NotificationService(db).mark_read(current_user.id, notification_id)


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return NotificationService(db).delete(current_user.id, notification_id)
