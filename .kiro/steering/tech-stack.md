---
inclusion: always
---

# DevTask — Technology Stack Steering Document

## Mandatory Technologies

The following technologies are required for this project. Do NOT introduce alternatives without explicit approval.

### Backend

| Technology | Version  | Purpose                        |
|------------|----------|--------------------------------|
| Node.js    | 20 LTS   | Runtime                        |
| TypeScript | 5.x      | Type safety across the stack   |
| Express    | 4.x      | HTTP server and routing        |
| better-sqlite3 | latest | Synchronous SQLite driver  |
| uuid       | latest   | UUID generation                |
| zod        | latest   | Runtime input validation       |

### Frontend

| Technology | Version | Purpose                         |
|------------|---------|---------------------------------|
| React      | 18.x    | UI library                      |
| TypeScript | 5.x     | Type safety                     |
| Vite       | 5.x     | Build tool and dev server       |

### Testing

| Technology | Version | Purpose                              |
|------------|---------|--------------------------------------|
| Vitest     | latest  | Test runner (unit + integration)     |
| fast-check | latest  | Property-based testing               |
| supertest  | latest  | HTTP integration testing             |

### Infrastructure

| Technology     | Version | Purpose                          |
|----------------|---------|----------------------------------|
| Docker         | 24+     | Containerization                 |
| Docker Compose | v2      | Multi-container orchestration    |

## Database

- SQLite via `better-sqlite3` for synchronous API simplicity.
- Schema is initialized programmatically on startup.
- No ORM — use raw SQL queries in repositories.
- Database file path is configurable via `DATABASE_PATH` environment variable.
- Default: `./data/devtask.sqlite`

## Why This Stack

- **TypeScript everywhere**: Prevents entire categories of runtime errors, improves refactoring safety.
- **Express**: Minimal and battle-tested. No magic routing or decorators that obscure what's happening.
- **SQLite**: Perfect for a single-user personal task manager. Zero infrastructure. Embeds in the container.
- **better-sqlite3**: Synchronous API avoids callback/promise complexity in repositories.
- **Vitest**: Native TypeScript support, fast, compatible with Vite ecosystem.
- **fast-check**: Best-in-class property-based testing for TypeScript.
- **Zod**: Runtime validation that mirrors TypeScript types — single source of truth.

## What NOT to Use

- No ORMs (Prisma, TypeORM, Sequelize). Use raw SQL in repositories.
- No class-based controllers. Use plain functions.
- No global state outside the database layer.
- No `any` type in TypeScript. Use `unknown` + type guards when needed.
- No CommonJS `require()`. Use ES modules (`import`/`export`) throughout.
