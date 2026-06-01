from datetime import UTC, date, datetime, time, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.checkins.models import CheckIn
from app.notifications.models import Notification
from app.notifications.schemas import NotificationCreateRequest, NotificationUpdateRequest
from app.outreach.models import OutreachLog
from app.tasks.models import Task
from app.workspaces.services import get_workspace


REMINDER_TYPES = {"daily_reminder", "missed_task_alert", "accountability_prompt", "weekly_summary", "inactivity_prompt"}


def _get_notification(db: Session, notification_id: UUID, owner_id: UUID) -> Notification:
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == owner_id)
        .first()
    )
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return notification


def list_notifications(db: Session, owner_id: UUID, workspace_id: UUID | None = None) -> list[Notification]:
    query = db.query(Notification).filter(Notification.user_id == owner_id)
    if workspace_id is not None:
        query = query.filter(Notification.workspace_id == workspace_id)
    return query.order_by(Notification.created_at.desc()).all()


def create_notification(db: Session, owner_id: UUID, payload: NotificationCreateRequest) -> Notification:
    notification = Notification(
        user_id=owner_id,
        workspace_id=payload.workspace_id,
        type=payload.type,
        title=payload.title,
        message=payload.message,
        scheduled_for=payload.scheduled_for,
        extra_metadata=payload.extra_metadata,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def update_notification(db: Session, notification_id: UUID, owner_id: UUID, payload: NotificationUpdateRequest) -> Notification:
    notification = _get_notification(db, notification_id, owner_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(notification, field, value)
    db.commit()
    db.refresh(notification)
    return notification


def mark_notification_read(db: Session, notification_id: UUID, owner_id: UUID) -> Notification:
    return update_notification(db, notification_id, owner_id, NotificationUpdateRequest(is_read=True))


def delete_notification(db: Session, notification_id: UUID, owner_id: UUID) -> None:
    notification = _get_notification(db, notification_id, owner_id)
    db.delete(notification)
    db.commit()


def _count_open_tasks(db: Session, workspace_id: UUID) -> int:
    return db.query(Task).filter(Task.workspace_id == workspace_id, Task.status != "done").count()


def _count_overdue_tasks(db: Session, workspace_id: UUID) -> int:
    return (
        db.query(Task)
        .filter(Task.workspace_id == workspace_id, Task.status != "done", Task.is_overdue.is_(True))
        .count()
    )


def _count_recent_check_ins(db: Session, workspace_id: UUID) -> int:
    seven_days_ago = date.today() - timedelta(days=6)
    return db.query(CheckIn).filter(CheckIn.workspace_id == workspace_id, CheckIn.check_in_date >= seven_days_ago).count()


def _count_recent_outreach(db: Session, workspace_id: UUID) -> int:
    seven_days_ago = datetime.combine(date.today() - timedelta(days=6), time.min, tzinfo=UTC)
    return (
        db.query(OutreachLog)
        .filter(OutreachLog.workspace_id == workspace_id, OutreachLog.created_at >= seven_days_ago)
        .count()
    )


def generate_daily_reminders(db: Session, owner_id: UUID, workspace_id: UUID) -> list[Notification]:
    workspace = get_workspace(db, workspace_id, owner_id)
    notifications: list[Notification] = []

    open_tasks = _count_open_tasks(db, workspace_id)
    if open_tasks:
        notifications.append(
            create_notification(
                db,
                owner_id,
                NotificationCreateRequest(
                    workspace_id=workspace_id,
                    type="daily_reminder",
                    title=f"Daily reminder for {workspace.name}",
                    message=f"You have {open_tasks} open tasks waiting today.",
                    extra_metadata={"open_tasks": open_tasks},
                ),
            )
        )

    recent_check_ins = _count_recent_check_ins(db, workspace_id)
    if recent_check_ins == 0:
        notifications.append(
            create_notification(
                db,
                owner_id,
                NotificationCreateRequest(
                    workspace_id=workspace_id,
                    type="accountability_prompt",
                    title=f"Accountability prompt for {workspace.name}",
                    message="You have not completed a check-in in the last 7 days.",
                    extra_metadata={"recent_check_ins": recent_check_ins},
                ),
            )
        )

    return notifications


def generate_missed_task_alerts(db: Session, owner_id: UUID, workspace_id: UUID) -> list[Notification]:
    workspace = get_workspace(db, workspace_id, owner_id)
    overdue_tasks = _count_overdue_tasks(db, workspace_id)
    notifications: list[Notification] = []

    if overdue_tasks:
        notifications.append(
            create_notification(
                db,
                owner_id,
                NotificationCreateRequest(
                    workspace_id=workspace_id,
                    type="missed_task_alert",
                    title=f"Overdue tasks in {workspace.name}",
                    message=f"{overdue_tasks} task(s) are overdue and need attention.",
                    extra_metadata={"overdue_tasks": overdue_tasks},
                ),
            )
        )
    return notifications


def generate_weekly_summary_notification(db: Session, owner_id: UUID, workspace_id: UUID) -> Notification | None:
    workspace = get_workspace(db, workspace_id, owner_id)
    recent_check_ins = _count_recent_check_ins(db, workspace_id)
    recent_outreach = _count_recent_outreach(db, workspace_id)
    open_tasks = _count_open_tasks(db, workspace_id)

    if recent_check_ins == 0 and recent_outreach == 0 and open_tasks == 0:
        return None

    return create_notification(
        db,
        owner_id,
        NotificationCreateRequest(
            workspace_id=workspace_id,
            type="weekly_summary",
            title=f"Weekly summary for {workspace.name}",
            message=(
                f"This week: {recent_check_ins} check-ins, {recent_outreach} outreach activities, "
                f"and {open_tasks} open tasks."
            ),
            extra_metadata={
                "recent_check_ins": recent_check_ins,
                "recent_outreach": recent_outreach,
                "open_tasks": open_tasks,
            },
        ),
    )


def generate_inactivity_prompt(db: Session, owner_id: UUID, workspace_id: UUID) -> Notification | None:
    workspace = get_workspace(db, workspace_id, owner_id)
    recent_check_ins = _count_recent_check_ins(db, workspace_id)
    recent_outreach = _count_recent_outreach(db, workspace_id)

    if recent_check_ins > 0 or recent_outreach > 0:
        return None

    return create_notification(
        db,
        owner_id,
        NotificationCreateRequest(
            workspace_id=workspace_id,
            type="inactivity_prompt",
            title=f"Come back to {workspace.name}",
            message="No recent activity was detected in this workspace.",
            extra_metadata={"recent_check_ins": recent_check_ins, "recent_outreach": recent_outreach},
        ),
    )


def get_notification_summary(db: Session, owner_id: UUID, workspace_id: UUID | None = None) -> dict[str, int]:
    query = db.query(Notification).filter(Notification.user_id == owner_id)
    if workspace_id is not None:
        query = query.filter(Notification.workspace_id == workspace_id)

    notifications = query.all()
    unread_notifications = [notification for notification in notifications if not notification.is_read]
    unread_reminders = [notification for notification in unread_notifications if notification.type in REMINDER_TYPES]
    unread_alerts = [notification for notification in unread_notifications if notification.type not in REMINDER_TYPES]

    return {
        "total_notifications": len(notifications),
        "unread_notifications": len(unread_notifications),
        "unread_reminders": len(unread_reminders),
        "unread_alerts": len(unread_alerts),
    }
