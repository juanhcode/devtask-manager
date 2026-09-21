# DevTask — Implementation Tasks

## Task Tracking

Tasks are ordered by dependency. Complete each task before starting the next.

---

## MILESTONE 1: Backend Foundation

### TASK-01: Backend project scaffolding
- [ ] Create `backend/package.json` with all dependencies
- [ ] Create `backend/tsconfig.json` with strict mode
- [ ] Create `backend/vitest.config.ts`
- **Verifies**: Tech stack requirements (tech-stack.md)

### TASK-02: Domain model and types
- [ ] Create `backend/src/models/task.ts`
- [ ] Define `Task` interface
- [ ] Define `TaskStatus`, `TaskPriority` union types
- [ ] Define `CreateTaskInput`, `UpdateTaskInput`, `TaskFilter`, `TaskStats` types
- [ ] Define Zod schemas: `CreateTaskSchema`, `UpdateTaskSchema`, `TaskFilterSchema`
- **Verifies**: BR-1, BR-2, BR-3

### TASK-03: Database initialization
- [ ] Create `backend/src/db/database.ts`
- [ ] Implement `initializeDatabase(path?: string): Database` factory
- [ ] CREATE TABLE + indexes SQL
- [ ] Export singleton for production, factory for tests
- **Verifies**: REQ-1 (persistence)

### TASK-04: Task repository
- [ ] Create `backend/src/repositories/taskRepository.ts`
- [ ] Implement `findAll(filter?)`: dynamic WHERE clause
- [ ] Implement `findById(id)`: returns `Task | null`
- [ ] Implement `create(task)`: INSERT
- [ ] Implement `update(id, updates)`: UPDATE with `updated_at`
- [ ] Implement `remove(id)`: DELETE, returns boolean
- [ ] Implement `getStats()`: aggregate COUNT query
- [ ] Tags serialized as JSON string
- **Verifies**: All REQ-* at data layer

### TASK-05: Error handler middleware
- [ ] Create `backend/src/middleware/errorHandler.ts`
- [ ] Define `AppError` class
- [ ] Define `errorHandler` Express middleware
- [ ] Define `notFoundHandler` middleware
- **Verifies**: Error handling standards (coding-standards.md)

### TASK-06: Task service
- [ ] Create `backend/src/services/taskService.ts`
- [ ] Implement `createTask`: generate UUID, timestamps, call repo
- [ ] Implement `listTasks`: delegate to repo with filter
- [ ] Implement `getTaskById`: throws 404 if not found
- [ ] Implement `updateTask`: throws 404, calls repo.update
- [ ] Implement `deleteTask`: throws 404, calls repo.remove
- [ ] Implement `completeTask`: shorthand for status = DONE
- [ ] Implement `getStats`: delegate to repo
- **Verifies**: REQ-1 through REQ-7, all Business Rules

### TASK-07: Controllers and routes
- [ ] Create `backend/src/controllers/taskController.ts`
- [ ] One function per endpoint, all validated with Zod
- [ ] Create `backend/src/routes/taskRoutes.ts`
- [ ] Register routes in correct order (`/stats` before `/:id`)
- **Verifies**: API contract (design.md)

### TASK-08: Express app and server
- [ ] Create `backend/src/app.ts`: configure Express, mount router, add error handler
- [ ] Create `backend/src/server.ts`: start HTTP listener
- [ ] App is exported without listening (for tests)
- **Verifies**: Separation of app vs server (architecture.md)

---

## MILESTONE 2: Backend Tests

### TASK-09: Test helpers
- [ ] Create `backend/tests/helpers/createTestApp.ts`
- [ ] Factory that creates isolated in-memory SQLite + full app stack
- **Verifies**: Testing standards (testing.md)

### TASK-10: Unit tests — task service
- [ ] Create `backend/tests/unit/taskService.test.ts`
- [ ] Test `createTask`: valid input, empty title, invalid status/priority
- [ ] Test `getTaskById`: found, not found
- [ ] Test `updateTask`: updates correctly, not found
- [ ] Test `deleteTask`: deletes, not found
- [ ] Test `completeTask`: sets DONE, not found
- [ ] Test `getStats`: correct counts
- **Verifies**: REQ-1 through REQ-7

### TASK-11: Integration tests — API endpoints
- [ ] Create `backend/tests/integration/tasks.test.ts`
- [ ] `POST /api/v1/tasks`: happy path, missing title, invalid status
- [ ] `GET /api/v1/tasks`: empty, with tasks, with filters
- [ ] `GET /api/v1/tasks/stats`: correct totals
- [ ] `GET /api/v1/tasks/:id`: found, not found
- [ ] `PUT /api/v1/tasks/:id`: update, not found, invalid body
- [ ] `DELETE /api/v1/tasks/:id`: delete, not found, double-delete
- [ ] `PATCH /api/v1/tasks/:id/complete`: complete, not found
- **Verifies**: Full API contract

### TASK-12: Property-based tests
- [ ] Create `backend/tests/property/task.property.test.ts`
- [ ] Define `validTaskInputArbitrary` with fast-check
- [ ] Property: Unique IDs (BR-4)
- [ ] Property: Valid status on retrieval (BR-2)
- [ ] Property: Valid priority on retrieval (BR-3)
- [ ] Property: Complete task persists DONE (REQ-6)
- [ ] Property: Filter returns only matching tasks (REQ-2)
- [ ] Property: createdAt immutability (BR-5)
- [ ] Property: updatedAt advances on update (BR-6)
- [ ] Property: Round-trip persistence (REQ-2, REQ-3)
- **Verifies**: Lesson 4 — Property-based testing

---

## MILESTONE 3: Frontend

### TASK-13: Frontend project scaffolding
- [ ] Create `frontend/package.json` with React + Vite + TypeScript
- [ ] Create `frontend/tsconfig.json`
- [ ] Create `frontend/vite.config.ts`
- [ ] Create `frontend/index.html`

### TASK-14: Frontend types
- [ ] Create `frontend/src/types/task.ts`
- [ ] Mirror backend Task, TaskStatus, TaskPriority, TaskStats types

### TASK-15: API client service
- [ ] Create `frontend/src/services/apiClient.ts`
- [ ] `getTasks(filter?)`: GET /api/v1/tasks
- [ ] `createTask(input)`: POST /api/v1/tasks
- [ ] `getTask(id)`: GET /api/v1/tasks/:id
- [ ] `updateTask(id, input)`: PUT /api/v1/tasks/:id
- [ ] `deleteTask(id)`: DELETE /api/v1/tasks/:id
- [ ] `completeTask(id)`: PATCH /api/v1/tasks/:id/complete
- [ ] `getStats()`: GET /api/v1/tasks/stats

### TASK-16: Custom hooks
- [ ] Create `frontend/src/hooks/useTasks.ts`
- [ ] Create `frontend/src/hooks/useStats.ts`

### TASK-17: UI components
- [ ] `StatsPanel.tsx`: display task statistics
- [ ] `FilterBar.tsx`: status/priority filter dropdowns
- [ ] `TaskForm.tsx`: create/edit form with validation
- [ ] `TaskCard.tsx`: display task, action buttons (edit, delete, complete)
- [ ] `TaskList.tsx`: renders list of TaskCard
- [ ] `EmptyState.tsx`: shown when no tasks

### TASK-18: Tasks page and App entry
- [ ] `frontend/src/pages/TasksPage.tsx`: compose components, own state
- [ ] `frontend/src/App.tsx`: root component
- [ ] `frontend/src/main.tsx`: React DOM entry point

---

## MILESTONE 4: Infrastructure

### TASK-19: Docker configuration
- [ ] Create `backend/Dockerfile`
- [ ] Create `frontend/Dockerfile`
- [ ] Create `docker-compose.yml` at root
- [ ] Named volume for SQLite data
- [ ] Frontend proxies API through nginx config
- **Verifies**: Docker requirement

### TASK-20: Environment configuration
- [ ] Create `backend/.env.example`
- [ ] Create `frontend/.env.example`
- [ ] Document all environment variables

---

## MILESTONE 5: Kiro Configuration

### TASK-21: Kiro hooks
- [ ] Hook 1: Run tests on `.ts`/`.tsx` file save
- [ ] Hook 2: TypeScript typecheck + tests on task completion
- [ ] Create `docs/kiro-hooks.md`
- **Verifies**: Lesson 3 — Hooks

### TASK-22: Kiro Power integration
- [ ] Identify and activate relevant Power
- [ ] Use Power during development
- [ ] Create `docs/kiro-powers.md`
- **Verifies**: Lesson 5 — Powers

### TASK-23: MCP configuration
- [ ] Configure MCP server in `.kiro/settings/mcp.json`
- [ ] Use MCP tool in a development task
- [ ] Create `docs/kiro-mcp.md`
- **Verifies**: Lesson 6 — MCP

### TASK-24: Custom agents
- [ ] Create `.kiro/agents/test-engineer.json`
- [ ] Create `.kiro/agents/backend-reviewer.json`
- [ ] Create `docs/kiro-custom-agents.md`
- **Verifies**: Lesson 7 — Custom agents

---

## MILESTONE 6: Documentation and Evidence

### TASK-25: Documentation
- [ ] Create `docs/kiro-challenge.md` with evidence matrix
- [ ] Create `README.md` with full project documentation

### TASK-26: Final quality validation
- [ ] TypeScript typecheck passes (backend + frontend)
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All property-based tests pass
- [ ] Docker Compose builds and starts
- [ ] All API endpoints verified
- [ ] No secrets in any committed file
- [ ] Steering documents reflected in implementation
