import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False, default="Untitled Document")
    content: Mapped[dict] = mapped_column(
        JSON, nullable=False, server_default=text("'{\"type\":\"doc\",\"content\":[]}'")
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    owner: Mapped["User"] = relationship("User", back_populates="documents")  # type: ignore[name-defined]  # noqa: F821
    shares: Mapped[list["DocumentShare"]] = relationship(  # type: ignore[name-defined]  # noqa: F821
        "DocumentShare", back_populates="document", cascade="all, delete-orphan"
    )
