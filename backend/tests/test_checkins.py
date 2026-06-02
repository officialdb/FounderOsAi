from datetime import date, timedelta
from uuid import uuid4

from fastapi import HTTPException

import app.checkins.services as checkin_services
from app.checkins.schemas import CheckInCreateRequest
from app.checkins.services import calculate_score, create_check_in, get_weekly_summary


class FakeWorkspace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeCheckIn:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeQuery:
    def __init__(self, session):
        self.session = session

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def first(self):
        return self.session.checkin_lookup_result

    def all(self):
        return list(self.session.checkin_list_result)


class FakeSession:
    def __init__(self):
        self.added = None
        self.committed = False
        self.refreshed = None
        self.checkin_lookup_result = None
        self.checkin_list_result = []

    def query(self, *_args, **_kwargs):
        return FakeQuery(self)

    def add(self, item):
        self.added = item

    def commit(self):
        self.committed = True

    def refresh(self, item):
        self.refreshed = item


def test_get_weekly_summary_returns_longest_streak_from_full_history() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    weekly_history = [
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today(),
            mood="good",
            wins="Done",
            blockers=None,
            score=80,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        )
    ]
    all_history = weekly_history + [
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today() - timedelta(days=8),
            mood="good",
            wins="Done",
            blockers=None,
            score=70,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today() - timedelta(days=9),
            mood="good",
            wins="Done",
            blockers=None,
            score=72,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today() - timedelta(days=10),
            mood="good",
            wins="Done",
            blockers=None,
            score=74,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
    ]
    session.checkin_list_result = weekly_history

    original_get_workspace = checkin_services.get_workspace
    original_get_all_check_ins = checkin_services._get_all_check_ins
    checkin_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    checkin_services._get_all_check_ins = lambda *_args, **_kwargs: all_history
    try:
        summary = get_weekly_summary(session, owner_id, workspace_id)
    finally:
        checkin_services.get_workspace = original_get_workspace
        checkin_services._get_all_check_ins = original_get_all_check_ins

    assert summary["current_streak"] == 1
    assert summary["longest_streak"] == 3


def test_calculate_score_bounds_value() -> None:
    score = calculate_score(
        focus_level=5,
        completed_priorities=10,
        wins="big progress",
        blockers=None,
        mood="good",
    )

    assert score == 100


def test_create_check_in_updates_existing_record() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    existing = FakeCheckIn(
        id=uuid4(),
        workspace_id=workspace_id,
        check_in_date=date.today(),
        mood="fine",
        wins="",
        blockers="",
        score=10,
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )
    session.checkin_lookup_result = existing

    original_get_workspace = checkin_services.get_workspace
    checkin_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        result = create_check_in(
            session,
            owner_id,
            CheckInCreateRequest(
                workspace_id=workspace_id,
                mood="focused",
                wins="Completed priorities",
                blockers=None,
                completed_priorities=3,
                focus_level=4,
            ),
        )
    finally:
        checkin_services.get_workspace = original_get_workspace

    assert result is existing
    assert result.score > 10
    assert session.committed is True


def test_get_weekly_summary_returns_metrics() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.checkin_list_result = [
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today(),
            mood="good",
            wins="Done",
            blockers=None,
            score=80,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today() - timedelta(days=1),
            mood="good",
            wins="Done",
            blockers=None,
            score=70,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
    ]

    original_get_workspace = checkin_services.get_workspace
    checkin_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        summary = get_weekly_summary(session, owner_id, workspace_id)
    finally:
        checkin_services.get_workspace = original_get_workspace

    assert summary["total_check_ins"] == 2
    assert summary["best_score"] == 80
    assert summary["current_streak"] == 2
    assert summary["longest_streak"] == 2


def test_get_weekly_summary_counts_current_streak_from_latest_check_in() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace_id = uuid4()
    session.checkin_list_result = [
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today() - timedelta(days=1),
            mood="good",
            wins="Done",
            blockers=None,
            score=80,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
        FakeCheckIn(
            id=uuid4(),
            workspace_id=workspace_id,
            check_in_date=date.today() - timedelta(days=2),
            mood="good",
            wins="Done",
            blockers=None,
            score=70,
            extra_metadata={},
            created_at=None,
            updated_at=None,
        ),
    ]

    original_get_workspace = checkin_services.get_workspace
    checkin_services.get_workspace = lambda *_args, **_kwargs: FakeWorkspace(id=workspace_id, owner_id=owner_id)
    try:
        summary = get_weekly_summary(session, owner_id, workspace_id)
    finally:
        checkin_services.get_workspace = original_get_workspace

    assert summary["current_streak"] == 2
    assert summary["longest_streak"] == 2


def test_get_weekly_summary_raises_for_missing_workspace() -> None:
    session = FakeSession()
    session.checkin_list_result = []

    original_get_workspace = checkin_services.get_workspace
    try:
        checkin_services.get_workspace = lambda *_args, **_kwargs: (_ for _ in ()).throw(
            HTTPException(status_code=404, detail="Workspace not found")
        )
        get_weekly_summary(session, uuid4(), uuid4())
        raise AssertionError("Expected an exception")
    except HTTPException as exc:
        assert exc.status_code == 404
    finally:
        checkin_services.get_workspace = original_get_workspace
