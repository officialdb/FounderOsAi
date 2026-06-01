from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.users.models import User
from app.workspaces.schemas import (
    WorkspaceCreateRequest,
    WorkspaceResponse,
    WorkspaceUpdateRequest,
)
from app.workspaces.services import create_workspace, get_workspace, list_workspaces, update_workspace

router = APIRouter(prefix="/workspaces", tags=["workspaces"])


def _serialize_workspace(workspace) -> WorkspaceResponse:
    return WorkspaceResponse(
        id=workspace.id,
        owner_id=workspace.owner_id,
        name=workspace.name,
        description=workspace.description,
        color=workspace.color,
        status=workspace.status,
        extra_metadata=workspace.extra_metadata,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
    )


@router.get("", response_model=list[WorkspaceResponse])
def get_workspaces(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[WorkspaceResponse]:
    workspaces = list_workspaces(db, current_user.id)
    return [_serialize_workspace(workspace) for workspace in workspaces]


@router.post("", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
def create_new_workspace(
    payload: WorkspaceCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkspaceResponse:
    workspace = create_workspace(db, current_user.id, payload)
    return _serialize_workspace(workspace)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
def get_single_workspace(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkspaceResponse:
    workspace = get_workspace(db, workspace_id, current_user.id)
    return _serialize_workspace(workspace)


@router.patch("/{workspace_id}", response_model=WorkspaceResponse)
def update_single_workspace(
    workspace_id: UUID,
    payload: WorkspaceUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkspaceResponse:
    workspace = update_workspace(db, workspace_id, current_user.id, payload)
    return _serialize_workspace(workspace)
