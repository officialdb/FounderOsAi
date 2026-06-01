from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class OutreachCreateRequest(BaseModel):
    workspace_id: UUID
    contact_name: str | None = Field(default=None, max_length=255)
    contact_company: str | None = Field(default=None, max_length=255)
    contact_channel: str | None = Field(default=None, max_length=100)
    status: str = Field(default="sent", max_length=32)
    follow_up_date: date | None = None
    notes: str | None = None


class OutreachUpdateRequest(BaseModel):
    contact_name: str | None = Field(default=None, max_length=255)
    contact_company: str | None = Field(default=None, max_length=255)
    contact_channel: str | None = Field(default=None, max_length=100)
    status: str | None = Field(default=None, max_length=32)
    follow_up_date: date | None = None
    notes: str | None = None


class OutreachResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    contact_name: str | None = None
    contact_company: str | None = None
    contact_channel: str | None = None
    status: str
    follow_up_date: date | None = None
    notes: str | None = None
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime


class FollowUpReminderResponse(BaseModel):
    workspace_id: UUID
    reminder_date: date
    due_follow_ups: int
    overdue_follow_ups: int

