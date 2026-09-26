from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)

    username: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255)
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow
    )

    threads = relationship(
        "Thread",
        back_populates="user"
    )

    mcp_connections = relationship(
        "UserMCPConnection",
        back_populates="user"
    )

    tool_preferences = relationship(
        "UserToolPreference",
        back_populates="user"
    )