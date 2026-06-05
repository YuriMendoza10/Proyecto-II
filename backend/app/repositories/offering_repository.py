from sqlalchemy.orm import Session, joinedload

from app.models.offering import OfferingConflict, SectionOffering, SectionRequirement
from app.models.teacher import Teacher


class OfferingRepository:
    def __init__(self, db: Session):
        self.db = db

    def offering_query(self):
        return self.db.query(SectionOffering).options(
            joinedload(SectionOffering.academic_period),
            joinedload(SectionOffering.academic_program),
            joinedload(SectionOffering.curriculum_plan),
            joinedload(SectionOffering.curriculum_course),
            joinedload(SectionOffering.course),
            joinedload(SectionOffering.teacher).joinedload(Teacher.user),
            joinedload(SectionOffering.classroom),
            joinedload(SectionOffering.requirements),
        )

    def get_offering(self, offering_id: int):
        return self.offering_query().filter(SectionOffering.id == offering_id).first()

    def save(self, item):
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item):
        self.db.delete(item)
        self.db.commit()

    def requirements_query(self):
        return self.db.query(SectionRequirement).options(
            joinedload(SectionRequirement.section_offering)
        )

    def conflicts_query(self):
        return self.db.query(OfferingConflict).options(
            joinedload(OfferingConflict.section_offering)
        )
