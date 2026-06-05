from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.schedule import ScheduleStatus, ScheduleType
from app.repositories.schedule_repository import ScheduleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.schedule_schema import (
    AcademicScheduleCreate,
    AcademicScheduleUpdate,
)


class ScheduleService:
    def __init__(self, db: Session):
        self.db = db
        self.schedule_repository = ScheduleRepository(db)
        self.user_repository = UserRepository(db)

    def list_schedules(
        self,
        skip: int = 0,
        limit: int = 100,
        academic_period: str | None = None,
        schedule_type: ScheduleType | None = None,
        status_filter: ScheduleStatus | None = None,
        is_active: bool | None = None,
    ):
        total = self.schedule_repository.count_all(
            academic_period=academic_period,
            schedule_type=schedule_type,
            status=status_filter,
            is_active=is_active,
        )

        schedules = self.schedule_repository.get_all(
            skip=skip,
            limit=limit,
            academic_period=academic_period,
            schedule_type=schedule_type,
            status=status_filter,
            is_active=is_active,
        )

        return {
            "total": total,
            "schedules": schedules,
        }

    def get_schedule_by_id(self, schedule_id: int):
        schedule = self.schedule_repository.get_by_id(schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario académico no encontrado",
            )

        return schedule

    def create_schedule(self, schedule_data: AcademicScheduleCreate):
        self._reject_direct_publication(schedule_data.status)

        if schedule_data.generated_by_user_id is not None:
            user = self.user_repository.get_by_id(
                schedule_data.generated_by_user_id
            )

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario generador no encontrado",
                )

        return self.schedule_repository.create(schedule_data)

    def update_schedule(
        self,
        schedule_id: int,
        schedule_data: AcademicScheduleUpdate,
    ):
        schedule = self.get_schedule_by_id(schedule_id)
        self._reject_direct_publication(schedule_data.status)

        if schedule_data.generated_by_user_id is not None:
            user = self.user_repository.get_by_id(
                schedule_data.generated_by_user_id
            )

            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario generador no encontrado",
                )

        return self.schedule_repository.update(schedule, schedule_data)

    def approve_schedule(self, schedule_id: int):
        schedule = self.get_schedule_by_id(schedule_id)

        if schedule.status == ScheduleStatus.ARCHIVED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede aprobar un horario archivado",
            )

        schedule_data = AcademicScheduleUpdate(
            status=ScheduleStatus.APPROVED
        )

        return self.schedule_repository.update(schedule, schedule_data)

    def publish_schedule(self, schedule_id: int):
        from app.services.schedule_publication_service import (
            SchedulePublicationService,
        )

        return SchedulePublicationService(self.db).publish_safely(
            schedule_id=schedule_id,
        )

    def archive_schedule(self, schedule_id: int):
        schedule = self.get_schedule_by_id(schedule_id)

        schedule_data = AcademicScheduleUpdate(
            status=ScheduleStatus.ARCHIVED,
            is_active=False,
        )

        return self.schedule_repository.update(schedule, schedule_data)

    def deactivate_schedule(self, schedule_id: int):
        schedule = self.get_schedule_by_id(schedule_id)

        schedule_data = AcademicScheduleUpdate(
            is_active=False,
        )

        return self.schedule_repository.update(schedule, schedule_data)

    def activate_schedule(self, schedule_id: int):
        schedule = self.get_schedule_by_id(schedule_id)

        schedule_data = AcademicScheduleUpdate(
            is_active=True,
        )

        return self.schedule_repository.update(schedule, schedule_data)

    @staticmethod
    def _reject_direct_publication(
        requested_status: ScheduleStatus | None,
    ) -> None:
        if requested_status == ScheduleStatus.PUBLISHED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "La publicacion requiere el flujo seguro de "
                    "validacion de readiness y calidad"
                ),
            )

    def delete_schedule(self, schedule_id: int):
        schedule = self.get_schedule_by_id(schedule_id)

        self.schedule_repository.delete(schedule)

        return {
            "message": "Horario académico eliminado correctamente",
        }
