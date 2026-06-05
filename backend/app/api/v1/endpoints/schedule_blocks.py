from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole

# Nuevos imports de Modelos
from app.models.course import CourseSection
from app.models.schedule import (
    AcademicSchedule,
    ScheduleBlock,
    ScheduleStatus,
    ScheduleType,
)
from app.models.teacher import Teacher
from app.models.classroom import Classroom
from app.models.offering import SectionOffering

# Schemas
from app.schemas.schedule_block_schema import (
    ScheduleBlockCreate,
    ScheduleBlockListResponse,
    ScheduleBlockResponse,
    ScheduleBlockUpdate,
)
from app.schemas.schedule_block_enriched_schema import ScheduleBlockEnrichedResponse

from app.services.schedule_block_service import ScheduleBlockService


router = APIRouter()


@router.get(
    "",
    response_model=ScheduleBlockListResponse,
    summary="Listar bloques horarios",
)
def list_schedule_blocks(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    schedule_id: int | None = Query(default=None, gt=0),
    section_id: int | None = Query(default=None, gt=0),
    classroom_id: int | None = Query(default=None, gt=0),
    day_of_week: int | None = Query(default=None, ge=1, le=7),
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
    block_service = ScheduleBlockService(db)

    return block_service.list_blocks(
        skip=skip,
        limit=limit,
        schedule_id=schedule_id,
        section_id=section_id,
        classroom_id=classroom_id,
        day_of_week=day_of_week,
        published_institutional_only=current_user.role in {UserRole.STUDENT, UserRole.TEACHER},
    )


@router.post(
    "",
    response_model=ScheduleBlockResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Crear bloque horario",
)
def create_schedule_block(
    block_data: ScheduleBlockCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    block_service = ScheduleBlockService(db)
    return block_service.create_block(block_data)


# --------------------------------------------------------------------------
# NUEVO ENDPOINT: Debe ir SIEMPRE antes de /{block_id}
# --------------------------------------------------------------------------
@router.get(
    "/enriched",
    response_model=list[ScheduleBlockEnrichedResponse],
    summary="Listar bloques horarios enriquecidos con curso, docente y aula",
)
def get_enriched_schedule_blocks(
    schedule_id: int = Query(..., gt=0),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=1000),
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
    if current_user.role in {UserRole.STUDENT, UserRole.TEACHER}:
        visible_schedule = (
            db.query(AcademicSchedule)
            .filter(
                AcademicSchedule.id == schedule_id,
                AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active == True,
            )
            .first()
        )

        if visible_schedule is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario publicado no encontrado",
            )

    blocks = (
        db.query(ScheduleBlock)
        .options(
            joinedload(ScheduleBlock.section)
            .joinedload(CourseSection.course),
            joinedload(ScheduleBlock.section)
            .joinedload(CourseSection.teacher)
            .joinedload(Teacher.user),
            joinedload(ScheduleBlock.classroom),
            joinedload(ScheduleBlock.section_offering)
            .joinedload(SectionOffering.course),
            joinedload(ScheduleBlock.section_offering)
            .joinedload(SectionOffering.teacher)
            .joinedload(Teacher.user),
        )
        .filter(ScheduleBlock.schedule_id == schedule_id)
        .order_by(ScheduleBlock.day_of_week, ScheduleBlock.start_time)
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []

    for block in blocks:
        section = block.section
        offering = block.section_offering
        course = section.course if section else offering.course if offering else None
        teacher = section.teacher if section else offering.teacher if offering else None
        teacher_user = teacher.user if teacher else None
        classroom = block.classroom

        result.append(
            {
                "id": block.id,
                "schedule_id": block.schedule_id,

                "section_id": block.section_id,
                "section_offering_id": block.section_offering_id,
                "section_code": section.section_code if section else offering.section_code if offering else None,

                "course_id": course.id if course else None,
                "course_code": course.code if course else None,
                "course_name": course.name if course else None,
                "weekly_hours": course.weekly_hours if course else None,

                "teacher_id": teacher.id if teacher else None,
                "teacher_code": teacher.teacher_code if teacher else None,
                "teacher_name": teacher_user.full_name if teacher_user else None,

                "classroom_id": classroom.id if classroom else None,
                "classroom_code": classroom.code if classroom else None,
                "classroom_name": classroom.name if classroom else None,
                "classroom_capacity": classroom.capacity if classroom else None,

                "day_of_week": block.day_of_week,
                "start_time": block.start_time,
                "end_time": block.end_time,
            }
        )

    return result


@router.get(
    "/{block_id}",
    response_model=ScheduleBlockResponse,
    summary="Obtener bloque horario por ID",
)
def get_schedule_block(
    block_id: int,
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
    block_service = ScheduleBlockService(db)
    block = block_service.get_block_by_id(block_id)

    if current_user.role in {UserRole.STUDENT, UserRole.TEACHER}:
        visible_schedule = (
            db.query(AcademicSchedule)
            .filter(
                AcademicSchedule.id == block.schedule_id,
                AcademicSchedule.schedule_type == ScheduleType.INSTITUTIONAL,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active == True,
            )
            .first()
        )

        if visible_schedule is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bloque de horario publicado no encontrado",
            )

    return block


@router.put(
    "/{block_id}",
    response_model=ScheduleBlockResponse,
    summary="Actualizar bloque horario",
)
def update_schedule_block(
    block_id: int,
    block_data: ScheduleBlockUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.COORDINATOR)
    ),
):
    block_service = ScheduleBlockService(db)
    return block_service.update_block(block_id, block_data)


@router.delete(
    "/{block_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar bloque horario",
)
def delete_schedule_block(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
):
    block_service = ScheduleBlockService(db)
    return block_service.delete_block(block_id)
