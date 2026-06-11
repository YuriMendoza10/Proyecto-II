from datetime import time

from app.csp import utils


def test_time_conversion_and_duration_helpers():
    assert utils.time_to_minutes(time(8, 30)) == 510
    assert utils.minutes_to_time(510) == time(8, 30)
    assert utils.duration_in_minutes(time(8, 0), time(9, 30)) == 90


def test_overlap_helpers_cover_adjacent_and_tolerance_cases():
    assert utils.overlaps(time(8, 0), time(9, 0), time(8, 30), time(10, 0)) is True
    assert utils.overlaps(time(8, 0), time(9, 0), time(9, 0), time(10, 0)) is False
    assert utils.overlaps_with_tolerance(time(8, 0), time(9, 0), time(9, 5), time(10, 0), 10) is True
    assert utils.overlaps_with_tolerance(time(8, 0), time(9, 0), time(9, 20), time(10, 0), 10) is False


def test_generate_and_filter_academic_slots():
    slots = utils.generate_time_slots(time(8, 0), time(11, 0), 60)

    assert slots == [
        (time(8, 0), time(9, 0)),
        (time(9, 0), time(10, 0)),
        (time(10, 0), time(11, 0)),
    ]
    assert utils.filter_academic_slots_by_range(slots, time(9, 0), time(11, 0)) == slots[1:]


def test_build_slots_and_split_weekly_hours():
    academic_slots = [(time(8, 0), time(9, 30)), (time(9, 40), time(10, 20))]

    assert utils.build_time_slots_from_academic_slots(academic_slots, 90, 45) == [(time(8, 0), time(9, 30))]
    assert utils.split_weekly_hours_into_blocks(5, 90, 45) == [90, 90, 90]
