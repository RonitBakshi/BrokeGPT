from datetime import datetime, timedelta, timezone

import jwt
from pwdlib import PasswordHash


class SecurityService:
    def __init__(
        self,
        secret_key: str,
        algorithm: str = "HS256"
    ):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.password_hash = PasswordHash.recommended()

    def hash_password(self, password: str) -> str:
        return self.password_hash.hash(password)

    def verify_password(
        self,
        password: str,
        password_hash: str
    ) -> bool:
        return self.password_hash.verify(
            password,
            password_hash
        )

    def create_access_token(
        self,
        user_id: int,
        expires_in_hours: int = 1
    ) -> str:
        payload = {
            "sub": str(user_id),
            "exp": (
                datetime.now(timezone.utc)
                + timedelta(hours=expires_in_hours)
            )
        }

        return jwt.encode(
            payload,
            self.secret_key,
            algorithm=self.algorithm
        )

    def decode_access_token(self, token: str) -> int:
        payload = jwt.decode(
            token,
            self.secret_key,
            algorithms=[self.algorithm]
        )

        return int(payload["sub"])