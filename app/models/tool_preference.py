from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class UserToolPreference(Base):
    __tablename__ = "user_tool_preferences"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id")
    )

    mcp_server: Mapped[str] = mapped_column(
        String(100)
    )

    tool_name: Mapped[str] = mapped_column(
        String(150)
    )

    hitl_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    user = relationship(
        "User",
        back_populates="tool_preferences"
    )