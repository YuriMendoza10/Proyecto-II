from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.offering import OfferingStatus
from app.models.user import User, UserRole
from app.schemas.offering_schema import (
    BulkOfferingCreate,
    BulkOfferingResponse,
    SectionOfferingCreate,
    SectionOfferingResponse,
    SectionOfferingStatusUpdate,
    SectionOfferingUpdate,
)
from app.services.offering_service import SectionOfferingService
from app.services.traceability_service import TraceabilityService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT)
WRITE_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR)


@router.get("", response_model=list[SectionOfferingResponse])
def list_section_offerings(
    academic_period_id: int | None = Query(default=None, gt=0),
    academic_program_id: int | None = Query(default=None, gt=0),
    curriculum_plan_id: int | None = Query(default=None, gt=0),
    cycle_number: int | None = Query(default=None, ge=1, le=10),
    status_filter: OfferingStatus | None = Query(default=None, alias="status"),
    teacher_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return SectionOfferingService(db).list_offerings(
        current_user, academic_period_id, academic_program_id, curriculum_plan_id,
        cycle_number, status_filter, teacher_id
    )


@router.get("/published/me", response_model=list[SectionOfferingResponse])
def list_my_published_offerings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return SectionOfferingService(db).list_published_for_student(current_user.id)


@router.post("/bulk-from-curriculum", response_model=BulkOfferingResponse, status_code=status.HTTP_201_CREATED)
def bulk_from_curriculum(
    payload: BulkOfferingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionOfferingService(db).bulk_from_curriculum(payload)


@router.get("/{offering_id}", response_model=SectionOfferingResponse)
def get_section_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return SectionOfferingService(db).get_offering(offering_id, current_user)


@router.post("", response_model=SectionOfferingResponse, status_code=status.HTTP_201_CREATED)
def create_section_offering(
    payload: SectionOfferingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionOfferingService(db).create_offering(payload)


@router.put("/{offering_id}", response_model=SectionOfferingResponse)
@router.patch("/{offering_id}", response_model=SectionOfferingResponse)
def update_section_offering(
    offering_id: int,
    payload: SectionOfferingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionOfferingService(db).update_offering(offering_id, payload)


@router.patch("/{offering_id}/status", response_model=SectionOfferingResponse)
def update_section_offering_status(
    offering_id: int,
    payload: SectionOfferingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    service = SectionOfferingService(db)
    before = service.get_offering(offering_id, current_user)
    result = service.change_status(offering_id, payload.status)
    item = service._require_offering(offering_id)
    teacher_user_id = item.teacher.user_id if item.teacher else None
    TraceabilityService(db).record_offering_status(
        current_user, offering_id, before["status"].value, result["status"].value, teacher_user_id
    )
    return result


@router.delete("/{offering_id}")
def delete_section_offering(
    offering_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionOfferingService(db).delete_offering(offering_id)
