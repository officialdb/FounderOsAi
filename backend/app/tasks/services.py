from datetime import UTC, date, datetime
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.tasks.models import Task
from app.tasks.schemas import TaskCreateRequest, TaskUpdateRequest
from app.workspaces.models import Workspace
from app.workspaces.services import get_workspace


def _refresh_overdue_state(task: Task) -> Task:
    if task.status != "done" and task.due_date is not None and task.due_date < date.today():
        task.is_overdue = True
    elif task.status == "done":
        task.is_overdue = False
    return task


def list_tasks(db: Session, workspace_id: UUID, owner_id: UUID) -> list[Task]:
    get_workspace(db, workspace_id, owner_id)
    tasks = db.query(Task).filter(Task.workspace_id == workspace_id).order_by(Task.created_at.desc()).all()
    for task in tasks:
        _refresh_overdue_state(task)
    db.commit()
    return tasks


def get_task(db: Session, task_id: UUID, owner_id: UUID) -> Task:
    task = (
        db.query(Task)
        .join(Workspace, Workspace.id == Task.workspace_id)
        .filter(Task.id == task_id, Workspace.owner_id == owner_id)
        .first()
    )
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    _refresh_overdue_state(task)
    db.commit()
    return task


def create_task(db: Session, owner_id: UUID, payload: TaskCreateRequest) -> Task:
    get_workspace(db, payload.workspace_id, owner_id)
    task = Task(
        workspace_id=payload.workspace_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        status="todo",
    )
    _refresh_overdue_state(task)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def update_task(db: Session, task_id: UUID, owner_id: UUID, payload: TaskUpdateRequest) -> Task:
    task = get_task(db, task_id, owner_id)
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(task, field, value)

    _refresh_overdue_state(task)
    db.commit()
    db.refresh(task)
    return task


def complete_task(db: Session, task_id: UUID, owner_id: UUID) -> Task:
    task = get_task(db, task_id, owner_id)
    task.status = "done"
    task.completed_at = datetime.now(UTC)
    task.is_overdue = False
    db.commit()
    db.refresh(task)
    return task
