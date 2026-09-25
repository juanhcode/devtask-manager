# Backend Code Review

**Date:** 2026-09-24
**Reviewer:** backend-reviewer agent

---

## Summary

| File | Rating | Issues |
|------|--------|--------|
| `middleware/errorHandler.ts` | FAIL | Error response shape missing `statusCode` field |
| `controllers/taskController.ts` | WARN | `req.params` not Zod-validated; inconsistent 400 formatting in `listTasks` |
| `services/taskService.ts` | FAIL | Status transition rules from product.md not enforced |
| `repositories/taskRepository.ts` | PASS | Clean raw SQL, no business logic, correct types |
| `models/task.ts` | WARN | `CreateTaskSchema` has no default for `status`; `UpdateTaskSchema.description` missing `.default('')` |
| `routes/taskRoutes.ts` | PASS | All 7 contract endpoints registered; `/stats` correctly ordered before `/:id` |
| `app.ts` | PASS | Clean wiring; no logic leakage |
| `db/database.ts` | PASS | Correct singleton pattern, WAL mode enabled, schema matches domain model |
| `server.ts` | PASS | Clean entry point; startup messages use `console.warn` appropriately |

---

## Detailed Findings

### `middleware/errorHandler.ts`

**Rating:** FAIL

#### Issues Found

- **[FAIL]** `errorHandler` omits `statusCode` from the JSON response body.
  - Location: line 31
  - Problem: The architecture steering document specifies the error response shape as `{ "error": "...", "statusCode": 400 }`. The current implementation emits only `{ "error": "..." }`, dropping the `statusCode` field. Clients relying on the body (not just the HTTP status code) to determine the error type will receive incomplete data. The same applies to the 404 `notFoundHandler` and the 500 fallback.
  - Suggested fix:
    ```typescript
    // In errorHandler:
    if (err instanceof AppError) {
      res.status(err.statusCode).json({ error: err.message, statusCode: err.statusCode });
      return;
    }
    console.error('[Unhandled error]', err);
    res.status(500).json({ error: 'Internal server error', statusCode: 500 });

    // In notFoundHandler:
    export function notFoundHandler(_req: Request, res: Response): void {
      res.status(404).json({ error: 'Route not found', statusCode: 404 });
    }
    ```

---

### `controllers/taskController.ts`

**Rating:** WARN

#### Issues Found

- **[WARN]** `req.params.id` is not validated with Zod in `getTaskById`, `updateTask`, `deleteTask`, or `completeTask`.
  - Location: lines 51, 61, 73, 81
  - Problem: The coding standards state "All `req.body`, `req.params`, and `req.query` inputs are validated with Zod before reaching the service." A malformed or empty `id` (e.g. whitespace-only string) is passed directly to the service, which then queries the database. While the service does handle the `null` return with a 404, the validation contract is not upheld at the controller boundary.
  - Suggested fix:
    ```typescript
    import { z } from 'zod';

    const TaskIdSchema = z.object({
      id: z.string().uuid('Task ID must be a valid UUID'),
    });

    // In getTaskById, deleteTask, completeTask:
    function getTaskById(req: Request, res: Response, next: NextFunction): void {
      const parsed = TaskIdSchema.safeParse(req.params);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid ID', statusCode: 400 });
        return;
      }
      try {
        const task = service.getTaskById(parsed.data.id);
        res.status(200).json(task);
      } catch (err) {
        next(err);
      }
    }
    ```

- **[WARN]** Inconsistent 400 error formatting in `listTasks`.
  - Location: line 24
  - Problem: `listTasks` uses `parsed.error.message` (the full Zod `ZodError` stringification), while `createTask` and `updateTask` correctly use `parsed.error.errors[0]?.message ?? 'Invalid input'` for a clean single-sentence message. This produces a different, noisier error payload for query-param validation failures.
  - Suggested fix:
    ```typescript
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid query parameters' });
      return;
    }
    ```

---

### `services/taskService.ts`

**Rating:** FAIL

#### Issues Found

- **[FAIL]** Status transition rules from `product.md` are not enforced anywhere in the service layer.
  - Location: `updateTask` (line 55) and `completeTask` (line 74)
  - Problem: `product.md` defines the only allowed transitions:
    ```
    TODO       → IN_PROGRESS
    TODO       → DONE
    IN_PROGRESS → DONE
    DONE       → TODO  (reopen)
    ```
    The transition `IN_PROGRESS → TODO` is explicitly **not** listed as allowed, yet `updateTask` accepts any `status` value and persists it without checking the current state. A client can freely move a task from `IN_PROGRESS` back to `TODO` by calling `PUT /api/v1/tasks/:id`. This is a domain rule violation that passes Zod validation (since `TODO` is a valid enum value) and silently corrupts task state.
  - Suggested fix: Add a `validateStatusTransition` guard in the service that reads the current task before persisting the update:
    ```typescript
    const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
      TODO:        ['IN_PROGRESS', 'DONE'],
      IN_PROGRESS: ['DONE'],
      DONE:        ['TODO'],
    };

    function validateStatusTransition(current: TaskStatus, next: TaskStatus): void {
      if (current === next) return; // idempotent — allow
      if (!ALLOWED_TRANSITIONS[current].includes(next)) {
        throw new AppError(
          `Cannot transition task from ${current} to ${next}`,
          422,
        );
      }
    }

    function updateTask(id: string, input: UpdateTaskInput): Task {
      const existing = getTaskById(id); // throws 404 if not found
      validateStatusTransition(existing.status, input.status);
      const now = new Date().toISOString();
      const updated = repository.update(id, input, now);
      if (!updated) {
        throw new AppError(`Task with id '${id}' not found`, 404);
      }
      return updated;
    }
    ```
    `completeTask` would automatically inherit the transition check via `updateTask` and would correctly reject `DONE → DONE` as a no-op (or allow it if idempotency is preferred, as shown above).

---

### `repositories/taskRepository.ts`

**Rating:** PASS

No issues found. The repository:
- Uses raw SQL exclusively via `better-sqlite3` — no ORM.
- Contains zero business logic; status/priority values are stored and returned as-is.
- Returns typed domain objects (`Task`, `TaskStats`) or `null`/`boolean`.
- Throws no `AppError` or HTTP concepts — `null` is returned for not-found cases so the service layer can decide the semantics.
- The `rowToTask` mapper correctly casts `status` and `priority` to their typed union values and parses the JSON-encoded `tags` column.
- The `update` function correctly uses `result.changes === 0` as the not-found signal (well-commented with the reason why).
- `getStats` correctly initialises all three status buckets to `0` before accumulating, preventing missing-key bugs.

---

### `models/task.ts`

**Rating:** WARN

#### Issues Found

- **[WARN]** `CreateTaskSchema` does not provide a default for `status`.
  - Location: line 35
  - Problem: `product.md` implies a newly created task is in an initial state. The `status` field on `CreateTaskSchema` is required with no default. A client must always supply a `status` to create a task, meaning they can create a task in `DONE` directly. While not technically prohibited by the spec, this is a design inconsistency worth flagging: if a default of `TODO` were applied, creation of already-completed tasks would require explicit intent. At minimum, this should be a documented design decision.
  - Suggested fix (if a default is desired):
    ```typescript
    status: z.enum(TASK_STATUSES, { ... }).default('TODO'),
    ```

- **[WARN]** `UpdateTaskSchema.description` lacks `.default('')` compared to `CreateTaskSchema`.
  - Location: line 40
  - Problem: In `CreateTaskSchema`, `description` uses `.default('')` making it optional for callers. In `UpdateTaskSchema`, `description` is a plain `z.string()` — required and no default. This means a `PUT` body that omits `description` will fail validation, while the `POST` body does not. Since `PUT` is a full replacement, this is technically correct semantics, but it should be explicitly documented or aligned with a purposeful API decision to avoid client confusion. If partial updates via `PUT` with omitted description are ever expected to be valid, this would silently break.

---

### `routes/taskRoutes.ts`

**Rating:** PASS

No issues found. All 7 endpoints from the API contract are registered:

| Contract | Registered |
|----------|-----------|
| `GET /api/v1/tasks` | ✅ `router.get('/')` |
| `POST /api/v1/tasks` | ✅ `router.post('/')` |
| `GET /api/v1/tasks/:id` | ✅ `router.get('/:id')` |
| `PUT /api/v1/tasks/:id` | ✅ `router.put('/:id')` |
| `DELETE /api/v1/tasks/:id` | ✅ `router.delete('/:id')` |
| `PATCH /api/v1/tasks/:id/complete` | ✅ `router.patch('/:id/complete')` |
| `GET /api/v1/tasks/stats` | ✅ `router.get('/stats')` |

The `/stats` route is correctly placed before `/:id` to prevent Express from matching the literal string `"stats"` as a task ID parameter.

---

### `app.ts`

**Rating:** PASS

No issues found. The app factory:
- Accepts `TaskService` as a parameter, enabling clean test injection.
- Does not call `app.listen()` — server startup is correctly delegated to `server.ts`.
- Applies middleware in the correct order: body parser → routes → 404 handler → global error handler.
- Contains zero business logic.

---

### `db/database.ts`

**Rating:** PASS

No issues found. Notable positives:
- `createDatabase` is a pure factory; `getDatabase` provides the production singleton — the separation allows tests to call `createDatabase(':memory:')` independently.
- WAL mode and `foreign_keys = ON` are both enabled.
- Schema uses `CHECK` constraints for `status` and `priority` as a final safety net even if application validation is bypassed.
- Directory creation for the data path is handled gracefully before opening the database.

---

### `server.ts`

**Rating:** PASS

No issues found. The file is a clean composition root that wires up the dependency chain and calls `app.listen()`. Startup messages use `console.warn` rather than `console.log`, which is a minor style choice but does not violate any standard (the coding standards only forbid `console.log` for **errors**).

---

## Overall Verdict

**FAIL** — Two files have hard violations: `errorHandler.ts` emits an error response shape that does not match the architecture contract (missing `statusCode`), and `taskService.ts` does not enforce the status transition rules defined in `product.md`, allowing illegal state changes to be persisted silently.
