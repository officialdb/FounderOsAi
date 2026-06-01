from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TaskCreateRequest(BaseModel):
    workspace_id: UUID
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    priority: int = Field(default=2, ge=1, le=5)
    due_date: date | None = None


class TaskUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    priority: int | None = Field(default=None, ge=1, le=5)
    due_date: date | None = None
    status: str | None = Field(default=None, max_length=32)


class TaskResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    title: str
    description: str | None = None
    priority: int
    status: str
    due_date: date | None = None
    completed_at: datetime | None = None
    is_overdue: bool
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime

