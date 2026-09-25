---
name: architecture-review
description: Review DevTask backend source code for compliance with the layered architecture, coding standards, and domain rules. Produces a structured PASS/WARN/FAIL report.
---

# Architecture Review

Perform a compliance audit of the DevTask backend against its steering documents.

## Reference Documents to Read First

Before reviewing any code, load these documents:

1. `.kiro/steering/architecture.md` — layered architecture rules
2. `.kiro/steering/coding-standards.md` — TypeScript and style standards
3. `.kiro/steering/product.md` — domain model and business rules

## Files to Review

| File | Layer | Key checks |
|------|-------|-----------|
| `backend/src/controllers/taskController.ts` | HTTP | Zod on all inputs, no business logic |
| `backend/src/services/taskService.ts` | Business | AppError for all failures, status transitions |
| `backend/src/repositories/taskRepository.ts` | Data | Raw SQL only, no business logic |
| `backend/src/middleware/errorHandler.ts` | Cross-cutting | Correct error shape |
| `backend/src/models/task.ts` | Domain | Zod schemas, correct types |
| `backend/src/routes/taskRoutes.ts` | Routing | All endpoints registered, /stats before /:id |

## Review Checklist

### Controllers
- [ ] All `req.body` validated with Zod
- [ ] All `req.params` validated with Zod
- [ ] All `req.query` validated with Zod
- [ ] No SQL queries
- [ ] No business logic
- [ ] No `any` type

### Services
- [ ] Domain violations throw `AppError(message, statusCode)`
- [ ] No `req`, `res`, `next` references
- [ ] No SQL queries
- [ ] Status transitions enforced per `product.md`
- [ ] No `any` type

### Repositories
- [ ] Raw SQL only via `better-sqlite3`
- [ ] No business logic
- [ ] Returns typed objects or `null`/`boolean`
- [ ] No `AppError` thrown
- [ ] No `any` type

### Error responses
- [ ] Shape is `{ error: string, statusCode: number }` consistently
- [ ] 404s include descriptive messages with the missing ID

## Output

Save the review report to `backend/REVIEW.md` using this structure:

```markdown
# Backend Code Review
**Date:** <ISO date>
**Reviewer:** devtask-quality-power / architecture-review skill

## Summary
| File | Rating | Notes |
...

## Detailed Findings
...

## Overall Verdict
PASS | WARN | FAIL
```

## Rating Scale

| Rating | Meaning |
|--------|---------|
| PASS | Fully compliant with all standards |
| WARN | Minor issues — not blocking but should be fixed |
| FAIL | Violates architecture rules — must be fixed before shipping |
