from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.institutional_schema import CampusCreate, CampusResponse, CampusUpdate
from app.services.institutional_catalog_service import InstitutionalCatalogService


router = APIRouter()
READ_ROLES = (UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)


@router.get("", response_model=list[CampusResponse])
def list_campuses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return InstitutionalCatalogService(db).list_campuses()


@router.get("/{campus_id}", response_model=CampusResponse)
def get_campus(
    campus_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(*READ_ROLES)),
):
    return InstitutionalCatalogService(db).get_campus(campus_id)


@router.post("", response_model=CampusResponse, status_code=status.HTTP_201_CREATED)
def create_campus(
    payload: CampusCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return InstitutionalCatalogService(db).create_campus(payload)


@router.patch("/{campus_id}", response_model=CampusResponse)
def update_campus(
    campus_id: int,
    payload: CampusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return InstitutionalCatalogService(db).update_campus(campus_id, payload)


@router.delete("/{campus_id}")
def delete_campus(
    campus_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    return InstitutionalCatalogService(db).delete_campus(campus_id)
