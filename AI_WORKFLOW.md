# AI Workflow Note

## Tools Used

- **Claude Code (claude-sonnet-4-6)** — primary coding assistant throughout the entire build

## Where AI Materially Sped Up My Work

1. **Scaffolding** — Generating the complete project structure (backend models, schemas, routers, services, Docker Compose, Alembic migration) in parallel. What would take 45–60 minutes of typing took under 5 minutes to review and accept.

2. **Boilerplate-heavy code** — SQLAlchemy async model definitions, Pydantic schemas with validators, FastAPI routers with proper type annotations. AI produced correct first-pass code that required minimal editing.

3. **File parser** (`file_parser.py`) — The Tiptap JSON mapping logic for .txt/.md/.docx was generated correctly on the first attempt. I verified the output manually by running a test file through it.

4. **MUI component composition** — The dark theme config, Tiptap CSS styling, and MUI component wiring (Select, ToggleButton, Dialog, ListItem patterns) were produced accurately for MUI v5 patterns. Some props needed updating for MUI v9 type changes (e.g., `fontWeight` moved to `sx`).

5. **Test writing** — The 5 pytest tests covering CRUD, access control, file upload, and delete behavior were generated in one pass and passed after fixing the SQLite/JSONB incompatibility and the `get_current_user` dependency injection pattern.

## What AI-Generated Output I Changed or Rejected

1. **Auth middleware → FastAPI dependency** — The initial plan used a Starlette `BaseHTTPMiddleware` for auth. I rejected this approach when the tests failed because middleware bypasses FastAPI's `dependency_overrides`. I changed to a `get_current_user` FastAPI dependency, which is the correct pattern for testable FastAPI auth.

2. **JSONB → JSON for SQLAlchemy model** — AI correctly used PostgreSQL's `JSONB` type in the migration SQL. However, the SQLAlchemy ORM model also used `JSONB`, which causes failures with SQLite in tests. Changed to `JSON` in the model (works on both); kept `JSONB` in the Alembic migration.

3. **`refresh(doc)` after update** — After `flush()` on an update, accessing `doc.updated_at` triggered a lazy load that failed in async context. Added `await db.refresh(doc)` explicitly.

4. **MUI v9 Typography `fontWeight` prop** — Generated code passed `fontWeight` as a direct prop on `<Typography>`. In MUI v9, this isn't in the type signature; it belongs in `sx`. Fixed across 3 files.

5. **`React.cloneElement` typing** — The `FileUpload` component used `React.ReactElement` without a type parameter for the trigger, causing a TypeScript error when cloning with `onClick`. Fixed by typing the trigger prop as `React.ReactElement<{ onClick?: () => void }>`.

## How I Verified Correctness

- **Backend:** `pytest tests/ -v` (5 tests, all passing). Also manually traced through the access control logic in `share_service.py` to confirm the `can_read`/`can_edit`/`can_manage` predicates are correct.
- **File parser:** Wrote a test that uploads a `.txt` file and asserts the resulting Tiptap JSON structure. Also manually verified `.md` parsing by uploading a sample Markdown file.
- **Frontend:** `tsc -b && vite build` with zero TypeScript errors. Ran the dev server and manually walked through the full flow: create doc → edit with rich text → share with Bob → switch users → see shared doc → upload file.
- **Linting:** `ruff check .` (backend, zero errors) and ESLint (frontend, zero errors).

## Key Judgment Calls I Made (Not Delegated to AI)

- Choosing mock `X-User-ID` auth over real JWT (scope/time decision)
- Refactoring from middleware to FastAPI dependency when tests revealed the architectural issue
- Deciding to lazy-load `EditorPage` to keep the initial bundle small
- Choosing `DocumentListOut` (without content) for list views vs full `DocumentOut`
