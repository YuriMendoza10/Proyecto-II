from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.traceability import Notification


class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, *, user_id, title, message, notification_type, related_entity_type=None, related_entity_id=None):
        item = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            related_entity_type=related_entity_type,
            related_entity_id=related_entity_id,
        )
        self.db.add(item)
        return item

    def create_many(self, user_ids, **values):
        for user_id in set(user_ids):
            self.create(user_id=user_id, **values)

    def list_for_user(self, user_id, is_read=None, notification_type=None, limit=30, offset=0):
        query = self.db.query(Notification).filter(Notification.user_id == user_id)
        if is_read is not None:
            query = query.filter(Notification.is_read == is_read)
        if notification_type is not None:
            query = query.filter(Notification.notification_type == notification_type)
        total = query.count()
        items = query.order_by(Notification.created_at.desc(), Notification.id.desc()).offset(offset).limit(limit).all()
        return {"total": total, "notifications": items}

    def unread_count(self, user_id):
        return self.db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read.is_(False)
        ).count()

    def mark_read(self, user_id, notification_id):
        item = self._own(user_id, notification_id)
        if not item.is_read:
            item.is_read = True
            item.read_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(item)
        return item

    def mark_all_read(self, user_id):
        items = self.db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read.is_(False)
        ).all()
        now = datetime.now(timezone.utc)
        for item in items:
            item.is_read = True
            item.read_at = now
        self.db.commit()
        return {"marked_read": len(items)}

    def delete(self, user_id, notification_id):
        item = self._own(user_id, notification_id)
        self.db.delete(item)
        self.db.commit()
        return {"message": "Notificacion eliminada correctamente"}

    def _own(self, user_id, notification_id):
        item = self.db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id,
        ).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notificacion no encontrada")
        return item
