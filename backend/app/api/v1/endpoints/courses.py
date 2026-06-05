from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.course_schema import (
    CourseCreate,
    CourseListResponse,
    CourseResponse,
    CourseUpdate,
)
from app.services.course_service import CourseService


router = APIRouter()


@router.get(
    "",
    response_model=CourseListResponse,
    summary="Listar cursos",
)
def list_courses(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    career: str | None = Query(default=None),
    cycle: int | None = Query(default=None, ge=1, le=10),
    is_active: bool | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.TEACHER,
            UserRole.STUDENT,
        )
    ),
):
    course_service = CourseService(db)

    return course_service.list_courses(
        skip=skip,
        limit=limit,
        career=career,
        cycle=cycle,
        is_active=is_active,
    )


@router.post(
    "",
    response_model=CourseResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear curso",
)
def create_course(
    course_data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    course_service = CourseService(db)
    return course_service.create_course(course_data)


@router.get(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Obtener curso por ID",
)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.TEACHER,
            UserRole.STUDENT,
        )
    ),
):
    course_service = CourseService(db)
    return course_service.get_course_by_id(course_id)


@router.put(
    "/{course_id}",
    response_model=CourseResponse,
    summary="Actualizar curso",
)
def update_course(
    course_id: int,
    course_data: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    course_service = CourseService(db)
    return course_service.update_course(course_id, course_data)


@router.patch(
    "/{course_id}/deactivate",
    response_model=CourseResponse,
    summary="Desactivar curso",
)
def deactivate_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    course_service = CourseService(db)
    return course_service.deactivate_course(course_id)


@router.patch(
    "/{course_id}/activate",
    response_model=CourseResponse,
    summary="Activar curso",
)
def activate_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    course_service = CourseService(db)
    return course_service.activate_course(course_id)


@router.delete(
    "/{course_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar curso permanentemente",
)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    course_service = CourseService(db)
    return course_service.delete_course(course_id)