import uuid

from app.models.document import Document
from app.models.share import DocumentShare


def can_read(user_id: uuid.UUID, doc: Document, share: DocumentShare | None) -> bool:
    return doc.owner_id == user_id or share is not None


def can_edit(user_id: uuid.UUID, doc: Document, share: DocumentShare | None) -> bool:
    return doc.owner_id == user_id or (share is not None and share.permission == "edit")


def can_manage(user_id: uuid.UUID, doc: Document) -> bool:
    return doc.owner_id == user_id
