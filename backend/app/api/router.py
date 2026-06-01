from fastapi import APIRouter

from app.ai.routes import router as ai_router
from app.auth.routes import router as auth_router
from app.checkins.routes import router as checkin_router
from app.notifications.routes import router as notification_router
from app.outreach.routes import router as outreach_router
from app.tasks.routes import router as task_router
from app.workspaces.routes import router as workspace_router

router = APIRouter()


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def readiness_check() -> dict[str, str]:
    return {"status": "ready"}


router.include_router(auth_router)
router.include_router(workspace_router)
router.include_router(task_router)
router.include_router(checkin_router)
router.include_router(ai_router)
router.include_router(outreach_router)
router.include_router(notification_router)
