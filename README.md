# Collaborative Document Editor

A lightweight Google Docs-inspired collaborative document editor built for the Ajaia LLC take-home assignment.

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

## Features

| Feature | Status |
|---------|--------|
| Create / rename / delete documents | ✅ |
| Rich text editing (bold, italic, underline, headings, lists) | ✅ |
| Auto-save with "Saving…" / "Saved" indicator | ✅ |
| Upload .txt, .md, .docx files → editable document | ✅ |
| Share document with another user (view or edit) | ✅ |
| Owned vs Shared document tabs | ✅ |
| View-only mode for view permission | ✅ |
| Persist across refresh | ✅ |
| Email/password signup and login | ✅ |
| JWT-based session (7-day tokens) | ✅ |
| Dark blue/grey MUI theme | ✅ |
| Automated tests (5 passing) | ✅ |
| Docker Compose local dev | ✅ |
| Railway + Vercel deployment | ✅ |

---

## Supported File Upload Types

| Extension | Notes |
|-----------|-------|
| `.txt` | Plain text, split on double newlines |
| `.md` | Markdown headings, lists, paragraphs |
| `.docx` | Word documents (paragraphs + bold/italic/underline) |

Max file size: **5 MB**

---

## Deployment

**Backend → Railway**
1. Connect repo, set root directory to `./backend`
2. Add a PostgreSQL plugin — `DATABASE_URL` is injected automatically
3. Set `CORS_ORIGINS` to your Vercel URL
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Frontend → Vercel**
1. Connect repo, framework preset: Vite, root directory: `frontend`
2. Set env var: `VITE_API_URL=https://<your-railway-app>.railway.app`
3. `vercel.json` handles SPA routing — no extra config needed
