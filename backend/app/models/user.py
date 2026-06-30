import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    documents: Mapped[list["Document"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "Document", back_populates="owner", cascade="all, delete-orphan"
    )
    shares: Mapped[list["DocumentShare"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "DocumentShare", foreign_keys="DocumentShare.shared_with", back_populates="user"
    )
