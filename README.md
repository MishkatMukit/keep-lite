# KeepLite

A multi-user note-taking platform backend inspired by Google Keep, designed with **Express 5**, **TypeScript**, **PostgreSQL**, and **Prisma 7**.

---

## Repository Structure

```text
keep-lite/
├── keep-lite-client/             # Frontend React app (React 19 + TypeScript + Tailwind CSS)
│   ├── src/                      # App components, styles, and assets
│   ├── vite.config.ts            # Vite config with @tailwindcss/vite plugin
│   └── package.json
├── keep-lite-server/             # Backend API service (Express 5 + TypeScript + Prisma 7)
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
├── api.md                        # Complete REST API specification
└── README.md
```

---

## Quick Start

### 1. Backend Setup (`keep-lite-server`)
```bash
cd keep-lite-server
npm install
cp .env.example .env
npx prisma migrate dev
npm test
npm run dev
```

### 2. Frontend Setup (`keep-lite-client`)
```bash
cd keep-lite-client
npm install
npm run dev
```

# Run database migrations
npx prisma migrate dev

# Run test suite
npm test

# Start dev server
npm run dev
```

For complete API documentation and endpoint details, see [keep-lite-server/README.md](file:///D:/WebDev2026/External/CRUD/keep-lite/keep-lite-server/README.md).
