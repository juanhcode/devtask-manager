---
inclusion: always
---

# DevTask — Architecture Steering Document

## Architectural Style

DevTask uses a **layered architecture** with a clean separation of concerns. Each layer has a single responsibility and communicates only with the layer directly below it.

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Routes    │  Express router — maps HTTP verbs/paths to controllers
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Controllers │  Parse request, validate input (Zod), call service, format response
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Services   │  Business logic, enforce domain rules, orchestrate repositories
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Repositories   │  Data access — raw SQL via better-sqlite3
└──────┬──────────┘
       │
       ▼
┌─────────────┐
│   SQLite    │  Persistent storage
└─────────────┘
```

## Layer Responsibilities

### Routes (`backend/src/routes/`)
- Register Express routes.
- Apply middleware (e.g., JSON body parser, error handler).
- Do NOT contain business logic.

### Controllers (`backend/src/controllers/`)
- Extract parameters from `req.params`, `req.query`, `req.body`.
- Validate all input using Zod schemas before passing to services.
- Return appropriate HTTP status codes and JSON responses.
- Handle `AppError` and translate to HTTP responses.
- Do NOT contain business logic or SQL.

### Services (`backend/src/services/`)
- Implement all business rules defined in `product.md`.
- Enforce domain constraints (e.g., valid status transitions, non-empty title).
- Orchestrate one or more repository calls.
- Throw `AppError` with descriptive messages for domain violations.
- Do NOT know about HTTP (no `req`, `res`, `next`).

### Repositories (`backend/src/repositories/`)
- Contain all SQL queries.
- Accept and return typed domain objects (`Task`, `CreateTaskInput`, etc.).
- Do NOT contain business logic.
- Do NOT throw HTTP errors — throw raw errors or return `null`/`undefined`.

### Models / Types (`backend/src/models/`)
- Define TypeScript interfaces and Zod schemas.
- Single source of truth for the Task domain model.
- Export both TS types (inferred from Zod) and validation schemas.

### Middleware (`backend/src/middleware/`)
- `errorHandler`: Global Express error handler. Translates `AppError` → JSON error response.
- `notFound`: 404 handler for unmatched routes.

## Frontend Architecture

```
frontend/src/
├── components/     # Reusable UI components (TaskCard, TaskForm, FilterBar, StatsPanel)
├── pages/          # Page-level components (TasksPage)
├── hooks/          # Custom React hooks (useTasks, useStats)
├── services/       # API client — fetch calls to the backend REST API
├── types/          # TypeScript types shared with the API contract
└── utils/          # Pure utility functions (formatDate, etc.)
```

The frontend communicates with the backend exclusively through the REST API. No shared code between frontend and backend — the types in `frontend/src/types/` are manually kept in sync with the backend contract (intentional — keeps the boundary explicit).

## Error Handling Strategy

- Services throw `AppError(message, statusCode)`.
- Controllers do NOT catch errors — they propagate to the global `errorHandler` middleware.
- Repository errors (SQLite exceptions) propagate upward; services translate them if needed.
- All error responses follow a consistent shape:
  ```json
  { "error": "Human-readable message", "statusCode": 400 }
  ```

## API Design

- Base path: `/api/v1`
- All endpoints return JSON.
- All endpoints accept JSON (`Content-Type: application/json`).
- Resource: `/api/v1/tasks`

| Method | Path                          | Description               |
|--------|-------------------------------|---------------------------|
| GET    | /api/v1/tasks                 | List tasks (with filters) |
| POST   | /api/v1/tasks                 | Create a task             |
| GET    | /api/v1/tasks/:id             | Get task by ID            |
| PUT    | /api/v1/tasks/:id             | Update a task             |
| DELETE | /api/v1/tasks/:id             | Delete a task             |
| PATCH  | /api/v1/tasks/:id/complete    | Mark task as complete     |
| GET    | /api/v1/tasks/stats           | Get task statistics       |

## Directory Structure

```
kiro-university/
├── .kiro/
│   ├── specs/devtask/         # Spec-driven development (Lesson 1)
│   ├── steering/              # Steering documents (Lesson 2)
│   ├── hooks/                 # Kiro hooks (Lesson 3)
│   └── agents/                # Custom agents (Lesson 7)
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/
│   │   └── app.ts
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── property/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── kiro-hooks.md
│   ├── kiro-powers.md
│   ├── kiro-mcp.md
│   ├── kiro-custom-agents.md
│   └── kiro-challenge.md
├── kiro-power/
│   └── devtask-quality-power/
├── docker-compose.yml
└── README.md
```
