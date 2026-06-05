from datetime import time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.schedule import ScheduleType
from app.repositories.classroom_repository import ClassroomRepository
from app.repositories.schedule_block_repository import ScheduleBlockRepository
from app.repositories.section_repository import SectionRepository
from app.schemas.schedule_block_schema import (
    ScheduleBlockCreate,
    ScheduleBlockUpdate,
)


class ScheduleBlockService:
    def __init__(self, db: Session):
        self.db = db
        self.block_repository = ScheduleBlockRepository(db)
        self.section_repository = SectionRepository(db)
        self.classroom_repository = ClassroomRepository(db)

    def list_blocks(
        self,
        skip: int = 0,
        limit: int = 100,
        schedule_id: int | None = None,
        section_id: int | None = None,
        classroom_id: int | None = None,
        day_of_week: int | None = None,
        published_institutional_only: bool = False,
    ):
        total = self.block_repository.count_all(
            schedule_id=schedule_id,
            section_id=section_id,
            classroom_id=classroom_id,
            day_of_week=day_of_week,
            published_institutional_only=published_institutional_only,
        )

        blocks = self.block_repository.get_all(
            skip=skip,
            limit=limit,
            schedule_id=schedule_id,
            section_id=section_id,
            classroom_id=classroom_id,
            day_of_week=day_of_week,
            published_institutional_only=published_institutional_only,
        )

        return {
            "total": total,
            "blocks": blocks,
        }

    def get_block_by_id(self, block_id: int):
        block = self.block_repository.get_by_id(block_id)

        if not block:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Bloque horario no encontrado",
            )

        return block

    def create_block(self, block_data: ScheduleBlockCreate):
        self._validate_block_data(block_data)

        return self.block_repository.create(block_data)

    def update_block(
        self,
        block_id: int,
        block_data: ScheduleBlockUpdate,
    ):
        block = self.get_block_by_id(block_id)

        schedule_id = (
            block_data.schedule_id
            if block_data.schedule_id is not None
            else block.schedule_id
        )

        section_id = (
            block_data.section_id
            if block_data.section_id is not None
            else block.section_id
        )

        classroom_id = (
            block_data.classroom_id
            if block_data.classroom_id is not None
            else block.classroom_id
        )

        day_of_week = (
            block_data.day_of_week
            if block_data.day_of_week is not None
            else block.day_of_week
        )

        start_time = (
            block_data.start_time
            if block_data.start_time is not None
            else block.start_time
        )

        end_time = (
            block_data.end_time
            if block_data.end_time is not None
            else block.end_time
        )

        merged_data = ScheduleBlockCreate(
            schedule_id=schedule_id,
            section_id=section_id,
            classroom_id=classroom_id,
            day_of_week=day_of_week,
            start_time=start_time,
            end_time=end_time,
        )

        self._validate_block_data(
            merged_data,
            exclude_block_id=block.id,
        )

        return self.block_repository.update(block, block_data)

    def delete_block(self, block_id: int):
        block = self.get_block_by_id(block_id)

        self.block_repository.delete(block)

        return {
            "message": "Bloque horario eliminado correctamente",
        }

    def _validate_block_data(
        self,
        block_data: ScheduleBlockCreate,
        exclude_block_id: int | None = None,
    ):
        if block_data.start_time >= block_data.end_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La hora de inicio debe ser menor que la hora de fin",
            )

        if block_data.start_time < time(7, 0) or block_data.end_time > time(22, 0):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El horario debe estar entre las 07:00 y las 22:00",
            )

        section = self.section_repository.get_by_id(block_data.section_id)

        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sección no encontrada",
            )

        if block_data.classroom_id is not None:
            classroom = self.classroom_repository.get_by_id(
                block_data.classroom_id
            )

            if not classroom:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Aula no encontrada",
                )

            if not classroom.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede asignar un aula inactiva",
                )

            if classroom.capacity < section.max_students:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El aula no tiene capacidad suficiente para la sección",
                )

            overlapping_classroom_blocks = (
                self.block_repository.get_overlapping_classroom_blocks(
                    classroom_id=block_data.classroom_id,
                    day_of_week=block_data.day_of_week,
                    start_time=block_data.start_time,
                    end_time=block_data.end_time,
                    exclude_block_id=exclude_block_id,
                )
            )

            if overlapping_classroom_blocks:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El aula ya está ocupada en ese horario",
                )

        overlapping_section_blocks = (
            self.block_repository.get_overlapping_section_blocks(
                section_id=block_data.section_id,
                day_of_week=block_data.day_of_week,
                start_time=block_data.start_time,
                end_time=block_data.end_time,
                exclude_block_id=exclude_block_id,
            )
        )

        if overlapping_section_blocks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La sección ya tiene una clase en ese horario",
            )
