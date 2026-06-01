from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CheckInCreateRequest(BaseModel):
    workspace_id: UUID
    completed_today: str | None = None
    next_priorities: str | None = None
    mood: str | None = Field(default=None, max_length=100)
    wins: str | None = None
    blockers: str | None = None
    completed_priorities: int = Field(default=0, ge=0, le=10)
    focus_level: int = Field(default=3, ge=1, le=5)
    check_in_date: date | None = None


class CheckInResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    check_in_date: date
    mood: str | None = None
    wins: str | None = None
    blockers: str | None = None
    score: int
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime


class WeeklySummaryResponse(BaseModel):
    workspace_id: UUID
    period_start: date
    period_end: date
    total_check_ins: int
    average_score: float
    current_streak: int
    best_score: int
    missed_days: int

class StreakResponse(BaseModel):
    current_streak: int
    longest_streak: int

