from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.student import StudentAcademicHistoryStatus
from app.models.user import User, UserRole
from app.schemas.student_academic_history_schema import (
    StudentAcademicHistoryBulkCreate,
    StudentAcademicHistoryBulkResult,
    StudentAcademicHistoryCreate,
    StudentAcademicHistoryPage,
    StudentAcademicHistoryRead,
    StudentAcademicHistoryUpdate,
)
from app.services.student_academic_history_service import StudentAcademicHistoryService

router = APIRouter()


@router.get("/page", response_model=StudentAcademicHistoryPage, summary="Listar historial academico paginado")
def list_history_page(
    student_id: int | None = Query(default=None, gt=0),
    academic_program_id: int | None = Query(default=None, gt=0),
    curriculum_plan_id: int | None = Query(default=None, gt=0),
    course_id: int | None = Query(default=None, gt=0),
    history_status: StudentAcademicHistoryStatus | None = Query(default=None, alias="status"),
    academic_period_id: int | None = Query(default=None, gt=0),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    return StudentAcademicHistoryService(db).list_history_page(
        student_id=student_id,
        academic_program_id=academic_program_id,
        curriculum_plan_id=curriculum_plan_id,
        course_id=course_id,
        history_status=history_status,
        academic_period_id=academic_period_id,
        page=page,
        page_size=page_size,
    )


@router.get("", response_model=list[StudentAcademicHistoryRead], summary="Listar historial academico")
def list_history(
    student_id: int | None = Query(default=None, gt=0),
    academic_program_id: int | None = Query(default=None, gt=0),
    curriculum_plan_id: int | None = Query(default=None, gt=0),
    course_id: int | None = Query(default=None, gt=0),
    history_status: StudentAcademicHistoryStatus | None = Query(default=None, alias="status"),
    academic_period_id: int | None = Query(default=None, gt=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=500, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    return StudentAcademicHistoryService(db).list_history(
        student_id=student_id,
        academic_program_id=academic_program_id,
        curriculum_plan_id=curriculum_plan_id,
        course_id=course_id,
        history_status=history_status,
        academic_period_id=academic_period_id,
        skip=skip,
        limit=limit,
    )


@router.post("/bulk", response_model=StudentAcademicHistoryBulkResult, summary="Registrar historial academico en lote")
def bulk_create_history(
    payload: StudentAcademicHistoryBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return StudentAcademicHistoryService(db).bulk_create_history(payload)


@router.get("/{record_id}", response_model=StudentAcademicHistoryRead, summary="Obtener registro de historial")
def get_history_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    return StudentAcademicHistoryService(db).get_history_record(record_id)


@router.post(
    "",
    response_model=StudentAcademicHistoryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar historial academico",
)
def create_history_record(
    payload: StudentAcademicHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return StudentAcademicHistoryService(db).create_history_record(payload)


@router.patch("/{record_id}", response_model=StudentAcademicHistoryRead, summary="Actualizar registro de historial")
def update_history_record(
    record_id: int,
    payload: StudentAcademicHistoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR)),
):
    return StudentAcademicHistoryService(db).update_history_record(record_id, payload)


@router.delete("/{record_id}", summary="Eliminar registro de historial")
def delete_history_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return StudentAcademicHistoryService(db).delete_history_record(record_id)
