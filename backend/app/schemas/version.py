import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserOut


class VersionOut(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    title: str
    content: dict[str, Any]
    created_by: uuid.UUID
    created_at: datetime
    author: UserOut

    model_config = ConfigDict(from_attributes=True)
