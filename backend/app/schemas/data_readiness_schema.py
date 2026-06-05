from typing import Any, Literal

from pydantic import BaseModel, Field


ReadinessSeverity = Literal["OK", "INFO", "WARNING", "CRITICAL"]


class DataReadinessCheck(BaseModel):
    code: str
    title: str
    severity: ReadinessSeverity
    passed: bool
    total: int
    affected: int
    message: str
    items: list[dict[str, Any]] = Field(default_factory=list)


class DataReadinessSummary(BaseModel):
    ready: bool
    status: Literal["READY", "WARNING", "CRITICAL"]
    total_checks: int
    passed_checks: int
    warning_checks: int
    critical_checks: int


class DataReadinessResponse(BaseModel):
    career_filter: str | None = None
    academic_period: str | None = None

    summary: DataReadinessSummary
    checks: list[DataReadinessCheck]