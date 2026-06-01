from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.notifications.schemas import (
    NotificationCreateRequest,
    NotificationResponse,
    NotificationSummaryResponse,
    NotificationUpdateRequest,
)
from app.notifications.services import (
    create_notification,
    delete_notification,
    generate_daily_reminders,
    generate_inactivity_prompt,
    generate_missed_task_alerts,
    generate_weekly_summary_notification,
    get_notification_summary,
    list_notifications,
    mark_notification_read,
    update_notification,
)
from app.users.models import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _serialize_notification(notification) -> NotificationResponse:
    return NotificationResponse(
        id=notification.id,
        user_id=notification.user_id,
        workspace_id=notification.workspace_id,
        type=notification.type,
        title=notification.title,
        message=notification.message,
        scheduled_for=notification.scheduled_for,
        is_read=notification.is_read,
        extra_metadata=notification.extra_metadata,
        created_at=notification.created_at,
        updated_at=notification.updated_at,
    )


@router.get("", response_model=list[NotificationResponse])
def get_notifications(
    workspace_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[NotificationResponse]:
    notifications = list_notifications(db, current_user.id, workspace_id)
    return [_serialize_notification(notification) for notification in notifications]


@router.get("/summary", response_model=NotificationSummaryResponse)
def notification_summary(
    workspace_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationSummaryResponse:
    summary = get_notification_summary(db, current_user.id, workspace_id)
    return NotificationSummaryResponse(**summary)


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
def create_manual_notification(
    payload: NotificationCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationResponse:
    notification = create_notification(db, current_user.id, payload)
    return _serialize_notification(notification)


@router.patch("/{notification_id}", response_model=NotificationResponse)
def update_single_notification(
    notification_id: UUID,
    payload: NotificationUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationResponse:
    notification = update_notification(db, notification_id, current_user.id, payload)
    return _serialize_notification(notification)


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationResponse:
    notification = mark_notification_read(db, notification_id, current_user.id)
    return _serialize_notification(notification)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_notification(
    notification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    delete_notification(db, notification_id, current_user.id)


@router.post("/generate/daily-reminders", response_model=list[NotificationResponse])
def generate_daily_reminders_route(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[NotificationResponse]:
    notifications = generate_daily_reminders(db, current_user.id, workspace_id)
    return [_serialize_notification(notification) for notification in notifications]


@router.post("/generate/missed-task-alerts", response_model=list[NotificationResponse])
def generate_missed_task_alerts_route(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[NotificationResponse]:
    notifications = generate_missed_task_alerts(db, current_user.id, workspace_id)
    return [_serialize_notification(notification) for notification in notifications]


@router.post("/generate/weekly-summary", response_model=NotificationResponse | None)
def generate_weekly_summary_route(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationResponse | None:
    notification = generate_weekly_summary_notification(db, current_user.id, workspace_id)
    return _serialize_notification(notification) if notification else None


@router.post("/generate/inactivity-prompt", response_model=NotificationResponse | None)
def generate_inactivity_prompt_route(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationResponse | None:
    notification = generate_inactivity_prompt(db, current_user.id, workspace_id)
    return _serialize_notification(notification) if notification else None

