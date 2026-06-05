from datetime import time


DEFAULT_ACADEMIC_SLOTS: list[tuple[time, time]] = [
    (time(7, 0), time(8, 30)),
    (time(8, 40), time(10, 10)),
    (time(10, 20), time(11, 50)),
    (time(12, 0), time(13, 30)),
    (time(14, 0), time(15, 30)),
    (time(15, 40), time(17, 10)),
    (time(17, 20), time(18, 50)),
    (time(19, 0), time(20, 30)),
    (time(20, 40), time(22, 0)),
]


def time_to_minutes(value: time) -> int:
    return value.hour * 60 + value.minute


def minutes_to_time(value: int) -> time:
    hour = value // 60
    minute = value % 60
    return time(hour=hour, minute=minute)


def duration_in_minutes(start_time: time, end_time: time) -> int:
    return time_to_minutes(end_time) - time_to_minutes(start_time)


def overlaps(
    start_a: time,
    end_a: time,
    start_b: time,
    end_b: time,
) -> bool:
    return start_a < end_b and end_a > start_b


def overlaps_with_tolerance(
    start_a: time,
    end_a: time,
    start_b: time,
    end_b: time,
    tolerance_minutes: int,
) -> bool:
    start_a_min = time_to_minutes(start_a)
    end_a_min = time_to_minutes(end_a)
    start_b_min = time_to_minutes(start_b)
    end_b_min = time_to_minutes(end_b)

    return (
        start_a_min < end_b_min + tolerance_minutes
        and end_a_min + tolerance_minutes > start_b_min
    )


def generate_time_slots(
    start_hour: time,
    end_hour: time,
    duration_minutes: int,
) -> list[tuple[time, time]]:
    slots: list[tuple[time, time]] = []

    start_minutes = time_to_minutes(start_hour)
    end_minutes = time_to_minutes(end_hour)

    current = start_minutes

    while current + duration_minutes <= end_minutes:
        slots.append(
            (
                minutes_to_time(current),
                minutes_to_time(current + duration_minutes),
            )
        )

        current += duration_minutes

    return slots


def filter_academic_slots_by_range(
    academic_slots: list[tuple[time, time]],
    start_hour: time,
    end_hour: time,
) -> list[tuple[time, time]]:
    return [
        (slot_start, slot_end)
        for slot_start, slot_end in academic_slots
        if slot_start >= start_hour and slot_end <= end_hour
    ]


def build_time_slots_from_academic_slots(
    academic_slots: list[tuple[time, time]],
    required_duration_minutes: int,
    min_block_duration_minutes: int,
) -> list[tuple[time, time]]:
    """
    Devuelve franjas académicas compatibles con la duración requerida.

    Si required_duration_minutes = 90, usa franjas de 90.
    Si required_duration_minutes = 80, puede usar una franja de 80 o más.
    """
    valid_slots: list[tuple[time, time]] = []

    for slot_start, slot_end in academic_slots:
        slot_duration = duration_in_minutes(slot_start, slot_end)

        if slot_duration >= required_duration_minutes:
            valid_slots.append((slot_start, slot_end))
            continue

        if slot_duration >= min_block_duration_minutes and required_duration_minutes <= slot_duration:
            valid_slots.append((slot_start, slot_end))

    return valid_slots


def split_weekly_hours_into_blocks(
    weekly_hours: int,
    default_block_duration_minutes: int,
    min_block_duration_minutes: int,
) -> list[int]:
    total_minutes = weekly_hours * 60
    blocks: list[int] = []

    while total_minutes >= default_block_duration_minutes:
        blocks.append(default_block_duration_minutes)
        total_minutes -= default_block_duration_minutes

    if total_minutes >= min_block_duration_minutes:
        blocks.append(total_minutes)

    return blocks