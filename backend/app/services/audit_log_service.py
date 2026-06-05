import csv
import io
from datetime import date, datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.traceability import AuditLog


class AuditLogService:
    SENSITIVE_FIELDS = {"password", "hashed_password", "token", "access_token", "secret", "secret_key"}

    def __init__(self, db: Session):
        self.db = db

    def record(
        self, *, actor=None, action, entity_type, entity_id=None, description,
        old_values=None, new_values=None, ip_address=None, user_agent=None, commit=False,
    ):
        item = AuditLog(
            user_id=actor.id if actor else None,
            user_role=actor.role.value if actor and hasattr(actor.role, "value") else str(actor.role) if actor else None,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            description=description,
            old_values=self.sanitize(old_values),
            new_values=self.sanitize(new_values),
            ip_address=ip_address,
            user_agent=user_agent[:255] if user_agent else None,
        )
        self.db.add(item)
        if commit:
            self.db.commit()
            self.db.refresh(item)
        return item

    def list(self, user_id=None, action=None, entity_type=None, date_from=None, date_to=None, limit=200, offset=0):
        query = self.db.query(AuditLog)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if action:
            query = query.filter(AuditLog.action == action)
        if entity_type:
            query = query.filter(AuditLog.entity_type == entity_type)
        if date_from:
            query = query.filter(AuditLog.created_at >= date_from)
        if date_to:
            query = query.filter(AuditLog.created_at <= date_to)
        total = query.count()
        return total, query.order_by(AuditLog.created_at.desc(), AuditLog.id.desc()).offset(offset).limit(limit).all()

    def get(self, audit_id):
        item = self.db.query(AuditLog).filter(AuditLog.id == audit_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de auditoria no encontrado")
        return item

    def csv(self, **filters):
        _, items = self.list(**filters, limit=10000, offset=0)
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["id", "user_id", "user_role", "action", "entity_type", "entity_id", "description", "created_at"])
        for item in items:
            writer.writerow([
                item.id, item.user_id, item.user_role, item.action.value, item.entity_type,
                item.entity_id, item.description, item.created_at.isoformat(),
            ])
        return output.getvalue()

    @classmethod
    def sanitize(cls, value):
        if value is None:
            return None
        if hasattr(value, "model_dump"):
            value = value.model_dump()
        if isinstance(value, dict):
            return {
                key: "[REDACTED]" if key.lower() in cls.SENSITIVE_FIELDS else cls.sanitize(item)
                for key, item in value.items()
            }
        if isinstance(value, (list, tuple)):
            return [cls.sanitize(item) for item in value]
        if hasattr(value, "value"):
            return value.value
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        return value
