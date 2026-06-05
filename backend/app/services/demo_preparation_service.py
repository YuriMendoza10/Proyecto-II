from collections import defaultdict
from datetime import time

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.academic import (
    AcademicPeriod,
    AcademicProgram,
    CurriculumCourse,
    CurriculumPlan,
    CurriculumPlanStatus,
)
from app.models.classroom import Classroom, ClassroomType
from app.models.offering import (
    OfferingModality,
    OfferingShift,
    OfferingStatus,
    SectionOffering,
)
from app.models.teacher import Teacher, TeacherAvailability
from app.models.user import User, UserRole


class DemoPreparationService:
    def __init__(self, db: Session):
        self.db = db

    def prepare_institutional_csp(self, request: dict | None = None) -> dict:
        request = request or {}
        warnings: list[str] = []
        errors: list[str] = []
        stats = defaultdict(int)

        period = self._resolve_period(request.get("academic_period_id"))
        program = self._resolve_program(request.get("academic_program_id"))
        plan = self._resolve_plan(request.get("curriculum_plan_id"), program)

        if not period or not program or not plan:
            return {
                "success": False,
                "warnings": warnings,
                "errors": ["No se pudo detectar periodo, programa o plan curricular activo."],
                "message": "Complete el dominio academico antes de preparar la demo CSP.",
            }

        cycles = self._resolve_cycles(request.get("cycles"), plan)
        curriculum_courses = (
            self.db.query(CurriculumCourse)
            .filter(
                CurriculumCourse.curriculum_plan_id == plan.id,
                CurriculumCourse.is_active.is_(True),
                CurriculumCourse.cycle_number.in_(cycles),
            )
            .order_by(CurriculumCourse.cycle_number, CurriculumCourse.id)
            .all()
        )
        if not curriculum_courses:
            return {
                "success": False,
                "period": period.code,
                "program": program.name,
                "plan": plan.code,
                "cycles_prepared": cycles,
                "warnings": warnings,
                "errors": ["No hay cursos curriculares para los ciclos seleccionados."],
                "message": "No se pudieron preparar ofertas porque la malla no tiene cursos.",
            }

        if request.get("create_missing_teachers", True):
            stats["created_teachers"] += self._ensure_teacher_count(len(curriculum_courses))
        teachers = self._active_teachers()
        if not teachers:
            errors.append("No hay docentes activos disponibles.")

        if request.get("create_missing_classrooms", True):
            stats["created_classrooms"] += self._ensure_classroom_count(len(curriculum_courses))
        classrooms = self._active_classrooms()
        if not classrooms:
            errors.append("No hay aulas activas disponibles.")

        if errors:
            self.db.rollback()
            return {
                "success": False,
                "period": period.code,
                "program": program.name,
                "plan": plan.code,
                "cycles_prepared": cycles,
                "warnings": warnings,
                "errors": errors,
                "message": "No se pudo preparar la demo CSP.",
            }

        offerings = []
        create_missing = request.get("create_missing_offerings", True)
        for curriculum_course in curriculum_courses:
            offering = (
                self.db.query(SectionOffering)
                .filter(
                    SectionOffering.academic_period_id == period.id,
                    SectionOffering.curriculum_course_id == curriculum_course.id,
                    SectionOffering.section_code == "A",
                )
                .first()
            )
            if not offering and create_missing:
                offering = SectionOffering(
                    academic_period_id=period.id,
                    academic_program_id=program.id,
                    campus_id=program.campus_id,
                    curriculum_plan_id=plan.id,
                    curriculum_course_id=curriculum_course.id,
                    course_id=curriculum_course.course_id,
                    section_code="A",
                    display_name=f"{curriculum_course.course.name} - Seccion A",
                    cycle_number=curriculum_course.cycle_number,
                    estimated_students=self._estimated_students(curriculum_course.cycle_number),
                    capacity=50,
                    modality=OfferingModality.PRESENTIAL,
                    shift=OfferingShift.FLEXIBLE,
                    status=OfferingStatus.APPROVED,
                    notes="Oferta demo creada automaticamente para CSP institucional.",
                )
                self.db.add(offering)
                self.db.flush()
                stats["offerings_created"] += 1
            if offering:
                offerings.append(offering)

        fix_existing = request.get("fix_existing_offerings", True)
        target_status = OfferingStatus(request.get("status_target", "APPROVED"))
        for index, offering in enumerate(offerings):
            changed = False
            if fix_existing:
                offering.academic_program_id = program.id
                if not offering.campus_id:
                    offering.campus_id = program.campus_id
                offering.curriculum_plan_id = plan.id
                offering.academic_period_id = period.id
                offering.cycle_number = offering.curriculum_course.cycle_number
                if not offering.display_name:
                    offering.display_name = f"{offering.course.name} - Seccion {offering.section_code or 'A'}"
                if not offering.section_code:
                    offering.section_code = "A"
                if not offering.estimated_students or offering.estimated_students < 1:
                    offering.estimated_students = self._estimated_students(offering.cycle_number)
                    changed = True
                if offering.capacity < offering.estimated_students:
                    offering.capacity = max(offering.estimated_students, 50)
                    changed = True
                if not offering.modality:
                    offering.modality = OfferingModality.PRESENTIAL
                    changed = True
                if not offering.shift:
                    offering.shift = OfferingShift.FLEXIBLE
                    changed = True
                preferred_teacher_id = teachers[index % len(teachers)].id
                if offering.teacher_id != preferred_teacher_id:
                    offering.teacher_id = preferred_teacher_id
                    stats["teachers_assigned"] += 1
                    changed = True
                if offering.modality != OfferingModality.VIRTUAL:
                    preferred_classroom_id = self._pick_classroom(classrooms, offering.estimated_students, index).id
                    if offering.classroom_id != preferred_classroom_id:
                        offering.classroom_id = preferred_classroom_id
                        stats["classrooms_assigned"] += 1
                        changed = True
                if offering.classroom and offering.classroom.capacity < offering.estimated_students:
                    offering.classroom_id = self._pick_classroom(classrooms, offering.estimated_students, index).id
                    stats["classrooms_assigned"] += 1
                    changed = True
                if offering.status in {OfferingStatus.DRAFT, OfferingStatus.READY, OfferingStatus.APPROVED, OfferingStatus.PUBLISHED}:
                    if offering.teacher_id and (offering.modality == OfferingModality.VIRTUAL or offering.classroom_id):
                        if offering.status != target_status:
                            offering.status = target_status
                            changed = True
                if changed:
                    stats["offerings_updated"] += 1

        assigned_teacher_ids = sorted({offering.teacher_id for offering in offerings if offering.teacher_id})
        availability_stats = self._ensure_availability(assigned_teacher_ids)
        stats.update(availability_stats)

        self.db.commit()
        final_offerings = (
            self.db.query(SectionOffering)
            .filter(
                SectionOffering.academic_period_id == period.id,
                SectionOffering.curriculum_plan_id == plan.id,
                SectionOffering.cycle_number.in_(cycles),
            )
            .all()
        )
        approved = sum(1 for item in final_offerings if item.status == OfferingStatus.APPROVED)
        ready = sum(1 for item in final_offerings if item.status == OfferingStatus.READY)
        missing_teacher = sum(1 for item in final_offerings if not item.teacher_id)
        missing_classroom = sum(1 for item in final_offerings if item.modality != OfferingModality.VIRTUAL and not item.classroom_id)
        if missing_teacher:
            warnings.append(f"{missing_teacher} oferta(s) quedaron sin docente.")
        if missing_classroom:
            warnings.append(f"{missing_classroom} oferta(s) quedaron sin aula.")

        return {
            "success": not missing_teacher and not missing_classroom,
            "period": period.code,
            "program": program.name,
            "plan": plan.code,
            "cycles_prepared": cycles,
            "offerings_reviewed": len(final_offerings),
            "offerings_created": stats["offerings_created"],
            "offerings_updated": stats["offerings_updated"],
            "offerings_ready": ready,
            "offerings_approved": approved,
            "teachers_assigned": stats["teachers_assigned"],
            "classrooms_assigned": stats["classrooms_assigned"],
            "created_teachers": stats["created_teachers"],
            "created_classrooms": stats["created_classrooms"],
            "teacher_availability_created": stats["teacher_availability_created"],
            "teacher_availability_existing": stats["teacher_availability_existing"],
            "teacher_availability_fixed": 0,
            "warnings": warnings,
            "errors": errors,
            "message": "Datos preparados correctamente para generacion institucional.",
        }

    def resolve_cycles_for_request(self, cycles, plan_id: int | None) -> list[int]:
        plan = self._resolve_plan(plan_id, None)
        return self._resolve_cycles(cycles, plan) if plan else []

    def _resolve_period(self, period_id):
        if period_id:
            return self.db.query(AcademicPeriod).filter(AcademicPeriod.id == period_id).first()
        return (
            self.db.query(AcademicPeriod)
            .filter(AcademicPeriod.is_active.is_(True))
            .order_by(AcademicPeriod.id.desc())
            .first()
            or self.db.query(AcademicPeriod).order_by(AcademicPeriod.id.desc()).first()
        )

    def _resolve_program(self, program_id):
        if program_id:
            return self.db.query(AcademicProgram).filter(AcademicProgram.id == program_id).first()
        return (
            self.db.query(AcademicProgram).filter(AcademicProgram.code == "ISI").first()
            or self.db.query(AcademicProgram).order_by(AcademicProgram.id).first()
        )

    def _resolve_plan(self, plan_id, program):
        if plan_id:
            return self.db.query(CurriculumPlan).filter(CurriculumPlan.id == plan_id).first()
        query = self.db.query(CurriculumPlan)
        if program:
            query = query.filter(CurriculumPlan.program_id == program.id)
        return (
            query.filter(CurriculumPlan.code == "ISI-UC-2026").first()
            or query.filter(CurriculumPlan.status == CurriculumPlanStatus.ACTIVE).first()
            or query.order_by(CurriculumPlan.id).first()
        )

    def _resolve_cycles(self, cycles, plan):
        if cycles in (None, "", [], "all", "ALL"):
            existing = [
                row[0] for row in self.db.query(CurriculumCourse.cycle_number)
                .filter(CurriculumCourse.curriculum_plan_id == plan.id)
                .distinct()
                .order_by(CurriculumCourse.cycle_number)
                .all()
            ]
            return existing or list(range(1, int(plan.total_cycles or 10) + 1))
        if isinstance(cycles, str):
            return [int(item.strip()) for item in cycles.split(",") if item.strip().isdigit()]
        return sorted({int(cycle) for cycle in cycles if int(cycle) > 0})

    def _ensure_teacher_count(self, minimum):
        created = 0
        current = len(self._active_teachers())
        for index in range(current + 1, minimum + 1):
            email = f"docente.csp.demo{index:02d}@optiacademic.com"
            user = self.db.query(User).filter(User.email == email).first()
            if not user:
                user = User(
                    full_name=f"Docente Demo CSP {index:02d}",
                    email=email,
                    hashed_password=get_password_hash("docente123"),
                    role=UserRole.TEACHER,
                    is_active=True,
                )
                self.db.add(user)
                self.db.flush()
            teacher = self.db.query(Teacher).filter(Teacher.user_id == user.id).first()
            if not teacher:
                teacher = Teacher(
                    user_id=user.id,
                    teacher_code=f"CSP-DEMO-{index:02d}",
                    specialty="Planificacion academica demo",
                    max_weekly_hours=24,
                    rating=4.5,
                )
                self.db.add(teacher)
                created += 1
        self.db.flush()
        return created

    def _ensure_classroom_count(self, minimum):
        created = 0
        current = len(self._active_classrooms())
        types = [ClassroomType.THEORY, ClassroomType.LAB, ClassroomType.AUDITORIUM]
        for index in range(current + 1, minimum + 1):
            code = f"CSP-AULA-{index:02d}"
            if self.db.query(Classroom).filter(Classroom.code == code).first():
                continue
            classroom_type = types[index % len(types)]
            self.db.add(
                Classroom(
                    code=code,
                    name=f"Aula Demo CSP {index:02d}",
                    capacity=60,
                    classroom_type=classroom_type,
                    campus="Demo",
                    building="CSP",
                    floor=str((index % 5) + 1),
                    has_projector=True,
                    has_computers=classroom_type == ClassroomType.LAB,
                    is_active=True,
                )
            )
            created += 1
        self.db.flush()
        return created

    def _ensure_availability(self, teacher_ids):
        stats = defaultdict(int)
        for teacher_id in teacher_ids:
            for day in range(1, 6):
                exists = (
                    self.db.query(TeacherAvailability)
                    .filter(
                        TeacherAvailability.teacher_id == teacher_id,
                        TeacherAvailability.day_of_week == day,
                        TeacherAvailability.start_time == time(7, 0),
                        TeacherAvailability.end_time == time(22, 0),
                    )
                    .first()
                )
                if exists:
                    stats["teacher_availability_existing"] += 1
                    if not exists.is_available:
                        exists.is_available = True
                        stats["teacher_availability_fixed"] += 1
                    continue
                self.db.add(
                    TeacherAvailability(
                        teacher_id=teacher_id,
                        day_of_week=day,
                        start_time=time(7, 0),
                        end_time=time(22, 0),
                        is_available=True,
                    )
                )
                stats["teacher_availability_created"] += 1
        self.db.flush()
        return stats

    def _active_teachers(self):
        return (
            self.db.query(Teacher)
            .join(User)
            .filter(User.is_active.is_(True))
            .order_by(Teacher.id)
            .all()
        )

    def _active_classrooms(self):
        return (
            self.db.query(Classroom)
            .filter(Classroom.is_active.is_(True), Classroom.capacity >= 30)
            .order_by(Classroom.capacity.desc(), Classroom.id)
            .all()
        )

    @staticmethod
    def _pick_classroom(classrooms, estimated_students, index=0):
        candidates = [item for item in classrooms if item.capacity >= estimated_students]
        pool = candidates or classrooms
        return pool[index % len(pool)]

    @staticmethod
    def _estimated_students(cycle):
        if cycle <= 1:
            return 40
        if cycle <= 3:
            return 35
        return 30
