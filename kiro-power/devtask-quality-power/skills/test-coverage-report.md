---
name: test-coverage-report
description: Run DevTask tests with V8 coverage and produce a human-readable summary mapping test results to spec requirements.
---

# Test Coverage Report

Generate a coverage report and map results to requirements.

## Step 1 — Run tests with coverage

```bash
cd backend && npm run test:coverage
```

This runs all 60 tests with V8 coverage and outputs:
- Terminal: per-file coverage table
- `coverage/lcov.info`: machine-readable coverage data

## Step 2 — Read the coverage output

Look for:
- **Lines** covered: target ≥ 90%
- **Functions** covered: target 100% for service and repository layers
- **Branches** covered: target ≥ 85%

Flag any file in `src/services/` or `src/repositories/` with < 100% function coverage.

## Step 3 — Map to requirements

Cross-reference covered code with the spec requirements:

| Requirement | Test file | Coverage |
|-------------|-----------|---------|
| REQ-1: Create task | `integration/tasks.test.ts` | POST /api/v1/tasks tests |
| REQ-2: List tasks | `integration/tasks.test.ts` | GET /api/v1/tasks tests |
| REQ-3: Get by ID | `integration/tasks.test.ts` | GET /api/v1/tasks/:id tests |
| REQ-4: Update task | `integration/tasks.test.ts` | PUT /api/v1/tasks/:id tests |
| REQ-5: Delete task | `integration/tasks.test.ts` | DELETE /api/v1/tasks/:id tests |
| REQ-6: Complete task | `integration/tasks.test.ts` | PATCH /api/v1/tasks/:id/complete |
| REQ-7: Statistics | `integration/tasks.test.ts` | GET /api/v1/tasks/stats tests |
| BR-2: Valid status | `property/task.property.test.ts` | Property: Valid status |
| BR-3: Valid priority | `property/task.property.test.ts` | Property: Valid priority |
| BR-4: Unique IDs | `property/task.property.test.ts` | Property: Unique IDs |
| BR-5: createdAt immutable | `property/task.property.test.ts` | Property: createdAt |
| BR-6: updatedAt advances | `property/task.property.test.ts` | Property: updatedAt |

## Step 4 — Report

Produce a `backend/COVERAGE.md` with:
- Overall coverage percentages by file
- Requirements coverage matrix (which REQ/BR is covered by which test)
- Any gaps identified (untested branches, uncovered paths)
- Recommendations for additional tests if gaps exist

## Coverage Thresholds

| Layer | Minimum |
|-------|---------|
| `src/services/` | 95% lines |
| `src/repositories/` | 90% lines |
| `src/controllers/` | 85% lines |
| `src/middleware/` | 100% lines |
| `src/models/` | N/A (types only) |
