---
inclusion: always
---

# DevTask — Product Steering Document

## Product Vision

DevTask is a personal DevOps task manager designed for software developers who need a lightweight, distraction-free way to track technical tasks throughout their development workflow.

## Target User

A solo developer or small team who needs to manage tasks related to software development work: bugs to fix, features to build, infrastructure to set up, code reviews to complete.

## Core Value Proposition

- Simple and fast task management without the overhead of enterprise tools like Jira.
- Clean REST API that can be integrated with other developer tools.
- Designed from day one with quality in mind: typed, tested, and containerized.

## Domain Model

A **Task** is the central entity of DevTask. It represents a single unit of technical work.

| Field       | Type                            | Description                          |
|-------------|----------------------------------|--------------------------------------|
| id          | string (UUID)                   | Unique identifier                    |
| title       | string                          | Short description of the task        |
| description | string                          | Detailed explanation                 |
| status      | TODO \| IN_PROGRESS \| DONE     | Current state of the task            |
| priority    | LOW \| MEDIUM \| HIGH           | Urgency level                        |
| tags        | string[]                        | Labels for categorization            |
| createdAt   | ISO 8601 datetime               | Creation timestamp                   |
| updatedAt   | ISO 8601 datetime               | Last modification timestamp          |

## Allowed Status Transitions

```
TODO → IN_PROGRESS → DONE
TODO → DONE (direct completion allowed)
DONE → TODO (reopen allowed)
```

## Key Business Rules

1. Every task MUST have a non-empty title.
2. Every task MUST have a valid status (TODO, IN_PROGRESS, DONE).
3. Every task MUST have a valid priority (LOW, MEDIUM, HIGH).
4. Task IDs MUST be globally unique UUIDs.
5. `createdAt` is set once at creation and MUST NOT be modified.
6. `updatedAt` MUST be updated on every modification.
7. Tags are optional but MUST be an array (can be empty).
8. Filtering by status or priority MUST return only tasks matching that exact value.
9. Statistics MUST always reflect the current state of the task store.

## Features in Scope

- Create task
- List all tasks
- Get task by ID
- Update task (any field except id, createdAt)
- Delete task
- Mark task as complete (shorthand to set status = DONE)
- Filter tasks by status
- Filter tasks by priority
- Get task statistics (total, by status)

## Features Out of Scope (v1)

- User authentication
- Multi-user support
- Task assignments
- Comments or attachments
- Recurring tasks
- Notifications
- External integrations (GitHub Issues, Jira, etc.)
