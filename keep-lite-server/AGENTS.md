# AGENTS.md

KeepLite note-taking API: Express 5 + TypeScript (ESM) + Prisma 7 (PostgreSQL). The codebase, schema, and API documentation are fully implemented, verified, and in sync across `src/`, `prisma/schema/`, and `README.md`.

## Commands

- `npm install` — also runs `prisma generate` via `postinstall`
- `npm run dev` — `tsx watch src/server.ts`, listens on `PORT` (default 5000)
- `npm test` — `tsx scripts/verify.ts`, runs the end-to-end integration and verification suite
- `npm run build` — `prisma generate && tsup`, bundles everything into `dist/server.js`
- `npm start` — run the bundled server
- `npm run typecheck` — `tsc --noEmit`
- `npx prisma migrate dev --name <name>` — create and apply migration after schema changes
- `npx prisma generate` / `npx prisma studio`

## Architecture & Locked Decisions

- **IDs & JWT**: IDs are `Int @default(autoincrement())`. The JWT payload is `{ userId, name, email, role }`.
- **User Roles & Status**: `User.role` (`CUSTOMER`, `ADMIN`) and `User.status` (`ACTIVE`, `SUSPENDED`).
- **Data Isolation**: Strict user-level isolation across all entities (`Category`, `Note`). Accessing another user's entity returns `404 Not Found`.
- **Relational Categorization**: Categories are scoped per user (`@@unique([name, userId])`). Deleting a category sets associated note `categoryId` to `null` (`onDelete: SetNull`).
- **API Prefix**: Unified under `/api/v1`:
  - `/api/v1/auth` (`register`, `login`, `refresh-token`, `logout`, `me`)
  - `/api/v1/categories` (CRUD with note counts and user isolation)
  - `/api/v1/notes` (CRUD, search, category filter, pinned ordering, isolation)
  - `/api/v1/health` (system health status envelope)
- **Module Design**: Route → Controller → Service. Async controllers are wrapped with `catchAsync`, errors thrown via `AppError(message, statusCode)`, and responses emitted via `sendResponse(res, { statusCode, success, message, data, meta? })`.
- **Zod Validation**: `validateRequest(zodSchema)` validates and replaces `req.body`. Validation errors map to `400 Bad Request`.
- **Prisma Client**: Prisma 7 generates client into `src/generated/prisma`. Imported from `../../lib/prisma` (singleton with `PrismaPg` driver adapter).
- **Global Error Handling**: `globalErrorHandler` centrally maps:
  - Prisma `P2002` → **409 Conflict** (duplicate constraint)
  - Prisma `P2025` → **404 Not Found** (record not found)
  - Prisma `P2003` → **400 Bad Request** (foreign key constraint)
  - `ZodError` → **400 Bad Request**
  - 5xx messages hidden outside `NODE_ENV=development`.
- **Cookies & Proxy**: Access token cookie (1 day) & refresh token cookie (7 days). `app.set("trust proxy", 1)` enabled for deployment.

## Deploy

`npm run build` → `npx prisma migrate deploy` → `npm start`. `vercel.json` routes all requests to `dist/server.js`.
