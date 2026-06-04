from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    AuthResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    PasswordResetResponse,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.auth.services import authenticate_login, confirm_password_reset_token, create_password_reset_token, issue_auth_response, refresh_auth_session, register_user, revoke_refresh_session
from app.core.rate_limit import enforce_rate_limit
from app.core.settings import get_settings
from app.database.session import get_db
from app.users.models import User

router = APIRouter(prefix="/auth", tags=["auth"])


def _serialize_user(user: User) -> UserResponse:
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: UserRegisterRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
) -> AuthResponse:
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit("register", f"{client_ip}:{payload.email.lower()}", limit=5, window_seconds=3600)
    user = register_user(db, payload)
    token = issue_auth_response(db, user, request, response)
    return AuthResponse(user=_serialize_user(user), token=TokenResponse(access_token=token["access_token"]))


@router.post("/login", response_model=AuthResponse)
def login(
    payload: UserLoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
) -> AuthResponse:
    client_ip = request.client.host if request.client else "unknown"
    enforce_rate_limit("login", f"{client_ip}:{payload.email.lower()}", limit=10, window_seconds=900)
    user = authenticate_login(db, payload)
    token = issue_auth_response(db, user, request, response)
    return AuthResponse(user=_serialize_user(user), token=TokenResponse(access_token=token["access_token"]))


@router.post("/refresh", response_model=AuthResponse)
def refresh(
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
) -> AuthResponse:
    user, access_token = refresh_auth_session(db, request, response)
    return AuthResponse(user=_serialize_user(user), token=TokenResponse(access_token=access_token))


@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)) -> dict[str, str]:
    revoke_refresh_session(db, request, response)
    return {"message": "Logged out"}


@router.post("/password-reset", response_model=PasswordResetResponse)
def request_password_reset(
    payload: PasswordResetRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> PasswordResetResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    settings = get_settings()
    if user is None:
        return PasswordResetResponse(message="Password reset requested")

    reset_token = create_password_reset_token(db, user, request)
    if settings.app_env == "production":
        return PasswordResetResponse(message="Password reset requested")
    return PasswordResetResponse(message="Password reset requested", reset_token=reset_token)


@router.post("/password-reset/confirm")
def confirm_password_reset(payload: PasswordResetConfirmRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    confirm_password_reset_token(db, payload)
    return {"message": "Password reset confirmed"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return _serialize_user(current_user)
