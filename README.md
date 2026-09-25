# DevTask — Personal DevOps Task Manager

A lightweight task management application for software developers. Built to demonstrate all 7 lessons of the **Kiro University Challenge 2026** using spec-driven development, steering documents, hooks, property-based testing, Powers, MCP, and custom agents.

---

## What Is DevTask?

DevTask helps individual developers track technical tasks — bugs, features, infrastructure work, code reviews — without the overhead of enterprise tools. It provides a clean REST API and a React UI, backed by SQLite.

**Task fields:** `id` · `title` · `description` · `status` (TODO/IN_PROGRESS/DONE) · `priority` (LOW/MEDIUM/HIGH) · `tags` · `createdAt` · `updatedAt`

**Operations:** Create · List (with filters) · Get by ID · Update · Delete · Complete · Statistics

---

## Architecture

```
HTTP Client
     │
     ▼
  Routes          (taskRoutes.ts)
     │
     ▼
Controllers       (taskController.ts)  — Zod input validation
     │
     ▼
  Services        (taskService.ts)     — Business rules, AppError
     │
     ▼
Repositories      (taskRepository.ts) — Raw SQL, better-sqlite3
     │
     ▼
   SQLite          (devtask.sqlite)
```

**Frontend:** React 18 + TypeScript + Vite → communicates with the backend exclusively via REST API.

---

## Quick Start

### Run locally (development)

**Prerequisites:** Node.js 20+

```bash
# Backend
cd backend
npm install
npm run dev          # http://localhost:3000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Run with Docker

```bash
docker compose up --build
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8080`
- Health: `http://localhost:3000/health`
- API: `http://localhost:3000/api/v1/tasks`

---

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/tasks` | List tasks (supports `?status=` and `?priority=` filters) |
| `POST` | `/api/v1/tasks` | Create a task |
| `GET` | `/api/v1/tasks/stats` | Get statistics |
| `GET` | `/api/v1/tasks/:id` | Get task by ID |
| `PUT` | `/api/v1/tasks/:id` | Update a task |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task |
| `PATCH` | `/api/v1/tasks/:id/complete` | Mark task as done |

**Example:**
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Setup CI","status":"TODO","priority":"HIGH","tags":["devops"]}'
```

---

## Tests

```bash
cd backend

npm test                  # All 60 tests (unit + integration + property)
npm run test:unit         # 24 unit tests (services)
npm run test:integration  # 25 integration tests (HTTP endpoints)
npm run test:property     # 11 property-based tests (fast-check invariants)
npm run test:coverage     # Tests with V8 coverage report
npm run typecheck         # TypeScript typecheck only
```

**Result:** 60/60 tests pass ✅

---

## Kiro University Challenge — 7 Lessons

### Lesson 1 — Spec-driven Development

Full specification written before any code:

| File | Contents |
|------|----------|
| `.kiro/specs/devtask/requirements.md` | 7 requirements with Given/When/Then criteria, 9 business rules |
| `.kiro/specs/devtask/design.md` | Technical design: architecture, DB schema, API contract |
| `.kiro/specs/devtask/tasks.md` | 26 implementation tasks across 6 milestones |

### Lesson 2 — Steering Documents

5 permanent rule documents injected into every Kiro session (`inclusion: always`):

| File | Purpose |
|------|---------|
| `.kiro/steering/product.md` | Domain model, business rules, scope |
| `.kiro/steering/tech-stack.md` | Mandatory technologies with rationale |
| `.kiro/steering/architecture.md` | Layered architecture diagram and rules |
| `.kiro/steering/coding-standards.md` | TypeScript strict, error handling, naming |
| `.kiro/steering/testing.md` | Test layer requirements and property invariants |

### Lesson 3 — Hooks

| Hook | Trigger | Action |
|------|---------|--------|
| `test-on-save` | PostFileSave (*.ts) | Runs `npm test` in backend |
| `validate-on-task-complete` | PostTaskExec | Runs typecheck + full test suite |

See `docs/kiro-hooks.md` for full documentation.

### Lesson 4 — Property-based Testing

**File:** `backend/tests/property/task.property.test.ts`  
**Library:** fast-check 3.x · **11 tests, 50–100 runs each**

Properties verified: unique IDs, valid status/priority, DONE persistence, filter correctness, createdAt immutability, updatedAt advances, round-trip persistence, stats invariant.

### Lesson 5 — Powers

**Power:** `canva-design-power`  
**Used for:** Activated skills and steering to guide the production of the architecture diagram following the Power's design hierarchy and typography guidelines.  
See `docs/kiro-powers.md`.

### Lesson 6 — MCP

**Server:** `@modelcontextprotocol/server-filesystem`  
**Config:** `.kiro/settings/mcp.json`  
**Used for:** Inspecting project structure, grepping `AppError` across codebase, reading spec + steering files simultaneously.  
See `docs/kiro-mcp.md`.

### Lesson 7 — Custom Agents

| Agent | File | Purpose |
|-------|------|---------|
| `test-engineer` | `.kiro/agents/test-engineer.md` | Writes/runs/fixes tests |
| `backend-reviewer` | `.kiro/agents/backend-reviewer.md` | Architecture compliance audit |

**Real evidence:** `backend-reviewer` found 2 FAIL issues → both fixed → all 60 tests still pass. See `backend/REVIEW.md` and `docs/kiro-custom-agents.md`.

---

## Bonus — Custom Power

**Location:** `kiro-power/devtask-quality-power/`

A reusable Kiro Power with 3 skills (`run-quality-checks`, `architecture-review`, `test-coverage-report`), a pre-submission checklist, and an auto-injected steering file with quality thresholds.

---

## Environment Variables

```bash
# Backend (.env)
PORT=3000
DATABASE_PATH=./data/devtask.sqlite
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:3000/api/v1
```

Copy `.env.example` files in `backend/` and `frontend/` as starting points. Never commit `.env` files.

---

## Project Structure

```
kiro-university/
├── .kiro/
│   ├── agents/              # Lesson 7: Custom agents
│   ├── hooks/               # Lesson 3: Hooks
│   ├── settings/mcp.json    # Lesson 6: MCP config
│   ├── specs/devtask/       # Lesson 1: Spec
│   └── steering/            # Lesson 2: Steering docs
├── backend/
│   ├── src/
│   │   ├── controllers/     # HTTP layer (Zod validation)
│   │   ├── db/              # SQLite initialization
│   │   ├── middleware/      # Error handler
│   │   ├── models/          # Types + Zod schemas
│   │   ├── repositories/    # Raw SQL queries
│   │   ├── routes/          # Express router
│   │   └── services/        # Business logic
│   └── tests/
│       ├── integration/     # supertest HTTP tests
│       ├── property/        # Lesson 4: fast-check
│       └── unit/            # Vitest unit tests
├── docs/
│   ├── kiro-challenge.md    # Evidence matrix
│   ├── kiro-custom-agents.md
│   ├── kiro-hooks.md
│   ├── kiro-mcp.md
│   └── kiro-powers.md
├── frontend/
│   └── src/
│       ├── components/      # UI components
│       ├── hooks/           # useTasks, useStats
│       ├── pages/           # TasksPage
│       ├── services/        # API client
│       └── types/           # Task types
├── kiro-power/
│   └── devtask-quality-power/  # Bonus: custom Power
├── backend/REVIEW.md        # Agent review report (Lesson 7)
└── docker-compose.yml
```

---

## License

MIT
