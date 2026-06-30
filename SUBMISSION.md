# Submission

## Candidate

Muhammad Umar — umar.dev09@gmail.com

## What's Included

| File/Folder | Description |
|-------------|-------------|
| `backend/` | FastAPI + SQLAlchemy + PostgreSQL backend |
| `frontend/` | React + Material UI frontend |
| `docker-compose.yml` | Local development setup |
| `README.md` | Local setup and run instructions |
| `ARCHITECTURE.md` | Architecture decisions and tradeoffs |
| `AI_WORKFLOW.md` | AI tool usage notes |
| `DEPLOY.md` | Railway + Vercel deployment steps |
| `SUBMISSION.md` | This file |

## Links

- **GitHub Repo:** https://github.com/MUmar007/Doc-Editor
- **Frontend:** https://doc-editor-iota.vercel.app/
- **Backend API:** https://doc-editor-production-de8b.up.railway.app
- **API Docs (Swagger):** https://doc-editor-production-de8b.up.railway.app/docs

## Demo Accounts

| User   | Email               | Password |
|--------|---------------------|----------|
| Alice  | alice@test.com      | Test1234 |
| Bob    | bob@test.com        | Test1234 |
| Tester | testerson@test.com  | Test1234 |

You can also create a new account via the Sign up page.

## What Is Working

- Document creation, renaming, deletion
- Rich text editing: bold, italic, underline, headings (H1/H2/H3), bullet lists, numbered lists
- Auto-save with visual indicator (debounced 800ms)
- Document persistence — content survives refresh
- File upload: `.txt`, `.md`, `.docx` → new editable document
- Document sharing: owner can share with any demo user
- Two-tab list: "My Documents" and "Shared with Me"
- Access control enforced server-side (403 if no access)
- View-only mode: toolbar disabled for view-permission shares
- 5 automated backend tests (all passing)
- Ruff linting (backend) and ESLint (frontend) with zero errors
- Docker Compose local dev (`docker compose up --build`)
- Dark blue/grey MUI theme

## What Is Incomplete / Deprioritized

| Feature | Status | Notes |
|---------|--------|-------|
| Real authentication | ✅ | Email/password signup + login with JWT tokens |
| `.docx` full fidelity | Partial | Handles paragraphs + bold/italic/underline; skips tables/images |
| Real-time collaboration | Not built | Would require WebSocket infrastructure |
| Version history | Not built | Schema could support it with a versions table |
| Export to PDF/Markdown | Not built | Stretch goal |

## What I Would Build Next (2–4 More Hours)

1. Document version history (versions table, diff viewer)
2. Export to Markdown (trivial from Tiptap JSON)
3. Real-time presence indicators (WebSocket + document room)
4. Inline commenting on document selections
5. Full view/edit enforcement in the UI (surface the user's permission level from the API)

## Walkthrough Video

*(Add Loom/YouTube link here after recording)*
