import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentOut, CommentUpdate
from app.services import comment_service, document_service

router = APIRouter(prefix="/api/documents", tags=["comments"])


@router.get("/{doc_id}/comments", response_model=list[CommentOut])
async def list_comments(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CommentOut]:
    await document_service.get_document(db, doc_id, current_user.id)
    return await comment_service.list_comments(db, doc_id)


@router.post("/{doc_id}/comments", response_model=CommentOut, status_code=201)
async def create_comment(
    doc_id: uuid.UUID,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommentOut:
    await document_service.get_document(db, doc_id, current_user.id)
    return await comment_service.create_comment(db, doc_id, current_user.id, data)


@router.patch("/{doc_id}/comments/{comment_id}", response_model=CommentOut)
async def update_comment(
    doc_id: uuid.UUID,
    comment_id: uuid.UUID,
    data: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommentOut:
    await document_service.get_document(db, doc_id, current_user.id)
    return await comment_service.update_comment(db, comment_id, current_user.id, data)


@router.delete("/{doc_id}/comments/{comment_id}", status_code=204)
async def delete_comment(
    doc_id: uuid.UUID,
    comment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await document_service.get_document(db, doc_id, current_user.id)
    await comment_service.delete_comment(db, comment_id, current_user.id)
