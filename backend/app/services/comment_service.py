import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.exceptions import ForbiddenError, NotFoundError
from app.models.document_comment import DocumentComment
from app.schemas.comment import CommentCreate, CommentOut, CommentUpdate


async def list_comments(db: AsyncSession, doc_id: uuid.UUID) -> list[CommentOut]:
    result = await db.execute(
        select(DocumentComment)
        .where(DocumentComment.document_id == doc_id)
        .options(selectinload(DocumentComment.author))
        .order_by(DocumentComment.created_at.asc())
    )
    return [CommentOut.model_validate(c) for c in result.scalars().all()]


async def create_comment(
    db: AsyncSession,
    doc_id: uuid.UUID,
    user_id: uuid.UUID,
    data: CommentCreate,
) -> CommentOut:
    comment = DocumentComment(
        document_id=doc_id,
        author_id=user_id,
        body=data.body,
    )
    db.add(comment)
    await db.flush()
    await db.refresh(comment, ["author"])
    return CommentOut.model_validate(comment)


async def update_comment(
    db: AsyncSession,
    comment_id: uuid.UUID,
    user_id: uuid.UUID,
    data: CommentUpdate,
) -> CommentOut:
    result = await db.execute(
        select(DocumentComment)
        .where(DocumentComment.id == comment_id)
        .options(selectinload(DocumentComment.author))
    )
    comment = result.scalar_one_or_none()
    if comment is None:
        raise NotFoundError("Comment")
    comment.resolved = data.resolved
    await db.flush()
    await db.refresh(comment, ["author"])
    return CommentOut.model_validate(comment)


async def delete_comment(
    db: AsyncSession,
    comment_id: uuid.UUID,
    user_id: uuid.UUID,
) -> None:
    result = await db.execute(
        select(DocumentComment).where(DocumentComment.id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if comment is None:
        raise NotFoundError("Comment")
    if comment.author_id != user_id:
        raise ForbiddenError()
    await db.delete(comment)
