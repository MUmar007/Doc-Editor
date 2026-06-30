import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions import ForbiddenError, NotFoundError
from app.models.document import Document
from app.models.share import DocumentShare
from app.models.user import User
from app.schemas.document import (
    DocumentCreate,
    DocumentListOut,
    DocumentOut,
    DocumentsListResponse,
    DocumentUpdate,
)
from app.services import share_service


async def _get_doc_with_share(
    db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID
) -> tuple[Document, DocumentShare | None]:
    doc_result = await db.execute(
        select(Document)
        .where(Document.id == doc_id)
        .options(selectinload(Document.owner))
    )
    doc = doc_result.scalar_one_or_none()
    if doc is None:
        raise NotFoundError("Document")

    share_result = await db.execute(
        select(DocumentShare)
        .where(DocumentShare.document_id == doc_id, DocumentShare.shared_with == user_id)
        .options(selectinload(DocumentShare.user))
    )
    share = share_result.scalar_one_or_none()
    return doc, share


def _to_doc_out(
    doc: Document, user_id: uuid.UUID, share: DocumentShare | None = None
) -> DocumentOut:
    owner = doc.owner
    is_owned = doc.owner_id == user_id
    shared_by_user = None
    if not is_owned and share is not None:
        shared_by_user = owner

    if is_owned:
        my_permission = "owner"
    elif share is not None and share.permission == "edit":
        my_permission = "edit"
    else:
        my_permission = "view"

    return DocumentOut(
        id=doc.id,
        title=doc.title,
        content=doc.content,
        owner_id=doc.owner_id,
        owner=owner,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        is_owned=is_owned,
        shared_by=shared_by_user,
        my_permission=my_permission,
    )


def _to_list_out(
    doc: Document, user_id: uuid.UUID, owner_user: User | None = None
) -> DocumentListOut:
    is_owned = doc.owner_id == user_id
    return DocumentListOut(
        id=doc.id,
        title=doc.title,
        owner_id=doc.owner_id,
        owner=owner_user or doc.owner,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        is_owned=is_owned,
        shared_by=owner_user if not is_owned else None,
    )


async def list_documents(db: AsyncSession, user_id: uuid.UUID) -> DocumentsListResponse:
    owned_result = await db.execute(
        select(Document)
        .where(Document.owner_id == user_id)
        .options(selectinload(Document.owner))
        .order_by(Document.updated_at.desc())
    )
    owned_docs = owned_result.scalars().all()

    shared_result = await db.execute(
        select(Document, DocumentShare)
        .join(DocumentShare, DocumentShare.document_id == Document.id)
        .where(DocumentShare.shared_with == user_id)
        .options(selectinload(Document.owner))
        .order_by(Document.updated_at.desc())
    )
    shared_rows = shared_result.all()

    owned = [_to_list_out(doc, user_id) for doc in owned_docs]
    shared = [_to_list_out(doc, user_id, owner_user=doc.owner) for doc, _ in shared_rows]

    return DocumentsListResponse(owned=owned, shared=shared)


async def get_document(db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID) -> DocumentOut:
    doc, share = await _get_doc_with_share(db, doc_id, user_id)
    if not share_service.can_read(user_id, doc, share):
        raise ForbiddenError()
    return _to_doc_out(doc, user_id, share)


async def create_document(
    db: AsyncSession, user_id: uuid.UUID, data: DocumentCreate
) -> DocumentOut:
    doc = Document(
        title=data.title,
        content=data.content,
        owner_id=user_id,
    )
    db.add(doc)
    await db.flush()
    await db.refresh(doc, ["owner"])
    return _to_doc_out(doc, user_id)


async def update_document(
    db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID, data: DocumentUpdate
) -> DocumentOut:
    from app.services.version_service import maybe_create_version

    doc, share = await _get_doc_with_share(db, doc_id, user_id)
    if not share_service.can_edit(user_id, doc, share):
        raise ForbiddenError()

    if data.title is not None:
        doc.title = data.title
    if data.content is not None:
        doc.content = data.content
        await maybe_create_version(db, doc_id, doc.title, doc.content, user_id)

    await db.flush()
    await db.refresh(doc)
    await db.refresh(doc, ["owner"])
    return _to_doc_out(doc, user_id, share)


async def delete_document(db: AsyncSession, doc_id: uuid.UUID, user_id: uuid.UUID) -> None:
    doc, _ = await _get_doc_with_share(db, doc_id, user_id)
    if not share_service.can_manage(user_id, doc):
        raise ForbiddenError()
    await db.delete(doc)


async def create_document_from_content(
    db: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    content: dict[str, Any],
) -> DocumentOut:
    doc = Document(title=title, content=content, owner_id=user_id)
    db.add(doc)
    await db.flush()
    await db.refresh(doc, ["owner"])
    return _to_doc_out(doc, user_id)
