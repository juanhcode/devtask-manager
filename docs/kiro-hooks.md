# DevTask — Kiro Hooks Documentation

**Lesson 3 — Hooks**

Kiro hooks are automation scripts that fire on IDE events. They enable a fast feedback loop during development — tests and type-checks run automatically without requiring manual commands.

Hook files are located in `.kiro/hooks/`.

---

## Hook 1 — Run Backend Tests on TypeScript Save

**File:** `.kiro/hooks/test-on-save.json`

| Property | Value |
|----------|-------|
| Trigger  | `PostFileSave` |
| Matcher  | `backend/src/.*\.ts$\|backend/tests/.*\.ts$` |
| Action   | `command` |
| Timeout  | 90 seconds |

### Command

```bash
cd /Users/juanhoyos/proyectos/kiro-university/backend && npm test 2>&1 | tail -20
```

### Purpose

Whenever a TypeScript file is saved inside `backend/src/` or `backend/tests/`, the complete test suite (unit + integration + property-based) runs automatically. The last 20 lines of output are returned to Kiro so it can detect failures and correct the code in the same turn.

This replaces the manual `npm test` step and ensures that no code change breaks the test suite undetected.

### Example Execution

```
 ✓ tests/unit/taskService.test.ts  (24 tests) 25ms
 ✓ tests/integration/tasks.test.ts  (25 tests) 102ms
 ✓ tests/property/task.property.test.ts  (11 tests) 176ms
 Test Files  3 passed (3)
      Tests  60 passed (60)
   Duration  565ms
```

### When it helps

- You modify a repository query and break a service test: Kiro sees the failure immediately and fixes the query.
- You add a new route and forget to update the integration test: the failing test output guides the next change.

---

## Hook 2 — Typecheck and Tests After Task Completion

**File:** `.kiro/hooks/validate-on-task-complete.json`

| Property | Value |
|----------|-------|
| Trigger  | `PostTaskExec` |
| Matcher  | (none — fires on all task completions) |
| Action   | `command` |
| Timeout  | 120 seconds |

### Command

```bash
cd /Users/juanhoyos/proyectos/kiro-university/backend \
  && echo "=== TypeScript typecheck ===" \
  && npx tsc --noEmit \
  && echo "TYPECHECK: OK" \
  && echo "=== Tests ===" \
  && npm test \
  && echo "TESTS: OK"
```

### Purpose

After Kiro marks a spec task as completed, this hook runs a two-step validation:

1. **TypeScript typecheck** — catches type errors that tests might not cover (e.g., a wrong interface, a missing property).
2. **Full test suite** — confirms that the implementation satisfies all requirements.

If either step fails, Kiro receives the error output and can correct the issue before the task is truly considered done. This enforces the quality gate defined in `testing.md`:

> _"All tests MUST pass before a task is considered complete."_

### Example Output — Success

```
=== TypeScript typecheck ===
TYPECHECK: OK
=== Tests ===
 ✓ tests/unit/taskService.test.ts  (24 tests)
 ✓ tests/integration/tasks.test.ts  (25 tests)
 ✓ tests/property/task.property.test.ts  (11 tests)
 Test Files  3 passed (3)
      Tests  60 passed (60)
TESTS: OK
```

### Example Output — Failure (Kiro receives and fixes)

```
=== TypeScript typecheck ===
src/services/taskService.ts:42:5 - error TS2322: Type 'string' is not assignable to type 'TaskStatus'.
Found 1 error.
```

Kiro reads this output, identifies the type error in `taskService.ts`, corrects the code, and re-runs the validation.

---

## How Hooks Demonstrate Lesson 3

| Aspect | Evidence |
|--------|----------|
| Real IDE event trigger | `PostFileSave` fires on actual file saves |
| Real automation | Runs `npm test` — not a simulated command |
| Feedback loop | Kiro receives output and can self-correct |
| Quality enforcement | Mirrors the "no broken tests" rule in `testing.md` |
| Two distinct hooks | Different triggers, different purposes |
