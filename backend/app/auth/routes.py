from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.schemas import (
    AuthResponse,
    PasswordResetConfirmRequest,
    PasswordResetRequest,
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.auth.security import create_access_token, hash_password, verify_password
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
def register(payload: UserRegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
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

    token = create_access_token(subject=str(user.id))
    return AuthResponse(user=_serialize_user(user), token=TokenResponse(access_token=token))


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id))
    return AuthResponse(user=_serialize_user(user), token=TokenResponse(access_token=token))


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"message": "Logged out"}


@router.post("/password-reset")
def request_password_reset(_: PasswordResetRequest) -> dict[str, str]:
    return {"message": "Password reset requested"}


@router.post("/password-reset/confirm")
def confirm_password_reset(_: PasswordResetConfirmRequest) -> dict[str, str]:
    return {"message": "Password reset confirmed"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return _serialize_user(current_user)

