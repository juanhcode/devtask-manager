# DevTask — Requirements Specification

## Overview

DevTask is a personal task manager REST API for software developers. It allows creating, reading, updating, and deleting tasks with metadata relevant to development workflows.

---

## REQ-1: Create Task

**Given** a POST request to `/api/v1/tasks` with a valid JSON body containing at least `title`, `status`, and `priority`
**When** the request is processed
**Then** the API must:
- Persist the task to SQLite
- Return HTTP 201
- Return the created task including a UUID `id`, `createdAt`, and `updatedAt` timestamps
- Set `tags` to an empty array if not provided
- Set `description` to an empty string if not provided

**Acceptance Criteria:**
- [ ] Task is persisted and retrievable after creation
- [ ] Response includes all Task fields
- [ ] `id` is a valid UUID v4
- [ ] `createdAt` and `updatedAt` are ISO 8601 strings and equal at creation time
- [ ] `tags` defaults to `[]` if not sent

**Error Cases:**
- Missing `title` → HTTP 400 with descriptive error message
- Empty string `title` → HTTP 400
- Invalid `status` value → HTTP 400
- Invalid `priority` value → HTTP 400

---

## REQ-2: List Tasks

**Given** a GET request to `/api/v1/tasks`
**When** the request is processed
**Then** the API must:
- Return HTTP 200
- Return an array of all tasks in the store
- Support optional query parameter `status` to filter by status
- Support optional query parameter `priority` to filter by priority
- Support combining both filters simultaneously

**Acceptance Criteria:**
- [ ] Returns empty array `[]` when no tasks exist
- [ ] Returns all tasks when no filter is applied
- [ ] When `?status=TODO` is provided, all returned tasks have `status === 'TODO'`
- [ ] When `?priority=HIGH` is provided, all returned tasks have `priority === 'HIGH'`
- [ ] When both filters are applied, all returned tasks match both values
- [ ] Invalid filter values return HTTP 400

---

## REQ-3: Get Task by ID

**Given** a GET request to `/api/v1/tasks/:id`
**When** the request is processed
**Then** the API must:
- Return HTTP 200 and the task if it exists
- Return HTTP 404 if no task with that ID exists

**Acceptance Criteria:**
- [ ] Returns the exact task that was previously created with that ID
- [ ] Returns 404 for a non-existent UUID
- [ ] Returns 404 for a malformed ID

---

## REQ-4: Update Task

**Given** a PUT request to `/api/v1/tasks/:id` with a JSON body containing fields to update
**When** the request is processed
**Then** the API must:
- Update only the provided fields (partial update via PUT — all updatable fields required)
- Return HTTP 200 and the updated task
- Return HTTP 404 if the task does not exist
- Update `updatedAt` to the current timestamp
- NOT modify `id` or `createdAt`

**Updatable fields:** `title`, `description`, `status`, `priority`, `tags`

**Acceptance Criteria:**
- [ ] Updated task reflects the new values
- [ ] `updatedAt` is newer than or equal to the previous `updatedAt`
- [ ] `createdAt` is unchanged after update
- [ ] `id` is unchanged after update
- [ ] Returns 404 for non-existent task ID
- [ ] Invalid status or priority value returns HTTP 400

---

## REQ-5: Delete Task

**Given** a DELETE request to `/api/v1/tasks/:id`
**When** the request is processed
**Then** the API must:
- Remove the task from the store
- Return HTTP 204 (no content)
- Return HTTP 404 if the task does not exist

**Acceptance Criteria:**
- [ ] Task is no longer retrievable after deletion
- [ ] Returns 204 on successful deletion
- [ ] Returns 404 when attempting to delete a non-existent task
- [ ] Deleting the same task twice returns 404 on the second attempt

---

## REQ-6: Mark Task as Complete

**Given** a PATCH request to `/api/v1/tasks/:id/complete`
**When** the request is processed
**Then** the API must:
- Set the task's `status` to `DONE`
- Update `updatedAt`
- Return HTTP 200 and the updated task

**Acceptance Criteria:**
- [ ] Task `status` is `DONE` after the request
- [ ] `updatedAt` is updated
- [ ] Works on tasks with any initial status (TODO, IN_PROGRESS, DONE)
- [ ] Returns 404 for non-existent task ID

---

## REQ-7: Task Statistics

**Given** a GET request to `/api/v1/tasks/stats`
**When** the request is processed
**Then** the API must:
- Return HTTP 200
- Return a JSON object with:
  - `total`: total number of tasks
  - `todo`: number of tasks with status TODO
  - `inProgress`: number of tasks with status IN_PROGRESS
  - `done`: number of tasks with status DONE

**Acceptance Criteria:**
- [ ] `total === todo + inProgress + done` always
- [ ] Stats reflect the current state of the task store
- [ ] Returns `{ total: 0, todo: 0, inProgress: 0, done: 0 }` when empty
- [ ] Stats update correctly after create, update, delete, and complete operations

---

## Business Rules (Non-functional Requirements)

| ID   | Rule                                                                                 |
|------|--------------------------------------------------------------------------------------|
| BR-1 | `title` must be a non-empty string, max 200 characters                              |
| BR-2 | `status` must be one of: `TODO`, `IN_PROGRESS`, `DONE`                             |
| BR-3 | `priority` must be one of: `LOW`, `MEDIUM`, `HIGH`                                  |
| BR-4 | Every task `id` must be a unique UUID v4                                             |
| BR-5 | `createdAt` is set once at creation and is immutable                                 |
| BR-6 | `updatedAt` is updated on every write operation                                      |
| BR-7 | `tags` is always an array of strings (never null, never undefined)                  |
| BR-8 | `description` defaults to empty string if not provided                               |
| BR-9 | Filter results must be deterministic: same filter always returns same subset        |

---

## API Contract Summary

| Method | Path                       | Request Body                    | Success Response         |
|--------|----------------------------|---------------------------------|--------------------------|
| POST   | /api/v1/tasks              | CreateTaskInput                 | 201 Task                 |
| GET    | /api/v1/tasks              | —                               | 200 Task[]               |
| GET    | /api/v1/tasks/stats        | —                               | 200 TaskStats            |
| GET    | /api/v1/tasks/:id          | —                               | 200 Task                 |
| PUT    | /api/v1/tasks/:id          | UpdateTaskInput                 | 200 Task                 |
| DELETE | /api/v1/tasks/:id          | —                               | 204 (no body)            |
| PATCH  | /api/v1/tasks/:id/complete | —                               | 200 Task                 |

---

## Input Schemas

### CreateTaskInput
```typescript
{
  title: string;          // required, non-empty, max 200 chars
  description?: string;   // optional, defaults to ""
  status: TaskStatus;     // required: "TODO" | "IN_PROGRESS" | "DONE"
  priority: TaskPriority; // required: "LOW" | "MEDIUM" | "HIGH"
  tags?: string[];        // optional, defaults to []
}
```

### UpdateTaskInput
```typescript
{
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
}
```
