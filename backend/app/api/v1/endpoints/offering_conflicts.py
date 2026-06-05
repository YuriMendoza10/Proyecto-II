from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.offering import OfferingConflictSeverity
from app.models.user import User, UserRole
from app.schemas.offering_schema import OfferingConflictAnalyzeRequest, OfferingConflictAnalyzeResponse, OfferingConflictResponse
from app.services.offering_service import OfferingConflictService, OfferingValidationService


router = APIRouter()


@router.get("", response_model=list[OfferingConflictResponse])
def list_conflicts(
    academic_period_id: int | None = Query(default=None, gt=0),
    severity: OfferingConflictSeverity | None = Query(default=None),
    is_resolved: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return OfferingConflictService(db).list_conflicts(academic_period_id, severity, is_resolved)


@router.post("/analyze", response_model=OfferingConflictAnalyzeResponse)
def analyze_conflicts(
    payload: OfferingConflictAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return OfferingValidationService(db).analyze(payload.academic_period_id, payload.section_offering_id)


@router.patch("/{conflict_id}/resolve", response_model=OfferingConflictResponse)
def resolve_conflict(
    conflict_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return OfferingConflictService(db).resolve(conflict_id)
