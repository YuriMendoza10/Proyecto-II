from dataclasses import dataclass
from datetime import time

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.models.teacher import Teacher, TeacherAvailability   # ✅ Corregido

from app.csp.student_scoring import StudentScoringEngine
from app.csp.utils import overlaps_with_tolerance
from app.models.course import Course, CourseSection
from app.models.offering import SectionOffering
from app.models.schedule import (
    AcademicSchedule,
    ScheduleBlock,
    StudentSchedule,
    StudentScheduleBlock,
)
from app.models.student import Student
from app.models.teacher import Teacher
from app.schemas.student_csp_schema import (
    StudentCSPPreviewRequest,
    StudentCSPSaveSelectedRequest,
)


@dataclass
class SectionOption:
    section_id: int
    section_code: str | None

    course_id: int
    course_code: str | None
    course_name: str | None
    credits: int

    teacher_id: int | None
    teacher_code: str | None
    teacher_name: str | None

    blocks: list[ScheduleBlock]


class StudentCSPService:

    
    def __init__(self, db: Session):
        self.db = db
        self.scoring_engine = StudentScoringEngine()

    # ------------------------------------------------------------------
    # Oferta horaria publicada para estudiante
    # ------------------------------------------------------------------

    def _clone_request_with_max_solutions(
        self,
        request,
        max_solutions: int,
    ):
        if hasattr(request, "model_copy"):
            return request.model_copy(
                update={
                    "max_solutions": max_solutions,
                }
            )

        return request.copy(
            update={
                "max_solutions": max_solutions,
            }
        )

    def get_offer_detail_for_student(
        self,
        student_id: int,
        institutional_schedule_id: int,
        unavailable_days: list[int],
        current_user=None,
    ):
        self._ensure_student_access(
            student_id=student_id,
            current_user=current_user,
        )

        self._ensure_institutional_schedule_is_published(
            schedule_id=institutional_schedule_id,
        )

        student = self._get_student(student_id)

        section_options = self._get_section_options(
            schedule_id=institutional_schedule_id,
            career=student.career,
            current_cycle=student.current_cycle,
            unavailable_days=unavailable_days,
        )

        grouped_by_course = {}

        for option in section_options:
            if option.course_id not in grouped_by_course:
                grouped_by_course[option.course_id] = {
                    "course_id": option.course_id,
                    "course_code": option.course_code,
                    "course_name": option.course_name,
                    "credits": option.credits,
                    "cycle": 0,
                    "career": student.career,
                    "weekly_hours": None,
                    "sections": [],
                }

            teacher_availability = []

            if option.teacher_id:
                availabilities = (
                    self.db.query(TeacherAvailability)
                    .filter(
                        TeacherAvailability.teacher_id == option.teacher_id,
                        TeacherAvailability.is_available == True,
                    )
                    .order_by(
                        TeacherAvailability.day_of_week,
                        TeacherAvailability.start_time,
                    )
                    .all()
                )

                teacher_availability = [
                    {
                        "day_of_week": availability.day_of_week,
                        "start_time": availability.start_time,
                        "end_time": availability.end_time,
                        "is_available": availability.is_available,
                    }
                    for availability in availabilities
                ]

            blocks = []

            for block in sorted(
                option.blocks,
                key=lambda item: (item.day_of_week, item.start_time),
            ):
                classroom = block.classroom

                blocks.append(
                    {
                        "schedule_block_id": block.id,
                        "classroom_id": block.classroom_id,
                        "classroom_code": classroom.code if classroom else None,
                        "classroom_name": classroom.name if classroom else None,
                        "day_of_week": block.day_of_week,
                        "start_time": block.start_time,
                        "end_time": block.end_time,
                    }
                )

            section_data = {
                "section_id": option.section_id,
                "section_code": option.section_code,
                "teacher_id": option.teacher_id,
                "teacher_code": option.teacher_code,
                "teacher_name": option.teacher_name,
                "teacher_specialty": None,
                "teacher_rating": None,
                "blocks": blocks,
                "teacher_availability": teacher_availability,
            }

            if option.teacher_id:
                teacher = (
                    self.db.query(Teacher)
                    .filter(Teacher.id == option.teacher_id)
                    .first()
                )

                if teacher:
                    section_data["teacher_specialty"] = teacher.specialty
                    section_data["teacher_rating"] = teacher.rating

            grouped_by_course[option.course_id]["sections"].append(section_data)

        course_ids = list(grouped_by_course.keys())

        if course_ids:
            courses = (
                self.db.query(Course)
                .filter(Course.id.in_(course_ids))
                .all()
            )

            course_map = {course.id: course for course in courses}

            for course_id, item in grouped_by_course.items():
                course = course_map.get(course_id)

                if course:
                    item["cycle"] = course.cycle
                    item["career"] = course.career
                    item["weekly_hours"] = course.weekly_hours

        courses_response = sorted(
            grouped_by_course.values(),
            key=lambda item: (
                item["cycle"],
                item["course_code"] or "",
                item["course_name"] or "",
            ),
        )

        total_sections = sum(
            len(course["sections"])
            for course in courses_response
        )

        total_blocks = sum(
            len(section["blocks"])
            for course in courses_response
            for section in course["sections"]
        )

        return {
            "success": True,
            "message": "Oferta académica detallada obtenida correctamente.",
            "student_id": student.id,
            "institutional_schedule_id": institutional_schedule_id,
            "total_courses": len(courses_response),
            "total_sections": total_sections,
            "total_blocks": total_blocks,
            "courses": courses_response,
        }

    def get_offer_courses_for_student(
        self,
        student_id: int,
        institutional_schedule_id: int,
        unavailable_days: list[int],
        current_user=None,
    ):
        self._ensure_student_access(
            student_id=student_id,
            current_user=current_user,
        )

        self._ensure_institutional_schedule_is_published(
            schedule_id=institutional_schedule_id,
        )

        student = self._get_student(student_id)

        section_options = self._get_section_options(
            schedule_id=institutional_schedule_id,
            career=student.career,
            current_cycle=student.current_cycle,
            unavailable_days=unavailable_days,
        )

        grouped_by_course = {}

        for option in section_options:
            if option.course_id not in grouped_by_course:
                grouped_by_course[option.course_id] = {
                    "course_id": option.course_id,
                    "course_code": option.course_code,
                    "course_name": option.course_name,
                    "credits": option.credits,
                    "cycle": None,
                    "career": student.career,
                    "weekly_hours": None,
                    "section_ids": set(),
                    "available_blocks": 0,
                }

            grouped_by_course[option.course_id]["section_ids"].add(option.section_id)
            grouped_by_course[option.course_id]["available_blocks"] += len(option.blocks)

        course_ids = list(grouped_by_course.keys())

        if course_ids:
            courses = (
                self.db.query(Course)
                .filter(Course.id.in_(course_ids))
                .all()
            )

            course_map = {
                course.id: course
                for course in courses
            }

            for course_id, item in grouped_by_course.items():
                course = course_map.get(course_id)

                if course:
                    item["cycle"] = course.cycle
                    item["career"] = course.career
                    item["weekly_hours"] = course.weekly_hours

        courses_response = []

        for item in grouped_by_course.values():
            courses_response.append(
                {
                    "course_id": item["course_id"],
                    "course_code": item["course_code"],
                    "course_name": item["course_name"],
                    "credits": item["credits"],
                    "cycle": item["cycle"] or 0,
                    "career": item["career"],
                    "weekly_hours": item["weekly_hours"],
                    "available_sections": len(item["section_ids"]),
                    "available_blocks": item["available_blocks"],
                }
            )

        courses_response = sorted(
            courses_response,
            key=lambda item: (
                item["cycle"],
                item["course_code"] or "",
                item["course_name"] or "",
            ),
        )

        total_credits = sum(
            item["credits"]
            for item in courses_response
        )

        return {
            "success": True,
            "message": "Cursos disponibles obtenidos desde la oferta horaria publicada.",
            "student_id": student.id,
            "institutional_schedule_id": institutional_schedule_id,
            "total_courses": len(courses_response),
            "total_credits": total_credits,
            "courses": courses_response,
        }

    # ------------------------------------------------------------------
    # Preview y guardado (con mejora de generación interna)
    # ------------------------------------------------------------------

    def preview_student_schedules(
        self,
        request: StudentCSPPreviewRequest,
        current_user=None,
    ):
        self._ensure_student_access(
            student_id=request.student_id,
            current_user=current_user,
        )

        internal_max_solutions = max(request.max_solutions * 8, 80)

        internal_request = self._clone_request_with_max_solutions(
            request=request,
            max_solutions=internal_max_solutions,
        )

        student, target_credits, solutions = self._generate_solutions(internal_request)

        ranked_solutions = self._rank_solutions(
            solutions=solutions,
            preferred_shift=request.preferred_shift,
            target_credits=target_credits,
            preferred_teacher_ids=request.preferred_teacher_ids,
            avoided_teacher_ids=request.avoided_teacher_ids,
        )

        ranked_solutions = ranked_solutions[: request.max_solutions]

        previews = [
            self._solution_to_preview(
                solution=solution,
                solution_index=index,
                score=score,
                score_breakdown=score_breakdown,
            )
            for index, (score, solution, score_breakdown) in enumerate(ranked_solutions)
        ]

        if not previews:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo generar ninguna opción de horario para el estudiante.",
            )

        return {
            "success": True,
            "message": "Horarios estudiantiles previsualizados correctamente",
            "student_id": student.id,
            "institutional_schedule_id": request.institutional_schedule_id,
            "evaluated_solutions": len(previews),
            "best_solution_index": 0,
            "best_score": previews[0]["score"],
            "min_credits": student.min_credits,
            "max_credits": student.max_credits,
            "target_credits": target_credits,
            "solutions": previews,
        }

    def save_selected_student_schedule(
        self,
        request: StudentCSPSaveSelectedRequest,
        current_user=None,
    ):
        self._ensure_student_access(
            student_id=request.student_id,
            current_user=current_user,
        )

        internal_max_solutions = max(request.max_solutions * 8, 80)

        internal_request = self._clone_request_with_max_solutions(
            request=request,
            max_solutions=internal_max_solutions,
        )

        student, target_credits, solutions = self._generate_solutions(internal_request)

        ranked_solutions = self._rank_solutions(
            solutions=solutions,
            preferred_shift=request.preferred_shift,
            target_credits=target_credits,
            preferred_teacher_ids=request.preferred_teacher_ids,
            avoided_teacher_ids=request.avoided_teacher_ids,
        )

        ranked_solutions = ranked_solutions[: request.max_solutions]

        if request.solution_index >= len(ranked_solutions):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"El solution_index {request.solution_index} no existe. "
                    f"Soluciones disponibles: 0 a {len(ranked_solutions) - 1}."
                ),
            )

        selected_score, selected_solution, selected_score_breakdown = ranked_solutions[
            request.solution_index
        ]

        if request.is_favorite:
            self._unset_previous_favorites(student_id=student.id)

        student_schedule = StudentSchedule(
            student_id=student.id,
            schedule_id=request.institutional_schedule_id,
            name=request.name,
            score=selected_score,
            is_favorite=request.is_favorite,
        )

        try:
            self.db.add(student_schedule)
            self.db.flush()

            selected_block_ids = self._get_schedule_block_ids(selected_solution)

            for schedule_block_id in selected_block_ids:
                student_schedule_block = StudentScheduleBlock(
                    student_schedule_id=student_schedule.id,
                    schedule_block_id=schedule_block_id,
                )
                self.db.add(student_schedule_block)

            self.db.commit()
            self.db.refresh(student_schedule)

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al guardar el horario personalizado del estudiante",
            )

        preview = self._solution_to_preview(
            solution=selected_solution,
            solution_index=request.solution_index,
            score=selected_score,
            score_breakdown=selected_score_breakdown,
        )

        return {
            "success": True,
            "message": "Horario personalizado guardado correctamente",
            "student_schedule_id": student_schedule.id,
            "student_id": student.id,
            "institutional_schedule_id": request.institutional_schedule_id,
            "selected_solution_index": request.solution_index,
            "score": selected_score,
            "total_credits": preview["total_credits"],
            "total_courses": preview["total_courses"],
            "is_favorite": student_schedule.is_favorite,
            "score_breakdown": preview["score_breakdown"],
            "blocks": preview["blocks"],
        }

    # ------------------------------------------------------------------
    # Horarios guardados
    # ------------------------------------------------------------------

    def list_saved_student_schedules(
        self,
        current_user,
        student_id: int | None = None,
    ):
        query = (
            self.db.query(StudentSchedule)
            .options(
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.course),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.classroom),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section_offering)
                .joinedload(SectionOffering.course),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section_offering)
                .joinedload(SectionOffering.teacher)
                .joinedload(Teacher.user),
            )
            .order_by(StudentSchedule.is_favorite.desc(), StudentSchedule.id.desc())
        )

        role = self._role_value(current_user)

        if role == "STUDENT":
            student = self._get_student_by_user_id(current_user.id)
            query = query.filter(StudentSchedule.student_id == student.id)
        elif student_id is not None:
            query = query.filter(StudentSchedule.student_id == student_id)

        schedules = query.all()

        return [
            self._student_schedule_to_summary(schedule)
            for schedule in schedules
        ]

    def get_saved_student_schedule_detail(
        self,
        student_schedule_id: int,
        current_user,
    ):
        student_schedule = self._get_student_schedule_or_404(student_schedule_id)

        self._ensure_student_schedule_access(
            student_schedule=student_schedule,
            current_user=current_user,
        )

        return self._student_schedule_to_detail(student_schedule)

    def mark_student_schedule_as_favorite(
        self,
        student_schedule_id: int,
        current_user,
    ):
        student_schedule = self._get_student_schedule_or_404(student_schedule_id)

        self._ensure_student_schedule_access(
            student_schedule=student_schedule,
            current_user=current_user,
        )

        try:
            self._unset_previous_favorites(student_id=student_schedule.student_id)

            student_schedule.is_favorite = True

            self.db.add(student_schedule)
            self.db.commit()
            self.db.refresh(student_schedule)

        except Exception:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al marcar el horario como favorito",
            )

        return {
            "success": True,
            "message": "Horario marcado como favorito correctamente",
            "student_schedule_id": student_schedule.id,
            "student_id": student_schedule.student_id,
            "is_favorite": student_schedule.is_favorite,
        }
    


    def _clone_request_with_max_solutions(
        self,
        request: StudentCSPPreviewRequest,
        max_solutions: int,
    ):
        if hasattr(request, "model_copy"):
            return request.model_copy(
                update={
                    "max_solutions": max_solutions,
                }
            )

        return request.copy(
            update={
                "max_solutions": max_solutions,
            }
        )

    # ------------------------------------------------------------------
    # Generación de soluciones
    # ------------------------------------------------------------------

    def _generate_solutions(
        self,
        request: StudentCSPPreviewRequest,
    ):
        self._ensure_institutional_schedule_is_published(
            schedule_id=request.institutional_schedule_id,
        )

        student = self._get_student(request.student_id)

        target_credits = request.target_credits or student.max_credits

        if target_credits < 1 or target_credits > student.max_credits:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"El máximo de créditos debe estar entre 1 y {student.max_credits}"
                ),
            )

        section_options = self._get_section_options(
            schedule_id=request.institutional_schedule_id,
            career=student.career,
            current_cycle=student.current_cycle,
            unavailable_days=request.unavailable_days,
        )

        if not section_options:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No hay secciones disponibles para el estudiante con el horario "
                    "institucional y restricciones indicadas."
                ),
            )

        grouped_by_course = self._group_options_by_course(section_options)

        required_course_ids = set()

        if request.selected_course_ids:
            selected_course_ids = set(request.selected_course_ids)

            grouped_by_course = {
                course_id: options
                for course_id, options in grouped_by_course.items()
                if course_id in selected_course_ids
            }

            missing_course_ids = selected_course_ids - set(grouped_by_course.keys())

            if missing_course_ids:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Algunos cursos seleccionados no tienen secciones disponibles "
                        f"en el horario institucional publicado: {sorted(missing_course_ids)}"
                    ),
                )

            if request.require_all_selected_courses:
                required_course_ids = selected_course_ids

        if not grouped_by_course:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay cursos disponibles para optimizar con las restricciones indicadas.",
            )

        courses = sorted(
            grouped_by_course.keys(),
            key=lambda course_id: max(
                option.credits
                for option in grouped_by_course.get(course_id, [])
            ),
            reverse=True,
        )

        available_credits = sum(
            max(option.credits for option in grouped_by_course[course_id])
            for course_id in courses
        )

        effective_min_credits = min(
            student.min_credits,
            target_credits,
            available_credits,
        )

        solutions: list[list[SectionOption]] = []

        self._backtrack(
            courses=courses,
            grouped_options=grouped_by_course,
            index=0,
            current=[],
            solutions=solutions,
            max_solutions=request.max_solutions,
            min_credits=effective_min_credits,
            target_credits=target_credits,
            tolerance_minutes=request.transfer_tolerance_minutes,
            required_course_ids=required_course_ids,
        )

        if not solutions and effective_min_credits > 1:
            self._backtrack(
                courses=courses,
                grouped_options=grouped_by_course,
                index=0,
                current=[],
                solutions=solutions,
                max_solutions=request.max_solutions,
                min_credits=1,
                target_credits=target_credits,
                tolerance_minutes=request.transfer_tolerance_minutes,
                required_course_ids=required_course_ids,
            )

        if not solutions and required_course_ids:
            self._backtrack(
                courses=courses,
                grouped_options=grouped_by_course,
                index=0,
                current=[],
                solutions=solutions,
                max_solutions=request.max_solutions,
                min_credits=1,
                target_credits=target_credits,
                tolerance_minutes=request.transfer_tolerance_minutes,
                required_course_ids=set(),
            )

        if not solutions:
            self._backtrack(
                courses=courses,
                grouped_options=grouped_by_course,
                index=0,
                current=[],
                solutions=solutions,
                max_solutions=request.max_solutions,
                min_credits=1,
                target_credits=target_credits,
                tolerance_minutes=0,
                required_course_ids=set(),
            )

        if not solutions:
            available_course_ids = sorted(grouped_by_course.keys())

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No se pudo generar una combinación válida para el estudiante. "
                    f"Cursos disponibles en oferta: {available_course_ids}. "
                    f"Créditos disponibles aproximados: {available_credits}. "
                    f"Máximo de créditos solicitado: {target_credits}. "
                    "Prueba quitando días no disponibles, bajando la tolerancia de traslado a 0, "
                    "desactivando exigir todos los cursos o seleccionando menos cursos."
                ),
            )

        return student, target_credits, solutions
    
    def _backtrack(
        self,
        courses: list[int],
        grouped_options: dict[int, list[SectionOption]],
        index: int,
        current: list[SectionOption],
        solutions: list[list[SectionOption]],
        max_solutions: int,
        min_credits: int,
        target_credits: int,
        tolerance_minutes: int,
        required_course_ids: set[int] | None = None,
    ):
        required_course_ids = required_course_ids or set()

        if len(solutions) >= max_solutions:
            return

        current_credits = sum(option.credits for option in current)

        if current_credits > target_credits:
            return

        if index >= len(courses):
            if not current:
                return

            if current_credits < min_credits:
                return

            if not self._has_required_courses(
                current=current,
                required_course_ids=required_course_ids,
            ):
                return

            solutions.append(current.copy())
            return

        remaining_courses = courses[index:]
        remaining_possible_credits = 0

        for course_id in remaining_courses:
            options = grouped_options.get(course_id, [])

            if options:
                remaining_possible_credits += max(option.credits for option in options)

        if current_credits + remaining_possible_credits < min_credits:
            return

        course_id = courses[index]

        options = sorted(
            grouped_options.get(course_id, []),
            key=lambda option: (
                -option.credits,
                len(option.blocks),
                option.section_code or "",
                option.section_id,
            ),
        )

        for option in options:
            if len(solutions) >= max_solutions:
                return

            if current_credits + option.credits > target_credits:
                continue

            if self._is_consistent_with_current(
                candidate=option,
                current=current,
                tolerance_minutes=tolerance_minutes,
            ):
                current.append(option)

                self._backtrack(
                    courses=courses,
                    grouped_options=grouped_options,
                    index=index + 1,
                    current=current,
                    solutions=solutions,
                    max_solutions=max_solutions,
                    min_credits=min_credits,
                    target_credits=target_credits,
                    tolerance_minutes=tolerance_minutes,
                    required_course_ids=required_course_ids,
                )

                current.pop()

        if len(solutions) >= max_solutions:
            return

        if course_id not in required_course_ids:
            self._backtrack(
                courses=courses,
                grouped_options=grouped_options,
                index=index + 1,
                current=current,
                solutions=solutions,
                max_solutions=max_solutions,
                min_credits=min_credits,
                target_credits=target_credits,
                tolerance_minutes=tolerance_minutes,
                required_course_ids=required_course_ids,
            )

    # ------------------------------------------------------------------
    # Consultas auxiliares
    # ------------------------------------------------------------------

    def _ensure_institutional_schedule_is_published(self, schedule_id: int):
        schedule = (
            self.db.query(AcademicSchedule)
            .filter(AcademicSchedule.id == schedule_id)
            .first()
        )

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario institucional no encontrado.",
            )

        if not schedule.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El horario institucional está inactivo.",
            )

        schedule_status = schedule.status

        if hasattr(schedule_status, "value"):
            schedule_status = schedule_status.value

        if schedule_status != "PUBLISHED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Solo se pueden generar horarios estudiantiles usando horarios "
                    "institucionales publicados. Publica primero el horario institucional."
                ),
            )

    def _get_student(self, student_id: int) -> Student:
        student = (
            self.db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudiante no encontrado",
            )

        return student

    def _get_student_by_user_id(self, user_id: int) -> Student:
        student = (
            self.db.query(Student)
            .filter(Student.user_id == user_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El usuario logueado no tiene perfil de estudiante asociado.",
            )

        return student

    def _get_section_options(
        self,
        schedule_id: int,
        career: str,
        current_cycle: int,
        unavailable_days: list[int],
    ) -> list[SectionOption]:
        blocks = (
            self.db.query(ScheduleBlock)
            .options(
                joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.course),
                joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.teacher)
                .joinedload(Teacher.user),
                joinedload(ScheduleBlock.classroom),
            )
            .filter(ScheduleBlock.schedule_id == schedule_id)
            .all()
        )

        if not blocks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El horario institucional no tiene bloques generados.",
            )

        blocks_by_section: dict[int, list[ScheduleBlock]] = {}

        for block in blocks:
            if block.day_of_week in unavailable_days:
                continue

            if block.section is None or block.section.course is None:
                continue

            course = block.section.course

            if course.career != career:
                continue

            if course.cycle > current_cycle:
                continue

            blocks_by_section.setdefault(block.section_id, []).append(block)

        options: list[SectionOption] = []

        for section_id, section_blocks in blocks_by_section.items():
            first_block = section_blocks[0]
            section = first_block.section
            course = section.course
            teacher = section.teacher
            teacher_user = teacher.user if teacher else None

            options.append(
                SectionOption(
                    section_id=section.id,
                    section_code=section.section_code,
                    course_id=course.id,
                    course_code=course.code,
                    course_name=course.name,
                    credits=course.credits,
                    teacher_id=teacher.id if teacher else None,
                    teacher_code=teacher.teacher_code if teacher else None,
                    teacher_name=teacher_user.full_name if teacher_user else None,
                    blocks=section_blocks,
                )
            )

        return options

    def _group_options_by_course(
        self,
        section_options: list[SectionOption],
    ) -> dict[int, list[SectionOption]]:
        grouped: dict[int, list[SectionOption]] = {}

        for option in section_options:
            grouped.setdefault(option.course_id, []).append(option)

        return grouped

    # ------------------------------------------------------------------
    # Validaciones de conflicto
    # ------------------------------------------------------------------

    def _is_consistent_with_current(
        self,
        candidate: SectionOption,
        current: list[SectionOption],
        tolerance_minutes: int,
    ) -> bool:
        for selected in current:
            if selected.course_id == candidate.course_id:
                return False

            if self._sections_conflict(
                candidate=candidate,
                selected=selected,
                tolerance_minutes=tolerance_minutes,
            ):
                return False

        return True

    def _sections_conflict(
        self,
        candidate: SectionOption,
        selected: SectionOption,
        tolerance_minutes: int,
    ) -> bool:
        for candidate_block in candidate.blocks:
            for selected_block in selected.blocks:
                if candidate_block.day_of_week != selected_block.day_of_week:
                    continue

                if overlaps_with_tolerance(
                    candidate_block.start_time,
                    candidate_block.end_time,
                    selected_block.start_time,
                    selected_block.end_time,
                    tolerance_minutes,
                ):
                    return True

        return False

    def _has_required_courses(
        self,
        current: list[SectionOption],
        required_course_ids: set[int],
    ) -> bool:
        if not required_course_ids:
            return True

        current_course_ids = {
            option.course_id
            for option in current
        }

        return required_course_ids.issubset(current_course_ids)

    # ------------------------------------------------------------------
    # Ranking y presentación
    # ------------------------------------------------------------------

    def _rank_solutions(
        self,
        solutions: list[list[SectionOption]],
        preferred_shift: str,
        target_credits: int,
        preferred_teacher_ids: list[int] | None = None,
        avoided_teacher_ids: list[int] | None = None,
    ) -> list[tuple[float, list[SectionOption], dict]]:
        ranked = []

        for solution in solutions:
            breakdown = self.scoring_engine.calculate_score(
                solution=solution,
                preferred_shift=preferred_shift,
                target_credits=target_credits,
                preferred_teacher_ids=preferred_teacher_ids or [],
                avoided_teacher_ids=avoided_teacher_ids or [],
            )

            ranked.append(
                (
                    breakdown.final_score,
                    solution,
                    {
                        "base_score": breakdown.base_score,
                        "credit_score": breakdown.credit_score,
                        "used_days_score": breakdown.used_days_score,
                        "gaps_score": breakdown.gaps_score,
                        "shift_score": breakdown.shift_score,
                        "late_classes_score": breakdown.late_classes_score,
                        "compactness_score": breakdown.compactness_score,
                        "daily_balance_score": breakdown.daily_balance_score,
                        "weekend_score": breakdown.weekend_score,
                        "final_score": breakdown.final_score,
                        "details": breakdown.details,
                    },
                )
            )

        return sorted(
            ranked,
            key=lambda item: item[0],
            reverse=True,
        )

    def _solution_to_preview(
        self,
        solution: list[SectionOption],
        solution_index: int,
        score: float,
        score_breakdown: dict,
    ) -> dict:
        total_credits = sum(
            int(option.credits or 0)
            for option in solution
        )

        used_days = sorted(
            {
                int(block.day_of_week)
                for option in solution
                for block in option.blocks
            }
        )

        blocks = []

        for option in solution:
            for block in sorted(
                option.blocks,
                key=lambda item: (item.day_of_week, item.start_time),
            ):
                classroom = block.classroom

                blocks.append(
                    {
                        "schedule_block_id": block.id,
                        "section_id": option.section_id,
                        "section_code": option.section_code,
                        "course_id": option.course_id,
                        "course_code": option.course_code,
                        "course_name": option.course_name,
                        "credits": option.credits,
                        "teacher_id": option.teacher_id,
                        "teacher_code": option.teacher_code,
                        "teacher_name": option.teacher_name,
                        "classroom_id": block.classroom_id,
                        "classroom_code": classroom.code if classroom else None,
                        "classroom_name": classroom.name if classroom else None,
                        "day_of_week": block.day_of_week,
                        "start_time": block.start_time,
                        "end_time": block.end_time,
                    }
                )

        return {
            "solution_index": solution_index,
            "score": round(score, 2),
            "total_credits": total_credits,
            "total_courses": len(solution),
            "used_days": used_days,
            "score_breakdown": score_breakdown,
            "explanation": self._build_solution_explanation(
                solution=solution,
                score=score,
                score_breakdown=score_breakdown,
            ),
            "blocks": blocks,
        }
    
    def _build_solution_explanation(
        self,
        solution: list[SectionOption],
        score: float,
        score_breakdown: dict,
    ) -> dict:
        details = score_breakdown.get("details", {}) or {}

        total_credits = int(details.get("total_credits") or 0)
        target_credits = int(details.get("target_credits") or 0)
        credit_difference = int(details.get("credit_difference") or 0)

        teacher_preference_score = float(
            details.get("teacher_preference_score") or 0
        )

        used_days = details.get("used_days") or []
        total_courses = int(details.get("total_courses") or len(solution))

        strengths = []
        warnings = []

        credit_score = float(score_breakdown.get("credit_score") or 0)
        gaps_score = float(score_breakdown.get("gaps_score") or 0)
        shift_score = float(score_breakdown.get("shift_score") or 0)
        late_classes_score = float(score_breakdown.get("late_classes_score") or 0)
        compactness_score = float(score_breakdown.get("compactness_score") or 0)
        daily_balance_score = float(score_breakdown.get("daily_balance_score") or 0)
        weekend_score = float(score_breakdown.get("weekend_score") or 0)
        used_days_score = float(score_breakdown.get("used_days_score") or 0)

        if target_credits > 0:
            if credit_difference == 0:
                strengths.append(
                    f"Cumple exactamente el objetivo de {target_credits} créditos."
                )
            elif credit_difference <= 2:
                strengths.append(
                    f"Se acerca mucho al objetivo de {target_credits} créditos con {total_credits} créditos."
                )
            elif credit_difference <= 4:
                strengths.append(
                    f"Tiene {total_credits} créditos, una carga cercana al objetivo de {target_credits}."
                )
            else:
                warnings.append(
                    f"Está lejos del objetivo de {target_credits} créditos: alcanza {total_credits} créditos."
                )

        if teacher_preference_score > 0:
            strengths.append("Incluye docentes preferidos por el estudiante.")

        if teacher_preference_score < 0:
            warnings.append("Incluye uno o más docentes que el estudiante prefiere evitar.")

        if gaps_score >= 5:
            strengths.append("Presenta pocas horas libres entre clases.")
        elif gaps_score < 0:
            warnings.append("Tiene varios espacios libres entre clases.")

        if late_classes_score >= 5:
            strengths.append("No presenta clases nocturnas o las reduce al mínimo.")
        elif late_classes_score < 0:
            warnings.append("Incluye clases en horario nocturno.")

        if compactness_score >= 5:
            strengths.append("El horario es compacto y concentra bien las clases.")
        elif compactness_score < 0:
            warnings.append("El horario está muy disperso durante el día.")

        if daily_balance_score >= 3:
            strengths.append("Tiene una distribución equilibrada de clases entre los días.")
        elif daily_balance_score < 0:
            warnings.append("La carga diaria no está muy equilibrada.")

        if weekend_score >= 5:
            strengths.append("Evita clases en sábado o domingo.")
        elif weekend_score < 0:
            warnings.append("Incluye clases en fin de semana, por eso recibe una penalización.")

        if used_days_score >= 5:
            strengths.append(
                f"Concentra las clases en {len(used_days)} día(s), reduciendo desplazamientos."
            )
        elif used_days_score < 0:
            warnings.append(
                f"Usa {len(used_days)} días de la semana, por eso el horario puede sentirse más extendido."
            )

        if not strengths:
            strengths.append(
                "Es una opción válida que cumple las restricciones principales del estudiante."
            )

        if not warnings:
            warnings.append(
                "No presenta penalizaciones importantes según los criterios configurados."
            )

        if score >= 85:
            summary = (
                "Esta es una opción altamente recomendada porque combina buen puntaje, "
                "preferencias del estudiante y una distribución aceptable."
            )
        elif score >= 75:
            summary = (
                "Esta es una opción recomendada. Tiene buen equilibrio general, aunque puede tener algunas penalizaciones menores."
            )
        elif score >= 60:
            summary = (
                "Esta opción es válida, pero presenta algunas condiciones mejorables."
            )
        else:
            summary = (
                "Esta opción cumple las restricciones mínimas, pero no es la más conveniente según las preferencias indicadas."
            )

        return {
            "summary": summary,
            "strengths": strengths,
            "warnings": warnings,
            "metrics": {
                "score": round(score, 2),
                "total_credits": total_credits,
                "target_credits": target_credits,
                "credit_difference": credit_difference,
                "total_courses": total_courses,
                "used_days": used_days,
                "teacher_preference_score": round(teacher_preference_score, 2),
                "credit_score": round(credit_score, 2),
                "gaps_score": round(gaps_score, 2),
                "shift_score": round(shift_score, 2),
                "late_classes_score": round(late_classes_score, 2),
                "compactness_score": round(compactness_score, 2),
                "daily_balance_score": round(daily_balance_score, 2),
                "weekend_score": round(weekend_score, 2),
            },
        }

    def _get_used_days(
        self,
        solution: list[SectionOption],
    ) -> list[int]:
        days = set()

        for option in solution:
            for block in option.blocks:
                days.add(block.day_of_week)

        return sorted(days)

    def _solution_to_blocks(
        self,
        solution: list[SectionOption],
    ) -> list[dict]:
        result = []

        for option in solution:
            for block in option.blocks:
                classroom = block.classroom

                result.append(
                    {
                        "schedule_block_id": block.id,
                        "section_id": option.section_id,
                        "section_code": option.section_code,
                        "course_id": option.course_id,
                        "course_code": option.course_code,
                        "course_name": option.course_name,
                        "credits": option.credits,
                        "teacher_id": option.teacher_id,
                        "teacher_code": option.teacher_code,
                        "teacher_name": option.teacher_name,
                        "classroom_id": block.classroom_id,
                        "classroom_code": classroom.code if classroom else None,
                        "classroom_name": classroom.name if classroom else None,
                        "day_of_week": block.day_of_week,
                        "start_time": block.start_time,
                        "end_time": block.end_time,
                    }
                )

        return sorted(
            result,
            key=lambda item: (item["day_of_week"], item["start_time"]),
        )

    def _get_schedule_block_ids(
        self,
        solution: list[SectionOption],
    ) -> list[int]:
        block_ids = []

        for option in solution:
            for block in option.blocks:
                block_ids.append(block.id)

        return sorted(set(block_ids))

    # ------------------------------------------------------------------
    # Horarios guardados: helpers
    # ------------------------------------------------------------------

    def _get_student_schedule_or_404(
        self,
        student_schedule_id: int,
    ) -> StudentSchedule:
        student_schedule = (
            self.db.query(StudentSchedule)
            .options(
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.course),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section)
                .joinedload(CourseSection.teacher)
                .joinedload(Teacher.user),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.classroom),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section_offering)
                .joinedload(SectionOffering.course),
                joinedload(StudentSchedule.selected_blocks)
                .joinedload(StudentScheduleBlock.schedule_block)
                .joinedload(ScheduleBlock.section_offering)
                .joinedload(SectionOffering.teacher)
                .joinedload(Teacher.user),
            )
            .filter(StudentSchedule.id == student_schedule_id)
            .first()
        )

        if not student_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario estudiantil guardado no encontrado",
            )

        return student_schedule

    def _ensure_student_access(self, student_id: int, current_user):
        if current_user is None:
            return

        role_value = self._role_value(current_user)

        if role_value in ("ADMIN", "COORDINATOR"):
            return

        if role_value != "STUDENT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para generar horarios estudiantiles.",
            )

        student = (
            self.db.query(Student)
            .filter(Student.id == student_id)
            .first()
        )

        if not student:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Estudiante no encontrado",
            )

        if student.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes generar ni guardar horarios de otro estudiante.",
            )

    def _ensure_student_schedule_access(
        self,
        student_schedule: StudentSchedule,
        current_user,
    ):
        role = self._role_value(current_user)

        if role in ["ADMIN", "COORDINATOR"]:
            return

        if role != "STUDENT":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para ver horarios estudiantiles.",
            )

        student = self._get_student_by_user_id(current_user.id)

        if student_schedule.student_id != student.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes acceder a horarios de otro estudiante.",
            )

    def _student_schedule_to_summary(
        self,
        student_schedule: StudentSchedule,
    ) -> dict:
        blocks = self._student_schedule_blocks_to_preview_blocks(student_schedule)
        course_ids = {block["course_id"] for block in blocks}

        total_credits = 0
        counted_courses = set()

        for block in blocks:
            course_id = block["course_id"]

            if course_id not in counted_courses:
                total_credits += block["credits"]
                counted_courses.add(course_id)

        return {
            "id": student_schedule.id,
            "student_id": student_schedule.student_id,
            "institutional_schedule_id": student_schedule.schedule_id,
            "name": student_schedule.name,
            "score": student_schedule.score,
            "is_favorite": student_schedule.is_favorite,
            "generation_mode": student_schedule.generation_mode,
            "total_credits": total_credits,
            "total_courses": len(course_ids),
            "total_blocks": len(blocks),
        }

    def _student_schedule_to_detail(
        self,
        student_schedule: StudentSchedule,
    ) -> dict:
        summary = self._student_schedule_to_summary(student_schedule)
        blocks = self._student_schedule_blocks_to_preview_blocks(student_schedule)

        return {
            **summary,
            "blocks": blocks,
        }

    def _student_schedule_blocks_to_preview_blocks(
        self,
        student_schedule: StudentSchedule,
    ) -> list[dict]:
        result = []

        for selected in student_schedule.selected_blocks:
            block = selected.schedule_block

            if block is None:
                continue

            section = block.section
            offering = block.section_offering
            course = section.course if section else offering.course if offering else None
            teacher = section.teacher if section else offering.teacher if offering else None
            teacher_user = teacher.user if teacher else None
            classroom = block.classroom

            result.append(
                {
                    "schedule_block_id": block.id,
                    "section_id": block.section_id,
                    "section_offering_id": block.section_offering_id,
                    "section_code": section.section_code if section else offering.section_code if offering else None,
                    "course_id": course.id if course else 0,
                    "course_code": course.code if course else None,
                    "course_name": course.name if course else None,
                    "credits": course.credits if course else 0,
                    "teacher_id": teacher.id if teacher else None,
                    "teacher_code": teacher.teacher_code if teacher else None,
                    "teacher_name": teacher_user.full_name if teacher_user else None,
                    "classroom_id": block.classroom_id,
                    "classroom_code": classroom.code if classroom else None,
                    "classroom_name": classroom.name if classroom else None,
                    "day_of_week": block.day_of_week,
                    "start_time": block.start_time,
                    "end_time": block.end_time,
                }
            )

        return sorted(
            result,
            key=lambda item: (item["day_of_week"], item["start_time"]),
        )

    def _unset_previous_favorites(self, student_id: int):
        self.db.query(StudentSchedule).filter(
            StudentSchedule.student_id == student_id
        ).update({"is_favorite": False})
        self.db.flush()

    def _role_value(self, current_user) -> str:
        role = current_user.role

        if hasattr(role, "value"):
            return role.value

        return str(role)

    @staticmethod
    def _time_to_minutes(value: time) -> int:
        return value.hour * 60 + value.minute
