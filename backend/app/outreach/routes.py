from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.outreach.schemas import (
    FollowUpReminderResponse,
    OutreachCreateRequest,
    OutreachResponse,
    OutreachUpdateRequest,
)
from app.outreach.services import (
    create_outreach_log,
    delete_outreach_log,
    get_follow_up_reminders,
    list_outreach_logs,
    mark_follow_up_needed,
    update_outreach_log,
)
from app.users.models import User

router = APIRouter(prefix="/outreach", tags=["outreach"])


def _serialize_outreach_log(outreach_log) -> OutreachResponse:
    return OutreachResponse(
        id=outreach_log.id,
        workspace_id=outreach_log.workspace_id,
        contact_name=outreach_log.contact_name,
        contact_company=outreach_log.contact_company,
        contact_channel=outreach_log.contact_channel,
        status=outreach_log.status,
        follow_up_date=outreach_log.follow_up_date,
        notes=outreach_log.notes,
        extra_metadata=outreach_log.extra_metadata,
        created_at=outreach_log.created_at,
        updated_at=outreach_log.updated_at,
    )


@router.get("", response_model=list[OutreachResponse])
def get_outreach_logs(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[OutreachResponse]:
    outreach_logs = list_outreach_logs(db, workspace_id, current_user.id)
    return [_serialize_outreach_log(outreach_log) for outreach_log in outreach_logs]


@router.post("", response_model=OutreachResponse, status_code=status.HTTP_201_CREATED)
def create_new_outreach_log(
    payload: OutreachCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OutreachResponse:
    outreach_log = create_outreach_log(db, current_user.id, payload)
    return _serialize_outreach_log(outreach_log)


@router.patch("/{outreach_id}", response_model=OutreachResponse)
def update_single_outreach_log(
    outreach_id: UUID,
    payload: OutreachUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OutreachResponse:
    outreach_log = update_outreach_log(db, outreach_id, current_user.id, payload)
    return _serialize_outreach_log(outreach_log)


@router.post("/{outreach_id}/follow-up", response_model=OutreachResponse)
def request_follow_up(
    outreach_id: UUID,
    follow_up_date: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OutreachResponse:
    outreach_log = mark_follow_up_needed(db, outreach_id, current_user.id, follow_up_date)
    return _serialize_outreach_log(outreach_log)


@router.delete("/{outreach_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_outreach_log(
    outreach_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    delete_outreach_log(db, outreach_id, current_user.id)


@router.get("/follow-up-reminders", response_model=FollowUpReminderResponse)
def follow_up_reminders(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FollowUpReminderResponse:
    reminder = get_follow_up_reminders(db, workspace_id, current_user.id)
    return FollowUpReminderResponse(**reminder)
