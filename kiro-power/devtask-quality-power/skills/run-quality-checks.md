---
name: run-quality-checks
description: Run the full quality suite for DevTask — TypeScript typecheck, lint, unit tests, integration tests, and property-based tests. Reports pass/fail for each step.
---

# Run Quality Checks

Execute all quality gates for the DevTask project in the correct order.

## Project Root

`/Users/juanhoyos/proyectos/kiro-university` (or workspace root if different)

## Steps

Run each step in sequence. Stop and report if any step fails — do not proceed to the next step with a failing gate.

### Step 1 — Backend TypeScript typecheck

```bash
cd backend && npx tsc --noEmit
```

**Pass criteria:** Exit code 0, no errors printed.

### Step 2 — Frontend TypeScript typecheck

```bash
cd frontend && npm run typecheck
```

**Pass criteria:** Exit code 0, no errors printed.

### Step 3 — Backend unit tests

```bash
cd backend && npm run test:unit
```

**Pass criteria:** All tests pass. Zero failures.

### Step 4 — Backend integration tests

```bash
cd backend && npm run test:integration
```

**Pass criteria:** All tests pass. Zero failures. Every endpoint covered.

### Step 5 — Property-based tests

```bash
cd backend && npm run test:property
```

**Pass criteria:** All 11 property tests pass across 100+ runs each.

### Step 6 — Full test suite summary

```bash
cd backend && npm test
```

**Pass criteria:** All 60+ tests pass across 3 test files.

## Output Format

After running all steps, report:

```
Quality Check Report — DevTask
================================
Backend typecheck:      ✅ PASS | ❌ FAIL
Frontend typecheck:     ✅ PASS | ❌ FAIL
Unit tests (24):        ✅ PASS | ❌ FAIL
Integration tests (25): ✅ PASS | ❌ FAIL
Property tests (11):    ✅ PASS | ❌ FAIL
Total:                  60/60 ✅ | X/60 ❌

Overall: READY TO SUBMIT | NEEDS FIXES
```

If any step fails, provide:
1. Which step failed
2. The exact error message
3. The file and line number
4. A suggested fix

## On Failure

If the same fix attempt fails twice, step back and diagnose the root cause rather than patching symptoms. Explain what is fundamentally wrong before trying again.
