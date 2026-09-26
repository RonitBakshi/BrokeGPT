from sqlalchemy.orm import Session

from ..models import User
from ..security import SecurityService


class UserService:
    def __init__(
        self,
        db: Session,
        security: SecurityService
    ):
        self.db = db
        self.security = security

    def get_by_username(
        self,
        username: str
    ) -> User | None:
        return (
            self.db.query(User)
            .filter(User.username == username)
            .first()
        )

    def get_by_id(
        self,
        user_id: int
    ) -> User | None:
        return (
            self.db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    def create_user(
        self,
        username: str,
        password: str
    ) -> User:
        password_hash = self.security.hash_password(
            password
        )

        user = User(
            username=username,
            password_hash=password_hash
        )

        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        return user

    def authenticate(
        self,
        username: str,
        password: str
    ) -> User | None:
        user = self.get_by_username(username)

        if not user:
            return None

        if not self.security.verify_password(
            password,
            user.password_hash
        ):
            return None

        return user