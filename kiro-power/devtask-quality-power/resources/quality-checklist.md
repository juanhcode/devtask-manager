# DevTask — Pre-Submission Quality Checklist

Use this checklist before every submission or release.

## TypeScript

- [ ] `cd backend && npx tsc --noEmit` → exit 0, zero errors
- [ ] `cd frontend && npm run typecheck` → exit 0, zero errors
- [ ] No `any` type in any source file (verify with `grep -r ": any" backend/src/`)
- [ ] All function return types are explicitly annotated

## Tests

- [ ] `cd backend && npm test` → 60/60 tests pass
- [ ] Unit tests: 24 passing
- [ ] Integration tests: 25 passing
- [ ] Property-based tests: 11 passing (each with 50–100 runs)
- [ ] No skipped or pending tests (`it.skip`, `xit`, `pending`)

## Architecture Compliance

- [ ] Controllers: Zod validation on all `req.body`, `req.params`, `req.query`
- [ ] Controllers: No SQL, no business logic
- [ ] Services: All domain violations throw `AppError` (never return null silently)
- [ ] Services: Status transition rules enforced (`TODO→IN_PROGRESS→DONE`)
- [ ] Repositories: Raw SQL only, no `AppError`
- [ ] Error responses: `{ error: string, statusCode: number }` shape everywhere
- [ ] Routes: `/stats` registered before `/:id`

## Security

- [ ] No `.env` files committed (`git status` shows clean)
- [ ] No API keys, tokens, or passwords in any source file
- [ ] `DATABASE_PATH` and `PORT` come from environment variables, not hardcoded
- [ ] `.gitignore` covers `.env`, `*.sqlite`, `*.db`, `node_modules/`

## Kiro Evidence

- [ ] `.kiro/specs/devtask/` — requirements.md, design.md, tasks.md exist
- [ ] `.kiro/steering/` — 5 steering documents exist and are non-empty
- [ ] `.kiro/hooks/` — test-on-save.json and validate-on-task-complete.json exist
- [ ] `.kiro/agents/` — test-engineer.md and backend-reviewer.md exist
- [ ] `.kiro/settings/mcp.json` — filesystem MCP server configured
- [ ] `backend/tests/property/` — fast-check property tests exist
- [ ] `docs/kiro-challenge.md` — evidence matrix complete

## Docker

- [ ] `docker-compose build` → both images build without error
- [ ] `docker-compose up` → backend health check passes at `http://localhost:3000/health`
- [ ] Frontend accessible at `http://localhost:8080`
- [ ] SQLite volume persists data between container restarts

## Git

- [ ] First commit date is September 21, 2026 at 09:00 PT or later
- [ ] No commits exist before September 21, 2026
- [ ] Commit messages are descriptive and reference the work done
- [ ] No binary files, no `node_modules/` committed
