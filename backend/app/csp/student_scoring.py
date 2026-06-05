from dataclasses import dataclass
from statistics import mean


@dataclass
class StudentScoreBreakdown:
    base_score: float

    credit_score: float
    used_days_score: float
    gaps_score: float
    shift_score: float
    late_classes_score: float
    compactness_score: float
    daily_balance_score: float
    weekend_score: float

    final_score: float
    details: dict


class StudentScoringEngine:
    def calculate_score(
        self,
        solution,
        preferred_shift: str = "ANY",
        target_credits: int = 25,
        preferred_teacher_ids: list[int] | None = None,
        avoided_teacher_ids: list[int] | None = None,
    ) -> StudentScoreBreakdown:
        preferred_teacher_ids = set(preferred_teacher_ids or [])
        avoided_teacher_ids = set(avoided_teacher_ids or [])

        base_score = 50.0

        credit_score = self._calculate_credit_score(
            solution=solution,
            target_credits=target_credits,
        )

        used_days_score = self._calculate_used_days_score(solution)
        gaps_score = self._calculate_gaps_score(solution)
        shift_score = self._calculate_shift_score(
            solution=solution,
            preferred_shift=preferred_shift,
        )
        late_classes_score = self._calculate_late_classes_score(solution)
        compactness_score = self._calculate_compactness_score(solution)
        daily_balance_score = self._calculate_daily_balance_score(solution)
        weekend_score = self._calculate_weekend_score(solution)

        teacher_preference_score = self._calculate_teacher_preference_score(
            solution=solution,
            preferred_teacher_ids=preferred_teacher_ids,
            avoided_teacher_ids=avoided_teacher_ids,
        )

        final_score = (
            base_score
            + credit_score
            + used_days_score
            + gaps_score
            + shift_score
            + late_classes_score
            + compactness_score
            + daily_balance_score
            + weekend_score
            + teacher_preference_score
        )

        final_score = max(0.0, min(100.0, round(final_score, 2)))

        return StudentScoreBreakdown(
            base_score=round(base_score, 2),
            credit_score=round(credit_score, 2),
            used_days_score=round(used_days_score, 2),
            gaps_score=round(gaps_score, 2),
            shift_score=round(shift_score, 2),
            late_classes_score=round(late_classes_score, 2),
            compactness_score=round(compactness_score, 2),
            daily_balance_score=round(daily_balance_score, 2),
            weekend_score=round(weekend_score, 2),
            final_score=final_score,
            details={
                "teacher_preference_score": round(teacher_preference_score, 2),
                "preferred_teacher_ids": sorted(preferred_teacher_ids),
                "avoided_teacher_ids": sorted(avoided_teacher_ids),
                "total_credits": self._total_credits(solution),
                "target_credits": target_credits,
                "credit_difference": abs(target_credits - self._total_credits(solution)),
                "used_days": sorted(self._used_days(solution)),
                "total_courses": len(solution),
            },
        )

    def _total_credits(self, solution) -> int:
        return sum(int(option.credits or 0) for option in solution)

    def _used_days(self, solution) -> set[int]:
        days = set()

        for option in solution:
            for block in option.blocks:
                days.add(int(block.day_of_week))

        return days

    def _blocks_by_day(self, solution) -> dict[int, list]:
        grouped = {}

        for option in solution:
            for block in option.blocks:
                grouped.setdefault(int(block.day_of_week), []).append(block)

        for day in grouped:
            grouped[day] = sorted(
                grouped[day],
                key=lambda block: block.start_time,
            )

        return grouped

    def _calculate_credit_score(self, solution, target_credits: int) -> float:
        total_credits = self._total_credits(solution)

        if target_credits <= 0:
            return 0.0

        difference = abs(target_credits - total_credits)

        # Caso ideal: exacto al objetivo.
        if difference == 0:
            return 25.0

        # Muy cerca del objetivo.
        if difference <= 2:
            return 18.0

        # Aceptable.
        if difference <= 4:
            return 10.0

        # Lejos del objetivo.
        if difference <= 7:
            return 0.0

        # Muy lejos del objetivo: penalización fuerte.
        penalty = min(35.0, difference * 3.0)
        return -penalty

    def _calculate_used_days_score(self, solution) -> float:
        used_days = self._used_days(solution)
        count = len(used_days)

        if count == 0:
            return 0.0

        if count <= 3:
            return 8.0

        if count == 4:
            return 5.0

        if count == 5:
            return 2.0

        return -2.0

    def _calculate_gaps_score(self, solution) -> float:
        blocks_by_day = self._blocks_by_day(solution)

        if not blocks_by_day:
            return 0.0

        total_gap_minutes = 0

        for blocks in blocks_by_day.values():
            if len(blocks) <= 1:
                continue

            for index in range(len(blocks) - 1):
                current = blocks[index]
                next_block = blocks[index + 1]

                gap = self._time_to_minutes(next_block.start_time) - self._time_to_minutes(
                    current.end_time
                )

                if gap > 0:
                    total_gap_minutes += gap

        if total_gap_minutes == 0:
            return 8.0

        if total_gap_minutes <= 60:
            return 5.0

        if total_gap_minutes <= 180:
            return 2.0

        return -5.0

    def _calculate_shift_score(self, solution, preferred_shift: str) -> float:
        if preferred_shift == "ANY":
            return 0.0

        blocks = [
            block
            for option in solution
            for block in option.blocks
        ]

        if not blocks:
            return 0.0

        matched = 0

        for block in blocks:
            hour = block.start_time.hour

            if preferred_shift == "MORNING" and 7 <= hour < 13:
                matched += 1

            elif preferred_shift == "AFTERNOON" and 13 <= hour < 18:
                matched += 1

            elif preferred_shift == "NIGHT" and hour >= 18:
                matched += 1

        ratio = matched / len(blocks)

        return ratio * 8.0

    def _calculate_late_classes_score(self, solution) -> float:
        blocks = [
            block
            for option in solution
            for block in option.blocks
        ]

        if not blocks:
            return 0.0

        late_blocks = [
            block
            for block in blocks
            if block.start_time.hour >= 19
        ]

        if not late_blocks:
            return 5.0

        ratio = len(late_blocks) / len(blocks)

        return -8.0 * ratio

    def _calculate_compactness_score(self, solution) -> float:
        blocks_by_day = self._blocks_by_day(solution)

        if not blocks_by_day:
            return 0.0

        daily_spans = []

        for blocks in blocks_by_day.values():
            first_start = self._time_to_minutes(blocks[0].start_time)
            last_end = self._time_to_minutes(blocks[-1].end_time)
            daily_spans.append(last_end - first_start)

        average_span = mean(daily_spans)

        if average_span <= 180:
            return 6.0

        if average_span <= 300:
            return 3.0

        if average_span <= 480:
            return 0.0

        return -4.0

    def _calculate_daily_balance_score(self, solution) -> float:
        blocks_by_day = self._blocks_by_day(solution)

        if not blocks_by_day:
            return 0.0

        counts = [len(blocks) for blocks in blocks_by_day.values()]

        if len(counts) <= 1:
            return 3.0

        difference = max(counts) - min(counts)

        if difference == 0:
            return 5.0

        if difference == 1:
            return 3.0

        if difference == 2:
            return 1.0

        return -3.0

    def _calculate_weekend_score(self, solution) -> float:
        weekend_blocks = 0
        total_blocks = 0

        for option in solution:
            for block in option.blocks:
                total_blocks += 1

                if int(block.day_of_week) in (6, 7):
                    weekend_blocks += 1

        if total_blocks == 0:
            return 0.0

        if weekend_blocks == 0:
            return 5.0

        ratio = weekend_blocks / total_blocks

        return -8.0 * ratio

    def _calculate_teacher_preference_score(
        self,
        solution,
        preferred_teacher_ids: set[int],
        avoided_teacher_ids: set[int],
    ) -> float:
        if not preferred_teacher_ids and not avoided_teacher_ids:
            return 0.0

        teacher_ids = [
            int(option.teacher_id)
            for option in solution
            if option.teacher_id is not None
        ]

        if not teacher_ids:
            return 0.0

        score = 0.0

        preferred_matches = [
            teacher_id
            for teacher_id in teacher_ids
            if teacher_id in preferred_teacher_ids
        ]

        avoided_matches = [
            teacher_id
            for teacher_id in teacher_ids
            if teacher_id in avoided_teacher_ids
        ]

        if preferred_teacher_ids:
            preferred_ratio = len(preferred_matches) / len(teacher_ids)
            score += preferred_ratio * 15.0

        if avoided_teacher_ids:
            avoided_ratio = len(avoided_matches) / len(teacher_ids)
            score -= avoided_ratio * 20.0

        return score

    @staticmethod
    def _time_to_minutes(value) -> int:
        return value.hour * 60 + value.minute