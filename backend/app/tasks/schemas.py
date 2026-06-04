from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field
from typing import Literal


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
    status: Literal["todo", "in_progress", "done", "overdue"] | None = None


class TaskResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    title: str
    description: str | None = None
    priority: int
    status: Literal["todo", "in_progress", "done", "overdue"]
    due_date: date | None = None
    completed_at: datetime | None = None
    is_overdue: bool
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime
