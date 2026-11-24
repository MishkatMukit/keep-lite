# KeepLite — Multi-User Note App Documentation (Node.js, Express, JavaScript & Prisma)

**KeepLite** is a lightweight, Google Keep-inspired multi-user note-taking backend designed for a **Database Management Systems (DBMS)** course. It demonstrates relational database modeling with **PostgreSQL**, multi-file **Prisma ORM** schemas, **JWT authentication**, strict per-user data isolation, and a clean modular Express architecture.

---

## 1. Project Overview & Tech Stack

### Core Features
* **JWT Authentication:** User registration and login with `bcryptjs` password hashing and JSON Web Tokens.
* **Multi-User Data Isolation:** Every `Note` and `Category` belongs to a specific `User`; users can only access and modify their own records.
* **Notes CRUD & Keep Essentials:** Create, read, update, delete, pin/unpin, color-code, and search notes.
* **Relational Categorization:** Organize notes under user-specific categories.

### Tech Stack
| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | Node.js (v18+) | JavaScript runtime environment |
| **Framework** | Express.js | REST API routing and middleware |
| **Language** | JavaScript (CommonJS) | Backend logic |
| **Database** | PostgreSQL | Relational database management system |
| **ORM** | Prisma ORM | Multi-file schema modeling, migrations, and queries |
| **Auth** | `bcryptjs` & `jsonwebtoken` | Password hashing and stateless JWT auth |
| **Dev Tools** | Nodemon, Prisma Studio, Postman / Thunder Client | Auto-reload, DB visualization, API testing |

---

## 2. Database Design (DBMS Schema)

The database models two **1:N** relationships from `User` (`User -> Note` and `User -> Category`) and one optional **1:N** relationship from `Category` to `Note`.

```text
+--------------------+
|        User        |
+--------------------+
| PK  id (Int)       |
|     name (Str)     |
| UQ  email (Str)    |
|     password (Str) |
|     createdAt      |
+--------------------+
   | 1              | 1
   |                |
   | N              | N
   v                v
+------------------+          +----------------------+
|    Category      |          |         Note         |
+------------------+          +----------------------+
| PK  id (Int)     | 1      N | PK  id (Int)         |
|     name (Str)   |<---------|     title (Str)      |
| FK  userId (Int) |          |     content (Str)    |
|     createdAt    |          |     color (Str)      |
+------------------+          |     isPinned (Bool)  |
  UQ(name, userId)            | FK  userId (Int)     |
                              | FK  categoryId (Int?)|
                              |     createdAt        |
                              |     updatedAt        |
                              +----------------------+
```

* **Cascade Deletes (`onDelete: Cascade`):** Deleting a `User` automatically deletes all of their `Notes` and `Categories`.
* **Set Null (`onDelete: SetNull`):** Deleting a `Category` preserves its notes and sets `categoryId` to `NULL`.
* **Composite Unique Constraint (`@@unique([name, userId])`):** Different users can each have a category named `"Work"`, while a single user cannot create duplicate `"Work"` categories.

---

## 3. Project Folder Structure

```text
keeplite-backend/
├── prisma/
│   ├── migrations/
│   └── schema/
│       ├── schema.prisma          # Generator & datasource config
│       ├── user.prisma            # User model
│       ├── category.prisma        # Category model
│       └── note.prisma            # Note model
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── index.js           # Centralized .env variables
│   │   ├── lib/
│   │   │   └── prisma.js          # Shared PrismaClient instance
│   │   ├── middleware/
│   │   │   ├── checkAuth.js       # JWT verification middleware
│   │   │   ├── globalErrorHandler.js
│   │   │   └── notFound.js        # 404 route handler
│   │   ├── module/
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.route.js
│   │   │   │   └── auth.service.js
│   │   │   ├── category/
│   │   │   │   ├── category.controller.js
│   │   │   │   ├── category.route.js
│   │   │   │   └── category.service.js
│   │   │   └── note/
│   │   │       ├── note.controller.js
│   │   │       ├── note.route.js
│   │   │       └── note.service.js
│   │   └── utils/
│   │       ├── catchAsync.js      # Async error wrapper
│   │       ├── jwt.js             # JWT sign & verify helpers
│   │       └── sendResponse.js    # Standardized JSON response helper
│   ├── app.js                     # Express app, routes & error handlers
│   └── server.js                  # Server bootstrap
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 4. Setup & Configuration

### Step 1: Initialize & Install Dependencies
```bash
mkdir keeplite-backend
cd keeplite-backend
npm init -y
npm install express cors dotenv @prisma/client bcryptjs jsonwebtoken
npm install -D prisma nodemon
```

### Step 2: Configure `package.json`
Add development scripts and point Prisma to the `prisma/schema` directory:

```json
{
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "studio": "npx prisma studio"
  },
  "prisma": {
    "schema": "prisma/schema"
  }
}
```

### Step 3: Environment Variables (`.env.example` & `.env`)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/keeplite_db?schema=public"
JWT_SECRET="super_secret_key_change_in_production"
JWT_EXPIRES_IN="7d"
```

### Step 4: Centralized Config (`src/app/config/index.js`)
```javascript
require("dotenv").config();

module.exports = {
  node_env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN || "7d",
  },
};
```

---

## 5. Multi-File Prisma Schema (`prisma/schema/`)

### `prisma/schema/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### `prisma/schema/user.prisma`
```prisma
model User {
  id         Int        @id @default(autoincrement())
  name       String
  email      String     @unique
  password   String
  createdAt  DateTime   @default(now())
  notes      Note[]
  categories Category[]
}
```

### `prisma/schema/category.prisma`
```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  notes     Note[]

  @@unique([name, userId])
}
```

### `prisma/schema/note.prisma`
```prisma
model Note {
  id         Int       @id @default(autoincrement())
  title      String
  content    String
  color      String    @default("#ffffff")
  isPinned   Boolean   @default(false)
  userId     Int
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  categoryId Int?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

### Run the Initial Migration
```bash
npx prisma migrate dev --name init
```

Inspect your tables visually at any time:
```bash
npm run studio
```

### Shared Prisma Client (`src/app/lib/prisma.js`)
```javascript
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;
```

---

## 6. Core Utilities (`src/app/utils/`)

### `src/app/utils/catchAsync.js`
Wraps async controllers and forwards errors to `globalErrorHandler`.

```javascript
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = catchAsync;
```

### `src/app/utils/sendResponse.js`
Standardizes all JSON API responses.

```javascript
const sendResponse = (res, { statusCode, success, message, data }) => {
  res.status(statusCode).json({
    success,
    message,
    data: data ?? null,
  });
};

module.exports = sendResponse;
```

### `src/app/utils/jwt.js`
```javascript
const jwt = require("jsonwebtoken");
const config = require("../config");

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expires_in,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

module.exports = { generateToken, verifyToken };
```

---

## 7. Middlewares (`src/app/middleware/`)

### `src/app/middleware/checkAuth.js`
```javascript
const { verifyToken } = require("../utils/jwt");

const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Unauthorized: No token provided.");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { userId, email }
    next();
  } catch (err) {
    const error = new Error("Unauthorized: Invalid or expired token.");
    error.statusCode = 401;
    next(error);
  }
};

module.exports = checkAuth;
```

### `src/app/middleware/notFound.js`
```javascript
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
    data: null,
  });
};

module.exports = notFound;
```

### `src/app/middleware/globalErrorHandler.js`
```javascript
const config = require("../config");

const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";

  // Prisma Unique Constraint Violation
  if (err.code === "P2002") {
    statusCode = 409;
    message = "Duplicate entry: record already exists.";
  }

  // Prisma Record Not Found
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Requested record not found.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.node_env === "development" && { stack: err.stack }),
  });
};

module.exports = globalErrorHandler;
```

---

## 8. Feature Modules (`src/app/module/`)

### 8.1 Auth Module (`src/app/module/auth/`)

#### `auth.service.js`
```javascript
const bcrypt = require("bcryptjs");
const prisma = require("../../lib/prisma");
const { generateToken } = require("../../utils/jwt");

const register = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already in use.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = generateToken({ userId: user.id, email: user.email });
  return { user, token };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken({ userId: user.id, email: user.email });
  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
};

module.exports = { register, login };
```

#### `auth.controller.js`
```javascript
const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");
const AuthService = require("./auth.service");

const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required.");
    error.statusCode = 400;
    throw error;
  }
  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters.");
    error.statusCode = 400;
    throw error;
  }

  const result = await AuthService.register({ name, email, password });

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully.",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("Email and password are required.");
    error.statusCode = 400;
    throw error;
  }

  const result = await AuthService.login({ email, password });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully.",
    data: result,
  });
});

module.exports = { register, login };
```

#### `auth.route.js`
```javascript
const express = require("express");
const AuthController = require("./auth.controller");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;
```

---

### 8.2 Note Module (`src/app/module/note/`)

#### `note.service.js`
```javascript
const prisma = require("../../lib/prisma");

const createNote = async (userId, payload) => {
  return prisma.note.create({
    data: {
      title: payload.title,
      content: payload.content,
      color: payload.color || "#ffffff",
      isPinned: payload.isPinned || false,
      userId,
      categoryId: payload.categoryId ? Number(payload.categoryId) : null,
    },
    include: { category: true },
  });
};

const getAllNotes = async (userId, { search, categoryId }) => {
  const where = { userId };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    where.categoryId = Number(categoryId);
  }

  return prisma.note.findMany({
    where,
    include: { category: true },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });
};

const getNoteById = async (id, userId) => {
  const note = await prisma.note.findFirst({
    where: { id: Number(id), userId },
    include: { category: true },
  });

  if (!note) {
    const error = new Error("Note not found.");
    error.statusCode = 404;
    throw error;
  }

  return note;
};

const updateNote = async (id, userId, payload) => {
  await getNoteById(id, userId); // Verifies ownership or throws 404

  return prisma.note.update({
    where: { id: Number(id) },
    data: {
      title: payload.title,
      content: payload.content,
      color: payload.color,
      isPinned: payload.isPinned,
      categoryId:
        payload.categoryId !== undefined
          ? payload.categoryId
            ? Number(payload.categoryId)
            : null
          : undefined,
    },
    include: { category: true },
  });
};

const deleteNote = async (id, userId) => {
  await getNoteById(id, userId); // Verifies ownership or throws 404

  return prisma.note.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
```

#### `note.controller.js`
```javascript
const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");
const NoteService = require("./note.service");

const createNote = catchAsync(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    const error = new Error("Title and content are required.");
    error.statusCode = 400;
    throw error;
  }

  const result = await NoteService.createNote(req.user.userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Note created successfully.",
    data: result,
  });
});

const getAllNotes = catchAsync(async (req, res) => {
  const result = await NoteService.getAllNotes(req.user.userId, req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notes retrieved successfully.",
    data: result,
  });
});

const getNoteById = catchAsync(async (req, res) => {
  const result = await NoteService.getNoteById(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Note retrieved successfully.",
    data: result,
  });
});

const updateNote = catchAsync(async (req, res) => {
  const result = await NoteService.updateNote(req.params.id, req.user.userId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Note updated successfully.",
    data: result,
  });
});

const deleteNote = catchAsync(async (req, res) => {
  await NoteService.deleteNote(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Note deleted successfully.",
    data: null,
  });
});

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};
```

#### `note.route.js`
```javascript
const express = require("express");
const checkAuth = require("../../middleware/checkAuth");
const NoteController = require("./note.controller");

const router = express.Router();

router.use(checkAuth);

router.post("/", NoteController.createNote);
router.get("/", NoteController.getAllNotes);
router.get("/:id", NoteController.getNoteById);
router.patch("/:id", NoteController.updateNote);
router.delete("/:id", NoteController.deleteNote);

module.exports = router;
```

---

### 8.3 Category Module (`src/app/module/category/`)

#### `category.service.js`
```javascript
const prisma = require("../../lib/prisma");

const createCategory = async (userId, name) => {
  return prisma.category.create({
    data: { name, userId },
  });
};

const getAllCategories = async (userId) => {
  return prisma.category.findMany({
    where: { userId },
    include: { _count: { select: { notes: true } } },
    orderBy: { name: "asc" },
  });
};

const deleteCategory = async (id, userId) => {
  const category = await prisma.category.findFirst({
    where: { id: Number(id), userId },
  });

  if (!category) {
    const error = new Error("Category not found.");
    error.statusCode = 404;
    throw error;
  }

  return prisma.category.delete({ where: { id: Number(id) } });
};

module.exports = { createCategory, getAllCategories, deleteCategory };
```

#### `category.controller.js`
```javascript
const catchAsync = require("../../utils/catchAsync");
const sendResponse = require("../../utils/sendResponse");
const CategoryService = require("./category.service");

const createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    const error = new Error("Category name is required.");
    error.statusCode = 400;
    throw error;
  }

  const result = await CategoryService.createCategory(req.user.userId, name);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Category created successfully.",
    data: result,
  });
});

const getAllCategories = catchAsync(async (req, res) => {
  const result = await CategoryService.getAllCategories(req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Categories retrieved successfully.",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  await CategoryService.deleteCategory(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Category deleted successfully.",
    data: null,
  });
});

module.exports = { createCategory, getAllCategories, deleteCategory };
```

#### `category.route.js`
```javascript
const express = require("express");
const checkAuth = require("../../middleware/checkAuth");
const CategoryController = require("./category.controller");

const router = express.Router();

router.use(checkAuth);

router.post("/", CategoryController.createCategory);
router.get("/", CategoryController.getAllCategories);
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
```

---

## 9. App & Server Entry (`src/app.js` & `src/server.js`)

### `src/app.js`
```javascript
const express = require("express");
const cors = require("cors");
const authRoutes = require("./app/module/auth/auth.route");
const noteRoutes = require("./app/module/note/note.route");
const categoryRoutes = require("./app/module/category/category.route");
const notFound = require("./app/middleware/notFound");
const globalErrorHandler = require("./app/middleware/globalErrorHandler");

const app = express();

// Parsers & CORS
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "KeepLite API is running",
    data: null,
  });
});

// Application Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/notes", noteRoutes);
app.use("/api/v1/categories", categoryRoutes);

// 404 & Global Error Handler (Must be registered last)
app.use(notFound);
app.use(globalErrorHandler);

module.exports = app;
```

### `src/server.js`
```javascript
const app = require("./app");
const config = require("./app/config");

async function main() {
  try {
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
```

Start the development server:
```bash
npm run dev
```

---

## 10. API Reference

Base URL: `http://localhost:5000/api/v1`

Every endpoint returns a consistent JSON envelope:
```json
{
  "success": true,
  "message": "Note created successfully.",
  "data": {}
}
```

| Method | Endpoint | Auth | Description | Sample Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register a new user & receive JWT | `{ "name": "Rahim", "email": "rahim@mail.com", "password": "password123" }` |
| `POST` | `/auth/login` | Public | Login & receive JWT | `{ "email": "rahim@mail.com", "password": "password123" }` |
| `POST` | `/categories` | Bearer JWT | Create a category for the logged-in user | `{ "name": "DBMS Lab" }` |
| `GET` | `/categories` | Bearer JWT | List logged-in user's categories with note counts | — |
| `DELETE` | `/categories/:id` | Bearer JWT | Delete user's category (`note.categoryId` becomes `null`) | — |
| `POST` | `/notes` | Bearer JWT | Create a note owned by the logged-in user | `{ "title": "3NF", "content": "No transitive dependencies", "color": "#fef08a", "categoryId": 1 }` |
| `GET` | `/notes` | Bearer JWT | List user's notes (supports `?search=` and `?categoryId=`) | — |
| `GET` | `/notes/:id` | Bearer JWT | Get a single note owned by the logged-in user | — |
| `PATCH` | `/notes/:id` | Bearer JWT | Update user's note | `{ "isPinned": true }` |
| `DELETE` | `/notes/:id` | Bearer JWT | Delete user's note | — |

---

## 11. Frontend Integration (JWT Flow)

```javascript
const API_URL = "http://localhost:5000/api/v1";

// Login & store token
async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (json.success && json.data?.token) {
    localStorage.setItem("token", json.data.token);
  }
  return json;
}

// Fetch logged-in user's notes
async function loadMyNotes() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/notes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
```

---

## 12. Common Errors & Student Troubleshooting

| Error / Code | Cause | Fix |
| :--- | :--- | :--- |
| `P1001: Can't reach database server` | PostgreSQL isn't running or `.env` credentials are wrong. | Start PostgreSQL and verify `DATABASE_URL`. |
| `P2002: Unique constraint failed` | Duplicate email or duplicate category name for the same user. | Handled as `409 Conflict` by `globalErrorHandler`. |
| `401 Unauthorized` | Missing, malformed, or expired `Bearer <token>` header. | Re-login via `/api/v1/auth/login` and attach `Authorization: Bearer <token>`. |
| `404 Note not found` | Note ID doesn't exist or belongs to a different user. | Verify note ownership in Prisma Studio. |
| `PrismaClient did not initialize yet` | Schema updated without regenerating client. | Run `npx prisma generate` or `npx prisma migrate dev`. |