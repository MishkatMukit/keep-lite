# KeepLite API Documentation (`/api/v1`)

Complete reference for all endpoints of the KeepLite REST API, including authentication requirements, request body/query schemas, success responses, and error response formats.

---

## Table of Contents
- [Global Conventions & Formats](#global-conventions--formats)
- [System & Health Endpoints](#system--health-endpoints)
- [Authentication Module (`/api/v1/auth`)](#authentication-module-apiv1auth)
  - [1. Register User](#1-register-user)
  - [2. Login User](#2-login-user)
  - [3. Refresh Token](#3-refresh-token)
  - [4. Logout User](#4-logout-user)
  - [5. Get Current User Profile](#5-get-current-user-profile)
- [Category Module (`/api/v1/categories`)](#category-module-apiv1categories)
  - [6. Create Category](#6-create-category)
  - [7. List All Categories](#7-list-all-categories)
  - [8. Get Category by ID](#8-get-category-by-id)
  - [9. Rename / Update Category](#9-rename--update-category)
  - [10. Delete Category](#10-delete-category)
- [Note Module (`/api/v1/notes`)](#note-module-apiv1notes)
  - [11. Create Note](#11-create-note)
  - [12. List Notes (Search, Filter, Pinned-First)](#12-list-notes-search-filter-pinned-first)
  - [13. Get Note by ID](#13-get-note-by-id)
  - [14. Update Note](#14-update-note)
  - [15. Delete Note](#15-delete-note)
- [Standard Error Codes & Envelope](#standard-error-codes--envelope)

---

## Global Conventions & Formats

### Base URL
```text
http://localhost:5000/api/v1
```

### Standard Response Envelope
All successful requests return a uniform JSON envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": { ... } // Optional: pagination or summary metadata
}
```

### Standard Error Envelope
All error responses return a uniform JSON error envelope:
```json
{
  "success": false,
  "statusCode": 400,
  "name": "ZodError",
  "message": "Detailed error message",
  "error": { ... }, // Included in development mode only
  "stack": "..."     // Included in development mode only
}
```

### Authentication Mechanism
Protected endpoints accept authentication in either of two ways:
1. **Bearer Header**: `Authorization: Bearer <accessToken>`
2. **Cookie**: An httpOnly cookie named `accessToken` sent automatically with requests (`credentials: "include"` / `withCredentials: true`).

---

## System & Health Endpoints

### Root Liveness Check
* **Method**: `GET`
* **Path**: `/`
* **Auth**: None (Public)
* **Description**: Verifies the HTTP listener is active.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Server is running",
  "author": "4AM"
}
```

---

### Health Check
* **Method**: `GET`
* **Path**: `/api/v1/health`
* **Auth**: None (Public)
* **Description**: Verifies API operational status and returns current timestamp.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "KeepLite API is healthy",
  "data": {
    "status": "UP",
    "timestamp": "2026-11-25T00:54:00.000Z",
    "environment": "development"
  }
}
```

---

## Authentication Module (`/api/v1/auth`)

### 1. Register User
* **Method**: `POST`
* **Path**: `/api/v1/auth/register`
* **Auth**: None (Public)
* **Headers**: `Content-Type: application/json`

#### Request Body
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Trimmed, 2–80 characters, letters, spaces, hyphens, apostrophes |
| `email` | `string` | **Yes** | Valid RFC-compliant email, normalized to lowercase |
| `password` | `string` | **Yes** | Min 8 chars, max 72 bytes, must contain at least 1 letter and 1 number |

```json
{
  "name": "Mishkat Mukit",
  "email": "mishkat@example.com",
  "password": "Password123!"
}
```

#### Success Response (`201 Created`)
*Also sets `accessToken` (1 day) and `refreshToken` (7 days) as httpOnly cookies.*
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Mishkat Mukit",
      "email": "mishkat@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "createdAt": "2026-11-25T00:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Validation error (e.g. invalid email format, password too short).
  ```json
  {
    "success": false,
    "statusCode": 400,
    "name": "ZodError",
    "message": "password: Password must contain at least one letter and one number"
  }
  ```
- **`409 Conflict`**: User already exists with this email.
  ```json
  {
    "success": false,
    "statusCode": 409,
    "name": "AppError",
    "message": "User with this email already exists"
  }
  ```

---

### 2. Login User
* **Method**: `POST`
* **Path**: `/api/v1/auth/login`
* **Auth**: None (Public)
* **Headers**: `Content-Type: application/json`

#### Request Body
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `email` | `string` | **Yes** | Valid email |
| `password` | `string` | **Yes** | Non-empty string |

```json
{
  "email": "mishkat@example.com",
  "password": "Password123!"
}
```

#### Success Response (`200 OK`)
*Also sets `accessToken` and `refreshToken` as httpOnly cookies.*
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### Error Responses
- **`401 Unauthorized`**: Password does not match.
  ```json
  {
    "success": false,
    "statusCode": 401,
    "name": "AppError",
    "message": "Invalid credentials"
  }
  ```
- **`403 Forbidden`**: User account is suspended.
  ```json
  {
    "success": false,
    "statusCode": 403,
    "name": "AppError",
    "message": "User is Suspended"
  }
  ```
- **`404 Not Found`**: Email not found in system.
  ```json
  {
    "success": false,
    "statusCode": 404,
    "name": "AppError",
    "message": "User Not Found"
  }
  ```

---

### 3. Refresh Token
* **Method**: `POST`
* **Path**: `/api/v1/auth/refresh-token`
* **Auth**: HttpOnly cookie `refreshToken`
* **Headers**: None required

#### Success Response (`200 OK`)
*Rotates and sets new `accessToken` and `refreshToken` cookies.*
```json
{
  "success": true,
  "statusCode": 200,
  "message": "New tokens generated successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

#### Error Responses
- **`401 Unauthorized`**: Refresh token missing or expired.
  ```json
  {
    "success": false,
    "statusCode": 401,
    "name": "AppError",
    "message": "Refresh token is missing"
  }
  ```

---

### 4. Logout User
* **Method**: `POST`
* **Path**: `/api/v1/auth/logout`
* **Auth**: None (Public - allows clearing expired sessions)

#### Success Response (`200 OK`)
*Clears `accessToken` and `refreshToken` cookies.*
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 5. Get Current User Profile
* **Method**: `GET`
* **Path**: `/api/v1/auth/me`
* **Auth**: Bearer Token or `accessToken` cookie
* **Role**: `CUSTOMER` or `ADMIN`

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched successfully",
  "data": {
    "id": 1,
    "name": "Mishkat Mukit",
    "email": "mishkat@example.com",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "createdAt": "2026-11-25T00:00:00.000Z"
  }
}
```

#### Error Responses
- **`401 Unauthorized`**: Missing token or token expired.
  ```json
  {
    "success": false,
    "statusCode": 401,
    "name": "AppError",
    "message": "You are not logged in. Please log in to access this resource."
  }
  ```

---

## Category Module (`/api/v1/categories`)

*All category endpoints require authentication. Categories are strictly scoped to the authenticated user.*

### 6. Create Category
* **Method**: `POST`
* **Path**: `/api/v1/categories`
* **Auth**: Bearer Token or `accessToken` cookie

#### Request Body
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Trimmed, 1–50 characters, non-empty |

```json
{
  "name": "Database Lab"
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Database Lab",
    "userId": 1,
    "createdAt": "2026-11-25T00:00:00.000Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Empty or invalid category name.
- **`401 Unauthorized`**: Not logged in.
- **`409 Conflict`**: User already has a category with this name.
  ```json
  {
    "success": false,
    "statusCode": 409,
    "name": "PrismaClientKnownRequestError",
    "message": "Duplicate value error: a record with this name, userId already exists."
  }
  ```

---

### 7. List All Categories
* **Method**: `GET`
* **Path**: `/api/v1/categories`
* **Auth**: Bearer Token or `accessToken` cookie
* **Description**: Returns all categories owned by the logged-in user, ordered alphabetically by name (`asc`), with the count of active notes attached.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Database Lab",
      "userId": 1,
      "createdAt": "2026-11-25T00:00:00.000Z",
      "_count": {
        "notes": 4
      }
    },
    {
      "id": 2,
      "name": "Personal Ideas",
      "userId": 1,
      "createdAt": "2026-11-25T00:00:00.000Z",
      "_count": {
        "notes": 0
      }
    }
  ]
}
```

---

### 8. Get Category by ID
* **Method**: `GET`
* **Path**: `/api/v1/categories/:id`
* **Auth**: Bearer Token or `accessToken` cookie
* **Path Parameters**:
  - `id` (`number`): Positive integer representing Category ID.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category retrieved successfully",
  "data": {
    "id": 1,
    "name": "Database Lab",
    "userId": 1,
    "createdAt": "2026-11-25T00:00:00.000Z",
    "_count": {
      "notes": 4
    }
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Non-numeric or invalid category ID.
- **`404 Not Found`**: Category does not exist or is owned by another user (isolated).

---

### 9. Rename / Update Category
* **Method**: `PATCH`
* **Path**: `/api/v1/categories/:id`
* **Auth**: Bearer Token or `accessToken` cookie

#### Request Body
| Field | Type | Required | Constraints |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Trimmed, 1–50 characters |

```json
{
  "name": "Advanced DBMS Lab"
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category updated successfully",
  "data": {
    "id": 1,
    "name": "Advanced DBMS Lab",
    "userId": 1,
    "createdAt": "2026-11-25T00:00:00.000Z"
  }
}
```

#### Error Responses
- **`404 Not Found`**: Category does not exist or is not owned by user.
- **`409 Conflict`**: User already has another category with this target name.

---

### 10. Delete Category
* **Method**: `DELETE`
* **Path**: `/api/v1/categories/:id`
* **Auth**: Bearer Token or `accessToken` cookie
* **Relational Behavior**: Deleting a category **does not delete its notes**. All attached notes have their `categoryId` set to `null` (`SetNull`).

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category deleted successfully",
  "data": null
}
```

#### Error Responses
- **`404 Not Found`**: Category does not exist or is not owned by user.

---

## Note Module (`/api/v1/notes`)

*All note endpoints require authentication. Notes are strictly scoped to the authenticated user.*

### 11. Create Note
* **Method**: `POST`
* **Path**: `/api/v1/notes`
* **Auth**: Bearer Token or `accessToken` cookie

#### Request Body
| Field | Type | Required | Default | Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `title` | `string` | **Yes** | — | Trimmed, 1–200 characters |
| `content` | `string` | **Yes** | — | Min 1 character |
| `color` | `string` | No | `"#ffffff"` | Valid 3 or 6 hex digit string (e.g. `#ffffff`, `#fef08a`) |
| `isPinned` | `boolean`| No | `false` | Boolean |
| `categoryId` | `number \| null` | No | `null` | Must be a category owned by the logged-in user |

```json
{
  "title": "Third Normal Form (3NF)",
  "content": "A table is in 3NF if it is in 2NF and has no transitive functional dependencies.",
  "color": "#fef08a",
  "isPinned": true,
  "categoryId": 1
}
```

#### Success Response (`201 Created`)
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Note created successfully.",
  "data": {
    "id": 1,
    "title": "Third Normal Form (3NF)",
    "content": "A table is in 3NF if it is in 2NF and has no transitive functional dependencies.",
    "color": "#fef08a",
    "isPinned": true,
    "userId": 1,
    "categoryId": 1,
    "createdAt": "2026-11-25T00:00:00.000Z",
    "updatedAt": "2026-11-25T00:00:00.000Z",
    "category": {
      "id": 1,
      "name": "Database Lab",
      "userId": 1,
      "createdAt": "2026-11-25T00:00:00.000Z"
    }
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Validation error (missing title/content, invalid hex color).
- **`404 Not Found`**: The specified `categoryId` does not exist or belongs to another user.

---

### 12. List Notes (Search, Filter, Pinned-First)
* **Method**: `GET`
* **Path**: `/api/v1/notes`
* **Auth**: Bearer Token or `accessToken` cookie

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `search` | `string` | No | Case-insensitive substring match against `title` OR `content` |
| `categoryId` | `number` | No | Filters notes belonging exclusively to this Category ID |

#### Example Query URLs
- List all user's notes: `GET /api/v1/notes`
- Search notes: `GET /api/v1/notes?search=normal+form`
- Filter by category: `GET /api/v1/notes?categoryId=1`
- Search within category: `GET /api/v1/notes?search=3nf&categoryId=1`

#### Ordering
Notes are automatically ordered by:
1. `isPinned: "desc"` (pinned notes always appear at the top)
2. `updatedAt: "desc"` (most recently updated notes appear next)

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Notes retrieved successfully.",
  "data": [
    {
      "id": 1,
      "title": "Third Normal Form (3NF)",
      "content": "A table is in 3NF if it is in 2NF and has no transitive functional dependencies.",
      "color": "#fef08a",
      "isPinned": true,
      "userId": 1,
      "categoryId": 1,
      "createdAt": "2026-11-25T00:00:00.000Z",
      "updatedAt": "2026-11-25T00:00:00.000Z",
      "category": {
        "id": 1,
        "name": "Database Lab",
        "userId": 1,
        "createdAt": "2026-11-25T00:00:00.000Z"
      }
    },
    {
      "id": 2,
      "title": "Weekend Grocery",
      "content": "Milk, eggs, coffee beans",
      "color": "#ffffff",
      "isPinned": false,
      "userId": 1,
      "categoryId": null,
      "createdAt": "2026-11-25T00:02:00.000Z",
      "updatedAt": "2026-11-25T00:02:00.000Z",
      "category": null
    }
  ]
}
```

---

### 13. Get Note by ID
* **Method**: `GET`
* **Path**: `/api/v1/notes/:id`
* **Auth**: Bearer Token or `accessToken` cookie
* **Path Parameters**:
  - `id` (`number`): Positive integer representing Note ID.

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Note retrieved successfully.",
  "data": {
    "id": 1,
    "title": "Third Normal Form (3NF)",
    "content": "A table is in 3NF if it is in 2NF and has no transitive functional dependencies.",
    "color": "#fef08a",
    "isPinned": true,
    "userId": 1,
    "categoryId": 1,
    "createdAt": "2026-11-25T00:00:00.000Z",
    "updatedAt": "2026-11-25T00:00:00.000Z",
    "category": {
      "id": 1,
      "name": "Database Lab",
      "userId": 1,
      "createdAt": "2026-11-25T00:00:00.000Z"
    }
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Non-numeric or invalid note ID.
- **`404 Not Found`**: Note not found or owned by another user.

---

### 14. Update Note
* **Method**: `PATCH`
* **Path**: `/api/v1/notes/:id`
* **Auth**: Bearer Token or `accessToken` cookie
* **Description**: Partial update. Only provided fields are updated.

#### Request Body *(All fields optional)*
| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Updated title (1–200 characters) |
| `content` | `string` | Updated note body |
| `color` | `string` | Hex color code (e.g. `#bbf7d0`) |
| `isPinned` | `boolean`| Pin (`true`) or unpin (`false`) |
| `categoryId` | `number \| null` | Set to category ID to assign, or `null` to detach category |

```json
{
  "isPinned": false,
  "color": "#e9d5ff",
  "categoryId": null
}
```

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Note updated successfully.",
  "data": {
    "id": 1,
    "title": "Third Normal Form (3NF)",
    "content": "A table is in 3NF if it is in 2NF and has no transitive functional dependencies.",
    "color": "#e9d5ff",
    "isPinned": false,
    "userId": 1,
    "categoryId": null,
    "createdAt": "2026-11-25T00:00:00.000Z",
    "updatedAt": "2026-11-25T00:15:00.000Z",
    "category": null
  }
}
```

#### Error Responses
- **`400 Bad Request`**: Invalid field values or hex color format.
- **`404 Not Found`**: Note does not exist, note is owned by another user, or new `categoryId` is not owned by user.

---

### 15. Delete Note
* **Method**: `DELETE`
* **Path**: `/api/v1/notes/:id`
* **Auth**: Bearer Token or `accessToken` cookie

#### Success Response (`200 OK`)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Note deleted successfully.",
  "data": null
}
```

#### Error Responses
- **`404 Not Found`**: Note not found or owned by another user.

---

## Standard Error Codes & Envelope

| Status Code | Meaning | Common Triggers |
| :--- | :--- | :--- |
| **`400 Bad Request`** | Input validation failure | Missing required fields, invalid email/color format, invalid route parameter |
| **`401 Unauthorized`** | Authentication failure | Missing token, invalid signature, expired session, wrong credentials |
| **`403 Forbidden`** | Authorization failure | Account suspended (`status = SUSPENDED`), role restriction |
| **`404 Not Found`** | Resource missing or isolated | Non-existent route, or attempting to access an entity owned by another user |
| **`409 Conflict`** | Unique constraint violation | Email already registered, or duplicate category name for the same user |
| **`500 Internal Error`** | Unhandled server error | Database connectivity issue or runtime exception (stack hidden in production) |

### Sample Validation Error Response (`400 Bad Request`)
```json
{
  "success": false,
  "statusCode": 400,
  "name": "ZodError",
  "message": "title: Title cannot be empty, color: Color must be a valid hex color code (e.g. #ffffff)"
}
```

### Sample Unmapped Route Response (`404 Not Found`)
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Route '/api/v1/unknown' not found",
  "data": null
}
```
