import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserOut


class CommentCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class CommentUpdate(BaseModel):
    resolved: bool


class CommentOut(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    author_id: uuid.UUID
    body: str
    resolved: bool
    created_at: datetime
    updated_at: datetime
    author: UserOut

    model_config = ConfigDict(from_attributes=True)
