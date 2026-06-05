from itertools import product

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.csp.utils import overlaps
from app.models.academic import AcademicPeriod, AcademicPeriodStatus
from app.models.offering import OfferingStatus, SectionOffering
from app.models.schedule import (
    AcademicSchedule,
    ScheduleBlock,
    ScheduleSourceType,
    ScheduleStatus,
    StudentSchedule,
    StudentScheduleBlock,
)
from app.models.student import Student, StudentCourseEnrollment
from app.models.teacher import Teacher


class EnrollmentScheduleService:
    def __init__(self, db: Session):
        self.db = db

    def enrolled_courses(self, user_id):
        student, period = self._context(user_id)
        rows = self._enrollments(student.id, period)
        return [self._course_response(item, period) for item in rows]

    def published_sections(self, user_id):
        student, period = self._context(user_id)
        course_ids = [item.course_id for item in self._enrollments(student.id, period)]
        if not course_ids:
            return []
        blocks = self._published_blocks(period.id, course_ids=course_ids)
        offerings = {}
        for block in blocks:
            offering = block.section_offering
            if offering:
                offerings.setdefault(offering.id, (offering, block.schedule_id))
        return [
            self._offering_response(offering, schedule_id)
            for offering, schedule_id in offerings.values()
        ]

    def generate(self, request, user_id):
        student, period = self._context(user_id)
        enrolled = self._enrollments(student.id, period)
        enrolled_ids = {item.course_id for item in enrolled}
        selected_ids = set(request.selected_course_ids or enrolled_ids)
        if not selected_ids.issubset(enrolled_ids):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puede generar horarios con cursos asignados o matriculados.",
            )
        schedule = self._published_schedule(period.id, request.institutional_schedule_id)
        blocks = self._published_blocks(period.id, schedule.id, list(selected_ids))
        options = {}
        for block in blocks:
            offering = block.section_offering
            if not offering:
                continue
            options.setdefault(offering.course_id, {}).setdefault(offering.id, []).append(block)
        missing = selected_ids.difference(options)
        if missing:
            raise HTTPException(
                status_code=400,
                detail="No existen secciones publicadas para todos los cursos matriculados seleccionados.",
            )
        course_options = [list(options[course_id].values()) for course_id in sorted(selected_ids)]
        solutions = []
        for combination in product(*course_options):
            selected_blocks = [block for section_blocks in combination for block in section_blocks]
            if self._has_conflict(selected_blocks):
                continue
            credits = sum(item.course.credits for item in enrolled if item.course_id in selected_ids)
            if credits < student.min_credits or credits > student.max_credits:
                raise HTTPException(
                    status_code=400,
                    detail=f"La seleccion suma {credits} creditos y esta fuera del rango {student.min_credits}-{student.max_credits}.",
                )
            score = max(0.0, 100.0 - len({block.day_of_week for block in selected_blocks}) * 2.0)
            solutions.append(
                {
                    "solution_index": len(solutions),
                    "score": score,
                    "total_credits": credits,
                    "total_courses": len(selected_ids),
                    "blocks": [self._block_response(block) for block in selected_blocks],
                }
            )
            if len(solutions) >= request.max_solutions:
                break
        if not solutions:
            raise HTTPException(status_code=400, detail="No se hallaron alternativas sin cruces para los cursos matriculados.")
        return {
            "success": True,
            "message": "Alternativas generadas solo con cursos asignados y secciones publicadas.",
            "generation_mode": "ENROLLMENTS",
            "institutional_schedule_id": schedule.id,
            "enrolled_course_ids": sorted(enrolled_ids),
            "solutions": solutions,
        }

    def save(self, request, user_id):
        student, _ = self._context(user_id)
        result = self.generate(request, user_id)
        if request.solution_index >= len(result["solutions"]):
            raise HTTPException(status_code=400, detail="Indice de solucion no valido.")
        selected = result["solutions"][request.solution_index]
        if request.is_favorite:
            self.db.query(StudentSchedule).filter(StudentSchedule.student_id == student.id).update(
                {"is_favorite": False}, synchronize_session=False
            )
        item = StudentSchedule(
            student_id=student.id,
            schedule_id=result["institutional_schedule_id"],
            name=request.name,
            score=selected["score"],
            is_favorite=request.is_favorite,
            generation_mode="ENROLLMENTS",
        )
        self.db.add(item)
        self.db.flush()
        for block in selected["blocks"]:
            self.db.add(
                StudentScheduleBlock(
                    student_schedule_id=item.id,
                    schedule_block_id=block["schedule_block_id"],
                )
            )
        self.db.commit()
        return {
            "success": True,
            "message": "Horario favorito guardado desde sus cursos matriculados.",
            "generation_mode": "ENROLLMENTS",
            "student_schedule_id": item.id,
            "institutional_schedule_id": item.schedule_id,
            "score": item.score,
            "blocks": selected["blocks"],
        }

    def _context(self, user_id):
        student = self.db.query(Student).filter(Student.user_id == user_id).first()
        if not student:
            raise HTTPException(status_code=404, detail="Perfil estudiante no encontrado.")
        period = (
            self.db.query(AcademicPeriod)
            .filter(AcademicPeriod.status == AcademicPeriodStatus.ACTIVE, AcademicPeriod.is_active == True)
            .order_by(AcademicPeriod.id.desc())
            .first()
        )
        if not period:
            raise HTTPException(status_code=404, detail="No existe periodo academico activo.")
        return student, period

    def _enrollments(self, student_id, period):
        return (
            self.db.query(StudentCourseEnrollment)
            .options(joinedload(StudentCourseEnrollment.course))
            .filter(
                StudentCourseEnrollment.student_id == student_id,
                StudentCourseEnrollment.is_active == True,
                StudentCourseEnrollment.status.in_(["ENROLLED", "ASSIGNED"]),
                or_(
                    StudentCourseEnrollment.academic_period_id == period.id,
                    StudentCourseEnrollment.academic_period == period.code,
                ),
            )
            .all()
        )

    def _published_schedule(self, period_id, requested_id=None):
        query = self.db.query(AcademicSchedule).filter(
            AcademicSchedule.academic_period_id == period_id,
            AcademicSchedule.source_type == ScheduleSourceType.SECTION_OFFERINGS,
            AcademicSchedule.status == ScheduleStatus.PUBLISHED,
            AcademicSchedule.is_active == True,
        )
        if requested_id:
            query = query.filter(AcademicSchedule.id == requested_id)
        schedule = query.order_by(AcademicSchedule.id.desc()).first()
        if not schedule:
            raise HTTPException(status_code=404, detail="No existe horario institucional publicado para las ofertas del periodo activo.")
        return schedule

    def _published_blocks(self, period_id, schedule_id=None, course_ids=None):
        query = (
            self.db.query(ScheduleBlock)
            .options(
                joinedload(ScheduleBlock.schedule),
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.course),
                joinedload(ScheduleBlock.section_offering).joinedload(SectionOffering.teacher).joinedload(Teacher.user),
                joinedload(ScheduleBlock.classroom),
            )
            .join(AcademicSchedule, AcademicSchedule.id == ScheduleBlock.schedule_id)
            .join(SectionOffering, SectionOffering.id == ScheduleBlock.section_offering_id)
            .filter(
                AcademicSchedule.academic_period_id == period_id,
                AcademicSchedule.source_type == ScheduleSourceType.SECTION_OFFERINGS,
                AcademicSchedule.status == ScheduleStatus.PUBLISHED,
                SectionOffering.status == OfferingStatus.PUBLISHED,
            )
        )
        if schedule_id:
            query = query.filter(AcademicSchedule.id == schedule_id)
        if course_ids:
            query = query.filter(SectionOffering.course_id.in_(course_ids))
        return query.order_by(ScheduleBlock.schedule_id.desc(), ScheduleBlock.id).all()

    @staticmethod
    def _has_conflict(blocks):
        for index, first in enumerate(blocks):
            for second in blocks[index + 1:]:
                if first.day_of_week == second.day_of_week and overlaps(
                    first.start_time, first.end_time, second.start_time, second.end_time
                ):
                    return True
        return False

    @staticmethod
    def _course_response(item, period):
        course = item.course
        return {
            "enrollment_id": item.id,
            "course_id": course.id,
            "course_code": course.code,
            "course_name": course.name,
            "credits": course.credits,
            "cycle": course.cycle,
            "academic_period_id": period.id,
            "academic_period_code": period.code,
            "status": item.status,
        }

    @staticmethod
    def _offering_response(offering, schedule_id):
        return {
            "section_offering_id": offering.id,
            "course_id": offering.course_id,
            "course_code": offering.course.code,
            "course_name": offering.course.name,
            "credits": offering.course.credits,
            "cycle_number": offering.cycle_number,
            "section_code": offering.section_code,
            "teacher_name": offering.teacher.user.full_name if offering.teacher and offering.teacher.user else None,
            "classroom_code": offering.classroom.code if offering.classroom else None,
            "modality": offering.modality.value,
            "shift": offering.shift.value,
            "capacity": offering.capacity,
            "estimated_students": offering.estimated_students,
            "institutional_schedule_id": schedule_id,
        }

    @staticmethod
    def _block_response(block):
        offering = block.section_offering
        return {
            "schedule_block_id": block.id,
            "section_offering_id": offering.id,
            "course_id": offering.course_id,
            "course_name": offering.course.name,
            "credits": offering.course.credits,
            "section_code": offering.section_code,
            "teacher_name": offering.teacher.user.full_name if offering.teacher and offering.teacher.user else None,
            "classroom_code": block.classroom.code if block.classroom else None,
            "day_of_week": block.day_of_week,
            "start_time": block.start_time,
            "end_time": block.end_time,
        }
