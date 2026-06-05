from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.section_schema import (
    SectionCreate,
    SectionListResponse,
    SectionResponse,
    SectionUpdate,
)
from app.services.section_service import SectionService


router = APIRouter()


@router.get(
    "",
    response_model=SectionListResponse,
    summary="Listar secciones",
)
def list_sections(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    course_id: int | None = Query(default=None, gt=0),
    teacher_id: int | None = Query(default=None, gt=0),
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
    section_service = SectionService(db)

    return section_service.list_sections(
        skip=skip,
        limit=limit,
        course_id=course_id,
        teacher_id=teacher_id,
    )


@router.post(
    "",
    response_model=SectionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear sección",
)
def create_section(
    section_data: SectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    section_service = SectionService(db)
    return section_service.create_section(section_data)


@router.get(
    "/{section_id}",
    response_model=SectionResponse,
    summary="Obtener sección por ID",
)
def get_section(
    section_id: int,
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
    section_service = SectionService(db)
    return section_service.get_section_by_id(section_id)


@router.put(
    "/{section_id}",
    response_model=SectionResponse,
    summary="Actualizar sección",
)
def update_section(
    section_id: int,
    section_data: SectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    section_service = SectionService(db)
    return section_service.update_section(section_id, section_data)


@router.delete(
    "/{section_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar sección",
)
def delete_section(
    section_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    section_service = SectionService(db)
    return section_service.delete_section(section_id)