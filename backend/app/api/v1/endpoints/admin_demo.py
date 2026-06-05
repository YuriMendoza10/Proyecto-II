from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.services.demo_preparation_service import DemoPreparationService


router = APIRouter()


class PrepareInstitutionalCSPRequest(BaseModel):
    academic_period_id: int | None = None
    academic_program_id: int | None = None
    curriculum_plan_id: int | None = None
    cycles: list[int] | str | None = "all"
    status_target: str = "APPROVED"
    create_missing_offerings: bool = True
    create_missing_teachers: bool = True
    create_missing_classrooms: bool = True
    fix_existing_offerings: bool = True


@router.post("/prepare-institutional-csp")
def prepare_institutional_csp(
    payload: PrepareInstitutionalCSPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
) -> dict[str, Any]:
    return DemoPreparationService(db).prepare_institutional_csp(payload.model_dump())
