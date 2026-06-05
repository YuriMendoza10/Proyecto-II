from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.academic_schema import (
    AcademicPeriodCreate,
    AcademicPeriodResponse,
    AcademicPeriodUpdate,
)
from app.services.academic_service import AcademicCatalogService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT)


@router.get("", response_model=list[AcademicPeriodResponse])
def list_periods(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return AcademicCatalogService(db).list_periods(current_user.role == UserRole.STUDENT)


@router.get("/{period_id}", response_model=AcademicPeriodResponse)
def get_period(
    period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    item = AcademicCatalogService(db).get_period(period_id)
    if current_user.role == UserRole.STUDENT and not item.is_active:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Periodo activo no encontrado")
    return item


@router.post("", response_model=AcademicPeriodResponse, status_code=status.HTTP_201_CREATED)
def create_period(
    payload: AcademicPeriodCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).create_period(payload)


@router.put("/{period_id}", response_model=AcademicPeriodResponse)
@router.patch("/{period_id}", response_model=AcademicPeriodResponse)
def update_period(
    period_id: int,
    payload: AcademicPeriodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).update_period(period_id, payload)


@router.delete("/{period_id}")
def delete_period(
    period_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).delete_period(period_id)
