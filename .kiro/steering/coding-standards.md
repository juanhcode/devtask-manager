---
inclusion: always
---

# DevTask — Coding Standards Steering Document

## TypeScript

- **Strict mode is mandatory.** `tsconfig.json` must include `"strict": true`.
- **No `any` type.** Use `unknown` + type guards when the type is genuinely unknown.
- **Prefer type inference** where it is obvious, but always annotate function return types explicitly.
- **Use `interface` for domain objects** (Task, CreateTaskInput) and `type` for unions/aliases.
- **Zod schemas are the single source of truth** for input validation. Infer TypeScript types from Zod with `z.infer<typeof Schema>`.

```typescript
// ✅ Good
function getTaskById(id: string): Task | null { ... }

// ❌ Bad
function getTaskById(id: any) { ... }
```

## Functions

- **Small and focused.** Each function does exactly one thing.
- **Maximum ~30 lines.** If a function grows beyond this, split it.
- **Descriptive names.** Verbs for functions (`createTask`, `findById`, `validateStatus`), nouns for types (`Task`, `TaskFilter`).
- **No side effects in pure logic functions.** Services that modify state should be clearly named (`updateTask`, not `processTask`).

```typescript
// ✅ Good — clear name, single responsibility
function isValidStatus(value: string): value is TaskStatus {
  return ['TODO', 'IN_PROGRESS', 'DONE'].includes(value);
}

// ❌ Bad — does too many things, name is vague
function processData(data: any) { ... }
```

## Error Handling

- **Explicit error handling is required.** Do not silently swallow errors.
- **Services throw `AppError`** with a human-readable message and an HTTP status code.
- **Repositories do NOT catch errors** — they propagate to services.
- **Controllers do NOT catch errors** — they propagate to the global error handler middleware.
- **Never use `console.log` for errors in production code.** Use `console.error` or a proper logger.

```typescript
// ✅ Good
if (!task) {
  throw new AppError(`Task with id ${id} not found`, 404);
}

// ❌ Bad
try {
  const task = repository.findById(id);
} catch (e) {
  return null; // silently swallowed
}
```

## Input Validation

- **All external input MUST be validated** before reaching the service layer.
- **Use Zod schemas** in controllers for `req.body`, `req.params`, and `req.query`.
- **Reject requests with invalid input early** — return 400 with a descriptive error message.
- **Do NOT trust client-provided IDs without verifying** they exist in the database.

```typescript
// ✅ Good — validated at the controller boundary
const parsed = CreateTaskSchema.safeParse(req.body);
if (!parsed.success) {
  res.status(400).json({ error: parsed.error.message });
  return;
}
```

## Separation of Concerns

- **Routes** only register paths and middleware — no logic.
- **Controllers** only handle HTTP — no SQL, no business rules.
- **Services** only handle business logic — no SQL, no `req`/`res`.
- **Repositories** only handle SQL — no business rules, no HTTP concepts.
- **Models** only define types and schemas — no logic.

Violating this layering is a defect, not a style choice.

## Naming Conventions

| Construct         | Convention            | Example                       |
|-------------------|-----------------------|-------------------------------|
| Files             | camelCase             | `taskRepository.ts`           |
| Types/Interfaces  | PascalCase            | `Task`, `CreateTaskInput`     |
| Functions         | camelCase             | `createTask`, `findById`      |
| Constants         | SCREAMING_SNAKE_CASE  | `MAX_TITLE_LENGTH`            |
| Zod schemas       | PascalCase + Schema   | `CreateTaskSchema`            |
| Test files        | `*.test.ts`           | `taskService.test.ts`         |
| Property tests    | `*.property.test.ts`  | `task.property.test.ts`       |

## Module Imports

- Use **ES module** syntax (`import`/`export`). No `require()`.
- **Relative imports** within the project. No path aliases unless explicitly configured.
- **Group imports**: external packages first, then internal modules, separated by a blank line.

```typescript
// ✅ Good
import express from 'express';
import { z } from 'zod';

import { taskService } from '../services/taskService.js';
import { AppError } from '../middleware/errorHandler.js';
```

## Code Style

- **2-space indentation.**
- **Single quotes** for strings.
- **Trailing commas** in multi-line objects and arrays.
- **Semicolons** required.
- **No unused variables or imports** — treat them as errors.
- All files must end with a single newline character.

## Comments

- **Code should be self-documenting.** Avoid comments that restate what the code does.
- **Use comments to explain WHY**, not what.
- **JSDoc on exported functions** in services and repositories.

```typescript
// ❌ Bad comment — restates the code
// Increment i by 1
i++;

// ✅ Good comment — explains why
// SQLite returns 0 for affected rows on a no-op UPDATE;
// we treat this as "not found" to return a 404.
if (changes === 0) throw new AppError('Task not found', 404);
```
