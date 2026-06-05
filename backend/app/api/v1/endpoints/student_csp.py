from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.student_csp_schema import (
    StudentCSPPreviewRequest,
    StudentCSPPreviewResponse,
    StudentCSPSaveSelectedRequest,
    StudentCSPSaveSelectedResponse,
    StudentOfferCoursesResponse,
    StudentOfferDetailResponse,          # ✅ Import agregado
    StudentSavedScheduleDetail,
    StudentSavedScheduleFavoriteResponse,
    StudentSavedScheduleSummary,
)
from app.services.student_csp_service import StudentCSPService
from app.schemas.enrollment_schedule_schema import (
    EnrollmentScheduleGenerateRequest,
    EnrollmentScheduleGenerateResponse,
    EnrollmentScheduleSaveRequest,
    EnrollmentScheduleSaveResponse,
)
from app.services.enrollment_schedule_service import EnrollmentScheduleService

router = APIRouter()

@router.get(
    "/me",
    summary="Obtener perfil estudiantil del usuario autenticado",
)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    student = service._get_student_by_user_id(current_user.id)

    return {
        "id": student.id,
        "user_id": student.user_id,
        "student_code": student.student_code,
        "career": student.career,
        "current_cycle": student.current_cycle,
        "min_credits": student.min_credits,
        "max_credits": student.max_credits,
    }

@router.get(
    "/offer-courses",
    response_model=StudentOfferCoursesResponse,
    summary="Listar cursos disponibles para estudiante desde oferta horaria publicada",
)
def get_student_offer_courses(
    student_id: int = Query(..., gt=0),
    institutional_schedule_id: int = Query(..., gt=0),
    unavailable_days: list[int] = Query(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.get_offer_courses_for_student(
        student_id=student_id,
        institutional_schedule_id=institutional_schedule_id,
        unavailable_days=unavailable_days,
        current_user=current_user,
    )

# ✅ Nuevo endpoint agregado
@router.get(
    "/offer-detail",
    response_model=StudentOfferDetailResponse,
    summary="Ver oferta académica detallada para estudiante",
)
def get_student_offer_detail(
    student_id: int = Query(..., gt=0),
    institutional_schedule_id: int = Query(..., gt=0),
    unavailable_days: list[int] = Query(default=[]),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.get_offer_detail_for_student(
        student_id=student_id,
        institutional_schedule_id=institutional_schedule_id,
        unavailable_days=unavailable_days,
        current_user=current_user,
    )

@router.post(
    "/preview",
    response_model=StudentCSPPreviewResponse,
    summary="Previsualizar horarios personalizados para estudiante",
)
def preview_student_schedules(
    request: StudentCSPPreviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.preview_student_schedules(
        request=request,
        current_user=current_user,
    )


@router.post(
    "/save-selected",
    response_model=StudentCSPSaveSelectedResponse,
    summary="Guardar una solución de horario personalizada para estudiante",
)
def save_selected_student_schedule(
    request: StudentCSPSaveSelectedRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.save_selected_student_schedule(
        request=request,
        current_user=current_user,
    )


@router.get(
    "/saved",
    response_model=list[StudentSavedScheduleSummary],
    summary="Listar horarios estudiantiles guardados",
)
def list_saved_student_schedules(
    student_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.list_saved_student_schedules(
        current_user=current_user,
        student_id=student_id,
    )


@router.get(
    "/saved/{student_schedule_id}",
    response_model=StudentSavedScheduleDetail,
    summary="Obtener detalle de un horario estudiantil guardado",
)
def get_saved_student_schedule_detail(
    student_schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.get_saved_student_schedule_detail(
        student_schedule_id=student_schedule_id,
        current_user=current_user,
    )


@router.patch(
    "/saved/{student_schedule_id}/favorite",
    response_model=StudentSavedScheduleFavoriteResponse,
    summary="Marcar horario estudiantil como favorito",
)
def mark_student_schedule_as_favorite(
    student_schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.COORDINATOR,
            UserRole.STUDENT,
        )
    ),
):
    service = StudentCSPService(db)
    return service.mark_student_schedule_as_favorite(
        student_schedule_id=student_schedule_id,
        current_user=current_user,
    )


@router.post(
    "/generate-from-enrollments",
    response_model=EnrollmentScheduleGenerateResponse,
    summary="Generar horario personal desde cursos asignados y ofertas publicadas",
)
def generate_from_enrollments(
    request: EnrollmentScheduleGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return EnrollmentScheduleService(db).generate(request, current_user.id)


@router.post(
    "/save-from-enrollments",
    response_model=EnrollmentScheduleSaveResponse,
    summary="Guardar horario personal generado desde cursos asignados",
)
def save_from_enrollments(
    request: EnrollmentScheduleSaveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return EnrollmentScheduleService(db).save(request, current_user.id)
