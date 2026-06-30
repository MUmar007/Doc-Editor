import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.document import DocumentCreate, DocumentOut, DocumentsListResponse, DocumentUpdate
from app.services import document_service, file_parser

router = APIRouter(prefix="/api/documents", tags=["documents"])


@router.get("", response_model=DocumentsListResponse)
async def list_documents(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentsListResponse:
    return await document_service.list_documents(db, current_user.id)


@router.post("", response_model=DocumentOut, status_code=201)
async def create_document(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentOut:
    try:
        body = await request.json()
        data = DocumentCreate(**body)
    except Exception:
        data = DocumentCreate()
    return await document_service.create_document(db, current_user.id, data)


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentOut:
    file_parser.validate_upload(file.filename, file.size)
    content_bytes = await file.read()
    title = Path(file.filename or "Uploaded Document").stem
    tiptap_content = file_parser.parse_file(file.filename or "file.txt", content_bytes)
    return await document_service.create_document_from_content(
        db, current_user.id, title, tiptap_content
    )


@router.get("/{doc_id}", response_model=DocumentOut)
async def get_document(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentOut:
    return await document_service.get_document(db, doc_id, current_user.id)


@router.patch("/{doc_id}", response_model=DocumentOut)
async def update_document(
    doc_id: uuid.UUID,
    data: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentOut:
    return await document_service.update_document(db, doc_id, current_user.id, data)


@router.delete("/{doc_id}", status_code=204)
async def delete_document(
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await document_service.delete_document(db, doc_id, current_user.id)
