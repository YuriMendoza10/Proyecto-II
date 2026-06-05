from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.academic_schema import (
    ElectiveBankCourseCreate,
    ElectiveBankCourseResponse,
    ElectiveBankCourseUpdate,
)
from app.services.academic_service import CurriculumService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT)


@router.get("", response_model=list[ElectiveBankCourseResponse])
def list_electives(
    plan_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return CurriculumService(db).list_electives(
        plan_id, active_only=current_user.role == UserRole.STUDENT
    )


@router.post("", response_model=ElectiveBankCourseResponse, status_code=status.HTTP_201_CREATED)
def create_elective(
    payload: ElectiveBankCourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return CurriculumService(db).create_elective(payload)


@router.put("/{elective_id}", response_model=ElectiveBankCourseResponse)
@router.patch("/{elective_id}", response_model=ElectiveBankCourseResponse)
def update_elective(
    elective_id: int,
    payload: ElectiveBankCourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return CurriculumService(db).update_elective(elective_id, payload)


@router.delete("/{elective_id}")
def delete_elective(
    elective_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return CurriculumService(db).delete_elective(elective_id)
