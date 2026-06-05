from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.academic_schema import PrerequisiteCreate, PrerequisiteResponse
from app.services.academic_service import CurriculumService


router = APIRouter()


@router.get("", response_model=list[PrerequisiteResponse])
def list_prerequisites(
    curriculum_course_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)
    ),
):
    return CurriculumService(db).list_prerequisites(curriculum_course_id)


@router.post("", response_model=PrerequisiteResponse, status_code=status.HTTP_201_CREATED)
def create_prerequisite(
    payload: PrerequisiteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return CurriculumService(db).create_prerequisite(payload)


@router.delete("/{prerequisite_id}")
def delete_prerequisite(
    prerequisite_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return CurriculumService(db).delete_prerequisite(prerequisite_id)
