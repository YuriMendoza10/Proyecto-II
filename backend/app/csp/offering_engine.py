from dataclasses import dataclass
from datetime import time
from itertools import product

from app.csp.utils import DEFAULT_ACADEMIC_SLOTS, overlaps, split_weekly_hours_into_blocks
from app.models.offering import OfferingModality, OfferingShift


@dataclass
class OfferingAssignment:
    offering: object
    requirement_id: int | None
    classroom: object | None
    day_of_week: int
    start_time: time
    end_time: time


class OfferingCSPEngine:
    """Small CSP solver specialized for approved/ready academic offerings."""

    def __init__(self, offerings, availabilities, request):
        self.offerings = offerings
        self.availabilities = availabilities
        self.request = request
        self.variables = self._build_variables()

    def solve(self):
        domains = [self._domain(offering) for offering in self.variables]
        if any(not domain for domain in domains):
            return []
        if len(domains) > 20:
            solution = self._greedy_solution(domains)
            return [self._score(solution)] if solution else []
        results = []
        self._backtrack(domains, 0, [], results)
        scored = [self._score(solution) for solution in results]
        return sorted(scored, key=lambda value: value["score_total"], reverse=True)

    def _greedy_solution(self, domains):
        current = []
        for domain in domains:
            selected = None
            for assignment in domain:
                if self._consistent(assignment, current):
                    selected = assignment
                    break
            if selected is None:
                return []
            current.append(selected)
        return current

    def _build_variables(self):
        variables = []
        for offering in self.offerings:
            blocks = split_weekly_hours_into_blocks(
                max(1, int(offering.course.weekly_hours or 1)), 90, 60
            ) or [90]
            variables.extend([offering] * len(blocks))
        return variables

    def _domain(self, offering):
        requirement = offering.requirements[0] if offering.requirements else None
        classroom = None if offering.modality == OfferingModality.VIRTUAL else offering.classroom
        slots = self._slots_for_shift(offering.shift)
        values = []
        for day, (start, end) in product(range(1, 6), slots):
            if self.request.respect_teacher_availability and not self._teacher_available(
                offering.teacher_id, day, start, end
            ):
                continue
            values.append(
                OfferingAssignment(
                    offering=offering,
                    requirement_id=requirement.id if requirement else None,
                    classroom=classroom,
                    day_of_week=day,
                    start_time=start,
                    end_time=end,
                )
            )
        if self.request.strategy == "SPREAD":
            return sorted(values, key=lambda value: (value.day_of_week, value.start_time))
        return sorted(values, key=lambda value: (value.start_time, value.day_of_week))

    def _backtrack(self, domains, index, current, results):
        if len(results) >= self.request.max_solutions:
            return
        if index == len(domains):
            results.append(list(current))
            return
        for assignment in domains[index]:
            if self._consistent(assignment, current):
                current.append(assignment)
                self._backtrack(domains, index + 1, current, results)
                current.pop()

    def _consistent(self, candidate, assigned):
        for other in assigned:
            if candidate.day_of_week != other.day_of_week or not overlaps(
                candidate.start_time, candidate.end_time, other.start_time, other.end_time
            ):
                continue
            if candidate.offering.id == other.offering.id:
                return False
            if candidate.offering.teacher_id == other.offering.teacher_id:
                return False
            if (
                candidate.classroom
                and other.classroom
                and candidate.classroom.id == other.classroom.id
            ):
                return False
            if (
                self.request.avoid_same_cycle_conflicts
                and candidate.offering.cycle_number == other.offering.cycle_number
            ):
                return False
        return True

    def _teacher_available(self, teacher_id, day, start, end):
        return any(
            availability.day_of_week == day
            and availability.start_time <= start
            and availability.end_time >= end
            for availability in self.availabilities.get(teacher_id, [])
        )

    @staticmethod
    def _slots_for_shift(shift):
        if shift == OfferingShift.MORNING:
            return [slot for slot in DEFAULT_ACADEMIC_SLOTS if slot[1] <= time(13, 30)]
        if shift == OfferingShift.AFTERNOON:
            return [slot for slot in DEFAULT_ACADEMIC_SLOTS if time(12, 0) <= slot[0] < time(19, 0)]
        if shift == OfferingShift.NIGHT:
            return [slot for slot in DEFAULT_ACADEMIC_SLOTS if slot[0] >= time(17, 20)]
        return DEFAULT_ACADEMIC_SLOTS

    def _score(self, blocks):
        days_by_cycle = {}
        teacher_hours = {}
        classroom_usage = {}
        for item in blocks:
            days_by_cycle.setdefault(str(item.offering.cycle_number), set()).add(item.day_of_week)
            teacher_hours[item.offering.teacher_id] = teacher_hours.get(item.offering.teacher_id, 0) + 1.5
            if item.classroom:
                classroom_usage[item.classroom.code] = classroom_usage.get(item.classroom.code, 0) + 1
        occupied_days = sum(len(days) for days in days_by_cycle.values())
        compact_bonus = max(0.0, 18.0 - occupied_days * 1.5)
        balance_penalty = float(max(classroom_usage.values(), default=0) - min(classroom_usage.values(), default=0))
        teacher_penalty = float(max(teacher_hours.values(), default=0) * 0.3)
        spread_bonus = float(occupied_days) if self.request.strategy == "SPREAD" else 0.0
        score = max(0.0, min(100.0, 82.0 + compact_bonus + spread_bonus - balance_penalty - teacher_penalty))
        warnings = []
        if balance_penalty > 3:
            warnings.append("El uso de aulas esta concentrado en pocos espacios.")
        if max(teacher_hours.values(), default=0) > 12:
            warnings.append("Existe concentracion alta de carga en un docente.")
        return {
            "score_total": round(score, 2),
            "score_breakdown": {
                "base": 82.0,
                "compact_schedule_bonus": round(compact_bonus, 2),
                "balanced_distribution_bonus": round(spread_bonus, 2),
                "classroom_imbalance_penalty": round(-balance_penalty, 2),
                "teacher_concentration_penalty": round(-teacher_penalty, 2),
            },
            "hard_conflicts": [],
            "soft_warnings": warnings,
            "classroom_usage": classroom_usage,
            "teacher_load_summary": {
                str(teacher_id): hours for teacher_id, hours in teacher_hours.items()
            },
            "cycle_distribution": {
                cycle: sorted(days) for cycle, days in days_by_cycle.items()
            },
            "assignments": blocks,
        }
