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

## Stretch Features

### Real-time presence: WebSocket, in-memory room state
A single FastAPI WebSocket endpoint (`/api/documents/{doc_id}/presence`) authenticates via a `token` query param (the same JWT used for REST calls) and tracks connected users in an in-memory `dict[doc_id, dict[user_id, info]]`. Join/leave events broadcast to the room. Each client also pings every 10s; the server replies with the full room state on every ping so any client that missed a broadcast self-corrects within 10 seconds, rather than drifting out of sync permanently. User avatar colors are deterministic (`sum(ord(c) for c in user_id) % palette_len`) and computed identically in Python and JS so colors match across reloads — Python's built-in `hash()` is randomized per-process and was the wrong tool here. This is single-process only, which is fine for a single Railway instance; a multi-instance deployment would need Redis pub/sub instead.

### Version history: throttled snapshots + diff-on-read
Every content update calls `maybe_create_version`, which writes a row to `document_versions` only if 30+ seconds have passed since the last snapshot for that document (or if the user explicitly clicks "save snapshot now", which bypasses the throttle). This avoids a version row per keystroke while still giving fine-grained undo points. Diffing is computed client-side and on-demand — `diffWords` from the `diff` package runs against plain text extracted from the Tiptap JSON tree, rather than storing diffs server-side. This keeps the schema simple (`document_versions` just stores a full JSON snapshot) at the cost of recomputing the diff on every preview open, which is cheap at this scale.

### Commenting: flat, document-scoped (not range-anchored)
Comments attach to the document, not to a specific text selection — `document_comments` has `document_id`, `author_id`, `body`, `resolved`. This was a deliberate scope cut: range-anchored comments need either ProseMirror decorations with stable position mapping across concurrent edits, or a CRDT-based anchor, both of which are substantially more work than the time budget allowed. A resolved boolean plus delete (author-only) covers the core "track open questions on a doc" use case.

### Export: client-side, no server round-trip
Both PDF and Markdown export run entirely in the browser. PDF export opens a blank window, writes clean print-styled HTML (Tiptap's `getHTML()` output), and calls `window.print()` — this avoids a server-side PDF rendering dependency (e.g. Puppeteer) entirely. Markdown export walks the Tiptap JSON tree client-side and converts node types to Markdown syntax directly, also without a server call.

### Role-based permissions: server is the source of truth
`DocumentOut` now includes a computed `my_permission: "owner" | "edit" | "view"` field, derived server-side from `doc.owner_id` and the caller's share record. The frontend gates editing, version history visibility, and restore actions on this field rather than a local heuristic (the original implementation inferred permission from whether `shared_by` was present, which broke down for owners viewing their own shared docs). Centralizing this on the server closes that gap and means any future client only needs to read one field.

## What I Deprioritized

| Feature | Reason |
|---------|--------|
| .docx full fidelity | python-docx handles paragraphs + runs but not tables/images |
| Range-anchored comments | Needs stable position mapping across concurrent edits — bigger scope than time allowed |
| Multi-instance presence (Redis pub/sub) | In-memory room state is single-process only; fine for one Railway instance |
| Pagination | Not needed at demo scale |

## What I Would Build Next

With another 2–4 hours:
1. Cursor-level presence (Tiptap's collaboration cursor extension)
2. Range-anchored comments tied to text selections
3. `.docx` export
4. Multi-instance presence via Redis pub/sub for horizontal scaling
