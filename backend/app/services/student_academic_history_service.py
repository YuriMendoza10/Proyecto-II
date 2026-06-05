from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.academic import AcademicPeriod
from app.models.course import Course
from app.models.student import Student, StudentAcademicHistory, StudentAcademicHistoryStatus
from app.schemas.student_academic_history_schema import (
    StudentAcademicHistoryBulkCreate,
    StudentAcademicHistoryCreate,
    StudentAcademicHistoryUpdate,
)


class StudentAcademicHistoryService:
    def __init__(self, db: Session):
        self.db = db

    def _query(self):
        return self.db.query(StudentAcademicHistory).options(
            joinedload(StudentAcademicHistory.student).joinedload(Student.user),
            joinedload(StudentAcademicHistory.student).joinedload(Student.academic_program),
            joinedload(StudentAcademicHistory.student).joinedload(Student.curriculum_plan),
            joinedload(StudentAcademicHistory.course),
            joinedload(StudentAcademicHistory.academic_period),
        )

    @staticmethod
    def _serialize(record: StudentAcademicHistory) -> dict:
        student = record.student
        course = record.course
        return {
            "id": record.id,
            "student_id": record.student_id,
            "student_code": student.student_code,
            "student_name": student.student_name,
            "academic_program_id": student.academic_program_id,
            "academic_program_name": student.academic_program_name,
            "curriculum_plan_id": student.curriculum_plan_id,
            "curriculum_plan_code": student.curriculum_plan_code,
            "course_id": record.course_id,
            "course_code": course.code,
            "course_name": course.name,
            "academic_period_id": record.academic_period_id,
            "academic_period_name": record.academic_period.name if record.academic_period else None,
            "status": record.status,
            "grade": record.grade,
            "attempt_number": record.attempt_number,
            "credits": record.credits,
            "observation": record.observation,
            "created_at": record.created_at,
            "updated_at": record.updated_at,
        }

    def list_history(
        self,
        student_id: int | None = None,
        academic_program_id: int | None = None,
        curriculum_plan_id: int | None = None,
        course_id: int | None = None,
        history_status: StudentAcademicHistoryStatus | None = None,
        academic_period_id: int | None = None,
        skip: int = 0,
        limit: int = 500,
    ) -> list[dict]:
        query = self._query()
        if student_id is not None:
            query = query.filter(StudentAcademicHistory.student_id == student_id)
        if academic_program_id is not None or curriculum_plan_id is not None:
            query = query.join(Student)
        if academic_program_id is not None:
            query = query.filter(Student.academic_program_id == academic_program_id)
        if curriculum_plan_id is not None:
            query = query.filter(Student.curriculum_plan_id == curriculum_plan_id)
        if course_id is not None:
            query = query.filter(StudentAcademicHistory.course_id == course_id)
        if history_status is not None:
            query = query.filter(StudentAcademicHistory.status == history_status)
        if academic_period_id is not None:
            query = query.filter(StudentAcademicHistory.academic_period_id == academic_period_id)
        records = query.order_by(StudentAcademicHistory.id.desc()).offset(skip).limit(limit).all()
        return [self._serialize(record) for record in records]

    def list_history_page(self, page: int = 1, page_size: int = 20, **filters) -> dict:
        query = self._query()
        student_id = filters.get("student_id")
        academic_program_id = filters.get("academic_program_id")
        curriculum_plan_id = filters.get("curriculum_plan_id")
        course_id = filters.get("course_id")
        history_status = filters.get("history_status")
        academic_period_id = filters.get("academic_period_id")
        if student_id is not None:
            query = query.filter(StudentAcademicHistory.student_id == student_id)
        if academic_program_id is not None or curriculum_plan_id is not None:
            query = query.join(Student)
        if academic_program_id is not None:
            query = query.filter(Student.academic_program_id == academic_program_id)
        if curriculum_plan_id is not None:
            query = query.filter(Student.curriculum_plan_id == curriculum_plan_id)
        if course_id is not None:
            query = query.filter(StudentAcademicHistory.course_id == course_id)
        if history_status is not None:
            query = query.filter(StudentAcademicHistory.status == history_status)
        if academic_period_id is not None:
            query = query.filter(StudentAcademicHistory.academic_period_id == academic_period_id)
        total = query.count()
        records = query.order_by(StudentAcademicHistory.id.desc()).offset((page - 1) * page_size).limit(page_size).all()
        return {
            "items": [self._serialize(record) for record in records],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    def get_history_record(self, record_id: int) -> dict:
        record = self._query().filter(StudentAcademicHistory.id == record_id).first()
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de historial no encontrado")
        return self._serialize(record)

    def _validated_entities(self, student_id: int, course_id: int, academic_period_id: int | None):
        student = self.db.get(Student, student_id)
        course = self.db.get(Course, course_id)
        period = self.db.get(AcademicPeriod, academic_period_id) if academic_period_id else None
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado")
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado")
        if academic_period_id and not period:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Periodo academico no encontrado")
        return student, course

    def create_history_record(self, payload: StudentAcademicHistoryCreate) -> dict:
        _, course = self._validated_entities(payload.student_id, payload.course_id, payload.academic_period_id)
        values = payload.model_dump()
        values["credits"] = payload.credits if payload.credits is not None else course.credits
        record = StudentAcademicHistory(**values)
        self.db.add(record)
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un registro para el mismo curso, periodo e intento",
            ) from exc
        return self.get_history_record(record.id)

    def update_history_record(self, record_id: int, payload: StudentAcademicHistoryUpdate) -> dict:
        record = self.db.get(StudentAcademicHistory, record_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de historial no encontrado")
        values = payload.model_dump(exclude_unset=True)
        course_id = values.get("course_id", record.course_id)
        period_id = values.get("academic_period_id", record.academic_period_id)
        _, course = self._validated_entities(record.student_id, course_id, period_id)
        for field, value in values.items():
            setattr(record, field, value)
        if "course_id" in values and "credits" not in values:
            record.credits = course.credits
        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un registro para el mismo curso, periodo e intento",
            ) from exc
        return self.get_history_record(record.id)

    def delete_history_record(self, record_id: int) -> dict:
        record = self.db.get(StudentAcademicHistory, record_id)
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Registro de historial no encontrado")
        self.db.delete(record)
        self.db.commit()
        return {"message": "Registro de historial eliminado correctamente"}

    def bulk_create_history(self, payload: StudentAcademicHistoryBulkCreate) -> dict:
        created = 0
        updated = 0
        errors: list[str] = []
        for index, item in enumerate(payload.records, start=1):
            try:
                _, course = self._validated_entities(item.student_id, item.course_id, item.academic_period_id)
                query = self.db.query(StudentAcademicHistory).filter(
                    StudentAcademicHistory.student_id == item.student_id,
                    StudentAcademicHistory.course_id == item.course_id,
                    StudentAcademicHistory.attempt_number == item.attempt_number,
                )
                if item.academic_period_id is None:
                    query = query.filter(StudentAcademicHistory.academic_period_id.is_(None))
                else:
                    query = query.filter(StudentAcademicHistory.academic_period_id == item.academic_period_id)
                record = query.first()
                values = item.model_dump()
                values["credits"] = item.credits if item.credits is not None else course.credits
                if record:
                    for field, value in values.items():
                        setattr(record, field, value)
                    updated += 1
                else:
                    self.db.add(StudentAcademicHistory(**values))
                    created += 1
            except HTTPException as exc:
                errors.append(f"Fila {index}: {exc.detail}")
        self.db.commit()
        return {"created": created, "updated": updated, "errors": errors}

    def get_student_academic_summary(self, student_id: int) -> dict:
        student = self.db.get(Student, student_id)
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado")
        records = self.db.query(StudentAcademicHistory).filter(StudentAcademicHistory.student_id == student_id).all()
        count = lambda item_status: sum(record.status == item_status for record in records)
        credits = lambda item_status: sum(record.credits or 0 for record in records if record.status == item_status)
        return {
            "student_id": student.id,
            "student_code": student.student_code,
            "student_name": student.student_name,
            "total_courses": len(records),
            "approved_courses": count(StudentAcademicHistoryStatus.APPROVED),
            "failed_courses": count(StudentAcademicHistoryStatus.FAILED),
            "in_progress_courses": count(StudentAcademicHistoryStatus.IN_PROGRESS),
            "withdrawn_courses": count(StudentAcademicHistoryStatus.WITHDRAWN),
            "approved_credits": credits(StudentAcademicHistoryStatus.APPROVED),
            "failed_credits": credits(StudentAcademicHistoryStatus.FAILED),
            "current_cycle": student.current_cycle,
            "academic_program": student.academic_program_name,
            "curriculum_plan": student.curriculum_plan_code,
        }
