from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.ai.schemas import (
    AIFeedbackRequest,
    AIFeedbackResponse,
    AIContentRequest,
    AIGenerationResponse,
    AIWeeklySummaryRequest,
    AIWeeklySummaryResponse,
    AIInsightResponse,
)
from app.ai.services import create_accountability_feedback, create_content_generation, create_weekly_ai_summary, get_ai_history, get_ai_insights
from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User

router = APIRouter(prefix="/ai", tags=["ai"])


def _serialize_generation(generation) -> AIGenerationResponse:
    return AIGenerationResponse(
        id=generation.id,
        user_id=generation.user_id,
        workspace_id=generation.workspace_id,
        generation_type=generation.generation_type,
        prompt=generation.prompt,
        response_text=generation.response_text,
        model_name=generation.model_name,
        extra_metadata=generation.extra_metadata,
        created_at=generation.created_at,
        updated_at=generation.updated_at,
    )


@router.post("/content", response_model=AIGenerationResponse, status_code=status.HTTP_201_CREATED)
def generate_content(
    payload: AIContentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIGenerationResponse:
    generation = create_content_generation(db, current_user.id, payload)
    return _serialize_generation(generation)


@router.post("/feedback", response_model=AIFeedbackResponse)
def generate_feedback(
    payload: AIFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIFeedbackResponse:
    feedback = create_accountability_feedback(db, current_user.id, payload.workspace_id)
    return AIFeedbackResponse(**feedback)


@router.post("/weekly-summary", response_model=AIWeeklySummaryResponse)
def generate_weekly_summary(
    payload: AIWeeklySummaryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AIWeeklySummaryResponse:
    summary = create_weekly_ai_summary(db, current_user.id, payload.workspace_id)
    return AIWeeklySummaryResponse(**summary)


@router.get("/history", response_model=list[AIGenerationResponse])
def history(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AIGenerationResponse]:
    history = get_ai_history(db, current_user.id, workspace_id)
    return [_serialize_generation(h) for h in history]


@router.get("/insights", response_model=list[AIInsightResponse])
def insights(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[AIInsightResponse]:
    insights = get_ai_insights(db, current_user.id, workspace_id)
    return [AIInsightResponse(**i) for i in insights]
