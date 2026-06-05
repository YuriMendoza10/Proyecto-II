from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.traceability import AuditAction
from app.models.user import User, UserRole
from app.schemas.traceability_schema import AuditLogListResponse, AuditLogResponse
from app.services.audit_log_service import AuditLogService


router = APIRouter()


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    user_id: int | None = Query(default=None, gt=0),
    action: AuditAction | None = Query(default=None),
    entity_type: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    total, logs = AuditLogService(db).list(user_id, action, entity_type, date_from, date_to, limit, offset)
    return {"total": total, "logs": logs}


@router.get("/export.csv")
def export_audit_logs(
    user_id: int | None = Query(default=None, gt=0),
    action: AuditAction | None = Query(default=None),
    entity_type: str | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    service = AuditLogService(db)
    body = service.csv(user_id=user_id, action=action, entity_type=entity_type, date_from=date_from, date_to=date_to)
    service.record(
        actor=current_user, action=AuditAction.EXPORT_REPORT, entity_type="AUDIT_LOG",
        description="Exportacion CSV de auditoria.", new_values={"format": "CSV"}, commit=True,
    )
    return Response(
        content=body,
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="audit-logs.csv"'},
    )


@router.get("/{audit_id}", response_model=AuditLogResponse)
def get_audit_log(
    audit_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AuditLogService(db).get(audit_id)
