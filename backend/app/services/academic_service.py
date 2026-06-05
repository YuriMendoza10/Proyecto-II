from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.academic import (
    AcademicPeriod,
    AcademicProgram,
    AcademicProgramStatus,
    CoursePrerequisite,
    CurriculumCourse,
    CurriculumPlan,
    CurriculumPlanStatus,
    ElectiveBankCourse,
    PrerequisiteType,
)
from app.models.course import Course
from app.models.student import Student, StudentCourseEnrollment
from app.repositories.academic_repository import AcademicRepository


class AcademicCatalogService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = AcademicRepository(db)

    def list_periods(self, only_active: bool = False):
        periods = self.repository.list_periods()
        return [item for item in periods if not only_active or item.is_active]

    def get_period(self, item_id: int):
        return self._require(AcademicPeriod, item_id, "Periodo academico")

    def create_period(self, payload):
        self._ensure_unique_code(AcademicPeriod, payload.code)
        return self.repository.create(AcademicPeriod, payload)

    def update_period(self, item_id: int, payload):
        item = self.get_period(item_id)
        self._ensure_unique_code(AcademicPeriod, payload.code, item.id)
        return self.repository.update(item, payload)

    def delete_period(self, item_id: int):
        self._delete(self.get_period(item_id))
        return {"message": "Periodo academico eliminado correctamente"}

    def list_programs(self, only_active: bool = False):
        programs = self.repository.list_programs()
        return [
            item
            for item in programs
            if not only_active or item.status == AcademicProgramStatus.ACTIVE
        ]

    def get_program(self, item_id: int):
        return self._require(AcademicProgram, item_id, "Programa academico")

    def create_program(self, payload):
        self._ensure_unique_code(AcademicProgram, payload.code)
        return self.repository.create(AcademicProgram, payload)

    def update_program(self, item_id: int, payload):
        item = self.get_program(item_id)
        self._ensure_unique_code(AcademicProgram, payload.code, item.id)
        return self.repository.update(item, payload)

    def delete_program(self, item_id: int):
        self._delete(self.get_program(item_id))
        return {"message": "Programa academico eliminado correctamente"}

    def list_plans(self, only_active: bool = False):
        plans = self.repository.list_plans()
        return [
            item
            for item in plans
            if not only_active or item.status == CurriculumPlanStatus.ACTIVE
        ]

    def get_plan(self, item_id: int, only_active: bool = False):
        item = self._require(CurriculumPlan, item_id, "Plan curricular")
        if only_active and item.status != CurriculumPlanStatus.ACTIVE:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan activo no encontrado")
        return item

    def create_plan(self, payload):
        self._ensure_program(payload.program_id)
        self._ensure_unique_code(CurriculumPlan, payload.code)
        return self.repository.create(CurriculumPlan, payload)

    def update_plan(self, item_id: int, payload):
        item = self.get_plan(item_id)
        if payload.program_id is not None:
            self._ensure_program(payload.program_id)
        self._ensure_unique_code(CurriculumPlan, payload.code, item.id)
        return self.repository.update(item, payload)

    def delete_plan(self, item_id: int):
        self._delete(self.get_plan(item_id))
        return {"message": "Plan curricular eliminado correctamente"}

    def _ensure_program(self, program_id: int):
        self._require(AcademicProgram, program_id, "Programa academico")

    def _ensure_unique_code(self, model, code: str | None, current_id: int | None = None):
        if not code:
            return
        item = self.repository.get_by_code(model, code)
        if item and item.id != current_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El codigo ya esta registrado")

    def _require(self, model, item_id: int, label: str):
        item = self.repository.get_by_id(model, item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"{label} no encontrado")
        return item

    def _delete(self, item):
        try:
            self.repository.delete(item)
        except IntegrityError as error:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El registro esta asociado a informacion academica existente",
            ) from error


class CurriculumService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = AcademicRepository(db)
        self.catalog = AcademicCatalogService(db)

    def get_plan_detail(self, plan_id: int, only_active: bool = False):
        plan = self.catalog.get_plan(plan_id, only_active=only_active)
        return {
            **self._plan_dict(plan),
            "courses": self.list_courses(plan_id=plan.id, active_only=only_active),
            "elective_bank_courses": self.list_electives(
                plan_id=plan.id, active_only=only_active
            ),
        }

    def list_courses(
        self,
        plan_id: int | None = None,
        cycle_number: int | None = None,
        course_type=None,
        active_only: bool = False,
    ):
        if plan_id:
            self.catalog.get_plan(plan_id, only_active=active_only)
        items = self.repository.list_curriculum_courses(plan_id, cycle_number, course_type)
        if active_only:
            items = [
                item
                for item in items
                if item.is_active
                and item.curriculum_plan.status == CurriculumPlanStatus.ACTIVE
            ]
        return [self._course_dict(item) for item in items]

    def get_course(self, item_id: int, active_only: bool = False):
        item = self.repository.get_curriculum_course(item_id)
        if not item or (active_only and (not item.is_active or item.curriculum_plan.status != CurriculumPlanStatus.ACTIVE)):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso de malla no encontrado")
        return self._course_dict(item)

    def create_course(self, payload):
        plan = self.catalog.get_plan(payload.curriculum_plan_id)
        if payload.cycle_number > plan.total_cycles:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El ciclo excede el plan curricular")
        course = self.db.query(Course).filter(Course.id == payload.course_id).first()
        if not course:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado")
        existing = (
            self.db.query(CurriculumCourse)
            .filter(
                CurriculumCourse.curriculum_plan_id == payload.curriculum_plan_id,
                CurriculumCourse.course_id == payload.course_id,
            )
            .first()
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El curso ya pertenece al plan")
        item = self.repository.create(CurriculumCourse, payload)
        return self.get_course(item.id)

    def update_course(self, item_id: int, payload):
        item = self._require_curriculum_course(item_id)
        plan_id = payload.curriculum_plan_id or item.curriculum_plan_id
        plan = self.catalog.get_plan(plan_id)
        if payload.cycle_number is not None and payload.cycle_number > plan.total_cycles:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El ciclo excede el plan curricular")
        if payload.course_id is not None:
            course = self.db.query(Course).filter(Course.id == payload.course_id).first()
            if not course:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso no encontrado")
        self.repository.update(item, payload)
        return self.get_course(item_id)

    def delete_course(self, item_id: int):
        item = self._require_curriculum_course(item_id)
        self.repository.delete(item)
        return {"message": "Curso retirado de la malla correctamente"}

    def list_prerequisites(self, curriculum_course_id: int | None = None):
        return [self._prerequisite_dict(item) for item in self.repository.list_prerequisites(curriculum_course_id)]

    def create_prerequisite(self, payload):
        target = self._require_curriculum_course(payload.curriculum_course_id)
        prerequisite = self._require_curriculum_course(payload.prerequisite_course_id)
        if target.id == prerequisite.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Un curso no puede ser su propio prerrequisito")
        if target.curriculum_plan_id != prerequisite.curriculum_plan_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Los cursos deben pertenecer al mismo plan")
        existing = (
            self.db.query(CoursePrerequisite)
            .filter(
                CoursePrerequisite.curriculum_course_id == target.id,
                CoursePrerequisite.prerequisite_course_id == prerequisite.id,
            )
            .first()
        )
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El prerrequisito ya esta registrado")
        item = self.repository.create(CoursePrerequisite, payload)
        return self._prerequisite_dict(item)

    def delete_prerequisite(self, item_id: int):
        item = self.repository.get_by_id(CoursePrerequisite, item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prerrequisito no encontrado")
        self.repository.delete(item)
        return {"message": "Prerrequisito eliminado correctamente"}

    def list_electives(self, plan_id: int | None = None, active_only: bool = False):
        items = self.repository.list_electives(plan_id)
        if active_only:
            items = [
                item
                for item in items
                if item.is_active
                and item.curriculum_plan.status == CurriculumPlanStatus.ACTIVE
            ]
        return items

    def create_elective(self, payload):
        self.catalog.get_plan(payload.curriculum_plan_id)
        return self.repository.create(ElectiveBankCourse, payload)

    def update_elective(self, item_id: int, payload):
        item = self.repository.get_by_id(ElectiveBankCourse, item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Electivo no encontrado")
        return self.repository.update(item, payload)

    def delete_elective(self, item_id: int):
        item = self.repository.get_by_id(ElectiveBankCourse, item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Electivo no encontrado")
        self.repository.delete(item)
        return {"message": "Electivo eliminado correctamente"}

    def get_student_curriculum(self, user_id: int):
        _, plan = self._get_student_and_plan(user_id)
        return self.get_plan_detail(plan.id, only_active=True)

    def get_student_eligible_courses(self, user_id: int):
        student, plan = self._get_student_and_plan(user_id)
        completed = {
            enrollment.course_id
            for enrollment in self.db.query(StudentCourseEnrollment)
            .filter(StudentCourseEnrollment.student_id == student.id)
            .all()
            if enrollment.status.upper() in {"PASSED", "COMPLETED", "APPROVED"}
        }
        courses = [
            item
            for item in self.repository.list_curriculum_courses(plan_id=plan.id)
            if item.is_active
        ]
        result = []
        for item in courses:
            required = [
                prerequisite
                for prerequisite in item.prerequisites
                if prerequisite.prerequisite_type == PrerequisiteType.REQUIRED
                and prerequisite.prerequisite_course.course_id not in completed
            ]
            recommended = [
                prerequisite.prerequisite_course.course.name
                for prerequisite in item.prerequisites
                if prerequisite.prerequisite_type == PrerequisiteType.RECOMMENDED
            ]
            result.append(
                {
                    **self._course_dict(item),
                    "eligible": not required,
                    "blocking_prerequisites": [
                        prerequisite.prerequisite_course.course.name for prerequisite in required
                    ],
                    "recommended_prerequisites": recommended,
                }
            )
        return {"plan": self._plan_dict(plan), "completed_course_ids": sorted(completed), "courses": result}

    def _get_student_and_plan(self, user_id: int):
        student = self.db.query(Student).filter(Student.user_id == user_id).first()
        if not student:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Perfil estudiante no encontrado")
        plan = (
            self.db.query(CurriculumPlan)
            .join(AcademicProgram)
            .filter(CurriculumPlan.status == CurriculumPlanStatus.ACTIVE)
            .filter(AcademicProgram.name.like(f"{student.career}%"))
            .order_by(CurriculumPlan.effective_year.desc())
            .first()
        )
        if not plan:
            active_plans = (
                self.db.query(CurriculumPlan)
                .filter(CurriculumPlan.status == CurriculumPlanStatus.ACTIVE)
                .order_by(CurriculumPlan.effective_year.desc())
                .all()
            )
            plan = active_plans[0] if len(active_plans) == 1 else None
        if not plan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No existe una malla activa asociada a la carrera del estudiante",
            )
        return student, plan

    def _require_curriculum_course(self, item_id: int):
        item = self.db.query(CurriculumCourse).filter(CurriculumCourse.id == item_id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Curso de malla no encontrado")
        return item

    @staticmethod
    def _plan_dict(plan):
        return {
            "id": plan.id,
            "program_id": plan.program_id,
            "code": plan.code,
            "name": plan.name,
            "effective_year": plan.effective_year,
            "total_cycles": plan.total_cycles,
            "total_credits": plan.total_credits,
            "status": plan.status,
            "source_note": plan.source_note,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at,
            "program": plan.program,
        }

    def _course_dict(self, item):
        return {
            "id": item.id,
            "curriculum_plan_id": item.curriculum_plan_id,
            "course_id": item.course_id,
            "cycle_number": item.cycle_number,
            "course_type": item.course_type,
            "credits": item.credits,
            "weekly_theory_hours": item.weekly_theory_hours,
            "weekly_practice_hours": item.weekly_practice_hours,
            "weekly_lab_hours": item.weekly_lab_hours,
            "is_suggested_elective": item.is_suggested_elective,
            "is_active": item.is_active,
            "course_code": item.course.code,
            "course_name": item.course.name,
            "prerequisites": [self._prerequisite_dict(value) for value in item.prerequisites],
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }

    @staticmethod
    def _prerequisite_dict(item):
        course = item.prerequisite_course.course if item.prerequisite_course else None
        return {
            "id": item.id,
            "curriculum_course_id": item.curriculum_course_id,
            "prerequisite_course_id": item.prerequisite_course_id,
            "prerequisite_type": item.prerequisite_type,
            "minimum_grade": item.minimum_grade,
            "prerequisite_course_name": course.name if course else None,
            "prerequisite_course_code": course.code if course else None,
            "created_at": item.created_at,
            "updated_at": item.updated_at,
        }
