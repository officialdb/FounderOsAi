from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.checkins.schemas import CheckInCreateRequest, CheckInResponse, WeeklySummaryResponse, StreakResponse
from app.checkins.services import create_check_in, get_weekly_summary, get_check_ins
from app.database.session import get_db
from app.users.models import User

router = APIRouter(prefix="/checkins", tags=["checkins"])


def _serialize_check_in(check_in) -> CheckInResponse:
    return CheckInResponse(
        id=check_in.id,
        workspace_id=check_in.workspace_id,
        check_in_date=check_in.check_in_date,
        mood=check_in.mood,
        wins=check_in.wins,
        blockers=check_in.blockers,
        score=check_in.score,
        extra_metadata=check_in.extra_metadata,
        created_at=check_in.created_at,
        updated_at=check_in.updated_at,
    )


@router.post("", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
def submit_check_in(
    payload: CheckInCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CheckInResponse:
    check_in = create_check_in(db, current_user.id, payload)
    return _serialize_check_in(check_in)


@router.get("/weekly-summary", response_model=WeeklySummaryResponse)
def weekly_summary(
    workspace_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WeeklySummaryResponse:
    summary = get_weekly_summary(db, current_user.id, workspace_id)
    return WeeklySummaryResponse(**summary)

@router.get("", response_model=list[CheckInResponse])
def get_check_ins_route(
    workspace_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CheckInResponse]:
    check_ins = get_check_ins(db, current_user.id, workspace_id)
    return [_serialize_check_in(c) for c in check_ins]

@router.get("/streak", response_model=StreakResponse)
def get_streak_route(
    workspace_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StreakResponse:
    summary = get_weekly_summary(db, current_user.id, workspace_id)
    return StreakResponse(
        current_streak=summary["current_streak"],
        longest_streak=summary["longest_streak"],
    )
