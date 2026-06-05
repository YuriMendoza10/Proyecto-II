from sqlalchemy.orm import Session, joinedload

from app.models.offering import SectionOffering
from app.models.schedule import AcademicSchedule, ScheduleBlock
from app.models.schedule_change_request import ScheduleChangeRequest, ScheduleChangeRequestStatus
from app.models.student import Student, StudentCourseEnrollment
from app.models.teacher import Teacher
from app.models.traceability import (
    AuditAction,
    NotificationType,
    RelatedEntityType,
    ScheduleChangeHistory,
    ScheduleChangeType,
    SchedulePublicationHistory,
)
from app.models.user import User, UserRole
from app.services.audit_log_service import AuditLogService
from app.services.notification_service import NotificationService


class TraceabilityService:
    def __init__(self, db: Session):
        self.db = db
        self.notifications = NotificationService(db)
        self.audit = AuditLogService(db)

    def record_publication(self, schedule_id, actor, previous_status, notes=None):
        schedule = (
            self.db.query(AcademicSchedule)
            .options(joinedload(AcademicSchedule.blocks).joinedload(ScheduleBlock.section_offering))
            .filter(AcademicSchedule.id == schedule_id)
            .first()
        )
        offerings = [block.section_offering for block in schedule.blocks if block.section_offering]
        offering_ids = {item.id for item in offerings}
        teacher_user_ids = {
            item.teacher.user_id for item in offerings if item.teacher_id and item.teacher
        }
        course_ids = {item.course_id for item in offerings}
        student_user_ids = set()
        if course_ids:
            query = (
                self.db.query(Student.user_id)
                .join(StudentCourseEnrollment, StudentCourseEnrollment.student_id == Student.id)
                .filter(StudentCourseEnrollment.course_id.in_(course_ids), StudentCourseEnrollment.is_active.is_(True))
            )
            if schedule.academic_period_id:
                query = query.filter(StudentCourseEnrollment.academic_period_id == schedule.academic_period_id)
            student_user_ids = {row[0] for row in query.distinct().all()}
        coordinator_ids = {
            row[0] for row in self.db.query(User.id).filter(User.role == UserRole.COORDINATOR, User.is_active.is_(True)).all()
        }
        period = schedule.academic_period
        self.notifications.create_many(
            teacher_user_ids,
            title="Horario institucional publicado",
            message=f"Tienes un nuevo horario publicado para el periodo {period}.",
            notification_type=NotificationType.SCHEDULE_PUBLISHED,
            related_entity_type=RelatedEntityType.ACADEMIC_SCHEDULE,
            related_entity_id=schedule.id,
        )
        self.notifications.create_many(
            student_user_ids,
            title="Horario disponible",
            message="Ya esta disponible el horario publicado para tus cursos asignados.",
            notification_type=NotificationType.SCHEDULE_PUBLISHED,
            related_entity_type=RelatedEntityType.ACADEMIC_SCHEDULE,
            related_entity_id=schedule.id,
        )
        self.notifications.create_many(
            coordinator_ids | ({actor.id} if actor.role == UserRole.COORDINATOR else set()),
            title="Publicacion completada",
            message="El horario fue publicado correctamente.",
            notification_type=NotificationType.SUCCESS,
            related_entity_type=RelatedEntityType.ACADEMIC_SCHEDULE,
            related_entity_id=schedule.id,
        )
        self.db.add(SchedulePublicationHistory(
            academic_schedule_id=schedule.id,
            academic_period_id=schedule.academic_period_id,
            published_by_user_id=actor.id,
            previous_status=previous_status,
            new_status=schedule.status.value,
            publication_notes=notes,
            affected_teachers_count=len(teacher_user_ids),
            affected_students_count=len(student_user_ids),
            affected_sections_count=len(offering_ids),
        ))
        self.audit.record(
            actor=actor, action=AuditAction.PUBLISH, entity_type="ACADEMIC_SCHEDULE",
            entity_id=schedule.id, description=f"Horario publicado para {period}.",
            old_values={"status": previous_status}, new_values={"status": schedule.status.value},
        )
        self.db.commit()

    def record_csp_generation(self, actor, request, result):
        solutions = len(result.get("solutions", []))
        self.notifications.create(
            user_id=actor.id,
            title="Generacion CSP completada",
            message=f"Se generaron {solutions} soluciones de horario desde la oferta academica.",
            notification_type=NotificationType.CSP_GENERATED,
            related_entity_type=RelatedEntityType.SECTION_OFFERING,
        )
        self.audit.record(
            actor=actor, action=AuditAction.GENERATE_CSP, entity_type="SECTION_OFFERING",
            description=f"Generacion CSP desde ofertas: {solutions} soluciones.",
            new_values={"academic_period_id": request.academic_period_id, "solutions": solutions},
        )
        self.db.commit()

    def record_saved_solution(self, actor, schedule_id):
        self.notifications.create(
            user_id=actor.id,
            title="Solucion CSP guardada",
            message="La solucion seleccionada fue guardada como horario DRAFT.",
            notification_type=NotificationType.SUCCESS,
            related_entity_type=RelatedEntityType.ACADEMIC_SCHEDULE,
            related_entity_id=schedule_id,
        )
        self.audit.record(
            actor=actor, action=AuditAction.SAVE_SOLUTION, entity_type="ACADEMIC_SCHEDULE",
            entity_id=schedule_id, description="Solucion CSP guardada como horario DRAFT.",
            new_values={"status": "DRAFT"},
        )
        self.db.commit()

    def record_offering_status(self, actor, offering_id, previous_status, new_status, teacher_user_id=None):
        if new_status == "PUBLISHED" and teacher_user_id:
            self.notifications.create(
                user_id=teacher_user_id,
                title="Oferta publicada",
                message="Una seccion academica asignada ha sido publicada.",
                notification_type=NotificationType.OFFERING_UPDATED,
                related_entity_type=RelatedEntityType.SECTION_OFFERING,
                related_entity_id=offering_id,
            )
        self.audit.record(
            actor=actor, action=AuditAction.UPDATE, entity_type="SECTION_OFFERING", entity_id=offering_id,
            description=f"Estado de oferta actualizado de {previous_status} a {new_status}.",
            old_values={"status": previous_status}, new_values={"status": new_status},
        )
        self.db.add(ScheduleChangeHistory(
            changed_by_user_id=actor.id,
            change_type=ScheduleChangeType.OFFERING_UPDATED,
            description=f"Estado de oferta actualizado de {previous_status} a {new_status}.",
            old_values={"offering_id": offering_id, "status": previous_status},
            new_values={"offering_id": offering_id, "status": new_status},
        ))
        self.db.commit()

    def record_request_created(self, actor, item):
        coordinator_ids = [row[0] for row in self.db.query(User.id).filter(User.role == UserRole.COORDINATOR, User.is_active.is_(True)).all()]
        self.notifications.create_many(
            coordinator_ids,
            title="Solicitud de cambio docente",
            message=f"El docente {actor.full_name} envio una solicitud de cambio de horario.",
            notification_type=NotificationType.CHANGE_REQUEST,
            related_entity_type=RelatedEntityType.SCHEDULE_CHANGE_REQUEST,
            related_entity_id=item.id,
        )
        self._record_request_event(actor, item, ScheduleChangeType.REQUEST_CREATED, AuditAction.CREATE, "Solicitud docente creada.")

    def record_request_cancelled(self, actor, item, previous_status):
        self._record_request_event(
            actor, item, ScheduleChangeType.REQUEST_CANCELLED, AuditAction.UPDATE,
            "Solicitud docente cancelada.", previous_status,
        )

    def record_request_resolved(self, actor, item, previous_status):
        accepted = item.status == ScheduleChangeRequestStatus.APPROVED
        status_label = "aprobada" if accepted else "rechazada"
        self.notifications.create(
            user_id=item.teacher.user_id,
            title="Respuesta a solicitud de cambio",
            message=f"Tu solicitud fue {status_label}.",
            notification_type=NotificationType.CHANGE_REQUEST,
            related_entity_type=RelatedEntityType.SCHEDULE_CHANGE_REQUEST,
            related_entity_id=item.id,
        )
        self._record_request_event(
            actor, item,
            ScheduleChangeType.REQUEST_APPROVED if accepted else ScheduleChangeType.REQUEST_REJECTED,
            AuditAction.APPROVE if accepted else AuditAction.REJECT,
            f"Solicitud docente {status_label}.", previous_status,
        )

    def _record_request_event(self, actor, item, change_type, audit_action, description, old_status=None):
        self.db.add(ScheduleChangeHistory(
            schedule_change_request_id=item.id,
            schedule_block_id=item.schedule_block_id,
            academic_schedule_id=item.schedule_block.schedule_id if item.schedule_block else None,
            changed_by_user_id=actor.id,
            change_type=change_type,
            description=description,
            old_values={"status": old_status} if old_status else None,
            new_values={"status": item.status.value},
        ))
        self.audit.record(
            actor=actor, action=audit_action, entity_type="SCHEDULE_CHANGE_REQUEST",
            entity_id=item.id, description=description,
            old_values={"status": old_status} if old_status else None,
            new_values={"status": item.status.value},
        )
        self.db.commit()

    def record_report_export(self, actor, report_name):
        self.audit.record(
            actor=actor, action=AuditAction.EXPORT_REPORT, entity_type="REPORT",
            description=f"Reporte exportado: {report_name}.", new_values={"format": "CSV", "report": report_name},
            commit=True,
        )

    def schedule_trace(self, schedule_id):
        publications = self.db.query(SchedulePublicationHistory).filter(
            SchedulePublicationHistory.academic_schedule_id == schedule_id
        ).order_by(SchedulePublicationHistory.created_at.desc()).all()
        changes = self.db.query(ScheduleChangeHistory).filter(
            ScheduleChangeHistory.academic_schedule_id == schedule_id
        ).order_by(ScheduleChangeHistory.created_at.desc()).all()
        return {"schedule_id": schedule_id, "publications": publications, "changes": changes}

    def request_trace(self, request_id):
        return self.db.query(ScheduleChangeHistory).filter(
            ScheduleChangeHistory.schedule_change_request_id == request_id
        ).order_by(ScheduleChangeHistory.created_at.desc()).all()
