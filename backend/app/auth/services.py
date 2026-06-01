from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import TYPE_CHECKING
from uuid import UUID

from fastapi import HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth.models import PasswordResetToken, RefreshTokenSession
from app.auth.security import create_access_token, generate_secure_token, hash_password, hash_token, verify_password
from app.core.settings import get_settings
from app.users.models import User

if TYPE_CHECKING:
    from app.auth.schemas import PasswordResetConfirmRequest, PasswordResetRequest, UserLoginRequest, UserRegisterRequest


REFRESH_COOKIE_NAME = "founderos_refresh_token"
REFRESH_TOKEN_TTL_DAYS = 30
PASSWORD_RESET_TOKEN_TTL_MINUTES = 30


def _cookie_options() -> dict[str, object]:
    settings = get_settings()
    return {
        "httponly": True,
        "secure": settings.app_env == "production",
        "samesite": "lax",
        "path": "/",
        "max_age": REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60,
    }


def _set_refresh_cookie(response, refresh_token: str) -> None:
    response.set_cookie(REFRESH_COOKIE_NAME, refresh_token, **_cookie_options())


def _clear_refresh_cookie(response) -> None:
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")


def _request_context(request: Request | None) -> tuple[str | None, str | None]:
    if request is None:
        return None, None
    return (
        request.client.host if request.client else None,
        request.headers.get("user-agent"),
    )


def _create_refresh_session(db: Session, user_id: UUID, request: Request | None) -> str:
    raw_refresh_token = generate_secure_token()
    request_ip, request_user_agent = _request_context(request)
    session = RefreshTokenSession(
        user_id=user_id,
        token_hash=hash_token(raw_refresh_token),
        expires_at=datetime.now(UTC) + timedelta(days=REFRESH_TOKEN_TTL_DAYS),
        user_agent=request_user_agent,
        ip_address=request_ip,
    )
    db.add(session)
    db.commit()
    return raw_refresh_token


def _get_refresh_session(db: Session, raw_refresh_token: str) -> RefreshTokenSession:
    session = (
        db.query(RefreshTokenSession)
        .filter(RefreshTokenSession.token_hash == hash_token(raw_refresh_token))
        .first()
    )
    if session is None or session.revoked_at is not None or session.expires_at <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")
    return session


def issue_auth_response(db: Session, user: User, request: Request | None, response) -> dict[str, object]:
    access_token = create_access_token(subject=str(user.id))
    refresh_token = _create_refresh_session(db, user.id, request)
    _set_refresh_cookie(response, refresh_token)
    return {"access_token": access_token}


def refresh_auth_session(db: Session, request: Request, response) -> tuple[User, str]:
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    existing_session = _get_refresh_session(db, refresh_token)
    user = db.get(User, existing_session.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing_session.revoked_at = datetime.now(UTC)
    db.commit()

    new_refresh_token = _create_refresh_session(db, existing_session.user_id, request)
    _set_refresh_cookie(response, new_refresh_token)
    access_token = create_access_token(subject=str(existing_session.user_id))
    return user, access_token


def revoke_refresh_session(db: Session, request: Request, response) -> None:
    refresh_token = request.cookies.get(REFRESH_COOKIE_NAME)
    if refresh_token:
        session = (
            db.query(RefreshTokenSession)
            .filter(RefreshTokenSession.token_hash == hash_token(refresh_token))
            .first()
        )
        if session is not None:
            session.revoked_at = datetime.now(UTC)
            db.commit()
    _clear_refresh_cookie(response)


def create_password_reset_token(db: Session, user: User, request: Request | None) -> str:
    raw_token = generate_secure_token()
    request_ip, request_user_agent = _request_context(request)
    password_reset = PasswordResetToken(
        user_id=user.id,
        token_hash=hash_token(raw_token),
        expires_at=datetime.now(UTC) + timedelta(minutes=PASSWORD_RESET_TOKEN_TTL_MINUTES),
        request_ip=request_ip,
        request_user_agent=request_user_agent,
    )
    db.add(password_reset)
    db.commit()
    return raw_token


def confirm_password_reset_token(db: Session, payload: "PasswordResetConfirmRequest") -> None:
    reset_token = (
        db.query(PasswordResetToken)
        .filter(PasswordResetToken.token_hash == hash_token(payload.token))
        .first()
    )
    if reset_token is None or reset_token.consumed_at is not None or reset_token.expires_at <= datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")

    user = db.get(User, reset_token.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.hashed_password = hash_password(payload.new_password)
    reset_token.consumed_at = datetime.now(UTC)
    db.commit()


def authenticate_login(db: Session, payload: "UserLoginRequest") -> User:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return user


def register_user(db: Session, payload: "UserRegisterRequest") -> User:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
