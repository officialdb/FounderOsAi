from datetime import date, timedelta
from uuid import uuid4

from fastapi import HTTPException

import app.tasks.services as task_services
from app.tasks.schemas import TaskCreateRequest, TaskUpdateRequest
from app.tasks.services import complete_task, create_task, get_task, list_tasks, update_task


class FakeWorkspace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeTask:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeQuery:
    def __init__(self, session):
        self.session = session

    def join(self, *_args, **_kwargs):
        return self

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def all(self):
        return list(self.session.task_list_result)

    def first(self):
        return self.session.task_lookup_result


class FakeSession:
    def __init__(self):
        self.added = None
        self.committed = False
        self.refreshed = None
        self.task_list_result = []
        self.task_lookup_result = None

    def query(self, *_args, **_kwargs):
        return FakeQuery(self)

    def add(self, task):
        self.added = task

    def commit(self):
        self.committed = True

    def refresh(self, task):
        self.refreshed = task


def test_list_tasks_marks_overdue_items() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.task_list_result = [
        FakeTask(
            id=uuid4(),
            workspace_id=workspace_id,
            title="Ship MVP",
            description=None,
            priority=2,
            status="todo",
            due_date=date.today() - timedelta(days=1),
            completed_at=None,
            is_overdue=False,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        )
    ]

    original_get_workspace = task_services.get_workspace
    task_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        tasks = list_tasks(session, workspace_id, owner_id)
    finally:
        task_services.get_workspace = original_get_workspace

    assert tasks[0].is_overdue is True


def test_create_task_sets_defaults() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    payload = TaskCreateRequest(
        workspace_id=workspace_id,
        title="Build landing page",
        description="Create first version",
        priority=3,
        due_date=date.today(),
    )

    original_get_workspace = task_services.get_workspace
    task_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        task = create_task(session, owner_id, payload)
    finally:
        task_services.get_workspace = original_get_workspace

    assert session.added is task
    assert session.committed is True
    assert task.workspace_id == workspace_id
    assert task.status == "todo"


def test_get_task_raises_when_missing() -> None:
    session = FakeSession()
    session.task_lookup_result = None

    try:
        get_task(session, uuid4(), uuid4())
        raise AssertionError("Expected an exception")
    except HTTPException as exc:
        assert exc.status_code == 404


def test_update_task_applies_changes() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    task = FakeTask(
        id=uuid4(),
        workspace_id=workspace_id,
        title="Old",
        description=None,
        priority=2,
        status="todo",
        due_date=None,
        completed_at=None,
        is_overdue=False,
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )
    session.task_lookup_result = task

    original_get_task = task_services.get_task
    task_services.get_task = lambda *_args, **_kwargs: task
    try:
        result = update_task(session, task.id, owner_id, TaskUpdateRequest(title="New", status="in_progress"))
    finally:
        task_services.get_task = original_get_task

    assert result.title == "New"
    assert result.status == "in_progress"


def test_complete_task_marks_done() -> None:
    session = FakeSession()
    owner_id = uuid4()
    task = FakeTask(
        id=uuid4(),
        workspace_id=uuid4(),
        title="Done soon",
        description=None,
        priority=2,
        status="todo",
        due_date=None,
        completed_at=None,
        is_overdue=True,
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )

    original_get_task = task_services.get_task
    task_services.get_task = lambda *_args, **_kwargs: task
    try:
        result = complete_task(session, task.id, owner_id)
    finally:
        task_services.get_task = original_get_task

    assert result.status == "done"
    assert result.is_overdue is False
    assert result.completed_at is not None
