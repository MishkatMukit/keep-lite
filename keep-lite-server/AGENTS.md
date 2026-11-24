# AGENTS.md

KeepLite note-taking API: Express 5 + TypeScript (ESM) + Prisma 7 (PostgreSQL). The README still describes the original boilerplate, and `keeplite_backend_documentation.md` is an aspirational JavaScript/CommonJS design (`/api/v1`). Neither matches the implementation — trust `src/`, `prisma/schema/`, and `package.json`.

## Commands

- `npm install` — also runs `prisma generate` via `postinstall`
- `npm run dev` — `tsx watch src/server.ts`, listens on `PORT` (default 5000)
- `npm run build` — `prisma generate && tsup`, bundles everything into `dist/server.js`
- `npm start` — run the bundle
- `npm run typecheck` — `tsc --noEmit`; there is no lint or test script
- `npx prisma migrate dev --name <name>` — after editing `prisma/schema/*.prisma`
- `npx prisma generate` / `npx prisma studio`

There is no test suite. Verify behavior by running the dev server and calling endpoints.

## Locked decisions

- IDs are `Int @default(autoincrement())`; the JWT payload is `{ userId, name, email, role }`.
- Keep `User.role`/`User.status` with the `Role`/`ActiveStatus` enums.
- Keep `Category` and `Note.color`/`categoryId` as described in the spec.
- Target API prefix is `/api/v1`; current routes are still `/note` until Phase 4–5.
- Migrations are additive; do not squash or rewrite existing ones.

## Known WIP breakage (Nov 2026 — re-check before assuming)

- `note` module is a stub: only `POST /note`, no auth or validation, and `note.service.ts` never returns the created note. `auth()` is not mounted on note routes yet (Phase 3–4).
- `prisma/migrations/` is untracked. The second migration dropped the original `Category`/`Note.color`, and the third re-added them; add new migrations instead of rewriting these.

## Architecture

- `src/server.ts` starts the listener; `src/app.ts` owns middleware, routes, and error handling. Register routes, then `routeHandler` (404), then `globalErrorHandler` last.
- Features live in `src/app/modules/<feature>/` as route → controller → service. Wrap async controllers in `catchAsync`, throw `AppError(message, statusCode)`, and respond with `sendResponse(res, { statusCode, success, message, data, meta? })`.
- `validateRequest(zodSchema)` validates and replaces `req.body` only; a `ZodError` is forwarded to `globalErrorHandler`, which returns 400.
- Prisma 7 generates the client into `src/generated/prisma` (gitignored via `generated/`, never edit). Import it from there, not from `@prisma/client`: `import { prisma } from "../../lib/prisma"`, model types from `.../generated/prisma/client`, enums from `.../generated/prisma/enums`.
- `src/app/lib/prisma.ts` uses the `PrismaPg` driver adapter; `DATABASE_URL` is read when the module loads.
- The schema is multi-file under `prisma/schema/`. `prisma.config.ts` points the CLI at that directory and makes the datasource URL optional so `prisma generate` works without a database.
- `tsconfig.json` is strict with `verbatimModuleSyntax` and `exactOptionalPropertyTypes`; use `import type` for type-only imports.
- `src/app/config/index.ts` loads `.env` from `process.cwd()` and uses non-null assertions, so missing variables fail where used, not at startup. Treat every variable in `.env.example` as required.
- Auth endpoints are mounted at `/api/v1/auth` (`register`, `login`, `refresh-token`, `logout`, `me`). `createAuthTokens` in `src/app/utils/authToken.ts` issues the pair; access/refresh tokens are set as httpOnly cookies (1 day / 7 days) and also returned in the response body.
- `auth()` in `src/app/middleware/checkAuth.ts` tries the `Authorization` header first, then the `accessToken` cookie, verifies the `{ userId, name, email, role }` payload, looks the user up in the database, rejects non-active users with 401, and sets `req.user` to `{ userId, name, email, role }`. A role mismatch returns 403.
- `globalErrorHandler` maps Prisma `P2002`/`P2003`/`P2025` to **400** (not 409/404), and hides 5xx messages unless `NODE_ENV=development`.

## Deploy

`npm run build` → `npx prisma migrate deploy` → `npm start`. `vercel.json` routes all requests to `dist/server.js`.
