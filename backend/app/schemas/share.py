import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserOut


class ShareCreate(BaseModel):
    shared_with: uuid.UUID
    permission: Literal["view", "edit"] = "edit"


class ShareOut(BaseModel):
    id: uuid.UUID
    document_id: uuid.UUID
    shared_with: uuid.UUID
    user: UserOut
    permission: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
