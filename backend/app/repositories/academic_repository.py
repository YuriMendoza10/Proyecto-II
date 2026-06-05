from sqlalchemy.orm import Session, joinedload

from app.models.academic import (
    AcademicPeriod,
    AcademicProgram,
    CoursePrerequisite,
    CurriculumCourse,
    CurriculumCourseType,
    CurriculumPlan,
    ElectiveBankCourse,
)


class AcademicRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_periods(self):
        return self.db.query(AcademicPeriod).order_by(AcademicPeriod.code.desc()).all()

    def list_programs(self):
        return self.db.query(AcademicProgram).order_by(AcademicProgram.name.asc()).all()

    def list_plans(self):
        return (
            self.db.query(CurriculumPlan)
            .options(joinedload(CurriculumPlan.program))
            .order_by(CurriculumPlan.effective_year.desc(), CurriculumPlan.code.asc())
            .all()
        )

    def get_by_id(self, model, item_id: int):
        return self.db.query(model).filter(model.id == item_id).first()

    def get_by_code(self, model, code: str):
        return self.db.query(model).filter(model.code == code).first()

    def create(self, model, payload):
        item = model(**payload.model_dump())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item, payload):
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, field, value)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item):
        self.db.delete(item)
        self.db.commit()

    def list_curriculum_courses(
        self,
        plan_id: int | None = None,
        cycle_number: int | None = None,
        course_type: CurriculumCourseType | None = None,
    ):
        query = self.db.query(CurriculumCourse).options(
            joinedload(CurriculumCourse.course),
            joinedload(CurriculumCourse.prerequisites)
            .joinedload(CoursePrerequisite.prerequisite_course)
            .joinedload(CurriculumCourse.course),
        )
        if plan_id:
            query = query.filter(CurriculumCourse.curriculum_plan_id == plan_id)
        if cycle_number:
            query = query.filter(CurriculumCourse.cycle_number == cycle_number)
        if course_type:
            query = query.filter(CurriculumCourse.course_type == course_type)
        return query.order_by(CurriculumCourse.cycle_number, CurriculumCourse.id).all()

    def get_curriculum_course(self, item_id: int):
        return (
            self.db.query(CurriculumCourse)
            .options(
                joinedload(CurriculumCourse.course),
                joinedload(CurriculumCourse.prerequisites)
                .joinedload(CoursePrerequisite.prerequisite_course)
                .joinedload(CurriculumCourse.course),
            )
            .filter(CurriculumCourse.id == item_id)
            .first()
        )

    def list_prerequisites(self, curriculum_course_id: int | None = None):
        query = self.db.query(CoursePrerequisite).options(
            joinedload(CoursePrerequisite.prerequisite_course).joinedload(CurriculumCourse.course)
        )
        if curriculum_course_id:
            query = query.filter(CoursePrerequisite.curriculum_course_id == curriculum_course_id)
        return query.order_by(CoursePrerequisite.curriculum_course_id, CoursePrerequisite.id).all()

    def list_electives(self, plan_id: int | None = None):
        query = self.db.query(ElectiveBankCourse)
        if plan_id:
            query = query.filter(ElectiveBankCourse.curriculum_plan_id == plan_id)
        return query.order_by(ElectiveBankCourse.mention_name, ElectiveBankCourse.course_name).all()
