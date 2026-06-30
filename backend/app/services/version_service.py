import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.document_version import DocumentVersion
from app.schemas.version import VersionOut

# Minimum seconds between auto-created versions per document
VERSION_THROTTLE_SECONDS = 30


async def maybe_create_version(
    db: AsyncSession,
    doc_id: uuid.UUID,
    title: str,
    content: dict[str, Any],
    user_id: uuid.UUID,
    force: bool = False,
) -> None:
    if not force:
        cutoff = datetime.now(UTC) - timedelta(seconds=VERSION_THROTTLE_SECONDS)
        recent = await db.execute(
            select(DocumentVersion)
            .where(
                DocumentVersion.document_id == doc_id,
                DocumentVersion.created_at >= cutoff,
            )
            .limit(1)
        )
        if recent.scalar_one_or_none() is not None:
            return

    version = DocumentVersion(
        document_id=doc_id,
        title=title,
        content=content,
        created_by=user_id,
    )
    db.add(version)


async def list_versions(db: AsyncSession, doc_id: uuid.UUID) -> list[VersionOut]:
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == doc_id)
        .options(selectinload(DocumentVersion.author))
        .order_by(DocumentVersion.created_at.desc())
        .limit(50)
    )
    return [VersionOut.model_validate(v) for v in result.scalars().all()]


async def get_version(
    db: AsyncSession, version_id: uuid.UUID
) -> DocumentVersion | None:
    result = await db.execute(
        select(DocumentVersion)
        .where(DocumentVersion.id == version_id)
        .options(selectinload(DocumentVersion.author))
    )
    return result.scalar_one_or_none()
