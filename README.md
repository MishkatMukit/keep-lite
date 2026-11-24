# KeepLite

A multi-user note-taking platform backend inspired by Google Keep, designed with **Express 5**, **TypeScript**, **PostgreSQL**, and **Prisma 7**.

---

## Repository Structure

```text
keep-lite/
├── keep-lite-server/             # Backend API service
│   ├── prisma/schema/            # Multi-file Prisma schemas (User, Note, Category, Enums)
│   ├── prisma/migrations/        # PostgreSQL database migrations
│   ├── scripts/verify.ts         # Automated integration & verification test suite
│   ├── src/
│   │   ├── app/
│   │   │   ├── config/           # Environment configuration
│   │   │   ├── lib/              # Prisma client singleton
│   │   │   ├── middleware/       # checkAuth, validateRequest, globalErrorHandler, routerHandler
│   │   │   ├── modules/          # Feature modules (auth, category, note)
│   │   │   └── utils/            # sendResponse, catchAsync, AppError, authToken, jwt
│   │   ├── app.ts                # Express application configuration
│   │   └── server.ts             # Server entry listener
│   └── package.json
└── README.md
```

---

## Key Highlights

- **JWT Authentication & Security**: Complete auth lifecycle (`register`, `login`, `refresh-token`, `me`, `logout`) with bcrypt hashing and httpOnly cookie support.
- **Strict User Isolation**: All notes and categories belong to an authenticated user (`userId`). Cross-user access returns `404 Not Found`.
- **Relational Categorization**: Categories are scoped per user with composite unique constraints (`@@unique([name, userId])`). Deleting a category safely sets note category references to `null` (`SetNull`).
- **Notes CRUD, Search & Pinning**: Full CRUD with search (`?search=`), category filtering (`?categoryId=`), and automated pinned-first sorting.
- **Automated Verification**: End-to-end integration suite covering 35 test assertions across auth, isolation, and relational cascade behaviors (`npm test`).

---

## Quick Start

```bash
# Navigate to backend server
cd keep-lite-server

# Install dependencies (also generates Prisma client)
npm install

# Setup environment variables
cp .env.example .env

# Run database migrations
npx prisma migrate dev

# Run test suite
npm test

# Start dev server
npm run dev
```

For complete API documentation and endpoint details, see [keep-lite-server/README.md](file:///D:/WebDev2026/External/CRUD/keep-lite/keep-lite-server/README.md).
