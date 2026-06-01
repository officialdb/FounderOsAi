from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    color: str | None = Field(default=None, max_length=32)


class WorkspaceUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    color: str | None = Field(default=None, max_length=32)
    status: str | None = Field(default=None, max_length=32)


class WorkspaceResponse(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    description: str | None = None
    color: str | None = None
    status: str
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime

