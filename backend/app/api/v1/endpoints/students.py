from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.student import Student, StudentEnrollmentStatus
from app.models.user import User, UserRole
from app.schemas.student_schema import (
    StudentCreate,
    StudentListResponse,
    StudentResponse,
    StudentUpdate,
)
from app.schemas.academic_schema import (
    CurriculumPlanDetailResponse,
    StudentEligibleCoursesResponse,
)
from app.services.academic_service import CurriculumService
from app.services.student_service import StudentService
from app.services.student_academic_history_service import StudentAcademicHistoryService
from app.schemas.student_academic_history_schema import StudentAcademicHistorySummary
from app.schemas.enrollment_schedule_schema import EnrolledCourseResponse, PublishedEnrollmentSectionResponse
from app.services.enrollment_schedule_service import EnrollmentScheduleService


router = APIRouter()


@router.get(
    "",
    response_model=StudentListResponse,
    summary="Listar estudiantes",
)
def list_students(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    academic_program_id: int | None = Query(default=None, gt=0),
    curriculum_plan_id: int | None = Query(default=None, gt=0),
    campus_id: int | None = Query(default=None, gt=0),
    current_cycle: int | None = Query(default=None, ge=1, le=10),
    enrollment_status: StudentEnrollmentStatus | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    student_service = StudentService(db)
    return student_service.list_students(
        skip=skip,
        limit=limit,
        academic_program_id=academic_program_id,
        curriculum_plan_id=curriculum_plan_id,
        campus_id=campus_id,
        current_cycle=current_cycle,
        enrollment_status=enrollment_status,
    )


@router.post(
    "",
    response_model=StudentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear perfil estudiante",
)
def create_student(
    student_data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    student_service = StudentService(db)
    return student_service.create_student(student_data)


# --------------------------------------------------------------------------
# NUEVO ENDPOINT: Ubicado correctamente antes de /{student_id}
# --------------------------------------------------------------------------
@router.get(
    "/me",
    summary="Obtener perfil estudiante del usuario logueado",
)
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario logueado no tiene perfil de estudiante asociado.",
        )

    return student


@router.get(
    "/me/curriculum",
    response_model=CurriculumPlanDetailResponse,
    summary="Obtener la malla curricular activa del estudiante",
)
def get_my_curriculum(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return CurriculumService(db).get_student_curriculum(current_user.id)


@router.get(
    "/me/eligible-courses",
    response_model=StudentEligibleCoursesResponse,
    summary="Obtener cursos elegibles de la malla activa",
)
def get_my_eligible_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return CurriculumService(db).get_student_eligible_courses(current_user.id)


@router.get(
    "/me/enrolled-courses",
    response_model=list[EnrolledCourseResponse],
    summary="Listar cursos asignados del estudiante en el periodo activo",
)
def get_my_enrolled_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return EnrollmentScheduleService(db).enrolled_courses(current_user.id)


@router.get(
    "/me/published-sections",
    response_model=list[PublishedEnrollmentSectionResponse],
    summary="Listar secciones publicadas disponibles para cursos asignados",
)
def get_my_published_sections(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    return EnrollmentScheduleService(db).published_sections(current_user.id)


@router.get(
    "/me/academic-summary",
    response_model=StudentAcademicHistorySummary,
    summary="Obtener el resumen academico propio",
)
def get_my_academic_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.STUDENT)),
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil estudiante no encontrado")
    return StudentAcademicHistoryService(db).get_student_academic_summary(student.id)


@router.get(
    "/{student_id}/academic-summary",
    response_model=StudentAcademicHistorySummary,
    summary="Obtener resumen academico del estudiante",
)
def get_student_academic_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.TEACHER)),
):
    return StudentAcademicHistoryService(db).get_student_academic_summary(student_id)


@router.get(
    "/{student_id}",
    response_model=StudentResponse,
    summary="Obtener estudiante por ID",
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR, UserRole.STUDENT)
    ),
):
    student_service = StudentService(db)
    return student_service.get_student_by_id(student_id)


@router.put(
    "/{student_id}",
    response_model=StudentResponse,
    summary="Actualizar estudiante",
)
def update_student(
    student_id: int,
    student_data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    student_service = StudentService(db)
    return student_service.update_student(student_id, student_data)


@router.delete(
    "/{student_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar estudiante",
)
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    student_service = StudentService(db)
    return student_service.delete_student(student_id)
