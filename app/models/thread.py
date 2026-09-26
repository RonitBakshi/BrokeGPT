from datetime import datetime

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Thread(Base):
    __tablename__ = "threads"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    title: Mapped[str] = mapped_column(
        String(255)
    )

    created_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="threads"
    )