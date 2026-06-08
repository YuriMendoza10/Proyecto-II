from datetime import time

from app.csp.utils import duration_in_minutes, generate_time_slots, overlaps
from app.services.environmental_service import EnvironmentalService


def test_calculate_co2_returns_zero_for_empty_response():
    assert EnvironmentalService.calculate_co2_g(0) == 0


def test_calculate_co2_uses_positive_bytes():
    result = EnvironmentalService.calculate_co2_g(1024**3)
    assert result == EnvironmentalService.EMISSIONS_FACTOR_G_PER_GB


def test_calculate_co2_ignores_negative_bytes():
    assert EnvironmentalService.calculate_co2_g(-100) == 0


def test_csp_overlap_detects_conflicting_time_blocks():
    assert overlaps(time(8, 0), time(10, 0), time(9, 30), time(11, 0))


def test_csp_overlap_allows_adjacent_time_blocks():
    assert not overlaps(time(8, 0), time(10, 0), time(10, 0), time(12, 0))


def test_csp_generates_expected_time_slots():
    slots = generate_time_slots(time(8, 0), time(11, 0), 90)

    assert slots == [(time(8, 0), time(9, 30)), (time(9, 30), time(11, 0))]
    assert duration_in_minutes(*slots[0]) == 90
