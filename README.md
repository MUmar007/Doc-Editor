# Collaborative Document Editor

A lightweight Google Docs-inspired collaborative document editor — rich text editing, real-time presence, version history, commenting, and role-based sharing. Built for the Ajaia LLC take-home assignment.

**Live demo:** https://doc-editor-iota.vercel.app/ · **API docs:** https://doc-editor-production-de8b.up.railway.app/docs

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Running Without Docker](#running-without-docker)
- [Environment Variables](#environment-variables)
- [Tests & Linting](#tests--linting)
- [Live Demo](#live-demo)
- [Supported File Upload Types](#supported-file-upload-types)

---

## Features

| Feature | Status |
|---------|--------|
| Create / rename / delete documents | ✅ |
| Rich text editing (bold, italic, underline, headings, lists) | ✅ |
| Auto-save with "Saving…" / "Saved" indicator | ✅ |
| Upload .txt, .md, .docx files → editable document | ✅ |
| Share document with another user (view or edit) | ✅ |
| Role-based access: view-only users can't edit or restore versions | ✅ |
| Owned vs Shared document tabs | ✅ |
| Persist across refresh | ✅ |
| Email/password signup and login | ✅ |
| JWT-based session (7-day tokens) | ✅ |
| Real-time presence avatars (WebSocket, live viewer list) | ✅ |
| Document version history with preview and restore | ✅ |
| Word-level diff viewer (GitHub-style green/red) | ✅ |
| Inline commenting with resolve/delete | ✅ |
| Export to PDF (print-ready window) | ✅ |
| Export to Markdown (download .md file) | ✅ |
| Dark blue/grey MUI theme | ✅ |
| Automated tests (5 passing) | ✅ |
| Docker Compose local dev | ✅ |
| Railway + Vercel deployment | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python, FastAPI, SQLAlchemy (async), PostgreSQL, Alembic, Poetry |
| Auth | JWT (PyJWT, HS256), bcrypt password hashing |
| Frontend | React, TypeScript, Vite, Material UI (dark theme) |
| Editor | Tiptap (ProseMirror) |
| State / Data | Zustand (auth), React Query (server state) |
| Real-time | Native WebSocket (FastAPI server, browser client) |
| Local Dev | Docker Compose |
| Deployment | Railway (backend + Postgres), Vercel (frontend) |

---

## Project Structure

```
.
├── docker-compose.yml          # Local dev: db + backend + frontend
├── Makefile                    # up / down / test / lint / format shortcuts
├── .env.example                # Root-level env reference
│
├── backend/
│   ├── Dockerfile
│   ├── pyproject.toml          # Poetry deps + ruff/mypy/pytest config
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/           # 001 initial schema, 002 password hash, 003 versions+comments
│   ├── app/
│   │   ├── main.py             # FastAPI app, CORS, router registration, startup
│   │   ├── config.py           # pydantic-settings
│   │   ├── database.py         # Async SQLAlchemy engine + session
│   │   ├── auth.py             # JWT encode/decode
│   │   ├── dependencies.py     # get_current_user FastAPI dependency
│   │   ├── exceptions.py       # Structured AppError hierarchy + handlers
│   │   ├── seed.py             # Demo user seeding
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── routers/            # auth, documents, shares, versions, comments, presence (WS)
│   │   └── services/           # Business logic: documents, shares, versions, comments, file parsing
│   └── tests/
│       ├── conftest.py
│       └── test_documents.py
│
└── frontend/
    ├── Dockerfile
    ├── vite.config.ts
    ├── vercel.json              # SPA routing rewrites
    └── src/
        ├── main.tsx / App.tsx
        ├── theme.ts              # MUI dark theme
        ├── api/                  # Axios client + per-resource API calls
        ├── store/                # Zustand auth store
        ├── hooks/                # React Query hooks per resource + usePresence (WS)
        ├── components/
        │   ├── layout/           # AppShell, Sidebar
        │   ├── documents/        # DocumentList, FileUpload
        │   ├── editor/           # TiptapEditor, toolbar, presence avatars,
        │   │                     # version history drawer, comments panel, export menu
        │   ├── sharing/          # ShareDialog
        │   └── common/           # ErrorBoundary, LoadingSpinner, ConfirmDialog
        ├── pages/                # HomePage, EditorPage, LoginPage, SignupPage
        ├── types/                # Shared TypeScript types
        └── utils/                # errorHandler, exportUtils (PDF/Markdown)
```

---

## Prerequisites

- [Docker](https://www.docker.com/) + Docker Compose (recommended path), **or**
- Python 3.12+ with [Poetry](https://python-poetry.org/), PostgreSQL 16, and Node.js 20+ for a manual setup

---

## Quick Start (Docker)

```bash
git clone https://github.com/MUmar007/Doc-Editor.git
cd Doc-Editor
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173). The backend API runs on port `8000`.

On first boot, the DB tables are created and three demo users are seeded automatically.

---

## Running Without Docker

**Backend:**
```bash
cd backend
poetry install
export DATABASE_URL="postgresql+asyncpg://user:pass@localhost:5432/collab_docs"
export CORS_ORIGINS="http://localhost:5173"
poetry run uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|--------------|
| `DATABASE_URL` | backend | Async Postgres connection string (`postgresql+asyncpg://...`) |
| `CORS_ORIGINS` | backend | Comma-separated origins allowed to call the API |
| `VITE_API_URL` | frontend | Base URL of the backend API (HTTP; WS URL is derived from it) |

See `.env.example` (root), `backend/.env.example`, and `frontend/.env.example` for full reference.

---

## Tests & Linting

```bash
# Tests (from repo root)
make test

# Or directly
cd backend && poetry run pytest tests/ -v

# Lint
make lint
```

5 tests covering: CRUD, share access control, file upload, title update, delete permissions.

---

## Live Demo

- **Frontend:** https://doc-editor-iota.vercel.app/
- **Backend API:** https://doc-editor-production-de8b.up.railway.app
- **API Docs:** https://doc-editor-production-de8b.up.railway.app/docs

**Demo accounts (seeded automatically):**

| Name   | Email               | Password |
|--------|---------------------|----------|
| Alice  | alice@test.com      | Test1234 |
| Bob    | bob@test.com        | Test1234 |
| Tester | testerson@test.com  | Test1234 |

Or create a new account via the Sign up page.

---

## Supported File Upload Types

| Extension | Notes |
|-----------|-------|
| `.txt` | Plain text, split on double newlines |
| `.md` | Markdown headings, lists, paragraphs |
| `.docx` | Word documents (paragraphs + bold/italic/underline) |

Max file size: **5 MB**
