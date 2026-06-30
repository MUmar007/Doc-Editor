# Submission

## Candidate

Muhammad Umar — umar.dev09@gmail.com

## What's Included

| File/Folder | Description |
|-------------|-------------|
| `backend/` | FastAPI + SQLAlchemy + PostgreSQL backend |
| `frontend/` | React + Material UI frontend |
| `docker-compose.yml` | Local development setup |
| `README.md` | Setup, run instructions, project structure, deployment steps |
| `ARCHITECTURE.md` | Architecture decisions and tradeoffs |
| `AI_WORKFLOW.md` | AI tool usage notes |
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
- Document sharing: owner can share with any user (view or edit permission)
- Two-tab list: "My Documents" and "Shared with Me"
- Role-based access control: permission enforced server-side (403 if no access); view-only users see disabled toolbar and no history/restore controls
- **Real-time presence indicators**: live avatars showing who's in the document; WebSocket-based with deterministic user colors and a heartbeat that self-corrects missed join/leave events
- **Inline commenting**: add, resolve, and delete comments per document with unread badge counter
- **Document version history**: auto-snapshots every 30s on content change; manual "save snapshot now"; click any version to preview it or see a word-level GitHub-style diff (green = added, red = removed) before restoring
- **Export to PDF**: opens a clean print window with proper typography — no React chrome
- **Export to Markdown**: downloads a `.md` file converted from the Tiptap JSON tree
- 5 automated backend tests (all passing)
- Ruff linting (backend) and ESLint (frontend) with zero errors
- Docker Compose local dev (`docker compose up --build`)
- Dark blue/grey MUI theme

## What Is Incomplete / Deprioritized

| Feature | Status | Notes |
|---------|--------|-------|
| `.docx` full fidelity | Partial | Handles paragraphs + bold/italic/underline; skips tables/images |
| Collaborative cursor positions | Not built | Presence avatars show who's viewing but not their cursor location |
| Pagination | Not built | Not needed at demo scale |

## What I Would Build Next

1. Cursor-level presence (show each user's cursor position in the editor via Tiptap's collaboration cursor extension)
2. Inline comment anchoring (tie a comment to a specific text range, not just the document)
3. `.docx` export (using `docx` npm package)
4. Notification system for comment mentions

## Walkthrough Video

https://drive.google.com/file/d/1uduHWJS5AMV6weOE3IgjG9AbGhDVjCrt/view?usp=sharing
