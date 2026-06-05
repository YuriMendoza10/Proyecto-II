from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.academic import CurriculumCourseType
from app.models.user import User, UserRole
from app.schemas.academic_schema import CurriculumCourseCreate, CurriculumCourseResponse, CurriculumCourseUpdate
from app.services.academic_service import CurriculumService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT)
WRITE_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR)


@router.get("", response_model=list[CurriculumCourseResponse])
def list_courses(
    plan_id: int | None = Query(default=None, gt=0),
    cycle_number: int | None = Query(default=None, ge=1, le=20),
    course_type: CurriculumCourseType | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return CurriculumService(db).list_courses(
        plan_id, cycle_number, course_type, active_only=current_user.role == UserRole.STUDENT
    )


@router.get("/{curriculum_course_id}", response_model=CurriculumCourseResponse)
def get_course(
    curriculum_course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return CurriculumService(db).get_course(
        curriculum_course_id, active_only=current_user.role == UserRole.STUDENT
    )


@router.post("", response_model=CurriculumCourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CurriculumCourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return CurriculumService(db).create_course(payload)


@router.put("/{curriculum_course_id}", response_model=CurriculumCourseResponse)
@router.patch("/{curriculum_course_id}", response_model=CurriculumCourseResponse)
def update_course(
    curriculum_course_id: int,
    payload: CurriculumCourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return CurriculumService(db).update_course(curriculum_course_id, payload)


@router.delete("/{curriculum_course_id}")
def delete_course(
    curriculum_course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return CurriculumService(db).delete_course(curriculum_course_id)
