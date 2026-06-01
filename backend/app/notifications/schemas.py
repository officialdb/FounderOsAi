from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class NotificationCreateRequest(BaseModel):
    workspace_id: UUID | None = None
    type: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1)
    scheduled_for: datetime | None = None
    extra_metadata: dict[str, object] = Field(default_factory=dict)


class NotificationUpdateRequest(BaseModel):
    is_read: bool | None = None
    extra_metadata: dict[str, object] | None = None


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    workspace_id: UUID | None = None
    type: str
    title: str
    message: str
    scheduled_for: datetime | None = None
    is_read: bool
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime


class NotificationSummaryResponse(BaseModel):
    total_notifications: int
    unread_notifications: int
    unread_reminders: int
    unread_alerts: int
