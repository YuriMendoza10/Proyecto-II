import random
import time as time_module
from dataclasses import dataclass
from datetime import time
from typing import Literal

from app.csp.utils import (
    build_time_slots_from_academic_slots,
    duration_in_minutes,
    filter_academic_slots_by_range,
    generate_time_slots,
    overlaps,
    overlaps_with_tolerance,
    split_weekly_hours_into_blocks,
)
from app.models.classroom import Classroom
from app.models.course import CourseSection
from app.models.schedule import ScheduleBlock
from app.models.teacher import TeacherAvailability


DiversityStrategy = Literal[
    "ORDERED",
    "SHUFFLE",
    "ROTATE",
    "MIXED",
]

DistributionStrategy = Literal[
    "COMPACT",
    "BALANCED",
    "SPREAD",
]


@dataclass(frozen=True)
class CSPVariable:
    id: str
    section_id: int
    course_id: int
    teacher_id: int | None
    required_duration_minutes: int
    block_index: int


@dataclass
class CSPAssignment:
    section_id: int
    course_id: int
    teacher_id: int | None
    classroom_id: int | None
    day_of_week: int
    start_time: time
    end_time: time
    duration_minutes: int


class InstitutionalCSPEngine:
    def __init__(
        self,
        sections: list[CourseSection],
        classrooms: list[Classroom],
        teacher_availabilities: list[TeacherAvailability],
        existing_blocks: list[ScheduleBlock],
        days: list[int],
        start_hour: time,
        end_hour: time,
        default_block_duration_minutes: int,
        min_block_duration_minutes: int,
        transfer_tolerance_minutes: int,
        use_academic_slots: bool,
        academic_slots: list[tuple[time, time]] | None,
        diversity_strategy: DiversityStrategy = "ORDERED",
        random_seed: int | None = None,
        timeout_seconds: int = 30,
        max_nodes: int = 100000,
        distribution_strategy: DistributionStrategy = "BALANCED",
        avoid_same_section_same_day: bool = True,
        max_blocks_per_day: int | None = None,
    ):
        self.sections = sections
        self.classrooms = classrooms
        self.teacher_availabilities = teacher_availabilities
        self.existing_blocks = existing_blocks

        self.days = days
        self.start_hour = start_hour
        self.end_hour = end_hour
        self.default_block_duration_minutes = default_block_duration_minutes
        self.min_block_duration_minutes = min_block_duration_minutes
        self.transfer_tolerance_minutes = transfer_tolerance_minutes
        self.use_academic_slots = use_academic_slots
        self.academic_slots = academic_slots or []

        self.diversity_strategy = diversity_strategy
        self.random_seed = random_seed
        self.randomizer = random.Random(random_seed)

        self.distribution_strategy = distribution_strategy
        self.avoid_same_section_same_day = avoid_same_section_same_day
        self.max_blocks_per_day = max_blocks_per_day

        self.timeout_seconds = timeout_seconds
        self.max_nodes = max_nodes
        self.nodes_visited = 0
        self.started_at: float | None = None
        self.stopped_by_timeout = False
        self.stopped_by_node_limit = False

        self.section_map = {
            section.id: section
            for section in self.sections
        }

        self.teacher_availability_map = self._build_teacher_availability_map()
        self.existing_day_counts = self._build_existing_day_counts()
        self.existing_hour_counts = self._build_existing_hour_counts()

        self.variables = self._build_variables()

        self.domain_cache: dict[str, list[CSPAssignment]] = {}
        self._build_all_domains()

    def solve(self, max_solutions: int = 1) -> list[list[CSPAssignment]]:
        self.nodes_visited = 0
        self.started_at = time_module.perf_counter()
        self.stopped_by_timeout = False
        self.stopped_by_node_limit = False

        variables = self._order_variables_by_mrv()
        solutions: list[list[CSPAssignment]] = []

        total_domain_items = sum(
            len(self.domain_cache.get(variable.id, []))
            for variable in variables
        )

        print(
            "CSP DEBUG: iniciando solve | "
            f"variables={len(variables)} | "
            f"dominios_totales={total_domain_items} | "
            f"max_solutions={max_solutions} | "
            f"distribution={self.distribution_strategy} | "
            f"avoid_same_section_same_day={self.avoid_same_section_same_day} | "
            f"max_blocks_per_day={self.max_blocks_per_day} | "
            f"timeout={self.timeout_seconds}s | "
            f"max_nodes={self.max_nodes}"
        )

        self._backtrack(
            variables=variables,
            index=0,
            current_assignment=[],
            solutions=solutions,
            max_solutions=max_solutions,
        )

        elapsed = 0.0

        if self.started_at is not None:
            elapsed = time_module.perf_counter() - self.started_at

        print(
            "CSP DEBUG: solve terminado | "
            f"soluciones={len(solutions)} | "
            f"nodos={self.nodes_visited} | "
            f"tiempo={elapsed:.2f}s | "
            f"timeout={self.stopped_by_timeout} | "
            f"node_limit={self.stopped_by_node_limit}"
        )

        return solutions

    def calculate_score(self, assignments: list[CSPAssignment]) -> float:
        from app.csp.scoring import InstitutionalScoringEngine

        scoring_engine = InstitutionalScoringEngine(
            assignments=assignments,
            allowed_days=self.days,
        )

        return scoring_engine.calculate_score()

    def _build_variables(self) -> list[CSPVariable]:
        variables: list[CSPVariable] = []

        for section in self.sections:
            if section.course is None:
                continue

            durations = split_weekly_hours_into_blocks(
                weekly_hours=section.course.weekly_hours,
                default_block_duration_minutes=self.default_block_duration_minutes,
                min_block_duration_minutes=self.min_block_duration_minutes,
            )

            for block_index, duration in enumerate(durations):
                variables.append(
                    CSPVariable(
                        id=f"{section.id}-{block_index}-{duration}",
                        section_id=section.id,
                        course_id=section.course_id,
                        teacher_id=section.teacher_id,
                        required_duration_minutes=duration,
                        block_index=block_index,
                    )
                )

        return variables

    def _build_all_domains(self) -> None:
        for variable in self.variables:
            domain = self._build_domain_for_variable(variable)
            self.domain_cache[variable.id] = self._spread_initial_domain(domain)

    def _order_variables_by_mrv(self) -> list[CSPVariable]:
        ordered_variables = sorted(
            self.variables,
            key=lambda variable: (
                len(self.domain_cache.get(variable.id, [])),
                variable.course_id,
                variable.section_id,
                variable.block_index,
            ),
        )

        if self.diversity_strategy in ["SHUFFLE", "MIXED"]:
            grouped: dict[int, list[CSPVariable]] = {}

            for variable in ordered_variables:
                domain_size = len(self.domain_cache.get(variable.id, []))
                grouped.setdefault(domain_size, []).append(variable)

            diversified_variables: list[CSPVariable] = []

            for domain_size in sorted(grouped.keys()):
                group = grouped[domain_size]
                self.randomizer.shuffle(group)
                diversified_variables.extend(group)

            return diversified_variables

        return ordered_variables

    def _build_teacher_availability_map(self) -> dict[int, list[TeacherAvailability]]:
        availability_map: dict[int, list[TeacherAvailability]] = {}

        for availability in self.teacher_availabilities:
            availability_map.setdefault(
                availability.teacher_id,
                [],
            ).append(availability)

        return availability_map

    def _build_existing_day_counts(self) -> dict[int, int]:
        day_counts: dict[int, int] = {}

        for block in self.existing_blocks:
            day_counts[block.day_of_week] = day_counts.get(block.day_of_week, 0) + 1

        return day_counts

    def _build_existing_hour_counts(self) -> dict[str, int]:
        hour_counts: dict[str, int] = {}

        for block in self.existing_blocks:
            start_text = self._time_text(block.start_time)
            hour_counts[start_text] = hour_counts.get(start_text, 0) + 1

        return hour_counts

    def _get_candidate_time_slots(
        self,
        required_duration_minutes: int,
    ) -> list[tuple[time, time]]:
        if self.use_academic_slots:
            ranged_slots = filter_academic_slots_by_range(
                academic_slots=self.academic_slots,
                start_hour=self.start_hour,
                end_hour=self.end_hour,
            )

            slots = build_time_slots_from_academic_slots(
                academic_slots=ranged_slots,
                required_duration_minutes=required_duration_minutes,
                min_block_duration_minutes=self.min_block_duration_minutes,
            )
        else:
            slots = generate_time_slots(
                start_hour=self.start_hour,
                end_hour=self.end_hour,
                duration_minutes=required_duration_minutes,
            )

        return sorted(
            slots,
            key=lambda item: (
                self._hour_priority(item[0]),
                item[0],
            ),
        )

    def _build_domain_for_variable(
        self,
        variable: CSPVariable,
    ) -> list[CSPAssignment]:
        domain: list[CSPAssignment] = []

        section = self.section_map.get(variable.section_id)

        if section is None:
            return domain

        time_slots = self._get_candidate_time_slots(
            required_duration_minutes=variable.required_duration_minutes,
        )

        active_classrooms = [
            classroom
            for classroom in self.classrooms
            if classroom.is_active and classroom.capacity >= section.max_students
        ]

        active_classrooms = sorted(
            active_classrooms,
            key=lambda classroom: (
                classroom.capacity,
                classroom.id,
            ),
        )

        for day in self.days:
            for start_time, end_time in time_slots:
                for classroom in active_classrooms:
                    candidate = CSPAssignment(
                        section_id=variable.section_id,
                        course_id=variable.course_id,
                        teacher_id=variable.teacher_id,
                        classroom_id=classroom.id,
                        day_of_week=day,
                        start_time=start_time,
                        end_time=end_time,
                        duration_minutes=duration_in_minutes(start_time, end_time),
                    )

                    if self._teacher_is_available(candidate):
                        domain.append(candidate)

        return domain

    # ------------------------------------------------------------------
    # Distribución inteligente de dominios
    # ------------------------------------------------------------------

    def _time_text(self, value) -> str:
        if value is None:
            return ""

        text = str(value)

        if len(text) == 5:
            return f"{text}:00"

        return text

    def _preferred_hour_order(self) -> list[str]:
        return [
            "10:20:00",
            "15:40:00",
            "08:40:00",
            "17:20:00",
            "12:00:00",
            "14:00:00",
            "19:00:00",
            "07:00:00",
            "20:40:00",
        ]

    def _hour_priority(self, value) -> int:
        start_text = self._time_text(value)

        priority_map = {
            hour: index
            for index, hour in enumerate(self._preferred_hour_order())
        }

        return priority_map.get(start_text, 999)

    def _spread_initial_domain(
        self,
        domain: list[CSPAssignment],
    ) -> list[CSPAssignment]:
        if not domain:
            return domain

        ordered: list[CSPAssignment] = []

        for hour in self._preferred_hour_order():
            hour_candidates = [
                candidate
                for candidate in domain
                if self._time_text(candidate.start_time) == hour
            ]

            hour_candidates.sort(
                key=lambda candidate: (
                    candidate.day_of_week,
                    candidate.classroom_id or 0,
                )
            )

            ordered.extend(hour_candidates)

        remaining = [
            candidate
            for candidate in domain
            if self._time_text(candidate.start_time) not in self._preferred_hour_order()
        ]

        remaining.sort(
            key=lambda candidate: (
                candidate.day_of_week,
                candidate.start_time,
                candidate.classroom_id or 0,
            )
        )

        ordered.extend(remaining)

        return ordered

    def _get_current_day_load(
        self,
        current_assignment: list[CSPAssignment],
    ) -> dict[int, int]:
        day_load = dict(self.existing_day_counts)

        for assignment in current_assignment:
            day_load[assignment.day_of_week] = (
                day_load.get(assignment.day_of_week, 0) + 1
            )

        return day_load

    def _get_current_hour_load(
        self,
        current_assignment: list[CSPAssignment],
    ) -> dict[str, int]:
        hour_load = dict(self.existing_hour_counts)

        for assignment in current_assignment:
            start_text = self._time_text(assignment.start_time)
            hour_load[start_text] = hour_load.get(start_text, 0) + 1

        return hour_load

    def _get_day_priority(self, variable: CSPVariable) -> dict[int, int]:
        if not self.days:
            return {}

        ordered_days = list(self.days)

        if self.distribution_strategy == "COMPACT":
            return {
                day: index
                for index, day in enumerate(ordered_days)
            }

        rotation_seed = (
            variable.course_id
            + variable.section_id
            + variable.block_index
        )

        rotation = rotation_seed % len(ordered_days)
        rotated_days = ordered_days[rotation:] + ordered_days[:rotation]

        return {
            day: index
            for index, day in enumerate(rotated_days)
        }

    def _same_section_day_penalty(
        self,
        candidate: CSPAssignment,
        current_assignment: list[CSPAssignment],
    ) -> int:
        if not self.avoid_same_section_same_day:
            return 0

        for assigned in current_assignment:
            if (
                assigned.section_id == candidate.section_id
                and assigned.day_of_week == candidate.day_of_week
            ):
                return 1000

        return 0

    def _edge_hour_penalty(self, candidate: CSPAssignment) -> int:
        start_text = self._time_text(candidate.start_time)

        if start_text == "07:00:00":
            return 20

        if start_text == "20:40:00":
            return 12

        if start_text == "19:00:00":
            return 4

        return 0

    def _dynamic_domain_sort_key(
        self,
        candidate: CSPAssignment,
        variable: CSPVariable,
        current_assignment: list[CSPAssignment],
    ):
        day_priority = self._get_day_priority(variable)
        day_load = self._get_current_day_load(current_assignment)
        hour_load = self._get_current_hour_load(current_assignment)

        current_day_load = day_load.get(candidate.day_of_week, 0)
        current_hour_load = hour_load.get(self._time_text(candidate.start_time), 0)
        preferred_hour_priority = self._hour_priority(candidate.start_time)
        preferred_day_priority = day_priority.get(candidate.day_of_week, 999)
        same_section_day_penalty = self._same_section_day_penalty(
            candidate,
            current_assignment,
        )
        edge_hour_penalty = self._edge_hour_penalty(candidate)

        if self.distribution_strategy == "COMPACT":
            return (
                same_section_day_penalty,
                preferred_day_priority,
                current_hour_load * 15,
                edge_hour_penalty,
                preferred_hour_priority,
                candidate.classroom_id or 0,
            )

        if self.distribution_strategy == "SPREAD":
            return (
                same_section_day_penalty,
                current_hour_load * 25,
                current_day_load * 10,
                edge_hour_penalty,
                preferred_hour_priority,
                preferred_day_priority,
                candidate.classroom_id or 0,
            )

        # BALANCED
        return (
            same_section_day_penalty,
            current_hour_load * 30,
            current_day_load * 8,
            edge_hour_penalty,
            preferred_hour_priority,
            preferred_day_priority,
            candidate.classroom_id or 0,
        )

    def _diversify_domain(
        self,
        domain: list[CSPAssignment],
        depth_index: int,
        variable: CSPVariable,
        current_assignment: list[CSPAssignment],
    ) -> list[CSPAssignment]:
        ordered_domain = sorted(
            domain,
            key=lambda candidate: self._dynamic_domain_sort_key(
                candidate=candidate,
                variable=variable,
                current_assignment=current_assignment,
            ),
        )

        if self.diversity_strategy == "ORDERED":
            return ordered_domain

        if self.diversity_strategy == "SHUFFLE":
            shuffled_domain = ordered_domain.copy()
            self.randomizer.shuffle(shuffled_domain)
            return shuffled_domain

        if self.diversity_strategy == "ROTATE":
            return self._rotate_domain(
                domain=ordered_domain,
                depth_index=depth_index,
            )

        if self.diversity_strategy == "MIXED":
            rotated_domain = self._rotate_domain(
                domain=ordered_domain,
                depth_index=depth_index,
            )

            chunks = self._chunk_domain(rotated_domain, chunk_size=5)
            mixed_domain: list[CSPAssignment] = []

            for chunk in chunks:
                self.randomizer.shuffle(chunk)
                mixed_domain.extend(chunk)

            return mixed_domain

        return ordered_domain

    def _rotate_domain(
        self,
        domain: list[CSPAssignment],
        depth_index: int,
    ) -> list[CSPAssignment]:
        if not domain:
            return domain

        rotation = depth_index % len(domain)

        return domain[rotation:] + domain[:rotation]

    def _chunk_domain(
        self,
        domain: list[CSPAssignment],
        chunk_size: int,
    ) -> list[list[CSPAssignment]]:
        return [
            domain[index:index + chunk_size]
            for index in range(0, len(domain), chunk_size)
        ]

    def _backtrack(
        self,
        variables: list[CSPVariable],
        index: int,
        current_assignment: list[CSPAssignment],
        solutions: list[list[CSPAssignment]],
        max_solutions: int,
    ) -> None:
        if len(solutions) >= max_solutions:
            return

        if self._must_stop():
            return

        self.nodes_visited += 1

        if self.nodes_visited % 5000 == 0:
            elapsed = 0.0

            if self.started_at is not None:
                elapsed = time_module.perf_counter() - self.started_at

            print(
                "CSP DEBUG: progreso | "
                f"nodos={self.nodes_visited} | "
                f"profundidad={index}/{len(variables)} | "
                f"soluciones={len(solutions)} | "
                f"tiempo={elapsed:.2f}s"
            )

        if index >= len(variables):
            solutions.append(current_assignment.copy())
            return

        variable = variables[index]

        domain = self.domain_cache.get(variable.id, [])
        domain = self._diversify_domain(
            domain=domain,
            depth_index=index,
            variable=variable,
            current_assignment=current_assignment,
        )

        for candidate in domain:
            if len(solutions) >= max_solutions:
                return

            if self._must_stop():
                return

            if self._is_consistent(candidate, current_assignment):
                current_assignment.append(candidate)

                self._backtrack(
                    variables=variables,
                    index=index + 1,
                    current_assignment=current_assignment,
                    solutions=solutions,
                    max_solutions=max_solutions,
                )

                current_assignment.pop()

                if len(solutions) >= max_solutions:
                    return

    def _forward_check(
        self,
        variables: list[CSPVariable],
        next_index: int,
        current_assignment: list[CSPAssignment],
    ) -> bool:
        for variable in variables[next_index:]:
            domain = self.domain_cache.get(variable.id, [])

            domain = self._diversify_domain(
                domain=domain,
                depth_index=next_index,
                variable=variable,
                current_assignment=current_assignment,
            )

            has_valid_option = False

            for candidate in domain:
                if self._is_consistent(candidate, current_assignment):
                    has_valid_option = True
                    break

            if not has_valid_option:
                return False

        return True

    def _must_stop(self) -> bool:
        if self.nodes_visited >= self.max_nodes:
            self.stopped_by_node_limit = True
            return True

        if self.started_at is not None:
            elapsed = time_module.perf_counter() - self.started_at

            if elapsed >= self.timeout_seconds:
                self.stopped_by_timeout = True
                return True

        return False

    def _is_consistent(
        self,
        candidate: CSPAssignment,
        current_assignment: list[CSPAssignment],
    ) -> bool:
        if not self._teacher_is_available(candidate):
            return False

        if self._exceeds_max_blocks_per_day(candidate, current_assignment):
            return False

        for assigned in current_assignment:
            if self._conflicts(candidate, assigned):
                return False

        for existing_block in self.existing_blocks:
            if self._conflicts_existing_block(candidate, existing_block):
                return False

        return True

    def _exceeds_max_blocks_per_day(
        self,
        candidate: CSPAssignment,
        current_assignment: list[CSPAssignment],
    ) -> bool:
        if self.max_blocks_per_day is None:
            return False

        current_count = self.existing_day_counts.get(candidate.day_of_week, 0)

        for assignment in current_assignment:
            if assignment.day_of_week == candidate.day_of_week:
                current_count += 1

        return current_count >= self.max_blocks_per_day

    def _conflicts(
        self,
        candidate: CSPAssignment,
        assigned: CSPAssignment,
    ) -> bool:
        same_section = candidate.section_id == assigned.section_id

        if (
            self.avoid_same_section_same_day
            and same_section
            and candidate.day_of_week == assigned.day_of_week
        ):
            return True

        if candidate.day_of_week != assigned.day_of_week:
            return False

        normal_time_conflict = overlaps(
            candidate.start_time,
            candidate.end_time,
            assigned.start_time,
            assigned.end_time,
        )

        same_classroom = (
            candidate.classroom_id is not None
            and candidate.classroom_id == assigned.classroom_id
        )

        same_teacher = (
            candidate.teacher_id is not None
            and candidate.teacher_id == assigned.teacher_id
        )

        if normal_time_conflict and (same_classroom or same_section):
            return True

        if same_teacher:
            return overlaps_with_tolerance(
                candidate.start_time,
                candidate.end_time,
                assigned.start_time,
                assigned.end_time,
                self.transfer_tolerance_minutes,
            )

        return False

    def _conflicts_existing_block(
        self,
        candidate: CSPAssignment,
        existing_block: ScheduleBlock,
    ) -> bool:
        if (
            self.avoid_same_section_same_day
            and candidate.section_id == existing_block.section_id
            and candidate.day_of_week == existing_block.day_of_week
        ):
            return True

        if candidate.day_of_week != existing_block.day_of_week:
            return False

        normal_time_conflict = overlaps(
            candidate.start_time,
            candidate.end_time,
            existing_block.start_time,
            existing_block.end_time,
        )

        existing_teacher_id = None

        if existing_block.section is not None:
            existing_teacher_id = existing_block.section.teacher_id

        same_classroom = (
            candidate.classroom_id is not None
            and existing_block.classroom_id is not None
            and candidate.classroom_id == existing_block.classroom_id
        )

        same_section = candidate.section_id == existing_block.section_id

        same_teacher = (
            candidate.teacher_id is not None
            and existing_teacher_id is not None
            and candidate.teacher_id == existing_teacher_id
        )

        if normal_time_conflict and (same_classroom or same_section):
            return True

        if same_teacher:
            return overlaps_with_tolerance(
                candidate.start_time,
                candidate.end_time,
                existing_block.start_time,
                existing_block.end_time,
                self.transfer_tolerance_minutes,
            )

        return False

    def _teacher_is_available(
        self,
        candidate: CSPAssignment,
    ) -> bool:
        if candidate.teacher_id is None:
            return True

        availabilities = self.teacher_availability_map.get(
            candidate.teacher_id,
            [],
        )

        for availability in availabilities:
            if not availability.is_available:
                continue

            if availability.day_of_week != candidate.day_of_week:
                continue

            if (
                availability.start_time <= candidate.start_time
                and availability.end_time >= candidate.end_time
            ):
                return True

        return False