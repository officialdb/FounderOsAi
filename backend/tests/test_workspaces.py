from uuid import UUID, uuid4

from fastapi import HTTPException

from app.workspaces.schemas import WorkspaceCreateRequest, WorkspaceUpdateRequest
from app.workspaces.services import create_workspace, get_workspace, list_workspaces, update_workspace


class FakeWorkspace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class FakeQuery:
    def __init__(self, session):
        self.session = session

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def all(self):
        return list(self.session.workspace_list_result)

    def first(self):
        return self.session.workspace_lookup_result


class FakeSession:
    def __init__(self):
        self.added = None
        self.committed = False
        self.refreshed = None
        self.workspace_list_result = []
        self.workspace_lookup_result = None

    def query(self, *_args, **_kwargs):
        return FakeQuery(self)

    def add(self, workspace):
        self.added = workspace

    def commit(self):
        self.committed = True

    def refresh(self, workspace):
        self.refreshed = workspace


def test_list_workspaces_returns_owned_items() -> None:
    session = FakeSession()
    owner_id = uuid4()
    session.workspace_list_result = [
        FakeWorkspace(id=uuid4(), owner_id=owner_id, name="Techpronnet", description=None, color=None, status="active", extra_metadata={}, created_at=None, updated_at=None)
    ]

    result = list_workspaces(session, owner_id)

    assert len(result) == 1
    assert result[0].name == "Techpronnet"


def test_create_workspace_persists_new_workspace() -> None:
    session = FakeSession()
    owner_id = uuid4()
    payload = WorkspaceCreateRequest(name="Zidi Clinic", description="Health venture", color="#00AAFF")

    workspace = create_workspace(session, owner_id, payload)

    assert session.added is workspace
    assert session.committed is True
    assert session.refreshed is workspace
    assert workspace.owner_id == owner_id
    assert workspace.name == "Zidi Clinic"


def test_get_workspace_raises_when_missing() -> None:
    session = FakeSession()
    session.workspace_lookup_result = None

    try:
        get_workspace(session, uuid4(), uuid4())
        raise AssertionError("Expected an exception")
    except HTTPException as exc:
        assert getattr(exc, "status_code", None) == 404


def test_update_workspace_applies_changes() -> None:
    session = FakeSession()
    owner_id = uuid4()
    workspace = FakeWorkspace(
        id=uuid4(),
        owner_id=owner_id,
        name="Old",
        description=None,
        color=None,
        status="active",
        extra_metadata={},
        created_at=None,
        updated_at=None,
    )
    session.workspace_lookup_result = workspace

    result = update_workspace(
        session,
        workspace.id,
        owner_id,
        WorkspaceUpdateRequest(name="New Name", status="archived"),
    )

    assert result.name == "New Name"
    assert result.status == "archived"
    assert session.committed is True
