from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.course_repository import CourseRepository
from app.repositories.section_repository import SectionRepository
from app.repositories.teacher_repository import TeacherRepository
from app.schemas.section_schema import SectionCreate, SectionUpdate


class SectionService:
    def __init__(self, db: Session):
        self.db = db
        self.section_repository = SectionRepository(db)
        self.course_repository = CourseRepository(db)
        self.teacher_repository = TeacherRepository(db)

    def list_sections(
        self,
        skip: int = 0,
        limit: int = 100,
        course_id: int | None = None,
        teacher_id: int | None = None,
    ):
        total = self.section_repository.count_all(
            course_id=course_id,
            teacher_id=teacher_id,
        )

        sections = self.section_repository.get_all(
            skip=skip,
            limit=limit,
            course_id=course_id,
            teacher_id=teacher_id,
        )

        return {
            "total": total,
            "sections": sections,
        }

    def get_section_by_id(self, section_id: int):
        section = self.section_repository.get_by_id(section_id)

        if not section:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sección no encontrada",
            )

        return section

    def create_section(self, section_data: SectionCreate):
        course = self.course_repository.get_by_id(section_data.course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curso no encontrado",
            )

        if not course.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede crear una sección para un curso inactivo",
            )

        if section_data.teacher_id is not None:
            teacher = self.teacher_repository.get_by_id(section_data.teacher_id)

            if not teacher:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Docente no encontrado",
                )

        existing_section = self.section_repository.get_by_course_and_code(
            course_id=section_data.course_id,
            section_code=section_data.section_code,
        )

        if existing_section:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una sección con ese código para este curso",
            )

        if section_data.enrolled_students > section_data.max_students:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los inscritos no pueden superar el cupo máximo",
            )

        return self.section_repository.create(section_data)

    def update_section(
        self,
        section_id: int,
        section_data: SectionUpdate,
    ):
        section = self.get_section_by_id(section_id)

        new_course_id = (
            section_data.course_id
            if section_data.course_id is not None
            else section.course_id
        )

        new_section_code = (
            section_data.section_code
            if section_data.section_code is not None
            else section.section_code
        )

        course = self.course_repository.get_by_id(new_course_id)

        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curso no encontrado",
            )

        if not course.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede asignar una sección a un curso inactivo",
            )

        if section_data.teacher_id is not None:
            teacher = self.teacher_repository.get_by_id(section_data.teacher_id)

            if not teacher:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Docente no encontrado",
                )

        existing_section = self.section_repository.get_by_course_and_code(
            course_id=new_course_id,
            section_code=new_section_code,
        )

        if existing_section and existing_section.id != section.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Ya existe una sección con ese código para este curso",
            )

        new_max_students = (
            section_data.max_students
            if section_data.max_students is not None
            else section.max_students
        )

        new_enrolled_students = (
            section_data.enrolled_students
            if section_data.enrolled_students is not None
            else section.enrolled_students
        )

        if new_enrolled_students > new_max_students:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los inscritos no pueden superar el cupo máximo",
            )

        return self.section_repository.update(section, section_data)

    def delete_section(self, section_id: int):
        section = self.get_section_by_id(section_id)

        self.section_repository.delete(section)

        return {
            "message": "Sección eliminada correctamente",
        }