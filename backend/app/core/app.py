from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router as health_router
from app.core.logging import configure_logging
from app.core.settings import get_settings
import app.database.models  # noqa: F401


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging()

    app = FastAPI(title=settings.app_name, debug=settings.app_debug)

    cors_origins = settings.cors_origins
    if not cors_origins and settings.app_env == "development":
        cors_origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]

    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    app.include_router(health_router, prefix=settings.api_v1_prefix)
    return app
