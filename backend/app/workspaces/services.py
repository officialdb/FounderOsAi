from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.workspaces.models import Workspace
from app.workspaces.schemas import WorkspaceCreateRequest, WorkspaceUpdateRequest


def list_workspaces(db: Session, owner_id: UUID) -> list[Workspace]:
    return db.query(Workspace).filter(Workspace.owner_id == owner_id).order_by(Workspace.created_at.desc()).all()


def get_workspace(db: Session, workspace_id: UUID, owner_id: UUID) -> Workspace:
    workspace = (
        db.query(Workspace)
        .filter(Workspace.id == workspace_id, Workspace.owner_id == owner_id)
        .first()
    )
    if workspace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return workspace


def create_workspace(db: Session, owner_id: UUID, payload: WorkspaceCreateRequest) -> Workspace:
    workspace = Workspace(
        owner_id=owner_id,
        name=payload.name,
        description=payload.description,
        color=payload.color,
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    return workspace


def update_workspace(
    db: Session,
    workspace_id: UUID,
    owner_id: UUID,
    payload: WorkspaceUpdateRequest,
) -> Workspace:
    workspace = get_workspace(db, workspace_id, owner_id)
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(workspace, field, value)

    db.commit()
    db.refresh(workspace)
    return workspace

