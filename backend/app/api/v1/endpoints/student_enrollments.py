from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.student_enrollment_schema import (
    StudentAvailableCoursesResponse,
    StudentCourseEnrollmentBulkCreate,
    StudentCourseEnrollmentCreate,
    StudentCourseEnrollmentResponse,
)
from app.services.student_enrollment_service import StudentEnrollmentService


router = APIRouter()


@router.get(
    "",
    response_model=list[StudentCourseEnrollmentResponse],
)
def list_student_enrollments(
    student_id: int | None = Query(default=None),
    academic_period: str | None = Query(default=None),
    only_active: bool = Query(default=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.list_enrollments(
        student_id=student_id,
        academic_period=academic_period,
        only_active=only_active,
    )


@router.post(
    "",
    response_model=StudentCourseEnrollmentResponse,
)
def create_student_enrollment(
    payload: StudentCourseEnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.create_enrollment(
        student_id=payload.student_id,
        course_id=payload.course_id,
        academic_period=payload.academic_period,
        status_value=payload.status,
        is_active=payload.is_active,
    )


@router.post(
    "/bulk",
    response_model=list[StudentCourseEnrollmentResponse],
)
def bulk_create_student_enrollments(
    payload: StudentCourseEnrollmentBulkCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.bulk_create_enrollments(
        student_id=payload.student_id,
        course_ids=payload.course_ids,
        academic_period=payload.academic_period,
    )


@router.post(
    "/seed-cycle/{student_id}",
    response_model=list[StudentCourseEnrollmentResponse],
)
def seed_student_current_cycle_courses(
    student_id: int,
    academic_period: str = Query(default="2026-1"),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.seed_student_cycle_courses(
        student_id=student_id,
        academic_period=academic_period,
    )


@router.get(
    "/student/{student_id}/available-courses",
    response_model=StudentAvailableCoursesResponse,
)
def get_student_available_courses_by_admin(
    student_id: int,
    academic_period: str = Query(default="2026-1"),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.get_available_courses_for_student(
        student_id=student_id,
        academic_period=academic_period,
    )


@router.get(
    "/me/available-courses",
    response_model=StudentAvailableCoursesResponse,
)
def get_my_available_courses(
    academic_period: str = Query(default="2026-1"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden consultar sus cursos disponibles.",
        )

    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No existe perfil de estudiante para el usuario actual.",
        )

    service = StudentEnrollmentService(db)

    return service.get_available_courses_for_student(
        student_id=student.id,
        academic_period=academic_period,
    )


@router.patch(
    "/{enrollment_id}/deactivate",
    response_model=StudentCourseEnrollmentResponse,
)
def deactivate_student_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.deactivate_enrollment(enrollment_id)


@router.delete(
    "/{enrollment_id}",
)
def delete_student_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    service = StudentEnrollmentService(db)

    return service.delete_enrollment(enrollment_id)