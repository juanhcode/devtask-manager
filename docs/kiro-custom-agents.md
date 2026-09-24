# DevTask — Custom Agents Documentation

**Lesson 7 — Custom Agents**

Kiro custom agents are specialized AI assistants defined as `.md` files with YAML frontmatter in `.kiro/agents/`. Each agent has a focused responsibility, a set of tools, and domain-specific instructions. They can be invoked directly from the Kiro chat or delegated tasks programmatically.

---

## Agent 1: `test-engineer`

**File:** `.kiro/agents/test-engineer.md`

### Purpose

An expert TypeScript/Node.js test engineer for the DevTask project. Analyzes requirements, writes and runs unit, integration, and property-based tests, diagnoses failures, and applies corrections until all tests pass.

### When to Invoke

- Adding tests for a new feature
- Fixing failing tests after a code change
- Verifying full test suite compliance against testing standards
- Adding new property-based invariants

### Instructions Summary

The agent:
1. Reads `.kiro/specs/devtask/requirements.md` before writing any test
2. Creates unit tests in `backend/tests/unit/` targeting services with real in-memory SQLite
3. Creates integration tests in `backend/tests/integration/` using supertest
4. Creates property-based tests in `backend/tests/property/` using fast-check
5. Runs `cd backend && npm test` after every change
6. Diagnoses failures by root cause — never patches symptoms
7. Never declares done with failing tests

### Tools Allowed

| Tool | Purpose |
|------|---------|
| `read` | Read source files, specs, existing tests |
| `write` | Create and update test files |
| `shell` | Run `npm test`, `npm run test:unit`, etc. |

### Key Rules (from `.kiro/steering/testing.md`)

- Uses **real in-memory SQLite** — never mocks the database layer
- Every API endpoint gets a happy-path AND an error-path test
- All 8 property-based invariants must be maintained
- TypeScript errors in test files are treated as test failures

### Example Invocation

```
@test-engineer Add integration tests for the new /api/v1/tasks/export endpoint
```

### Evidence of Real Use

This agent was invoked during development and ran the test suite, diagnosing that the property tests for `createdAt` immutability and `updatedAt` advancement were using random status values that violated the new transition rules enforced by `taskService.ts`. The agent's test-engineer sub-agent identified the root cause and proposed the fix: keep the same status when the property only tests timestamp behavior.

---

## Agent 2: `backend-reviewer`

**File:** `.kiro/agents/backend-reviewer.md`

### Purpose

A senior backend engineer that reviews DevTask backend source code for architecture compliance, validation gaps, and error handling issues. Produces a structured review report with PASS/WARN/FAIL ratings per file and concrete code change suggestions.

### When to Invoke

- After implementing a new backend feature
- Before submitting code for review
- When auditing compliance with architecture or coding standards
- To verify that steering documents are being followed

### Instructions Summary

The agent reviews all files in:
- `backend/src/controllers/` — validates Zod input validation, no business logic
- `backend/src/services/` — validates AppError usage, domain rule enforcement
- `backend/src/repositories/` — validates raw SQL only, no business logic
- `backend/src/middleware/` — validates error response shape
- `backend/src/models/` — validates Zod schema patterns
- `backend/src/routes/` — validates endpoint registration

It produces a structured `backend/REVIEW.md` with PASS/WARN/FAIL per file and specific code fixes.

### Tools Allowed

| Tool | Purpose |
|------|---------|
| `read` | Read source files and steering documents |
| `write` | Write `backend/REVIEW.md` review report |

### Rating Definitions

| Rating | Meaning |
|--------|---------|
| PASS | Fully complies with all applicable standards |
| WARN | Minor issues that should be addressed but don't break correctness |
| FAIL | Violation that breaks architecture rules or hides errors |

### Example Invocation

```
@backend-reviewer Review the backend for compliance with our architecture standards
```

### Evidence of Real Use

The `backend-reviewer` agent was invoked during development of the DevTask project and produced `backend/REVIEW.md` (committed to the repository). It found two real FAIL issues:

**FAIL 1 — `middleware/errorHandler.ts`**
The error response body was `{ error: string }` but the architecture contract requires `{ error: string, statusCode: number }`. The reviewer produced the exact fix which was applied immediately.

**FAIL 2 — `services/taskService.ts`**
The status transition rules from `product.md` were not enforced. A task in `IN_PROGRESS` could be moved back to `TODO` — an explicitly disallowed transition. The reviewer produced a `validateStatusTransition` function with the exact `ALLOWED_TRANSITIONS` map. This was applied and all 60 tests continued to pass after the fix.

These were real architecture violations found by the agent, corrected, and verified by re-running the test suite. See `backend/REVIEW.md` for the full report.

---

## How Agents Demonstrate Lesson 7

| Aspect | Evidence |
|--------|----------|
| Real agent definitions | `.kiro/agents/test-engineer.md`, `.kiro/agents/backend-reviewer.md` |
| Correct Kiro format | `.md` files with YAML frontmatter (`name`, `description`, `tools`) |
| Focused responsibilities | Test engineer ≠ reviewer — separate concerns |
| Tool access defined | `read`, `write`, `shell` per agent |
| Real execution | `backend/REVIEW.md` generated by backend-reviewer |
| Real impact | Two FAIL issues found and fixed, 60 tests still pass |
