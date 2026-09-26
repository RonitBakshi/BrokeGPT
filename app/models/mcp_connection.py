from datetime import datetime

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class UserMCPConnection(Base):
    __tablename__ = "user_mcp_connections"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    mcp_server: Mapped[str] = mapped_column(
        String(100)
    )

    connected: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="mcp_connections"
    )