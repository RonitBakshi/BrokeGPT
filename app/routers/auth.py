import jwt

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import (
    OAuth2PasswordBearer,
    OAuth2PasswordRequestForm
)
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..security import SecurityService
from ..services.user_service import UserService


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_security() -> SecurityService:
    return SecurityService(
        secret_key="dev-secret-key"
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    security: SecurityService = Depends(get_security)
):
    try:
        user_id = security.decode_access_token(token)

    except (
        jwt.InvalidTokenError,
        KeyError,
        ValueError
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_service = UserService(
        db,
        security
    )

    user = user_service.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


@router.post("/signup")
def signup(
    username: str,
    password: str,
    db: Session = Depends(get_db),
    security: SecurityService = Depends(get_security)
):
    user_service = UserService(
        db,
        security
    )

    if user_service.get_by_username(username):
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    user = user_service.create_user(
        username,
        password
    )

    return {
        "id": user.id,
        "username": user.username
    }


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    security: SecurityService = Depends(get_security)
):
    user_service = UserService(
        db,
        security
    )

    user = user_service.authenticate(
        form_data.username,
        form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = security.create_access_token(
        user.id
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "username": current_user.username
    }