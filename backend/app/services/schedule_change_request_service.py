from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.offering import SectionOffering
from app.models.schedule import AcademicSchedule, ScheduleBlock, ScheduleStatus
from app.models.schedule_change_request import ScheduleChangeRequest, ScheduleChangeRequestStatus
from app.models.teacher import Teacher
from app.services.traceability_service import TraceabilityService


class ScheduleChangeRequestService:
    def __init__(self, db: Session):
        self.db = db

    def create_for_teacher(self, user_id, payload, actor=None):
        teacher = self._teacher(user_id)
        block = None
        offering = None
        if payload.schedule_block_id:
            block = (
                self.db.query(ScheduleBlock)
                .options(joinedload(ScheduleBlock.schedule), joinedload(ScheduleBlock.section_offering))
                .filter(ScheduleBlock.id == payload.schedule_block_id)
                .first()
            )
            if not block or not block.section_offering or block.section_offering.teacher_id != teacher.id:
                raise HTTPException(status_code=403, detail="El bloque no pertenece al docente autenticado.")
            if block.schedule.status != ScheduleStatus.PUBLISHED:
                raise HTTPException(status_code=400, detail="Solo se solicitan cambios sobre horarios publicados.")
            offering = block.section_offering
        elif payload.section_offering_id:
            offering = self.db.query(SectionOffering).filter(
                SectionOffering.id == payload.section_offering_id,
                SectionOffering.teacher_id == teacher.id,
            ).first()
            if not offering:
                raise HTTPException(status_code=403, detail="La oferta no pertenece al docente autenticado.")
        item = ScheduleChangeRequest(
            teacher_id=teacher.id,
            schedule_block_id=block.id if block else None,
            section_offering_id=offering.id if offering else None,
            academic_period_id=payload.academic_period_id or (offering.academic_period_id if offering else None),
            request_type=payload.request_type,
            current_day_of_week=block.day_of_week if block else None,
            current_start_time=block.start_time if block else None,
            current_end_time=block.end_time if block else None,
            requested_day_of_week=payload.requested_day_of_week,
            requested_start_time=payload.requested_start_time,
            requested_end_time=payload.requested_end_time,
            reason=payload.reason,
            status=ScheduleChangeRequestStatus.PENDING,
        )
        self.db.add(item)
        self.db.commit()
        item = self._get(item.id)
        if actor is not None:
            TraceabilityService(self.db).record_request_created(actor, item)
        return self._response(item)

    def list_for_teacher(self, user_id):
        teacher = self._teacher(user_id)
        return [self._response(item) for item in self._query().filter(ScheduleChangeRequest.teacher_id == teacher.id).all()]

    def cancel_for_teacher(self, user_id, request_id, actor=None):
        teacher = self._teacher(user_id)
        item = self._get(request_id)
        if item.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="La solicitud no pertenece al docente autenticado.")
        if item.status != ScheduleChangeRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail="Solo se pueden cancelar solicitudes pendientes.")
        previous_status = item.status.value
        item.status = ScheduleChangeRequestStatus.CANCELLED
        item.resolved_at = datetime.now(timezone.utc)
        self.db.commit()
        item = self._get(item.id)
        if actor is not None:
            TraceabilityService(self.db).record_request_cancelled(actor, item, previous_status)
        return self._response(item)

    def list_for_coordinator(self, status_filter=None, teacher_id=None, academic_period_id=None):
        query = self._query()
        if status_filter:
            query = query.filter(ScheduleChangeRequest.status == status_filter)
        if teacher_id:
            query = query.filter(ScheduleChangeRequest.teacher_id == teacher_id)
        if academic_period_id:
            query = query.filter(ScheduleChangeRequest.academic_period_id == academic_period_id)
        return [self._response(item) for item in query.all()]

    def resolve(self, request_id, payload, actor=None):
        item = self._get(request_id)
        if item.status != ScheduleChangeRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail="La solicitud ya no esta pendiente.")
        previous_status = item.status.value
        item.status = payload.status
        item.coordinator_response = payload.coordinator_response
        item.resolved_at = datetime.now(timezone.utc)
        self.db.commit()
        item = self._get(item.id)
        if actor is not None:
            TraceabilityService(self.db).record_request_resolved(actor, item, previous_status)
        return self._response(item)

    def _query(self):
        return (
            self.db.query(ScheduleChangeRequest)
            .options(
                joinedload(ScheduleChangeRequest.teacher).joinedload(Teacher.user),
                joinedload(ScheduleChangeRequest.section_offering).joinedload(SectionOffering.course),
                joinedload(ScheduleChangeRequest.academic_period),
            )
            .order_by(ScheduleChangeRequest.created_at.desc())
        )

    def _get(self, request_id):
        item = self._query().filter(ScheduleChangeRequest.id == request_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Solicitud de cambio no encontrada.")
        return item

    def _teacher(self, user_id):
        teacher = self.db.query(Teacher).filter(Teacher.user_id == user_id).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Perfil docente no encontrado.")
        return teacher

    @staticmethod
    def _response(item):
        offering = item.section_offering
        return {
            "id": item.id,
            "teacher_id": item.teacher_id,
            "teacher_name": item.teacher.user.full_name if item.teacher and item.teacher.user else None,
            "schedule_block_id": item.schedule_block_id,
            "section_offering_id": item.section_offering_id,
            "course_name": offering.course.name if offering and offering.course else None,
            "section_code": offering.section_code if offering else None,
            "academic_period_id": item.academic_period_id,
            "academic_period_code": item.academic_period.code if item.academic_period else None,
            "request_type": item.request_type,
            "current_day_of_week": item.current_day_of_week,
            "current_start_time": item.current_start_time,
            "current_end_time": item.current_end_time,
            "requested_day_of_week": item.requested_day_of_week,
            "requested_start_time": item.requested_start_time,
            "requested_end_time": item.requested_end_time,
            "reason": item.reason,
            "status": item.status,
            "coordinator_response": item.coordinator_response,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
            "resolved_at": item.resolved_at,
        }
