# KeepLite — Multi-User Note Taking API

A high-performance RESTful API backend for **KeepLite**, a Google Keep-inspired multi-user note-taking platform. Built with **Express 5**, **TypeScript (ESM)**, **Prisma 7 (PostgreSQL)**, and **JWT authentication** featuring strict per-user data isolation.

---

## Tech Stack

| Area | Tool | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (≥ 20), TypeScript (ESM) | Type-safe asynchronous execution |
| **Framework** | Express 5 | REST API routing and middleware |
| **Database** | PostgreSQL + Prisma 7 (`@prisma/adapter-pg`) | Relational database modeling, queries & migrations |
| **Validation** | Zod | Request body schema validation |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser` | Access & refresh token auth with httpOnly cookies |
| **Tooling** | `tsx` (dev/testing), `tsup` (production bundling) | Fast development reload and bundle builds |

---

## Features

- **JWT Authentication**: User registration, login, token refresh, and profile fetching with bcrypt hashing and secure httpOnly cookies.
- **Strict User Isolation**: Every note and category is strictly scoped to its owner (`req.user.userId`). Cross-user access attempts return `404 Not Found` to prevent data leakage.
- **Relational Categorization**: Categories are scoped per user (`@@unique([name, userId])`). Deleting a category sets associated note `categoryId` values to `null` (`onDelete: SetNull`).
- **Notes CRUD & Search**:
  - Full CRUD operations with color coding (`#ffffff`) and pinning (`isPinned`).
  - Multi-attribute search (`?search=`) matching title and content case-insensitively.
  - Category filtering (`?categoryId=`).
  - Automatic sorting: pinned notes always sort first, followed by most recently updated.
- **Standardized Response Envelope**: All endpoints return uniform JSON envelopes (`{ success, statusCode, message, data, meta? }`).
- **Centralized Error Handling**: Prisma errors (`P2002` duplicate -> 409, `P2025` not found -> 404, `P2003` foreign key -> 400) and `ZodError` validation (400) are mapped uniformly.

---

## Quick Start

### 1. Prerequisites
- Node.js ≥ 20
- npm
- PostgreSQL database (local or hosted like Neon, Supabase, etc.)

### 2. Installation
```bash
cd keep-lite-server
npm install
```
*(The `postinstall` script automatically runs `prisma generate` to build the client into `src/generated/prisma`).*

### 3. Environment Variables
Create a `.env` file in `keep-lite-server`:
```bash
cp .env.example .env
```
Configure your credentials:
```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/keeplite?schema=public
BCRYPT_SALT_ROUNDS=10
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Database Migrations
Apply the migrations to your PostgreSQL database:
```bash
npx prisma migrate dev
```

### 5. Running the Application
```bash
# Start development server with hot-reload
npm run dev

# Run automated integration & verification suite
npm test

# Typecheck TypeScript without emitting files
npm run typecheck

# Production build
npm run build

# Start production server
npm start
```

---

## API Reference (`/api/v1`)

### Liveness & Health
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Public | Root liveness check |
| `GET` | `/api/v1/health` | Public | System status and health envelope |

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Register new user & set auth cookies |
| `POST` | `/api/v1/auth/login` | Public | Login with credentials & set auth cookies |
| `POST` | `/api/v1/auth/refresh-token` | Cookie | Rotate access & refresh tokens |
| `POST` | `/api/v1/auth/logout` | Public | Clear authentication cookies |
| `GET` | `/api/v1/auth/me` | Bearer / Cookie | Get currently authenticated user profile |

### Categories (`/api/v1/categories`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/categories` | Bearer / Cookie | Create category (`{ "name": "Work" }`) |
| `GET` | `/api/v1/categories` | Bearer / Cookie | List user's categories with note count |
| `GET` | `/api/v1/categories/:id` | Bearer / Cookie | Get single category by ID |
| `PATCH` | `/api/v1/categories/:id` | Bearer / Cookie | Rename category |
| `DELETE` | `/api/v1/categories/:id` | Bearer / Cookie | Delete category (`note.categoryId` set to `null`) |

### Notes (`/api/v1/notes`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/notes` | Bearer / Cookie | Create note (`title`, `content`, optional `color`, `isPinned`, `categoryId`) |
| `GET` | `/api/v1/notes` | Bearer / Cookie | List user's notes (`?search=`, `?categoryId=`, sorted pinned-first) |
| `GET` | `/api/v1/notes/:id` | Bearer / Cookie | Get single note by ID |
| `PATCH` | `/api/v1/notes/:id` | Bearer / Cookie | Update note fields (color, title, content, pin, category) |
| `DELETE` | `/api/v1/notes/:id` | Bearer / Cookie | Delete user's note |

---

## Database Schema (Prisma Multi-File)

Located in `prisma/schema/`:
- **`user.prisma`**: Users with email, hashed password, role (`CUSTOMER`, `ADMIN`), and status (`ACTIVE`, `SUSPENDED`).
- **`category.prisma`**: Categories owned by a user, with composite unique constraint `@@unique([name, userId])`.
- **`note.prisma`**: Notes with `title`, `content`, `color`, `isPinned`, `userId` (`onDelete: Cascade`), and `categoryId` (`onDelete: SetNull`).
- **`enums.prisma`**: `Role` and `ActiveStatus` enums.
