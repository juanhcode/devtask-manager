# DevTask — Technical Design

## Architecture Overview

The system follows the layered architecture defined in `.kiro/steering/architecture.md`:

```
HTTP → Routes → Controllers → Services → Repositories → SQLite
```

Backend is a standalone Node.js/Express application. Frontend is a React SPA served by Vite in development and as static files in production. They communicate exclusively over the REST API.

---

## Backend Design

### 1. Domain Model (`backend/src/models/task.ts`)

Central type definitions and Zod validation schemas.

```typescript
// Status and priority as const unions — Zod validates these at runtime
export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TaskStatus = typeof TASK_STATUSES[number];
export type TaskPriority = typeof TASK_PRIORITIES[number];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  createdAt: string;  // ISO 8601
  updatedAt: string;  // ISO 8601
}

// Zod schemas inferred types for input validation
export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().default(''),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  tags: z.array(z.string()).default([]),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  tags: z.array(z.string()),
});
```

### 2. Database Initialization (`backend/src/db/database.ts`)

- Uses `better-sqlite3` — synchronous API, no async/await needed in repositories.
- Database path is read from `process.env.DATABASE_PATH` (defaults to `./data/devtask.sqlite`).
- Schema initialization runs on startup via `initializeDatabase()`.
- Tags are stored as JSON string in SQLite, deserialized on read.

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  priority    TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
  tags        TEXT NOT NULL DEFAULT '[]',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

### 3. Repository (`backend/src/repositories/taskRepository.ts`)

Raw SQL queries only. No business logic. Returns `Task` or `null`. Tags are serialized to/from JSON.

```typescript
interface TaskRepository {
  findAll(filter?: TaskFilter): Task[];
  findById(id: string): Task | null;
  create(task: Task): Task;
  update(id: string, updates: Partial<Task>): Task | null;
  delete(id: string): boolean;
  getStats(): TaskStats;
}
```

Key implementation details:
- `findAll` builds a dynamic SQL WHERE clause from the filter object.
- `create` uses an INSERT with all fields.
- `update` uses UPDATE ... SET with only provided fields + `updated_at = ?`.
- `delete` returns true if `changes > 0`, false otherwise.
- Tags column: stored as `JSON.stringify(tags)`, parsed with `JSON.parse` on read.

### 4. Service (`backend/src/services/taskService.ts`)

Business logic enforcement. Calls repository. Throws `AppError` for violations.

```typescript
interface TaskService {
  createTask(input: CreateTaskInput): Task;
  listTasks(filter?: TaskFilter): Task[];
  getTaskById(id: string): Task;
  updateTask(id: string, input: UpdateTaskInput): Task;
  deleteTask(id: string): void;
  completeTask(id: string): Task;
  getStats(): TaskStats;
}
```

Business rules enforced here:
- `getTaskById` throws `AppError('Task not found', 404)` if repository returns null.
- `updateTask` throws 404 if task doesn't exist.
- `deleteTask` throws 404 if task doesn't exist.
- `completeTask` is a shorthand for `updateTask` with `{ status: 'DONE' }`.
- `createTask` generates a UUID via `crypto.randomUUID()`.
- Timestamps use `new Date().toISOString()`.

### 5. Controllers (`backend/src/controllers/taskController.ts`)

HTTP boundary. Validates input via Zod. Calls service. Returns JSON responses.

Each controller function signature:
```typescript
(req: Request, res: Response, next: NextFunction): void
```

Controllers do NOT wrap calls in try/catch — errors propagate to the global error handler.

### 6. Routes (`backend/src/routes/taskRoutes.ts`)

```typescript
const router = express.Router();

router.get('/stats', getStats);          // MUST come before /:id
router.get('/', listTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/complete', completeTask);
```

Note: `/stats` is registered before `/:id` to prevent Express from matching "stats" as an ID.

### 7. Error Handler Middleware (`backend/src/middleware/errorHandler.ts`)

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

// Express error handler (4 args)
export function errorHandler(err, req, res, next): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  // Unexpected errors → 500
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}
```

### 8. App Entry Point (`backend/src/app.ts` + `backend/src/server.ts`)

- `app.ts` exports the configured Express app (without listening) — used by tests.
- `server.ts` imports `app` and calls `app.listen()` — the actual server entry point.

---

## Frontend Design

### Component Tree

```
App
└── TasksPage
    ├── StatsPanel          ← Shows total/todo/inProgress/done counts
    ├── FilterBar           ← Status and priority dropdowns
    ├── TaskForm            ← Create/Edit form (modal or inline)
    ├── TaskList
    │   └── TaskCard[]      ← Individual task card with actions
    └── EmptyState          ← Shown when no tasks match filter
```

### Data Flow

```
TasksPage (state owner)
  ├── useTasks(filter)    → fetches tasks from API, exposes CRUD operations
  └── useStats()          → fetches stats from API
```

State is owned at the page level. Custom hooks encapsulate API calls. No external state management library (React `useState` + `useEffect` is sufficient).

### API Service (`frontend/src/services/apiClient.ts`)

A thin wrapper around `fetch` pointing to `http://localhost:3000/api/v1`.

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
```

All functions return typed responses or throw on non-2xx status.

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status      TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'DONE')),
  priority    TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH')),
  tags        TEXT NOT NULL DEFAULT '[]',
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status   ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
```

---

## Environment Configuration

| Variable        | Default                  | Description                  |
|-----------------|--------------------------|------------------------------|
| PORT            | 3000                     | HTTP server port             |
| DATABASE_PATH   | ./data/devtask.sqlite    | SQLite file path             |
| NODE_ENV        | development              | Runtime environment          |

Frontend:

| Variable       | Default                       | Description            |
|----------------|-------------------------------|------------------------|
| VITE_API_URL   | http://localhost:3000/api/v1  | Backend API base URL   |

---

## Testing Architecture

Tests use a factory function that creates a fresh in-memory database for each test suite:

```typescript
// backend/tests/helpers/createTestApp.ts
export function createTestApp() {
  const db = new Database(':memory:');
  initializeSchema(db);
  const repo = createTaskRepository(db);
  const service = createTaskService(repo);
  const app = createApp(service);
  return { app, db, repo, service };
}
```

This pattern avoids global state, ensures test isolation, and mirrors the production dependency injection flow.

---

## Docker Design

### Backend Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
RUN mkdir -p /data
ENV DATABASE_PATH=/data/devtask.sqlite
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Docker Compose

- Backend on port 3000
- Frontend (nginx) on port 8080
- SQLite database in a named volume `devtask-data`
- Frontend `VITE_API_URL` set to backend service URL at build time
