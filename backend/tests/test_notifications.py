from datetime import date, datetime, timedelta
from uuid import uuid4

from fastapi import HTTPException

import app.notifications.services as notification_services
from app.notifications.schemas import NotificationCreateRequest, NotificationUpdateRequest
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


class FakeWorkspace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeNotification:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeTask:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeCheckIn:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeOutreachLog:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeQuery:
    def __init__(self, session, kind=None):
        self.session = session
        self.kind = kind

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def count(self):
        return self.session.count_result

    def all(self):
        return list(self.session.notification_list_result)

    def first(self):
        return self.session.notification_lookup_result


class FakeSession:
    def __init__(self):
        self.added = None
        self.deleted = None
        self.committed = False
        self.refreshed = None
        self.notification_list_result = []
        self.notification_lookup_result = None
        self.count_result = 0

    def query(self, *_args, **_kwargs):
        return FakeQuery(self)

    def add(self, item):
        self.added = item

    def delete(self, item):
        self.deleted = item

    def commit(self):
        self.committed = True

    def refresh(self, item):
        self.refreshed = item


def test_list_notifications_returns_user_items() -> None:
    session = FakeSession()
    owner_id = uuid4()
    session.notification_list_result = [
        FakeNotification(
            id=uuid4(),
            user_id=owner_id,
            workspace_id=None,
            type="daily_reminder",
            title="Reminder",
            message="Keep going",
            scheduled_for=None,
            is_read=False,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        )
    ]

    notifications = list_notifications(session, owner_id)

    assert len(notifications) == 1
    assert notifications[0].title == "Reminder"


def test_create_notification_persists_record() -> None:
    session = FakeSession()
    owner_id = uuid4()
    payload = NotificationCreateRequest(
        workspace_id=None,
        type="weekly_summary",
        title="Weekly summary",
        message="Summary ready",
    )

    notification = create_notification(session, owner_id, payload)

    assert session.added is notification
    assert session.committed is True
    assert notification.user_id == owner_id


def test_create_notification_validates_workspace_ownership() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    payload = NotificationCreateRequest(
        workspace_id=workspace_id,
        type="weekly_summary",
        title="Weekly summary",
        message="Summary ready",
    )

    original_get_workspace = notification_services.get_workspace
    notification_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        notification = create_notification(session, owner_id, payload)
    finally:
        notification_services.get_workspace = original_get_workspace

    assert notification.workspace_id == workspace_id


def test_update_notification_applies_changes() -> None:
    session = FakeSession()
    owner_id = uuid4()
    notification = FakeNotification(
        id=uuid4(),
        user_id=owner_id,
        workspace_id=None,
        type="daily_reminder",
        title="Reminder",
        message="Keep going",
        scheduled_for=None,
        is_read=False,
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )
    session.notification_lookup_result = notification

    result = update_notification(session, notification.id, owner_id, NotificationUpdateRequest(is_read=True))

    assert result.is_read is True


def test_update_notification_schema_does_not_accept_scheduled_for() -> None:
    assert "scheduled_for" not in NotificationUpdateRequest.model_fields


def test_mark_notification_read_marks_item_read() -> None:
    session = FakeSession()
    owner_id = uuid4()
    notification = FakeNotification(
        id=uuid4(),
        user_id=owner_id,
        workspace_id=None,
        type="daily_reminder",
        title="Reminder",
        message="Keep going",
        scheduled_for=None,
        is_read=False,
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )
    session.notification_lookup_result = notification

    result = mark_notification_read(session, notification.id, owner_id)

    assert result.is_read is True


def test_delete_notification_removes_record() -> None:
    session = FakeSession()
    owner_id = uuid4()
    notification = FakeNotification(id=uuid4(), user_id=owner_id)
    session.notification_lookup_result = notification

    delete_notification(session, notification.id, owner_id)

    assert session.deleted is notification
    assert session.committed is True


def test_generate_daily_reminders_creates_notifications() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.count_result = 0

    original_get_workspace = notification_services.get_workspace
    notification_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Techpronnet")
    try:
        notifications = generate_daily_reminders(session, owner_id, workspace_id)
    finally:
        notification_services.get_workspace = original_get_workspace

    assert len(notifications) == 1
    assert notifications[0].type == "accountability_prompt"


def test_generate_missed_task_alerts_creates_notification() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.count_result = 2

    original_get_workspace = notification_services.get_workspace
    notification_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Zidi Clinic")
    try:
        notifications = generate_missed_task_alerts(session, owner_id, workspace_id)
    finally:
        notification_services.get_workspace = original_get_workspace

    assert len(notifications) == 1
    assert notifications[0].type == "missed_task_alert"


def test_generate_weekly_summary_notification_returns_notification() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.count_result = 1

    original_get_workspace = notification_services.get_workspace
    notification_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Techpronnet")
    try:
        notification = generate_weekly_summary_notification(session, owner_id, workspace_id)
    finally:
        notification_services.get_workspace = original_get_workspace

    assert notification is not None
    assert notification.type == "weekly_summary"


def test_generate_inactivity_prompt_returns_none_when_activity_exists() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.count_result = 1

    original_get_workspace = notification_services.get_workspace
    notification_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Techpronnet")
    try:
        notification = generate_inactivity_prompt(session, owner_id, workspace_id)
    finally:
        notification_services.get_workspace = original_get_workspace

    assert notification is None


def test_get_notification_summary_counts_types() -> None:
    session = FakeSession()
    owner_id = uuid4()
    session.notification_list_result = [
        FakeNotification(type="daily_reminder", is_read=False),
        FakeNotification(type="weekly_summary", is_read=False),
        FakeNotification(type="weekly_summary", is_read=True),
    ]

    summary = get_notification_summary(session, owner_id)

    assert summary["total_notifications"] == 3
    assert summary["unread_notifications"] == 2
    assert summary["unread_reminders"] == 2
    assert summary["unread_alerts"] == 0


def test_update_notification_raises_when_missing() -> None:
    session = FakeSession()
    session.notification_lookup_result = None

    try:
        update_notification(session, uuid4(), uuid4(), NotificationUpdateRequest(is_read=True))
        raise AssertionError("Expected an exception")
    except HTTPException as exc:
        assert exc.status_code == 404
