from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.academic import AcademicProgramStatus
from app.models.user import User, UserRole
from app.schemas.academic_schema import (
    AcademicProgramCreate,
    AcademicProgramResponse,
    AcademicProgramUpdate,
)
from app.services.academic_service import AcademicCatalogService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER, UserRole.STUDENT)


@router.get("", response_model=list[AcademicProgramResponse])
def list_programs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return AcademicCatalogService(db).list_programs(current_user.role == UserRole.STUDENT)


@router.get("/{program_id}", response_model=AcademicProgramResponse)
def get_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    item = AcademicCatalogService(db).get_program(program_id)
    if current_user.role == UserRole.STUDENT and item.status != AcademicProgramStatus.ACTIVE:
        raise HTTPException(status_code=404, detail="Programa activo no encontrado")
    return item


@router.post("", response_model=AcademicProgramResponse, status_code=status.HTTP_201_CREATED)
def create_program(
    payload: AcademicProgramCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).create_program(payload)


@router.put("/{program_id}", response_model=AcademicProgramResponse)
@router.patch("/{program_id}", response_model=AcademicProgramResponse)
def update_program(
    program_id: int,
    payload: AcademicProgramUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).update_program(program_id, payload)


@router.delete("/{program_id}")
def delete_program(
    program_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return AcademicCatalogService(db).delete_program(program_id)
