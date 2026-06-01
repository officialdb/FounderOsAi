from datetime import UTC, date, datetime, timedelta
from uuid import uuid4

import app.ai.services as ai_services
from app.ai.schemas import AIContentRequest
from app.ai.services import create_accountability_feedback, create_content_generation, create_weekly_ai_summary


class FakeWorkspace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeTask:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeQuery:
    def __init__(self, session):
        self.session = session

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def all(self):
        return list(self.session.task_list_result)


class FakeSession:
    def __init__(self):
        self.added = None
        self.committed = False
        self.refreshed = None
        self.task_list_result = []

    def query(self, *_args, **_kwargs):
        return FakeQuery(self)

    def add(self, item):
        self.added = item

    def commit(self):
        self.committed = True

    def refresh(self, item):
        self.refreshed = item


def test_create_content_generation_stores_generation() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.task_list_result = [
        FakeTask(
            id=uuid4(),
            title="Launch landing page",
            status="todo",
            is_overdue=False,
            created_at=datetime.now(UTC),
        )
    ]

    original_get_workspace = ai_services.get_workspace
    ai_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Techpronnet")
    try:
        generation = create_content_generation(
            session,
            owner_id,
            AIContentRequest(workspace_id=workspace_id, topic="Founder execution", content_type="post", tone="direct"),
        )
    finally:
        ai_services.get_workspace = original_get_workspace

    assert generation.generation_type == "content"
    assert session.committed is True
    assert "Founder execution" in generation.prompt
    assert generation.response_text is not None


def test_create_accountability_feedback_returns_actions() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()

    original_get_workspace = ai_services.get_workspace
    original_weekly_summary = ai_services.get_weekly_summary
    ai_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Zidi Clinic")
    ai_services.get_weekly_summary = lambda *_args, **_kwargs: {
        "workspace_id": workspace_id,
        "period_start": date.today(),
        "period_end": date.today(),
        "total_check_ins": 3,
        "average_score": 75.0,
        "current_streak": 2,
        "best_score": 90,
        "missed_days": 0,
    }
    try:
        feedback = create_accountability_feedback(session, owner_id, workspace_id)
    finally:
        ai_services.get_workspace = original_get_workspace
        ai_services.get_weekly_summary = original_weekly_summary

    assert feedback["workspace_id"] == workspace_id
    assert feedback["strengths"]
    assert feedback["next_actions"]


def test_create_weekly_ai_summary_persists_generation() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.task_list_result = [
        FakeTask(id=uuid4(), title="Follow up leads", status="todo", is_overdue=True, created_at=datetime.now(UTC))
    ]

    original_get_workspace = ai_services.get_workspace
    original_weekly_summary = ai_services.get_weekly_summary
    ai_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, name="Techpronnet")
    ai_services.get_weekly_summary = lambda *_args, **_kwargs: {
        "workspace_id": workspace_id,
        "period_start": date.today() - timedelta(days=6),
        "period_end": date.today(),
        "total_check_ins": 5,
        "average_score": 82.0,
        "current_streak": 4,
        "best_score": 95,
        "missed_days": 1,
    }
    try:
        summary = create_weekly_ai_summary(session, owner_id, workspace_id)
    finally:
        ai_services.get_workspace = original_get_workspace
        ai_services.get_weekly_summary = original_weekly_summary

    assert summary["summary"]
    assert session.committed is True
    assert session.added.generation_type == "weekly_summary"
