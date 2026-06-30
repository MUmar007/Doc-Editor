import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.document import Document
from app.models.share import DocumentShare
from app.models.user import User
from app.schemas.share import ShareCreate, ShareOut
from app.services import share_service

router = APIRouter(prefix="/api/documents", tags=["shares"])


async def _get_doc(db: AsyncSession, doc_id: uuid.UUID) -> Document:
    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if doc is None:
        raise NotFoundError("Document")
    return doc


@router.get("/{doc_id}/shares", response_model=list[ShareOut])
async def list_shares(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DocumentShare]:
    doc = await _get_doc(db, doc_id)
    if not share_service.can_manage(current_user.id, doc):
        raise ForbiddenError()
    result = await db.execute(
        select(DocumentShare)
        .where(DocumentShare.document_id == doc_id)
        .options(selectinload(DocumentShare.user))
        .order_by(DocumentShare.created_at)
    )
    return list(result.scalars().all())


@router.post("/{doc_id}/shares", response_model=ShareOut, status_code=201)
async def create_share(
    doc_id: uuid.UUID,
    data: ShareCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentShare:
    doc = await _get_doc(db, doc_id)
    if not share_service.can_manage(current_user.id, doc):
        raise ForbiddenError()

    if data.shared_with == current_user.id:
        raise ConflictError("You cannot share a document with yourself")

    user_result = await db.execute(select(User).where(User.id == data.shared_with))
    target_user = user_result.scalar_one_or_none()
    if target_user is None:
        raise NotFoundError("User")

    existing = await db.execute(
        select(DocumentShare).where(
            DocumentShare.document_id == doc_id,
            DocumentShare.shared_with == data.shared_with,
        )
    )
    if existing.scalar_one_or_none() is not None:
        raise ConflictError("Document is already shared with this user")

    share = DocumentShare(
        document_id=doc_id,
        shared_with=data.shared_with,
        permission=data.permission,
    )
    db.add(share)
    await db.flush()
    await db.refresh(share, ["user"])
    return share


@router.delete("/{doc_id}/shares/{user_id}", status_code=204)
async def delete_share(
    doc_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    doc = await _get_doc(db, doc_id)
    if not share_service.can_manage(current_user.id, doc):
        raise ForbiddenError()

    result = await db.execute(
        select(DocumentShare).where(
            DocumentShare.document_id == doc_id,
            DocumentShare.shared_with == user_id,
        )
    )
    share = result.scalar_one_or_none()
    if share is None:
        raise NotFoundError("Share")
    await db.delete(share)
