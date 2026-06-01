from datetime import date, timedelta
from uuid import uuid4

from fastapi import HTTPException

import app.outreach.services as outreach_services
from app.outreach.schemas import OutreachCreateRequest, OutreachUpdateRequest
from app.outreach.services import (
    create_outreach_log,
    delete_outreach_log,
    get_follow_up_reminders,
    list_outreach_logs,
    mark_follow_up_needed,
    update_outreach_log,
)


class FakeWorkspace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeOutreachLog:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeQuery:
    def __init__(self, session):
        self.session = session
        self.kind = None

    def join(self, *_args, **_kwargs):
        return self

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def all(self):
        return list(self.session.outreach_list_result)

    def first(self):
        return self.session.outreach_lookup_result

    def count(self):
        return self.session.count_result


class FakeSession:
    def __init__(self):
        self.added = None
        self.deleted = None
        self.committed = False
        self.refreshed = None
        self.outreach_list_result = []
        self.outreach_lookup_result = None
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


def test_list_outreach_logs_returns_workspace_items() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.outreach_list_result = [
        FakeOutreachLog(
            id=uuid4(),
            workspace_id=workspace_id,
            contact_name="Ada",
            contact_company="Acme",
            contact_channel="email",
            status="pending",
            follow_up_date=None,
            notes=None,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        )
    ]

    original_get_workspace = outreach_services.get_workspace
    outreach_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        logs = list_outreach_logs(session, workspace_id, owner_id)
    finally:
        outreach_services.get_workspace = original_get_workspace

    assert len(logs) == 1
    assert logs[0].contact_name == "Ada"


def test_create_outreach_log_persists_record() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    payload = OutreachCreateRequest(
        workspace_id=workspace_id,
        contact_name="Grace",
        contact_company="Studio",
        contact_channel="linkedin",
        status="pending",
        follow_up_date=date.today() + timedelta(days=2),
        notes="Initial intro",
    )

    original_get_workspace = outreach_services.get_workspace
    outreach_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        outreach_log = create_outreach_log(session, owner_id, payload)
    finally:
        outreach_services.get_workspace = original_get_workspace

    assert session.added is outreach_log
    assert session.committed is True
    assert outreach_log.workspace_id == workspace_id


def test_update_outreach_log_applies_changes() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    outreach_log = FakeOutreachLog(
        id=uuid4(),
        workspace_id=workspace_id,
        contact_name="Old",
        contact_company=None,
        contact_channel="email",
        status="pending",
        follow_up_date=None,
        notes=None,
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )
    session.outreach_lookup_result = outreach_log

    result = update_outreach_log(session, outreach_log.id, owner_id, OutreachUpdateRequest(contact_name="New", status="responded"))

    assert result.contact_name == "New"
    assert result.status == "responded"


def test_delete_outreach_log_removes_record() -> None:
    session = FakeSession()
    owner_id = uuid4()
    outreach_log = FakeOutreachLog(id=uuid4(), workspace_id=uuid4())
    session.outreach_lookup_result = outreach_log

    delete_outreach_log(session, outreach_log.id, owner_id)

    assert session.deleted is outreach_log
    assert session.committed is True


def test_mark_follow_up_needed_sets_follow_up_state() -> None:
    session = FakeSession()
    owner_id = uuid4()
    outreach_log = FakeOutreachLog(
        id=uuid4(),
        workspace_id=uuid4(),
        status="contacted",
        follow_up_date=None,
    )
    session.outreach_lookup_result = outreach_log

    result = mark_follow_up_needed(session, outreach_log.id, owner_id, None)

    assert result.status == "follow_up"
    assert result.follow_up_date is not None


def test_get_follow_up_reminders_returns_counts() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.count_result = 2

    original_get_workspace = outreach_services.get_workspace
    outreach_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        reminder = get_follow_up_reminders(session, workspace_id, owner_id)
    finally:
        outreach_services.get_workspace = original_get_workspace

    assert reminder["workspace_id"] == workspace_id
    assert reminder["overdue_follow_ups"] == 2


def test_get_outreach_log_raises_when_missing() -> None:
    session = FakeSession()
    session.outreach_lookup_result = None

    try:
        update_outreach_log(session, uuid4(), uuid4(), OutreachUpdateRequest(contact_name="Test"))
        raise AssertionError("Expected an exception")
    except HTTPException as exc:
        assert exc.status_code == 404
