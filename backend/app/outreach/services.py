from datetime import date, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.outreach.models import OutreachLog
from app.outreach.schemas import OutreachCreateRequest, OutreachUpdateRequest
from app.workspaces.models import Workspace
from app.workspaces.services import get_workspace


ACTIVE_FOLLOW_UP_STATUSES = {"pending", "contacted", "follow_up", "responded"}


def _get_outreach_log(db: Session, outreach_id: UUID, owner_id: UUID) -> OutreachLog:
    log = (
        db.query(OutreachLog)
        .join(Workspace, Workspace.id == OutreachLog.workspace_id)
        .filter(OutreachLog.id == outreach_id, Workspace.owner_id == owner_id)
        .first()
    )
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Outreach log not found")
    return log


def list_outreach_logs(db: Session, workspace_id: UUID, owner_id: UUID) -> list[OutreachLog]:
    get_workspace(db, workspace_id, owner_id)
    return (
        db.query(OutreachLog)
        .filter(OutreachLog.workspace_id == workspace_id)
        .order_by(OutreachLog.created_at.desc())
        .all()
    )


def create_outreach_log(db: Session, owner_id: UUID, payload: OutreachCreateRequest) -> OutreachLog:
    get_workspace(db, payload.workspace_id, owner_id)
    outreach_log = OutreachLog(
        workspace_id=payload.workspace_id,
        contact_name=payload.contact_name,
        contact_company=payload.contact_company,
        contact_channel=payload.contact_channel,
        status=payload.status,
        follow_up_date=payload.follow_up_date,
        notes=payload.notes,
        extra_metadata={},
    )
    db.add(outreach_log)
    db.commit()
    db.refresh(outreach_log)
    return outreach_log


def update_outreach_log(db: Session, outreach_id: UUID, owner_id: UUID, payload: OutreachUpdateRequest) -> OutreachLog:
    outreach_log = _get_outreach_log(db, outreach_id, owner_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(outreach_log, field, value)
    db.commit()
    db.refresh(outreach_log)
    return outreach_log


def delete_outreach_log(db: Session, outreach_id: UUID, owner_id: UUID) -> None:
    outreach_log = _get_outreach_log(db, outreach_id, owner_id)
    db.delete(outreach_log)
    db.commit()


def get_follow_up_reminders(db: Session, workspace_id: UUID, owner_id: UUID) -> dict[str, object]:
    get_workspace(db, workspace_id, owner_id)
    today = date.today()
    due_follow_ups = (
        db.query(OutreachLog)
        .filter(
            OutreachLog.workspace_id == workspace_id,
            OutreachLog.status.in_(ACTIVE_FOLLOW_UP_STATUSES),
            OutreachLog.follow_up_date == today,
        )
        .count()
    )
    overdue_follow_ups = (
        db.query(OutreachLog)
        .filter(
            OutreachLog.workspace_id == workspace_id,
            OutreachLog.status.in_(ACTIVE_FOLLOW_UP_STATUSES),
            OutreachLog.follow_up_date.isnot(None),
            OutreachLog.follow_up_date < today,
        )
        .count()
    )
    return {
        "workspace_id": workspace_id,
        "reminder_date": today,
        "due_follow_ups": due_follow_ups,
        "overdue_follow_ups": overdue_follow_ups,
    }


def mark_follow_up_needed(db: Session, outreach_id: UUID, owner_id: UUID, follow_up_date: date | None) -> OutreachLog:
    outreach_log = _get_outreach_log(db, outreach_id, owner_id)
    outreach_log.status = "follow_up"
    outreach_log.follow_up_date = follow_up_date or (date.today() + timedelta(days=2))
    db.commit()
    db.refresh(outreach_log)
    return outreach_log
