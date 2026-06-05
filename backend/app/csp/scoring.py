from datetime import time

from app.csp.institutional_engine import CSPAssignment


class InstitutionalScoringEngine:
    """
    Scoring institucional sobre 100 puntos.

    Factores:
    - Menos días usados.
    - Menos clases nocturnas.
    - Mejor balance de carga docente.
    - Mejor balance de uso de aulas.
    - Menor dispersión horaria por docente.
    - Menor cantidad de huecos por docente.
    """

    def __init__(
        self,
        assignments: list[CSPAssignment],
        allowed_days: list[int],
    ):
        self.assignments = assignments
        self.allowed_days = allowed_days

    def calculate_score(self) -> float:
        if not self.assignments:
            return 0.0

        score = 100.0

        score -= self._penalize_many_days()
        score -= self._penalize_late_classes()
        score -= self._penalize_teacher_overload()
        score -= self._penalize_classroom_overuse()
        score -= self._penalize_teacher_gaps()
        score -= self._penalize_teacher_daily_dispersion()

        return round(max(score, 0.0), 2)

    def _penalize_many_days(self) -> float:
        """
        Penaliza usar demasiados días.
        Máximo: 15 puntos.
        """
        used_days = len({assignment.day_of_week for assignment in self.assignments})
        total_allowed_days = max(len(self.allowed_days), 1)

        penalty = (used_days / total_allowed_days) * 15

        return min(penalty, 15)

    def _penalize_late_classes(self) -> float:
        """
        Penaliza clases después de las 18:00.
        Máximo: 15 puntos.
        """
        late_blocks = [
            assignment
            for assignment in self.assignments
            if assignment.end_time > time(18, 0)
        ]

        return min(len(late_blocks) * 2.5, 15)

    def _penalize_teacher_overload(self) -> float:
        """
        Penaliza docentes con más de 6 horas diarias.
        Máximo: 15 puntos.
        """
        teacher_daily_load: dict[tuple[int, int], int] = {}

        for assignment in self.assignments:
            if assignment.teacher_id is None:
                continue

            key = (assignment.teacher_id, assignment.day_of_week)
            teacher_daily_load[key] = (
                teacher_daily_load.get(key, 0) + assignment.duration_minutes
            )

        penalty = 0.0

        for total_minutes in teacher_daily_load.values():
            if total_minutes > 360:
                excess_hours = (total_minutes - 360) / 60
                penalty += excess_hours * 2

        return min(penalty, 15)

    def _penalize_classroom_overuse(self) -> float:
        """
        Penaliza concentración excesiva en pocas aulas.
        Máximo: 10 puntos.
        """
        classroom_usage: dict[int, int] = {}

        for assignment in self.assignments:
            if assignment.classroom_id is None:
                continue

            classroom_usage[assignment.classroom_id] = (
                classroom_usage.get(assignment.classroom_id, 0) + 1
            )

        if not classroom_usage:
            return 0.0

        total_blocks = sum(classroom_usage.values())
        average_usage = total_blocks / len(classroom_usage)

        penalty = 0.0

        for usage in classroom_usage.values():
            if usage > average_usage * 1.5:
                penalty += 2

        return min(penalty, 10)

    def _penalize_teacher_gaps(self) -> float:
        """
        Penaliza huecos largos entre clases del mismo docente.
        Máximo: 20 puntos.
        """
        teacher_day_blocks = self._group_by_teacher_and_day()

        penalty = 0.0

        for blocks in teacher_day_blocks.values():
            ordered_blocks = sorted(
                blocks,
                key=lambda assignment: assignment.start_time,
            )

            for index in range(len(ordered_blocks) - 1):
                current_block = ordered_blocks[index]
                next_block = ordered_blocks[index + 1]

                gap_minutes = self._minutes_between(
                    current_block.end_time,
                    next_block.start_time,
                )

                if gap_minutes > 120:
                    penalty += 3
                elif gap_minutes > 60:
                    penalty += 1.5

        return min(penalty, 20)

    def _penalize_teacher_daily_dispersion(self) -> float:
        """
        Penaliza jornadas muy dispersas para un docente.
        Máximo: 15 puntos.
        """
        teacher_day_blocks = self._group_by_teacher_and_day()

        penalty = 0.0

        for blocks in teacher_day_blocks.values():
            if len(blocks) <= 1:
                continue

            first_start = min(block.start_time for block in blocks)
            last_end = max(block.end_time for block in blocks)

            total_span_minutes = self._minutes_between(first_start, last_end)
            teaching_minutes = sum(block.duration_minutes for block in blocks)

            idle_minutes = total_span_minutes - teaching_minutes

            if idle_minutes > 180:
                penalty += 4
            elif idle_minutes > 90:
                penalty += 2

        return min(penalty, 15)

    def _group_by_teacher_and_day(self) -> dict[tuple[int, int], list[CSPAssignment]]:
        grouped: dict[tuple[int, int], list[CSPAssignment]] = {}

        for assignment in self.assignments:
            if assignment.teacher_id is None:
                continue

            key = (assignment.teacher_id, assignment.day_of_week)
            grouped.setdefault(key, []).append(assignment)

        return grouped

    def _time_to_minutes(self, value: time) -> int:
        return value.hour * 60 + value.minute

    def _minutes_between(
        self,
        start_time: time,
        end_time: time,
    ) -> int:
        return self._time_to_minutes(end_time) - self._time_to_minutes(start_time)