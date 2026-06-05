from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.offering_schema import SectionRequirementCreate, SectionRequirementResponse, SectionRequirementUpdate
from app.services.offering_service import SectionRequirementService


router = APIRouter()
WRITE_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR)


@router.get("", response_model=list[SectionRequirementResponse])
def list_requirements(
    section_offering_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    return SectionRequirementService(db).list_requirements(section_offering_id)


@router.post("", response_model=SectionRequirementResponse, status_code=status.HTTP_201_CREATED)
def create_requirement(
    payload: SectionRequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionRequirementService(db).create_requirement(payload)


@router.put("/{requirement_id}", response_model=SectionRequirementResponse)
@router.patch("/{requirement_id}", response_model=SectionRequirementResponse)
def update_requirement(
    requirement_id: int,
    payload: SectionRequirementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionRequirementService(db).update_requirement(requirement_id, payload)


@router.delete("/{requirement_id}")
def delete_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*WRITE_ROLES)),
):
    return SectionRequirementService(db).delete_requirement(requirement_id)
