import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.user import UserOut

DEFAULT_TIPTAP_CONTENT: dict[str, Any] = {"type": "doc", "content": []}


class DocumentCreate(BaseModel):
    title: str = Field(default="Untitled Document", max_length=500)
    content: dict[str, Any] = Field(default_factory=lambda: {"type": "doc", "content": []})


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=500)
    content: dict[str, Any] | None = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str | None) -> str | None:
        if v is not None and not v.strip():
            raise ValueError("Title cannot be empty")
        return v.strip() if v else v

    @field_validator("content")
    @classmethod
    def valid_tiptap_json(cls, v: dict[str, Any] | None) -> dict[str, Any] | None:
        if v is not None and v.get("type") != "doc":
            raise ValueError('Content must be a valid Tiptap document with root type "doc"')
        return v


class DocumentListOut(BaseModel):
    id: uuid.UUID
    title: str
    owner_id: uuid.UUID
    owner: UserOut
    created_at: datetime
    updated_at: datetime
    is_owned: bool = False
    shared_by: UserOut | None = None

    model_config = ConfigDict(from_attributes=True)


class DocumentOut(DocumentListOut):
    content: dict[str, Any]
    my_permission: Literal["owner", "edit", "view"] = "owner"


class DocumentsListResponse(BaseModel):
    owned: list[DocumentListOut]
    shared: list[DocumentListOut]
