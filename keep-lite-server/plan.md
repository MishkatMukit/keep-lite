# KeepLite Backend — Phased Implementation Plan

## Goal

Implement the feature set described in `keeplite_backend_documentation.md` (JWT auth, per-user notes, categories, search, pinning) on top of the existing TypeScript/ESM/Prisma 7 codebase.

The documentation is a **feature spec**, not a code template: its snippets are JavaScript/CommonJS and use older folder names. Follow the repo's TypeScript conventions documented in `AGENTS.md`; ignore the doc's JS syntax and `src/app/module/` layout.

## Progress

- [x] Phase 0 — baseline unblocked
- [x] Phase 1 — schema + migration
- [x] Phase 2 — auth + middleware
- [ ] Phase 3 — categories
- [ ] Phase 4 — notes
- [ ] Phase 5 — API consistency
- [ ] Phase 6 — verification
- [ ] Phase 7 — docs + deployment

## Baseline before Phase 0 (verified)

| Area | State |
| --- | --- |
| App bootstrap | `src/app.ts` imports the deleted `modules/example` route, so dev/build fail |
| Auth | Stub controller/route; middleware exists but is unused and out of sync with the `User` model |
| Notes | Stub `POST /note`; no validation, no ownership, service returns `undefined` |
| Categories | Missing entirely |
| Schema | `User` has `Int` id but no `role`/`status`; `Note` has no `color`/`categoryId`; `Category` missing |
| Migrations | Untracked; migration 1 creates Category/color, migration 2 drops them |
| API prefix | Inconsistent (`/note`, `/api/example`); docs specify `/api/v1` |
| Tests | None; no test/lint scripts |

## Decisions to lock before coding

| # | Decision | Recommendation |
| --- | --- | --- |
| 1 | ID type | Keep `Int @default(autoincrement())` (matches doc and current schema); change auth middleware from `string` to `number` |
| 2 | `User.role` / `User.status` | Keep them (`CUSTOMER`/`ADMIN`, `ACTIVE`/`SUSPENDED`); already scaffolded in auth middleware |
| 3 | `Category` + `Note.color`/`categoryId` | Restore them per the doc; they were removed by migration 2 |
| 4 | API prefix | `/api/v1` for all routes, including health |
| 5 | JWT payload | `{ userId, name, email, role }` via `createAuthTokens`, mirroring MessTally's auth conventions |
| 6 | Refresh tokens | Implement access + refresh with httpOnly cookies; env vars already exist |
| 7 | Migration baseline | If the dev DB can be reset, squash the two untracked migrations into one clean `init`; otherwise add a third migration |
| 8 | Error codes | Align with the doc: duplicate = 409, missing record = 404, validation = 400 |
| 9 | Verification | Add Vitest + Supertest if acceptable; otherwise ship an `.http` smoke suite and keep manual checks |

Record the chosen answers in `AGENTS.md` when they are finalized.

## Phase overview

| Phase | Outcome | Depends on | Exit criteria |
| --- | --- | --- | --- |
| 0 | App builds and boots again | — | `npm run dev` and `npm run build` succeed |
| 1 | Final schema + migration | Decisions 1–3, 7 | `prisma migrate` applies; client regenerates |
| 2 | Working auth + fixed middleware | Phase 1, Decisions 5–6 | Register/login/refresh/me work; `tsc --noEmit` is clean |
| 3 | Category API with isolation | Phase 2 | Create/list/delete are owner-scoped |
| 4 | Full Note API | Phase 2 (Phase 3 for category filter) | CRUD, search, filter, pin ordering, isolation |
| 5 | Consistent API surface | Phases 2–4 | Unified prefix, envelopes, status codes, 404/error order |
| 6 | Automated or scripted verification | Phase 5 | Auth/isolation/validation cases pass |
| 7 | Docs + deployment readiness | Phase 6 | Fresh-clone setup works; production build runs |

---

## Phase 0 — Unblock the baseline

**Goal:** Make the existing app runnable before changing behavior.

Tasks:
- Remove the `exampleRoutes` import and `/api/example` mount from `src/app.ts`; the module was deleted.
- Keep `/note` mounted for now; it will be replaced in Phase 4.
- Reorder the tail of `src/app.ts` to: routes → `routeHandler` (404) → `globalErrorHandler` (error handler last).
- Add a `typecheck` script (`tsc --noEmit`) to `package.json` if desired.
- Do not attempt to fix `auth.ts` yet; it is addressed in Phase 2.

Exit criteria:
- `npm run dev` starts and `GET /` responds.
- `npm run build` produces `dist/server.js`.
- `npx tsc --noEmit` still reports only the known `auth.ts`/schema errors, which Phase 1–2 remove.

## Phase 1 — Data model and migrations

**Goal:** Bring the Prisma schema in line with the documented domain.

Tasks:
- `prisma/schema/user.prisma`: keep `Int` id; add `role Role @default(CUSTOMER)` and `status ActiveStatus @default(ACTIVE)`; keep `notes Note[]` and add `categories Category[]`.
- `prisma/schema/category.prisma`: create `Category` with `id`, `name`, `userId`, `user` relation (`onDelete: Cascade`), `createdAt`, `notes Note[]`, and `@@unique([name, userId])`.
- `prisma/schema/note.prisma`: add `color String @default("#ffffff")` and optional `categoryId Int?` with `category Category? @relation(..., onDelete: SetNull)`.
- Consider `@@index([userId])` on `Note` and `Category` for ownership queries.
- Keep `prisma/schema/enums.prisma` (`Role`, `ActiveStatus`).
- Create the migration (`npx prisma migrate dev --name add_categories_and_user_fields`), or squash the untracked baseline into a single `init` if the DB can be reset.
- Run `npx prisma generate`; confirm the generated client now exposes `prisma.category` and the new fields.

Exit criteria:
- `npx prisma migrate status` is clean.
- `prisma.user` includes `role`/`status`; `prisma.note` includes `color`/`categoryId`; `prisma.category` exists.
- No generated files are committed (`src/generated` stays gitignored).

## Phase 2 — Auth module and middleware

**Goal:** Implement the documented auth flow and make the middleware match the schema.

Tasks (aligned with `mess-tally-backend` conventions):
- `src/app/utils/authToken.ts`: `createAuthTokens` issues the access/refresh pair with payload `{ userId, name, email, role }`.
- `src/app/modules/auth/auth.interface.ts`: `IRegisterUser`, `ILoginUser`, `IRequestUser` (`userId`).
- `src/app/modules/auth/auth.validation.ts`: MessTally-style Zod schemas (`registerUserSchema`, `loginUserSchema`) with email normalization and password strength rules.
- `src/app/modules/auth/auth.service.ts`:
  - `registerUser`: reject duplicate email with `AppError(..., 409)`; hash with `config.bcrypt_salt_rounds`; create user; return `{ user, ...tokens }`.
  - `loginUser`: find by email (404 if missing), reject suspended (403), `bcrypt.compare` (401 on mismatch), return tokens.
  - `getMe`: reload the user by `userId`, omit `password`, 404 if missing.
  - `refreshToken`: verify with `JWT_REFRESH_SECRET`, reload user, reject non-active (401), rotate tokens.
  - Never return `password`.
- `src/app/modules/auth/auth.controller.ts`: MessTally cookie settings (access 1 day, refresh 7 days, `secure` outside development, `sameSite` `lax` in development / `none` otherwise); refresh reads the cookie only.
- `src/app/modules/auth/auth.route.ts`: `POST /register`, `POST /login`, `POST /refresh-token`, `POST /logout`, `GET /me` guarded by `auth(Role.CUSTOMER, Role.ADMIN)`.
- Mount in `src/app.ts` at `/api/v1/auth`.
- Add `src/app/middleware/checkAuth.ts` (replacing `auth.ts`):
  - Accept the `Authorization` header first, then the `accessToken` cookie; tolerate `Bearer` casing and stray quotes.
  - Validate `{ userId, name, email, role }`; look the user up by all four fields.
  - 401 for missing/invalid/expired tokens, missing users, or non-active accounts; 403 for role mismatch.
  - Expose `req.user = { userId, name, email, role }`.

Exit criteria:
- Register → login → refresh → `GET /me` works via curl.
- Duplicate email returns 409; missing user login returns 404; bad credentials return 401; suspended login returns 403.
- Missing/invalid token returns 401; suspended user with a valid token returns 401.
- `npx tsc --noEmit` is clean.

## Phase 3 — Category module

**Goal:** Add the documented category endpoints with per-user isolation.

Tasks:
- `src/app/modules/category/category.validations.ts`: `name` non-empty, trimmed, reasonable max length.
- `src/app/modules/category/category.service.ts`:
  - Create for `req.user.userId`; map Prisma `P2002` to `AppError(409)` (duplicate name for the same user).
  - List only `where: { userId }`, include `_count: { select: { notes: true } }`, order by `name`.
  - Delete via `findFirst({ id, userId })` first; 404 if not owned.
- `category.controller.ts` / `category.route.ts`: `router.use(auth())`; `POST /`, `GET /`, `DELETE /:id`.
- Mount at `/api/v1/categories`.
- Optional/deferred: `PATCH /:id` rename.

Exit criteria:
- Two users can each own a category named "Work"; a duplicate for one user returns 409.
- User A cannot see or delete user B's category.
- Deleting a category leaves its notes intact with `categoryId = null` (verify via `GET /notes`).

## Phase 4 — Note module

**Goal:** Replace the stub with the full documented CRUD surface.

Tasks:
- `note.validations.ts`:
  - Create: `title` and `content` required; optional `color` (hex), `isPinned`, `categoryId`.
  - Update: all fields optional; allow `categoryId: null` to clear.
  - Query: optional `search`, `categoryId`.
- `note.service.ts`:
  - Create with `userId`; if `categoryId` is supplied, verify it belongs to the same user.
  - List with `where: { userId }`, optional `search` on title/content (`contains`, `mode: "insensitive"`), optional `categoryId`, order by `isPinned desc`, then `updatedAt desc`.
  - Get/update/delete via `findFirst({ id, userId })`; 404 when not owned.
  - Update only provided fields (watch `exactOptionalPropertyTypes`).
  - Return the created/updated record.
- `note.controller.ts`: 201 on create, 200 elsewhere; consistent messages/envelope.
- `note.routes.ts`: `router.use(auth())`; `POST /`, `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`.
- Mount at `/api/v1/notes`; remove the old `/note` mount.

Exit criteria:
- Full CRUD works for the logged-in user.
- User A cannot read, update, or delete user B's note (404, not 403, to avoid leaking existence).
- `?search=` matches title/content case-insensitively; `?categoryId=` filters.
- Pinned notes sort first.

## Phase 5 — API consistency and hardening

**Goal:** Make responses, status codes, and middleware order match the documented contract.

Tasks:
- Use `/api/v1` for auth, categories, notes, and `GET /api/v1/health`; keep `GET /` as a minimal liveness response if desired.
- Align `globalErrorHandler`:
  - `P2002` → 409, `P2025` → 404, `P2003` → 400, `ZodError` → 400.
  - Keep 5xx details hidden unless `NODE_ENV=development`.
  - Preserve `AppError` messages and status codes.
- Align the 404 handler with the response envelope (`success: false`, `statusCode`, `message`, `data: null`).
- Confirm middleware order: parsers → CORS → routes → 404 → error handler.
- Cookie/CORS settings: `credentials: true`, `APP_URL` origin, `secure` cookies in production, `app.set("trust proxy", 1)` if deployed behind a proxy.
- Optional: validate env vars at startup with Zod instead of non-null assertions; fail fast with a clear message.

Exit criteria:
- Every endpoint returns the documented envelope.
- Error matrix (400/401/403/404/409/500) is consistent across modules.
- Production mode does not leak stack traces or internal messages.

## Phase 6 — Verification

**Goal:** Prove auth, isolation, and CRUD behavior, not just compilation.

Preferred (if adding dev dependencies):
- Add Vitest + Supertest and a `test` script.
- Use a dedicated test database (`DATABASE_URL` override); run migrations before the suite.
- Cover:
  - Register/login/refresh/me; duplicate email; bad password; missing/invalid token.
  - Suspended user and role-protected route.
  - Category duplicate 409; cross-user access denied.
  - Note CRUD; cross-user read/update/delete returns 404.
  - Category delete sets `categoryId` to null.
  - Search, category filter, pinned ordering.
  - Validation failures return 400.

Fallback (no new dependencies):
- Add `docs/keeplite.http` (or a PowerShell script) with the same cases, including token capture between requests.
- Run it manually against `npm run dev`.

Exit criteria:
- `npx tsc --noEmit`, `npm run build`, and the test/smoke suite pass.
- Isolation cases are explicitly demonstrated for two users.

## Phase 7 — Documentation and deployment

**Goal:** Make the repo self-explanatory and deployable.

Tasks:
- Rewrite `README.md` for the actual stack and API: TypeScript/ESM, `/api/v1`, auth/category/note endpoints, env table, migration commands.
- Reconcile `keeplite_backend_documentation.md`: either mark it as the original spec or update it to the implemented TypeScript API.
- Update `AGENTS.md`: remove the "Known WIP breakage" section, document new scripts and the finalized token/route decisions.
- Production checklist: `NODE_ENV=production`, strong JWT secrets, correct `APP_URL`, reachable PostgreSQL, migrations applied.
- Deployment: `npm run build` → `npx prisma migrate deploy` → `npm start`; verify `dist/server.js` runs before deploying to Vercel.
- Note Prisma connection pooling/cold-start behavior when deploying serverless.

Exit criteria:
- Fresh clone → `npm install` → `.env` → `prisma migrate deploy` → `npm run dev` works.
- `npm run build && npm start` serves the API.
- README and `AGENTS.md` match the code; no stale route or schema claims remain.

## Cross-cutting conventions

- TypeScript ESM, strict mode: use `import type` for type-only imports.
- Module shape: route → controller → service; controllers wrap with `catchAsync`; services throw `AppError`.
- Validate request bodies with `validateRequest(schema)`; it replaces `req.body` with parsed data.
- Always respond through `sendResponse`; always filter user-owned data by `req.user.userId`.
- Import Prisma from `src/generated/prisma/*`, never `@prisma/client`; never edit generated files.
- Schema changes require a migration plus `prisma generate`.
- Keep secrets out of the repo; `.env` stays untracked.

## Suggested commit sequence

1. `chore: unblock app bootstrap`
2. `feat(db): add user role/status and category relations`
3. `feat(auth): add refresh-token flow and checkAuth middleware`
4. `feat(category): add owner-scoped category API`
5. `feat(note): implement full note CRUD with search and isolation`
6. `refactor(api): unify /api/v1, errors, and 404 handling`
7. `test: add auth and isolation coverage`
8. `docs: align README, AGENTS, and deployment notes`

## Out of scope (unless requested)

- Note sharing/collaboration, attachments, reminders, labels beyond categories.
- Email verification, password reset, OAuth, rate limiting.
- Pagination and sorting controls beyond pinned/updated ordering (the response envelope already supports `meta`).
- Category rename/update and bulk note operations.
