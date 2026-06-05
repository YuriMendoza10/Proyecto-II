from datetime import datetime

from pydantic import BaseModel


class EnvironmentalSummaryResponse(BaseModel):
    total_requests: int
    total_co2: float
    average_co2: float
    total_bytes: int
    most_polluting_endpoint: str | None = None
    most_used_endpoint: str | None = None
    average_response_time: float


class EnvironmentalMetricResponse(BaseModel):
    measured_at: datetime
    method: str
    path: str
    status_code: int
    response_time_ms: float
    response_size_bytes: int
    estimated_co2_g: float


class EnvironmentalEndpointRankingResponse(BaseModel):
    path: str
    total_requests: int
    total_co2: float
    average_response_time: float
    total_bytes: int
