from sqlalchemy.orm import Session

from app.models.schedule import AcademicSchedule, ScheduleStatus, ScheduleType
from app.schemas.schedule_schema import (
    AcademicScheduleCreate,
    AcademicScheduleUpdate,
)


class ScheduleRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_all(
        self,
        academic_period: str | None = None,
        schedule_type: ScheduleType | None = None,
        status: ScheduleStatus | None = None,
        is_active: bool | None = None,
    ) -> int:
        query = self.db.query(AcademicSchedule)

        if academic_period:
            query = query.filter(
                AcademicSchedule.academic_period == academic_period
            )

        if schedule_type:
            query = query.filter(
                AcademicSchedule.schedule_type == schedule_type
            )

        if status:
            query = query.filter(
                AcademicSchedule.status == status
            )

        if is_active is not None:
            query = query.filter(
                AcademicSchedule.is_active == is_active
            )

        return query.count()

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        academic_period: str | None = None,
        schedule_type: ScheduleType | None = None,
        status: ScheduleStatus | None = None,
        is_active: bool | None = None,
    ) -> list[AcademicSchedule]:
        query = self.db.query(AcademicSchedule)

        if academic_period:
            query = query.filter(
                AcademicSchedule.academic_period == academic_period
            )

        if schedule_type:
            query = query.filter(
                AcademicSchedule.schedule_type == schedule_type
            )

        if status:
            query = query.filter(
                AcademicSchedule.status == status
            )

        if is_active is not None:
            query = query.filter(
                AcademicSchedule.is_active == is_active
            )

        return (
            query.order_by(
                AcademicSchedule.academic_period.desc(),
                AcademicSchedule.id.desc(),
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, schedule_id: int) -> AcademicSchedule | None:
        return (
            self.db.query(AcademicSchedule)
            .filter(AcademicSchedule.id == schedule_id)
            .first()
        )

    def create(
        self,
        schedule_data: AcademicScheduleCreate,
    ) -> AcademicSchedule:
        schedule = AcademicSchedule(**schedule_data.model_dump())

        self.db.add(schedule)
        self.db.commit()
        self.db.refresh(schedule)

        return schedule

    def update(
        self,
        schedule: AcademicSchedule,
        schedule_data: AcademicScheduleUpdate,
    ) -> AcademicSchedule:
        update_data = schedule_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(schedule, field, value)

        self.db.commit()
        self.db.refresh(schedule)

        return schedule

    def delete(self, schedule: AcademicSchedule) -> None:
        self.db.delete(schedule)
        self.db.commit()