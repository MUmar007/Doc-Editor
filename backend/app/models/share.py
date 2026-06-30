import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DocumentShare(Base):
    __tablename__ = "document_shares"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    shared_with: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    permission: Mapped[str] = mapped_column(String(10), nullable=False, default="edit")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    document: Mapped["Document"] = relationship("Document", back_populates="shares")  # type: ignore[name-defined]  # noqa: F821
    user: Mapped["User"] = relationship("User", foreign_keys=[shared_with], back_populates="shares")  # type: ignore[name-defined]  # noqa: F821

    __table_args__ = (
        UniqueConstraint("document_id", "shared_with", name="uq_doc_user_share"),
        CheckConstraint("permission IN ('view', 'edit')", name="ck_permission_valid"),
    )
