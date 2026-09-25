---
inclusion: auto
name: quality-standards
description: Inject quality gate standards whenever running tests, typechecks, or quality reviews on the DevTask project.
---

# DevTask — Quality Standards

When performing quality checks, testing, or reviews on this project, enforce these standards:

## Zero-tolerance failures (block merge/submission)

- TypeScript typecheck errors in `backend/src/` or `frontend/src/`
- Any failing test in `backend/tests/`
- `any` type in source files (not test files or type declarations)
- Hardcoded secrets, API keys, or passwords
- SQL in controllers or business logic in repositories
- Missing Zod validation on HTTP inputs

## Must-pass thresholds

- All 60 backend tests pass
- All 11 property-based tests pass (each with ≥ 50 random runs)
- Backend `src/services/` has ≥ 95% line coverage
- Backend `src/middleware/` has 100% line coverage

## Quality check commands

```bash
# From backend/
npm run typecheck      # TypeScript only
npm run test:unit      # Unit tests
npm run test:integration  # Integration tests
npm run test:property  # Property-based tests
npm test               # All tests
npm run test:coverage  # Tests with coverage report
```

## Architecture invariants

Every code change must preserve:
1. HTTP request never reaches repository without passing through controller + service
2. Service never knows about `req`, `res`, or `next`
3. Repository never throws `AppError`
4. All error responses have shape `{ error: string, statusCode: number }`
5. Status transitions: TODO→IN_PROGRESS, TODO→DONE, IN_PROGRESS→DONE, DONE→TODO only
