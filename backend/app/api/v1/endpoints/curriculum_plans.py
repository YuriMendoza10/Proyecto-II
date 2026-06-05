from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.academic_schema import (
    CurriculumPlanCreate,
    CurriculumPlanDetailResponse,
    CurriculumPlanResponse,
    CurriculumPlanUpdate,
)
from app.services.academic_service import AcademicCatalogService, CurriculumService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT)


@router.get("", response_model=list[CurriculumPlanResponse])
def list_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return AcademicCatalogService(db).list_plans(current_user.role == UserRole.STUDENT)


@router.get("/{plan_id}", response_model=CurriculumPlanDetailResponse)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return CurriculumService(db).get_plan_detail(
        plan_id, only_active=current_user.role == UserRole.STUDENT
    )


@router.post("", response_model=CurriculumPlanResponse, status_code=status.HTTP_201_CREATED)
def create_plan(
    payload: CurriculumPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).create_plan(payload)


@router.put("/{plan_id}", response_model=CurriculumPlanResponse)
@router.patch("/{plan_id}", response_model=CurriculumPlanResponse)
def update_plan(
    plan_id: int,
    payload: CurriculumPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).update_plan(plan_id, payload)


@router.delete("/{plan_id}")
def delete_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).delete_plan(plan_id)
