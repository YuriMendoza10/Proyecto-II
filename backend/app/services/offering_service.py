from collections import Counter

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.models.academic import (
    AcademicPeriod,
    AcademicPeriodStatus,
    AcademicProgram,
    CurriculumCourse,
    CurriculumCourseType,
    CurriculumPlan,
)
from app.models.classroom import Classroom, ClassroomType
from app.models.course import Course, CourseSection
from app.models.offering import (
    OfferingConflict,
    OfferingConflictSeverity,
    OfferingConflictType,
    OfferingStatus,
    SectionOffering,
    SectionRequirement,
)
from app.models.student import Student
from app.models.teacher import Teacher, TeacherAvailability
from app.models.user import User, UserRole
from app.repositories.offering_repository import OfferingRepository


class SectionOfferingService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = OfferingRepository(db)
        self.validator = OfferingValidationService(db)

    def list_offerings(
        self,
        current_user: User,
        academic_period_id=None,
        academic_program_id=None,
        curriculum_plan_id=None,
        cycle_number=None,
        offering_status=None,
        teacher_id=None,
    ):
        query = self.repository.offering_query()
        if academic_period_id:
            query = query.filter(SectionOffering.academic_period_id == academic_period_id)
        if academic_program_id:
            query = query.filter(SectionOffering.academic_program_id == academic_program_id)
        if curriculum_plan_id:
            query = query.filter(SectionOffering.curriculum_plan_id == curriculum_plan_id)
        if cycle_number:
            query = query.filter(SectionOffering.cycle_number == cycle_number)
        if offering_status:
            query = query.filter(SectionOffering.status == offering_status)
        if teacher_id:
            query = query.filter(SectionOffering.teacher_id == teacher_id)

        if current_user.role == UserRole.TEACHER:
            if not current_user.teacher_profile:
                return []
            query = query.filter(SectionOffering.teacher_id == current_user.teacher_profile.id)
        if current_user.role == UserRole.STUDENT:
            student = self._require_student(current_user.id)
            query = (
                query.join(SectionOffering.academic_period).join(SectionOffering.academic_program)
                .filter(SectionOffering.status == OfferingStatus.PUBLISHED)
                .filter(AcademicPeriod.status == AcademicPeriodStatus.ACTIVE)
                .filter(SectionOffering.cycle_number == student.current_cycle)
                .filter(AcademicProgram.name.like(f"{student.career}%"))
            )
        return [
            self._response(item)
            for item in query.order_by(SectionOffering.cycle_number, SectionOffering.display_name).all()
        ]

    def list_published_for_student(self, user_id: int):
        student = self._require_student(user_id)
        items = (
            self.repository.offering_query()
            .join(SectionOffering.academic_period).join(SectionOffering.academic_program)
            .filter(SectionOffering.status == OfferingStatus.PUBLISHED)
            .filter(AcademicPeriod.status == AcademicPeriodStatus.ACTIVE)
            .filter(SectionOffering.cycle_number == student.current_cycle)
            .filter(AcademicProgram.name.like(f"{student.career}%"))
            .order_by(SectionOffering.display_name)
            .all()
        )
        return [self._response(item) for item in items]

    def get_offering(self, offering_id: int, current_user: User):
        item = self._require_offering(offering_id)
        if current_user.role == UserRole.TEACHER:
            if not current_user.teacher_profile or item.teacher_id != current_user.teacher_profile.id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Oferta no asignada al docente")
        if current_user.role == UserRole.STUDENT:
            visible_ids = {value["id"] for value in self.list_published_for_student(current_user.id)}
            if item.id not in visible_ids:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Oferta publicada no encontrada")
        return self._response(item)

    def create_offering(self, payload):
        values = payload.model_dump()
        if values["status"] == OfferingStatus.PUBLISHED:
            raise HTTPException(status_code=400, detail="La oferta debe crearse y aprobarse antes de publicarse")
        item = self._build_validated_offering(values)
        self.db.add(item)
        try:
            self.db.flush()
            self._validate_target_status(item, item.status)
            self.db.commit()
        except IntegrityError as error:
            self.db.rollback()
            raise HTTPException(status_code=400, detail="La seccion ya existe para el periodo y curso") from error
        except Exception:
            self.db.rollback()
            raise
        return self._response(self._require_offering(item.id))

    def update_offering(self, offering_id: int, payload):
        item = self._require_offering(offering_id)
        values = payload.model_dump(exclude_unset=True)
        requested_status = values.pop("status", None)
        merged = {
            "academic_period_id": item.academic_period_id,
            "academic_program_id": item.academic_program_id,
            "curriculum_plan_id": item.curriculum_plan_id,
            "curriculum_course_id": item.curriculum_course_id,
            "course_id": item.course_id,
            "section_code": item.section_code,
            "display_name": item.display_name,
            "cycle_number": item.cycle_number,
            "teacher_id": item.teacher_id,
            "classroom_id": item.classroom_id,
            "estimated_students": item.estimated_students,
            "capacity": item.capacity,
            "modality": item.modality,
            "shift": item.shift,
            "notes": item.notes,
            **values,
        }
        checked = self._build_validated_offering(merged, current_id=item.id)
        for key in merged:
            setattr(item, key, getattr(checked, key))
        try:
            self.db.flush()
            if requested_status is not None:
                self._transition(item, requested_status)
            else:
                self._validate_target_status(item, item.status)
            self.db.commit()
        except IntegrityError as error:
            self.db.rollback()
            raise HTTPException(status_code=400, detail="La seccion ya existe para el periodo y curso") from error
        except Exception:
            self.db.rollback()
            raise
        return self._response(self._require_offering(item.id))

    def change_status(self, offering_id: int, target_status: OfferingStatus):
        item = self._require_offering(offering_id)
        self._transition(item, target_status)
        self.db.commit()
        return self._response(self._require_offering(item.id))

    def delete_offering(self, offering_id: int):
        item = self._require_offering(offering_id)
        self.repository.delete(item)
        return {"message": "Oferta academica eliminada correctamente"}

    def bulk_from_curriculum(self, payload):
        period = self.db.query(AcademicPeriod).filter(AcademicPeriod.id == payload.academic_period_id).first()
        plan = self.db.query(CurriculumPlan).filter(CurriculumPlan.id == payload.curriculum_plan_id).first()
        if not period or not plan:
            raise HTTPException(status_code=404, detail="Periodo o plan curricular no encontrado")
        query = (
            self.db.query(CurriculumCourse)
            .options(joinedload(CurriculumCourse.course))
            .filter(
                CurriculumCourse.curriculum_plan_id == plan.id,
                CurriculumCourse.is_active == True,
            )
        )
        if payload.cycles:
            if any(cycle < 1 or cycle > plan.total_cycles for cycle in payload.cycles):
                raise HTTPException(status_code=400, detail="Los ciclos seleccionados no son validos")
            query = query.filter(CurriculumCourse.cycle_number.in_(payload.cycles))
        if not payload.include_electives:
            query = query.filter(
                CurriculumCourse.course_type.notin_(
                    [CurriculumCourseType.GENERAL_ELECTIVE, CurriculumCourseType.SPECIALTY_ELECTIVE]
                )
            )
        created = []
        skipped = 0
        for curriculum_course in query.order_by(CurriculumCourse.cycle_number, CurriculumCourse.id).all():
            exists = (
                self.db.query(SectionOffering)
                .filter(
                    SectionOffering.academic_period_id == period.id,
                    SectionOffering.curriculum_course_id == curriculum_course.id,
                    SectionOffering.section_code == payload.default_section_code,
                )
                .first()
            )
            if exists:
                skipped += 1
                continue
            item = SectionOffering(
                academic_period_id=period.id,
                academic_program_id=plan.program_id,
                campus_id=plan.program.campus_id,
                curriculum_plan_id=plan.id,
                curriculum_course_id=curriculum_course.id,
                course_id=curriculum_course.course_id,
                section_code=payload.default_section_code,
                display_name=f"{curriculum_course.course.name} - Seccion {payload.default_section_code}",
                cycle_number=curriculum_course.cycle_number,
                estimated_students=0,
                capacity=payload.default_capacity,
                modality=payload.default_modality,
                shift=payload.default_shift,
                status=OfferingStatus.DRAFT,
            )
            self.db.add(item)
            self.db.flush()
            created.append(item.id)
        self.db.commit()
        return {
            "created": len(created),
            "skipped_existing": skipped,
            "offerings": [self._response(self._require_offering(item_id)) for item_id in created],
        }

    def _build_validated_offering(self, values, current_id=None):
        plan = self.db.query(CurriculumPlan).filter(CurriculumPlan.id == values["curriculum_plan_id"]).first()
        curriculum_course = (
            self.db.query(CurriculumCourse)
            .options(joinedload(CurriculumCourse.course))
            .filter(CurriculumCourse.id == values["curriculum_course_id"])
            .first()
        )
        period = self.db.query(AcademicPeriod).filter(AcademicPeriod.id == values["academic_period_id"]).first()
        if not plan or not curriculum_course or not period:
            raise HTTPException(status_code=404, detail="Periodo, plan o curso de malla no encontrado")
        if curriculum_course.curriculum_plan_id != plan.id:
            raise HTTPException(status_code=400, detail="El curso no pertenece al plan curricular indicado")
        if plan.program_id != values["academic_program_id"]:
            raise HTTPException(status_code=400, detail="El programa no corresponde al plan curricular")
        course_id = values.get("course_id") or curriculum_course.course_id
        if course_id != curriculum_course.course_id:
            raise HTTPException(status_code=400, detail="El curso no corresponde al curso de la malla")
        cycle = values.get("cycle_number") or curriculum_course.cycle_number
        if cycle != curriculum_course.cycle_number or cycle < 1 or cycle > 10:
            raise HTTPException(status_code=400, detail="El ciclo no corresponde al curso de la malla")
        duplicate = (
            self.db.query(SectionOffering)
            .filter(
                SectionOffering.academic_period_id == period.id,
                SectionOffering.curriculum_course_id == curriculum_course.id,
                SectionOffering.section_code == values["section_code"],
            )
            .first()
        )
        if duplicate and duplicate.id != current_id:
            raise HTTPException(status_code=400, detail="La seccion ya existe para este curso y periodo")
        values = {**values, "course_id": course_id, "cycle_number": cycle}
        values["campus_id"] = values.get("campus_id") or plan.program.campus_id
        values["display_name"] = values.get("display_name") or f"{curriculum_course.course.name} - Seccion {values['section_code']}"
        return SectionOffering(**values)

    def _transition(self, item, target_status):
        if target_status == OfferingStatus.PUBLISHED and item.status != OfferingStatus.APPROVED:
            raise HTTPException(status_code=400, detail="La oferta debe aprobarse antes de publicarse")
        self._validate_target_status(item, target_status)
        item.status = target_status

    def _validate_target_status(self, item, target_status):
        if target_status == OfferingStatus.DRAFT or target_status == OfferingStatus.CLOSED:
            return
        issues = self.validator.get_issues(item, target_status)
        critical = [value for value in issues if value["severity"] == OfferingConflictSeverity.CRITICAL]
        if critical:
            raise HTTPException(status_code=400, detail=critical[0]["message"])

    def _require_offering(self, offering_id):
        item = self.repository.get_offering(offering_id)
        if not item:
            raise HTTPException(status_code=404, detail="Oferta academica no encontrada")
        return item

    def _require_student(self, user_id):
        item = self.db.query(Student).filter(Student.user_id == user_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Perfil estudiante no encontrado")
        return item

    @staticmethod
    def _response(item):
        return {
            "id": item.id,
            "academic_period_id": item.academic_period_id,
            "academic_period_code": item.academic_period.code if item.academic_period else None,
            "academic_program_id": item.academic_program_id,
            "academic_program_name": item.academic_program.name if item.academic_program else None,
            "curriculum_plan_id": item.curriculum_plan_id,
            "curriculum_plan_code": item.curriculum_plan.code if item.curriculum_plan else None,
            "curriculum_course_id": item.curriculum_course_id,
            "course_id": item.course_id,
            "course_code": item.course.code if item.course else None,
            "course_name": item.course.name if item.course else None,
            "section_code": item.section_code,
            "display_name": item.display_name,
            "cycle_number": item.cycle_number,
            "teacher_id": item.teacher_id,
            "teacher_name": item.teacher.user.full_name if item.teacher and item.teacher.user else None,
            "classroom_id": item.classroom_id,
            "classroom_code": item.classroom.code if item.classroom else None,
            "estimated_students": item.estimated_students,
            "capacity": item.capacity,
            "modality": item.modality,
            "shift": item.shift,
            "status": item.status,
            "notes": item.notes,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }


class SectionRequirementService:
    def __init__(self, db):
        self.db = db
        self.repository = OfferingRepository(db)

    def list_requirements(self, section_offering_id=None):
        query = self.repository.requirements_query()
        if section_offering_id:
            query = query.filter(SectionRequirement.section_offering_id == section_offering_id)
        return query.order_by(SectionRequirement.id).all()

    def create_requirement(self, payload):
        if not self.repository.get_offering(payload.section_offering_id):
            raise HTTPException(status_code=404, detail="Oferta academica no encontrada")
        return self.repository.save(SectionRequirement(**payload.model_dump()))

    def update_requirement(self, item_id, payload):
        item = self.db.query(SectionRequirement).filter(SectionRequirement.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Requisito no encontrado")
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, key, value)
        return self.repository.save(item)

    def delete_requirement(self, item_id):
        item = self.db.query(SectionRequirement).filter(SectionRequirement.id == item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Requisito no encontrado")
        self.repository.delete(item)
        return {"message": "Requisito eliminado correctamente"}


class OfferingValidationService:
    def __init__(self, db: Session):
        self.db = db

    def get_issues(self, offering, target_status=None):
        target_status = target_status or offering.status
        strict = target_status in {OfferingStatus.APPROVED, OfferingStatus.PUBLISHED}
        issues = []

        def add(conflict_type, severity, message, action):
            issues.append(
                {
                    "conflict_type": conflict_type,
                    "severity": severity,
                    "message": message,
                    "suggested_action": action,
                }
            )

        if not offering.teacher_id:
            add(
                OfferingConflictType.MISSING_TEACHER,
                OfferingConflictSeverity.CRITICAL if strict else OfferingConflictSeverity.HIGH,
                f"{offering.display_name} no tiene docente asignado.",
                "Asignar un docente activo con disponibilidad registrada.",
            )
        else:
            teacher = self.db.query(Teacher).filter(Teacher.id == offering.teacher_id).first()
            if not teacher or not teacher.user or not teacher.user.is_active:
                add(OfferingConflictType.MISSING_TEACHER, OfferingConflictSeverity.CRITICAL, f"El docente de {offering.display_name} esta inactivo.", "Asignar un docente activo.")
            elif not self.db.query(TeacherAvailability).filter(
                TeacherAvailability.teacher_id == teacher.id,
                TeacherAvailability.is_available == True,
            ).first():
                add(OfferingConflictType.TEACHER_NOT_AVAILABLE, OfferingConflictSeverity.CRITICAL if strict else OfferingConflictSeverity.HIGH, f"El docente de {offering.display_name} no tiene disponibilidad activa.", "Registrar disponibilidad docente.")
            compatible = {
                row[0]
                for row in self.db.query(CourseSection.teacher_id)
                .filter(CourseSection.course_id == offering.course_id, CourseSection.teacher_id.isnot(None))
                .all()
            }
            if compatible and offering.teacher_id not in compatible:
                add(OfferingConflictType.UNREADY_OFFERING, OfferingConflictSeverity.MEDIUM, f"El docente asignado no aparece entre docentes previos del curso {offering.display_name}.", "Confirmar compatibilidad docente-curso.")
            weekly_load = (
                self.db.query(func.coalesce(func.sum(Course.weekly_hours), 0))
                .select_from(SectionOffering)
                .join(Course, Course.id == SectionOffering.course_id)
                .filter(
                    SectionOffering.academic_period_id == offering.academic_period_id,
                    SectionOffering.teacher_id == teacher.id,
                    SectionOffering.status != OfferingStatus.CLOSED,
                )
                .scalar()
            )
            if weekly_load > teacher.max_weekly_hours:
                add(
                    OfferingConflictType.TEACHER_OVERLOAD,
                    OfferingConflictSeverity.CRITICAL if strict else OfferingConflictSeverity.HIGH,
                    f"El docente de {offering.display_name} supera su carga maxima semanal.",
                    "Redistribuir secciones o asignar otro docente.",
                )

        if not offering.classroom_id:
            add(
                OfferingConflictType.MISSING_CLASSROOM,
                OfferingConflictSeverity.CRITICAL if strict else OfferingConflictSeverity.HIGH,
                f"{offering.display_name} no tiene aula asignada.",
                "Asignar un aula activa o virtual compatible.",
            )
        else:
            classroom = self.db.query(Classroom).filter(Classroom.id == offering.classroom_id).first()
            if not classroom or not classroom.is_active:
                add(OfferingConflictType.MISSING_CLASSROOM, OfferingConflictSeverity.CRITICAL, f"El aula de {offering.display_name} esta inactiva.", "Asignar un aula activa.")
            else:
                needed = max(
                    [offering.estimated_students]
                    + [requirement.min_capacity for requirement in offering.requirements or []]
                )
                if classroom.capacity < needed:
                    add(OfferingConflictType.CLASSROOM_CAPACITY, OfferingConflictSeverity.CRITICAL, f"El aula de {offering.display_name} no cubre la capacidad requerida.", "Seleccionar un aula de mayor capacidad.")
                for requirement in offering.requirements or []:
                    required_type = ClassroomType.LAB if requirement.requires_lab else requirement.required_classroom_type
                    if required_type and classroom.classroom_type != required_type:
                        add(OfferingConflictType.CLASSROOM_TYPE_MISMATCH, OfferingConflictSeverity.CRITICAL, f"El aula de {offering.display_name} no cumple el tipo requerido.", "Asignar un aula del tipo requerido.")

        missing_minimum = (
            offering.course_id is None
            or offering.cycle_number is None
            or not (1 <= offering.cycle_number <= 10)
            or offering.capacity <= 0
            or offering.estimated_students < 0
        )
        if target_status in {OfferingStatus.READY, OfferingStatus.APPROVED, OfferingStatus.PUBLISHED} and missing_minimum:
            add(OfferingConflictType.UNREADY_OFFERING, OfferingConflictSeverity.CRITICAL, f"{offering.display_name} no tiene los datos minimos para estar {target_status.value}.", "Completar curso, ciclo y cupos/capacidad.")
        if offering.curriculum_course and (
            offering.curriculum_course.curriculum_plan_id != offering.curriculum_plan_id
            or offering.curriculum_course.course_id != offering.course_id
        ):
            add(OfferingConflictType.UNREADY_OFFERING, OfferingConflictSeverity.CRITICAL, f"{offering.display_name} contiene un curso fuera del plan.", "Corregir el curso de malla asociado.")
        return issues

    def analyze(self, academic_period_id, section_offering_id=None):
        query = (
            self.db.query(SectionOffering)
            .options(joinedload(SectionOffering.curriculum_course), joinedload(SectionOffering.requirements))
            .filter(SectionOffering.academic_period_id == academic_period_id)
        )
        if section_offering_id:
            query = query.filter(SectionOffering.id == section_offering_id)
        offerings = query.all()
        if not offerings:
            raise HTTPException(status_code=404, detail="No existen ofertas para analizar")
        offering_ids = [item.id for item in offerings]
        self.db.query(OfferingConflict).filter(
            OfferingConflict.academic_period_id == academic_period_id,
            OfferingConflict.section_offering_id.in_(offering_ids),
            OfferingConflict.is_resolved == False,
        ).delete(synchronize_session=False)
        created = []
        for offering in offerings:
            for issue in self.get_issues(offering):
                conflict = OfferingConflict(
                    section_offering_id=offering.id,
                    academic_period_id=academic_period_id,
                    **issue,
                )
                self.db.add(conflict)
                created.append(conflict)
        self.db.commit()
        return {
            "analyzed_offerings": len(offerings),
            "conflicts_created": len(created),
            "critical_conflicts": sum(1 for item in created if item.severity == OfferingConflictSeverity.CRITICAL),
            "conflicts": [OfferingConflictService(self.db)._response(item) for item in created],
        }


class OfferingConflictService:
    def __init__(self, db):
        self.db = db
        self.repository = OfferingRepository(db)

    def list_conflicts(self, academic_period_id=None, severity=None, is_resolved=None):
        query = self.repository.conflicts_query()
        if academic_period_id:
            query = query.filter(OfferingConflict.academic_period_id == academic_period_id)
        if severity:
            query = query.filter(OfferingConflict.severity == severity)
        if is_resolved is not None:
            query = query.filter(OfferingConflict.is_resolved == is_resolved)
        return [self._response(item) for item in query.order_by(OfferingConflict.created_at.desc()).all()]

    def resolve(self, conflict_id):
        item = self.db.query(OfferingConflict).filter(OfferingConflict.id == conflict_id).first()
        if not item:
            raise HTTPException(status_code=404, detail="Conflicto no encontrado")
        item.is_resolved = True
        self.db.commit()
        return self._response(item)

    @staticmethod
    def _response(item):
        return {
            "id": item.id,
            "section_offering_id": item.section_offering_id,
            "academic_period_id": item.academic_period_id,
            "conflict_type": item.conflict_type,
            "severity": item.severity,
            "message": item.message,
            "suggested_action": item.suggested_action,
            "is_resolved": item.is_resolved,
            "offering_display_name": item.section_offering.display_name if item.section_offering else None,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }


class CoordinatorDashboardService:
    def __init__(self, db):
        self.db = db

    def get_dashboard(self):
        period = (
            self.db.query(AcademicPeriod)
            .filter(AcademicPeriod.status == AcademicPeriodStatus.ACTIVE, AcademicPeriod.is_active == True)
            .order_by(AcademicPeriod.id.desc())
            .first()
        )
        items = (
            self.db.query(SectionOffering).filter(SectionOffering.academic_period_id == period.id).all()
            if period else []
        )
        statuses = Counter(item.status.value for item in items)
        cycles = Counter(str(item.cycle_number) for item in items)
        critical = (
            self.db.query(OfferingConflict)
            .filter(
                OfferingConflict.academic_period_id == period.id,
                OfferingConflict.severity == OfferingConflictSeverity.CRITICAL,
                OfferingConflict.is_resolved == False,
            )
            .count()
            if period else 0
        )
        return {
            "active_period_id": period.id if period else None,
            "active_period_code": period.code if period else None,
            "total_offerings": len(items),
            "offerings_by_status": dict(statuses),
            "offerings_without_teacher": sum(item.teacher_id is None for item in items),
            "offerings_without_classroom": sum(item.classroom_id is None for item in items),
            "critical_conflicts": critical,
            "courses_by_cycle": dict(cycles),
            "assigned_teachers": len({item.teacher_id for item in items if item.teacher_id}),
            "required_classrooms": len({item.classroom_id for item in items if item.classroom_id}),
        }


class OfferingsCSPPreparationService:
    def __init__(self, db):
        self.db = db
        self.validator = OfferingValidationService(db)

    def prepare(self, payload):
        query = (
            self.db.query(SectionOffering)
            .options(
                joinedload(SectionOffering.academic_period),
                joinedload(SectionOffering.academic_program),
                joinedload(SectionOffering.curriculum_plan),
                joinedload(SectionOffering.curriculum_course),
                joinedload(SectionOffering.course),
                joinedload(SectionOffering.teacher).joinedload(Teacher.user),
                joinedload(SectionOffering.classroom),
                joinedload(SectionOffering.requirements),
            )
            .filter(SectionOffering.academic_period_id == payload.academic_period_id)
            .filter(SectionOffering.status.in_([OfferingStatus.READY, OfferingStatus.APPROVED]))
        )
        if payload.academic_program_id:
            query = query.filter(SectionOffering.academic_program_id == payload.academic_program_id)
        if payload.cycle_numbers:
            query = query.filter(SectionOffering.cycle_number.in_(payload.cycle_numbers))
        items = query.order_by(SectionOffering.cycle_number, SectionOffering.display_name).all()
        if not items:
            return {
                "source": "course_sections",
                "academic_period_id": payload.academic_period_id,
                "offering_count": 0,
                "ready_for_generation": False,
                "fallback_to_course_sections": True,
                "message": "No hay ofertas READY o APPROVED; el generador vigente puede continuar con course_sections.",
                "offerings": [],
            }
        issues = []
        for item in items:
            issues.extend(self.validator.get_issues(item, OfferingStatus.APPROVED))
        critical = [item for item in issues if item["severity"] == OfferingConflictSeverity.CRITICAL]
        if critical:
            raise HTTPException(status_code=400, detail=critical[0]["message"])
        return {
            "source": "section_offerings",
            "academic_period_id": payload.academic_period_id,
            "offering_count": len(items),
            "ready_for_generation": True,
            "fallback_to_course_sections": False,
            "message": "Ofertas validadas para adaptacion al motor CSP; el guardado actual sigue usando course_sections.",
            "offerings": [SectionOfferingService._response(item) for item in items],
        }
