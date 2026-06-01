from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field


class AIContentRequest(BaseModel):
    workspace_id: UUID
    topic: str = Field(min_length=1, max_length=255)
    content_type: str = Field(default="post", max_length=100)
    tone: str | None = Field(default=None, max_length=100)


class AIFeedbackRequest(BaseModel):
    workspace_id: UUID


class AIWeeklySummaryRequest(BaseModel):
    workspace_id: UUID


class AIGenerationResponse(BaseModel):
    id: UUID
    user_id: UUID
    workspace_id: UUID | None = None
    generation_type: str
    prompt: str
    response_text: str | None = None
    model_name: str | None = None
    extra_metadata: dict[str, object]
    created_at: datetime
    updated_at: datetime


class AIFeedbackResponse(BaseModel):
    workspace_id: UUID
    summary: str
    strengths: list[str]
    improvements: list[str]
    next_actions: list[str]
    generated_at: datetime


class AIWeeklySummaryResponse(BaseModel):
    workspace_id: UUID
    period_start: date
    period_end: date
    summary: str
    highlights: list[str]
    risks: list[str]
    next_week_focus: list[str]
    generated_at: datetime


class AIInsightResponse(BaseModel):
    category: str
    insight: str
    recommended_action: str
    priority_level: str


