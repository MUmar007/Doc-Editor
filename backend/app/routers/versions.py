import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import NotFoundError
from app.models.user import User
from app.schemas.document import DocumentOut
from app.schemas.version import VersionOut
from app.services import document_service, version_service

router = APIRouter(prefix="/api/documents", tags=["versions"])


@router.get("/{doc_id}/versions", response_model=list[VersionOut])
async def list_versions(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[VersionOut]:
    await document_service.get_document(db, doc_id, current_user.id)
    return await version_service.list_versions(db, doc_id)


@router.post("/{doc_id}/versions", response_model=VersionOut, status_code=201)
async def save_version(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> VersionOut:
    doc = await document_service.get_document(db, doc_id, current_user.id)
    await version_service.maybe_create_version(
        db, doc_id, doc.title, doc.content, current_user.id, force=True
    )
    versions = await version_service.list_versions(db, doc_id)
    return versions[0]


@router.post("/{doc_id}/versions/{version_id}/restore", response_model=DocumentOut)
async def restore_version(
    doc_id: uuid.UUID,
    version_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentOut:
    version = await version_service.get_version(db, version_id)
    if version is None or version.document_id != doc_id:
        raise NotFoundError("Version")
    from app.schemas.document import DocumentUpdate
    data = DocumentUpdate(title=version.title, content=version.content)
    return await document_service.update_document(db, doc_id, current_user.id, data)
