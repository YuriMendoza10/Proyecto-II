from app.core.database import SessionLocal
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleStatus
from app.models.schedule_change_request import (
    ScheduleChangeRequest,
    ScheduleChangeRequestStatus,
    ScheduleChangeRequestType,
)


def main():
    db = SessionLocal()
    try:
        block = (
            db.query(ScheduleBlock)
            .join(AcademicSchedule, AcademicSchedule.id == ScheduleBlock.schedule_id)
            .filter(
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                AcademicSchedule.is_active == True,
                ScheduleBlock.section_offering_id.isnot(None),
            )
            .order_by(ScheduleBlock.id)
            .first()
        )
        if not block or not block.section_offering or not block.section_offering.teacher_id:
            print("No existe horario publicado; ejecute Fase 3 demo antes de seed_teacher_portal_demo.py")
            return
        existing = (
            db.query(ScheduleChangeRequest)
            .filter(
                ScheduleChangeRequest.teacher_id == block.section_offering.teacher_id,
                ScheduleChangeRequest.schedule_block_id == block.id,
                ScheduleChangeRequest.status == ScheduleChangeRequestStatus.PENDING,
            )
            .first()
        )
        if existing:
            print(f"Solicitud docente demo ya existente: {existing.id}.")
            return
        item = ScheduleChangeRequest(
            teacher_id=block.section_offering.teacher_id,
            schedule_block_id=block.id,
            section_offering_id=block.section_offering_id,
            academic_period_id=block.schedule.academic_period_id,
            request_type=ScheduleChangeRequestType.CHANGE_TIME,
            current_day_of_week=block.day_of_week,
            current_start_time=block.start_time,
            current_end_time=block.end_time,
            requested_day_of_week=block.day_of_week,
            requested_start_time=block.start_time,
            requested_end_time=block.end_time,
            reason="Solicitud demo para revisar el flujo del portal docente.",
            status=ScheduleChangeRequestStatus.PENDING,
        )
        db.add(item)
        db.commit()
        print(f"Solicitud docente demo creada: {item.id}; docente: {item.teacher_id}.")
        print("La solicitud no modifica el horario publicado.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
