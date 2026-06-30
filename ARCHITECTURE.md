# Architecture Notes

## What I Built

A full-stack collaborative document editor with:
- Rich text editing via Tiptap (ProseMirror-based)
- Document sharing between seeded demo users
- File upload with parsing of .txt, .md, .docx formats
- Full persistence in PostgreSQL

## Stack Decisions

### Rich Text Editor: Tiptap (over Quill)
Tiptap is built on ProseMirror and has first-class React support. Critically, its document model is a typed JSON schema that stores cleanly in PostgreSQL as JSONB. This avoids the XSS risks of raw HTML storage, provides lossless round-trips, and gives structural querying if needed later. Quill's React wrapper lacks TypeScript-first support and has stale maintenance.

### Content Storage: JSONB (not HTML, not TEXT)
Tiptap's native JSON document tree is stored directly as JSONB. This means:
- No HTML sanitization needed
- Lossless round-trips to the editor
- Format is stable and self-documenting
- Future full-text search is possible via GIN indexes

### Auth: Email/Password + JWT
Users sign up with email, full name, and password (min 8 chars). Passwords are hashed with bcrypt. On login/register the API returns a JWT (HS256, 7-day expiry) that the frontend stores in localStorage via Zustand persist. The Axios interceptor injects `Authorization: Bearer <token>` on every request.

Auth is implemented as a FastAPI dependency (`get_current_user`) rather than middleware — this keeps it fully overridable in tests via `dependency_overrides` so the test suite can run without a live database or generating real user sessions.

### Access Control
Three access levels:
- `can_read`: owner OR has a share entry
- `can_edit`: owner OR has a share with `permission = 'edit'`  
- `can_manage`: owner only (share/delete/revoke)

The `document_shares` table has a `permission` column (`view` | `edit`) so role-based permissions are schema-ready even though only `edit` is fully enforced in the current UI.

### Database: PostgreSQL via SQLAlchemy async + asyncpg
Async SQLAlchemy with asyncpg gives non-blocking I/O that pairs correctly with FastAPI's async event loop. Connection pooling is configured (`pool_size=10`, `max_overflow=20`, `pool_pre_ping=True`). An `updated_at` trigger in the Alembic migration keeps timestamps accurate without app-level management.

### Frontend State: Zustand + React Query
- **Zustand**: auth state only (current user, persisted to localStorage)
- **React Query**: all server state (documents, shares, users). Automatic cache invalidation on mutations, stale time of 30s for lists, optimistic title updates.

### Performance Choices
- `GET /api/documents` returns `{owned, shared}` in a single request — no N+1 queries
- `DocumentListOut` schema omits the `content` field for list views (avoids sending MB of JSON)
- `EditorPage` is lazy-loaded (`React.lazy`) — Tiptap + ProseMirror is ~450KB, splitting it keeps the initial bundle under 200KB
- Auto-save debounce: 800ms after last keystroke

## What I Deprioritized

| Feature | Reason |
|---------|--------|
| Real authentication | Assignment permits mock auth; saves 1.5+ hours |
| .docx full fidelity | python-docx handles paragraphs + runs but not tables/images |
| Real-time collaboration | Would require WebSocket infrastructure (2+ hours) |
| Version history | Stretch goal — schema could support it with a versions table |
| Export (PDF/Markdown) | Stretch goal |
| Pagination | Not needed at demo scale |

## What I Would Build Next

With another 2–4 hours:
1. Real JWT auth with a registration/login flow
2. Version history (store a `document_versions` table on each save)
3. Export to Markdown (trivial from Tiptap JSON)
4. Real-time presence indicators via WebSockets
5. Inline commenting on document selections
