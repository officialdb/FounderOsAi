from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.settings import get_settings


def build_engine():
    settings = get_settings()
    if not settings.database_url:
        return None
    return create_engine(settings.database_url, pool_pre_ping=True)


engine = build_engine()

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) if engine else None


def get_db() -> Generator[Session, None, None]:
    if SessionLocal is None:
        raise RuntimeError("DATABASE_URL is not configured")

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

