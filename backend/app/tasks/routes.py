from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.tasks.schemas import TaskCreateRequest, TaskResponse, TaskUpdateRequest
from app.tasks.services import complete_task, create_task, delete_task, get_task, list_tasks, update_task
from app.users.models import User

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _serialize_task(task) -> TaskResponse:
    return TaskResponse(
        id=task.id,
        workspace_id=task.workspace_id,
        title=task.title,
        description=task.description,
        priority=task.priority,
        status=task.status,
        due_date=task.due_date,
        completed_at=task.completed_at,
        is_overdue=task.is_overdue,
        extra_metadata=task.extra_metadata,
        created_at=task.created_at,
        updated_at=task.updated_at,
    )


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    workspace_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[TaskResponse]:
    tasks = list_tasks(db, workspace_id, current_user.id)
    return [_serialize_task(task) for task in tasks]


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_new_task(
    payload: TaskCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = create_task(db, current_user.id, payload)
    return _serialize_task(task)


@router.get("/{task_id}", response_model=TaskResponse)
def get_single_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = get_task(db, task_id, current_user.id)
    return _serialize_task(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_single_task(
    task_id: UUID,
    payload: TaskUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = update_task(db, task_id, current_user.id, payload)
    return _serialize_task(task)


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_single_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TaskResponse:
    task = complete_task(db, task_id, current_user.id)
    return _serialize_task(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_single_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    delete_task(db, task_id, current_user.id)
