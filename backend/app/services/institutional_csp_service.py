from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.csp.institutional_engine import CSPAssignment, InstitutionalCSPEngine
from app.csp.utils import DEFAULT_ACADEMIC_SLOTS
from app.models.course import CourseSection, Course
from app.models.schedule import ScheduleBlock, ScheduleStatus
from app.models.teacher import TeacherAvailability
from app.repositories.classroom_repository import ClassroomRepository
from app.repositories.schedule_repository import ScheduleRepository
from app.schemas.csp_schema import (
    InstitutionalCSPGenerateRequest,
    InstitutionalCSPSaveSelectedRequest,
)
from app.schemas.schedule_schema import AcademicScheduleUpdate


class InstitutionalCSPService:
    def __init__(self, db: Session):
        self.db = db
        self.schedule_repository = ScheduleRepository(db)
        self.classroom_repository = ClassroomRepository(db)

    def preview_institutional_schedule(self, request: InstitutionalCSPGenerateRequest):
        sections = self._get_filtered_sections(request)

        if not sections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No hay secciones para programar con los filtros indicados. "
                    "Revisa career_filter, cycle_filter, course_ids o max_sections_to_schedule."
                ),
            )

        engine = self._build_engine_from_request(request, sections=sections)
        solutions = engine.solve(max_solutions=request.max_solutions)

        if not solutions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No se pudo previsualizar ningún horario válido con las restricciones actuales. "
                    "El motor terminó por timeout, límite de nodos o restricciones muy fuertes. "
                    "Prueba con menos secciones, menos días o cycle_filter."
                ),
            )

        evaluated = self._evaluate_solutions(engine=engine, solutions=solutions)

        return {
            "success": True,
            "message": "Soluciones CSP previsualizadas correctamente. No se guardó nada en la base de datos.",
            "schedule_id": request.schedule_id,
            "evaluated_solutions": len(solutions),
            "best_solution_index": evaluated["best_solution_index"],
            "best_score": evaluated["best_score"],
            "diversity_strategy": request.diversity_strategy,
            "random_seed": request.random_seed,
            "distribution_strategy": request.distribution_strategy,
            "avoid_same_section_same_day": request.avoid_same_section_same_day,
            "max_blocks_per_day": request.max_blocks_per_day,
            "solutions": evaluated["solution_previews"],
            "career_filter": request.career_filter,
            "cycle_filter": request.cycle_filter,
            "course_ids": request.course_ids,
            "max_sections_to_schedule": request.max_sections_to_schedule,
            "sections_considered": len(sections),
        }

    def generate_institutional_schedule(self, request: InstitutionalCSPGenerateRequest):
        sections = self._get_filtered_sections(request)

        if not sections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No hay secciones para programar con los filtros indicados. "
                    "Revisa career_filter, cycle_filter, course_ids o max_sections_to_schedule."
                ),
            )

        if request.clear_existing_blocks:
            self._clear_schedule_blocks(schedule_id=request.schedule_id)

        engine = self._build_engine_from_request(request, sections=sections)
        solutions = engine.solve(max_solutions=request.max_solutions)

        if not solutions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No se pudo generar un horario válido con las restricciones actuales. "
                    "Revisa disponibilidad docente, aulas activas, capacidad, secciones, "
                    "weekly_hours, franjas académicas, tolerancia entre clases o reduce el lote."
                ),
            )

        selected = self._select_best_solution(engine=engine, solutions=solutions)

        selected_solution = selected["solution"]
        selected_solution_index = selected["solution_index"]
        best_score = selected["score"]
        solution_scores = selected["solution_scores"]

        schedule = self.schedule_repository.get_by_id(request.schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario académico no encontrado",
            )

        created_blocks = self._save_selected_solution(
            schedule_id=request.schedule_id,
            selected_solution=selected_solution,
            schedule=schedule,
            score=best_score,
        )

        return {
            "success": True,
            "message": "Horario institucional generado correctamente usando la mejor solución por score",
            "schedule_id": request.schedule_id,
            "evaluated_solutions": len(solutions),
            "selected_solution_index": selected_solution_index,
            "generated_blocks": len(created_blocks),
            "score": best_score,
            "diversity_strategy": request.diversity_strategy,
            "random_seed": request.random_seed,
            "distribution_strategy": request.distribution_strategy,
            "avoid_same_section_same_day": request.avoid_same_section_same_day,
            "max_blocks_per_day": request.max_blocks_per_day,
            "solution_scores": solution_scores,
            "blocks": [
                self._assignment_to_dict(assignment)
                for assignment in selected_solution
            ],
            "career_filter": request.career_filter,
            "cycle_filter": request.cycle_filter,
            "course_ids": request.course_ids,
            "max_sections_to_schedule": request.max_sections_to_schedule,
            "sections_considered": len(sections),
        }

    def generate_selected_solution(self, request: InstitutionalCSPSaveSelectedRequest):
        sections = self._get_filtered_sections(request)

        if not sections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No hay secciones para programar con los filtros indicados. "
                    "Revisa career_filter, cycle_filter, course_ids o max_sections_to_schedule."
                ),
            )

        engine = self._build_engine_from_request(request, sections=sections)
        solutions = engine.solve(max_solutions=request.max_solutions)

        if not solutions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No se encontraron soluciones para guardar. "
                    "Ejecuta el preview o el diagnóstico CSP nuevamente con filtros más pequeños."
                ),
            )

        if request.solution_index >= len(solutions):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"El solution_index {request.solution_index} no existe. "
                    f"Soluciones disponibles: 0 a {len(solutions) - 1}."
                ),
            )

        selected_solution = solutions[request.solution_index]
        selected_score = engine.calculate_score(selected_solution)

        solution_scores = [
            {
                "solution_index": index,
                "score": engine.calculate_score(solution),
                "total_blocks": len(solution),
            }
            for index, solution in enumerate(solutions)
        ]

        schedule = self.schedule_repository.get_by_id(request.schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario académico no encontrado",
            )

        if request.clear_existing_blocks:
            self._clear_schedule_blocks(schedule_id=request.schedule_id)

        created_blocks = self._save_selected_solution(
            schedule_id=request.schedule_id,
            selected_solution=selected_solution,
            schedule=schedule,
            score=selected_score,
        )

        return {
            "success": True,
            "message": "Solución CSP seleccionada guardada correctamente",
            "schedule_id": request.schedule_id,
            "evaluated_solutions": len(solutions),
            "selected_solution_index": request.solution_index,
            "generated_blocks": len(created_blocks),
            "score": selected_score,
            "diversity_strategy": request.diversity_strategy,
            "random_seed": request.random_seed,
            "distribution_strategy": request.distribution_strategy,
            "avoid_same_section_same_day": request.avoid_same_section_same_day,
            "max_blocks_per_day": request.max_blocks_per_day,
            "solution_scores": solution_scores,
            "blocks": [
                self._assignment_to_dict(assignment)
                for assignment in selected_solution
            ],
            "career_filter": request.career_filter,
            "cycle_filter": request.cycle_filter,
            "course_ids": request.course_ids,
            "max_sections_to_schedule": request.max_sections_to_schedule,
            "sections_considered": len(sections),
        }

    def _build_engine_from_request(
        self,
        request: InstitutionalCSPGenerateRequest,
        sections: list[CourseSection] | None = None,
    ) -> InstitutionalCSPEngine:
        schedule = self.schedule_repository.get_by_id(request.schedule_id)

        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Horario académico no encontrado",
            )

        if not schedule.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se puede trabajar sobre un horario inactivo",
            )

        existing_blocks = []

        if not request.clear_existing_blocks:
            existing_blocks = (
                self.db.query(ScheduleBlock)
                .options(joinedload(ScheduleBlock.section))
                .filter(ScheduleBlock.schedule_id == request.schedule_id)
                .all()
            )

        programmed_section_ids = {
            block.section_id
            for block in existing_blocks
        }

        if sections is None:
            sections = self._get_filtered_sections(request)

        if request.avoid_duplicate_section_blocks and programmed_section_ids:
            sections = [
                section
                for section in sections
                if section.id not in programmed_section_ids
            ]

        if not sections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No existen secciones pendientes para generar. "
                    "Puede que todas ya tengan bloques, no tengan docente asignado, "
                    "o no cumplan los filtros de carrera/ciclo/curso."
                ),
            )

        classrooms = self.classroom_repository.get_all(
            skip=0,
            limit=1000,
            is_active=True,
        )

        if not classrooms:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No existen aulas activas disponibles",
            )

        teacher_availabilities = (
            self.db.query(TeacherAvailability)
            .filter(TeacherAvailability.is_available == True)
            .all()
        )

        if not teacher_availabilities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No existe disponibilidad docente registrada",
            )

        academic_slots = self._resolve_academic_slots(request)

        return InstitutionalCSPEngine(
            sections=sections,
            classrooms=classrooms,
            teacher_availabilities=teacher_availabilities,
            existing_blocks=existing_blocks,
            days=request.days,
            start_hour=request.start_hour,
            end_hour=request.end_hour,
            default_block_duration_minutes=request.default_block_duration_minutes,
            min_block_duration_minutes=request.min_block_duration_minutes,
            transfer_tolerance_minutes=request.transfer_tolerance_minutes,
            use_academic_slots=request.use_academic_slots,
            academic_slots=academic_slots,
            diversity_strategy=request.diversity_strategy,
            random_seed=request.random_seed,
            timeout_seconds=30,
            max_nodes=100000,
            distribution_strategy=request.distribution_strategy,
            avoid_same_section_same_day=request.avoid_same_section_same_day,
            max_blocks_per_day=request.max_blocks_per_day,
        )

    def _get_filtered_sections(
        self,
        request: InstitutionalCSPGenerateRequest,
    ) -> list[CourseSection]:
        query = (
            self.db.query(CourseSection)
            .options(
                joinedload(CourseSection.course),
                joinedload(CourseSection.teacher),
            )
            .join(CourseSection.course)
            .filter(CourseSection.teacher_id.isnot(None))
            .filter(Course.is_active == True)
        )

        if request.career_filter:
            query = query.filter(Course.career == request.career_filter)

        if request.cycle_filter:
            query = query.filter(Course.cycle.in_(request.cycle_filter))

        if request.course_ids:
            query = query.filter(Course.id.in_(request.course_ids))

        query = query.order_by(
            Course.career.asc(),
            Course.cycle.asc(),
            Course.id.asc(),
            CourseSection.section_code.asc(),
        )

        if request.max_sections_to_schedule:
            query = query.limit(request.max_sections_to_schedule)

        return query.all()

    def _evaluate_solutions(
        self,
        engine: InstitutionalCSPEngine,
        solutions: list[list[CSPAssignment]],
    ):
        best_score = -1.0
        best_solution_index = 0
        best_solution: list[CSPAssignment] | None = None

        solution_previews = []

        for index, solution in enumerate(solutions):
            score = engine.calculate_score(solution)

            if score > best_score:
                best_score = score
                best_solution_index = index
                best_solution = solution

            solution_previews.append(
                {
                    "solution_index": index,
                    "score": score,
                    "total_blocks": len(solution),
                    "blocks": [
                        self._assignment_to_dict(assignment)
                        for assignment in solution
                    ],
                }
            )

        if best_solution is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo evaluar ninguna solución",
            )

        return {
            "best_score": best_score,
            "best_solution_index": best_solution_index,
            "best_solution": best_solution,
            "solution_previews": solution_previews,
        }

    def _select_best_solution(
        self,
        engine: InstitutionalCSPEngine,
        solutions: list[list[CSPAssignment]],
    ):
        evaluated = self._evaluate_solutions(
            engine=engine,
            solutions=solutions,
        )

        solution_scores = [
            {
                "solution_index": item["solution_index"],
                "score": item["score"],
                "total_blocks": item["total_blocks"],
            }
            for item in evaluated["solution_previews"]
        ]

        return {
            "solution": evaluated["best_solution"],
            "solution_index": evaluated["best_solution_index"],
            "score": evaluated["best_score"],
            "solution_scores": solution_scores,
        }

    def _save_selected_solution(
        self,
        schedule_id: int,
        selected_solution: list[CSPAssignment],
        schedule,
        score: float,
    ) -> list[ScheduleBlock]:
        created_blocks: list[ScheduleBlock] = []

        try:
            for assignment in selected_solution:
                block = ScheduleBlock(
                    schedule_id=schedule_id,
                    section_id=assignment.section_id,
                    classroom_id=assignment.classroom_id,
                    day_of_week=assignment.day_of_week,
                    start_time=assignment.start_time,
                    end_time=assignment.end_time,
                )

                self.db.add(block)
                created_blocks.append(block)

            self.db.flush()

            schedule_update = AcademicScheduleUpdate(
                status=ScheduleStatus.GENERATED,
                score=score,
            )

            self.schedule_repository.update(schedule, schedule_update)

            self.db.commit()

            for block in created_blocks:
                self.db.refresh(block)

            return created_blocks

        except Exception:
            self.db.rollback()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al guardar la solución seleccionada",
            )

    def _resolve_academic_slots(
        self,
        request: InstitutionalCSPGenerateRequest,
    ):
        if not request.use_academic_slots:
            return []

        if request.academic_slots is None:
            return DEFAULT_ACADEMIC_SLOTS

        return [
            (slot.start_time, slot.end_time)
            for slot in request.academic_slots
        ]

    def _clear_schedule_blocks(self, schedule_id: int):
        (
            self.db.query(ScheduleBlock)
            .filter(ScheduleBlock.schedule_id == schedule_id)
            .delete(synchronize_session=False)
        )

        self.db.flush()

    def _assignment_to_dict(self, assignment: CSPAssignment) -> dict:
        return {
            "section_id": assignment.section_id,
            "course_id": assignment.course_id,
            "teacher_id": assignment.teacher_id,
            "classroom_id": assignment.classroom_id,
            "day_of_week": assignment.day_of_week,
            "start_time": assignment.start_time,
            "end_time": assignment.end_time,
            "duration_minutes": assignment.duration_minutes,
        }