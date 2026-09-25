# Kiro University Challenge 2026 — Evidence Matrix

This document maps each of the 7 required lessons to the specific files, commits, and execution evidence in this repository.

---

## Evidence Matrix

| Lesson | Description | Evidence | Location |
|--------|-------------|----------|----------|
| **1. Spec-driven development** | Requirements, design, and tasks written before any code | Full spec with 7 requirements, 9 business rules, technical design, and 26 implementation tasks | `.kiro/specs/devtask/` |
| **2. Steering documents** | Permanent project rules injected into every Kiro session | 5 steering documents covering product vision, tech stack, architecture, coding standards, and testing | `.kiro/steering/` |
| **3. Hooks** | Automated actions triggered by IDE events | `test-on-save`: PostFileSave → runs test suite; `validate-on-task-complete`: PostTaskExec → typecheck + tests | `.kiro/hooks/` |
| **4. Property-based testing** | Invariants verified across hundreds of random inputs | 11 property tests using fast-check covering 8 invariants (unique IDs, valid status/priority, DONE persistence, filter correctness, createdAt/updatedAt, round-trip) | `backend/tests/property/` |
| **5. Powers** | Kiro Power activated and used during development | `canva-design-power` activated; skills and steering read; design guidelines applied to architecture diagram | `docs/kiro-powers.md` |
| **6. MCP** | External tool used via Model Context Protocol | `@modelcontextprotocol/server-filesystem` configured; used to inspect project structure, grep AppError usage, read spec + steering simultaneously | `.kiro/settings/mcp.json`, `docs/kiro-mcp.md` |
| **7. Custom agents** | Two specialized agents with real execution evidence | `test-engineer`: writes/runs tests; `backend-reviewer`: found 2 real FAIL issues (errorHandler shape, status transitions) that were corrected | `.kiro/agents/`, `backend/REVIEW.md` |

---

## Lesson 1 — Spec-driven development

**Files:**
- `.kiro/specs/devtask/requirements.md` — 7 requirements (REQ-1 to REQ-7) with Given/When/Then acceptance criteria, 9 business rules (BR-1 to BR-9), API contract table
- `.kiro/specs/devtask/design.md` — technical design including architecture diagram, database schema, API contract, frontend component tree, Docker design
- `.kiro/specs/devtask/tasks.md` — 26 implementation tasks across 6 milestones, each mapped to requirements

**Evidence:** First commit (`5782994`) includes only the spec and steering — no application code. Code started in second commit only after spec was complete.

---

## Lesson 2 — Steering Documents

**Files:**
- `.kiro/steering/product.md` — domain model, business rules, features in/out of scope
- `.kiro/steering/tech-stack.md` — mandatory technology choices with rationale
- `.kiro/steering/architecture.md` — layered architecture diagram and per-layer responsibilities
- `.kiro/steering/coding-standards.md` — TypeScript strict mode, function sizes, error handling patterns, naming conventions
- `.kiro/steering/testing.md` — testing philosophy, layer requirements, property-based test properties

**Evidence:** All 5 steering documents have `inclusion: always` front-matter so they inject into every Kiro session. The `backend-reviewer` agent found 2 FAIL issues that violated `architecture.md` (missing `statusCode` in error response) and `product.md` (missing status transition enforcement) — confirming the steering is actually enforced.

---

## Lesson 3 — Hooks

**Files:**
- `.kiro/hooks/test-on-save.json` — PostFileSave trigger, matches `backend/**/*.ts`, runs `npm test`
- `.kiro/hooks/validate-on-task-complete.json` — PostTaskExec trigger, runs typecheck + full tests
- `docs/kiro-hooks.md` — full documentation with purpose, example output, and failure scenarios

**Evidence:** The hooks were active during all backend development. The `validate-on-task-complete` hook caught the `TaskIdSchema` unused variable TypeScript error after the agent task completed.

---

## Lesson 4 — Property-based Testing

**File:** `backend/tests/property/task.property.test.ts`

**Properties implemented:**

| Property | Invariant | Requirement |
|----------|-----------|-------------|
| Unique IDs | Any two tasks have different UUIDs | BR-4 |
| UUID format | IDs match v4 UUID regex | BR-4 |
| Valid status | Retrieved task always has status ∈ {TODO, IN_PROGRESS, DONE} | BR-2 |
| Valid priority | Retrieved task always has priority ∈ {LOW, MEDIUM, HIGH} | BR-3 |
| DONE persistence | Task marked complete is always retrieved as DONE | REQ-6 |
| Filter by status | All tasks in filtered result have exactly the filtered status | REQ-2 |
| Filter by priority | All tasks in filtered result have exactly the filtered priority | REQ-2 |
| createdAt immutability | Updating a task never changes createdAt | BR-5 |
| updatedAt advances | Updating a task sets updatedAt ≥ previous updatedAt | BR-6 |
| Round-trip persistence | Create then retrieve returns equivalent data | REQ-2, REQ-3 |
| Stats invariant | total === todo + inProgress + done for any task set | REQ-7 |

**Library:** `fast-check` 3.x. Each property runs 50–100 random cases.

**Evidence:** The `createdAt` and `updatedAt` property tests caught an incompatibility when `validateStatusTransition` was added — fast-check found the shrunk counterexample `{status: "IN_PROGRESS"} → {status: "TODO"}` which is a disallowed transition. The tests were updated to keep status stable for those specific properties.

---

## Lesson 5 — Powers

**Power used:** `canva-design-power`

**Evidence:**
1. `kiro_powers action="activate"` — loaded skills and steering into session
2. `kiro_powers action="readSkill" skillName="create-design"` — read the 5-step design workflow
3. `kiro_powers action="readSteering" steeringFile="canva-design.md"` — loaded composition, typography, color guidelines
4. Applied guidelines to produce the architecture diagram (hierarchy, 2-font-weight rule, color coding)

**Documentation:** `docs/kiro-powers.md`

---

## Lesson 6 — Model Context Protocol

**Configuration:** `.kiro/settings/mcp.json`

**Server:** `@modelcontextprotocol/server-filesystem@latest`

**Real uses:**
1. `list_directory` — verified project structure matches `architecture.md`
2. `search_files` — grepped `AppError` across `backend/src/` to confirm it only appears in service layer
3. `read_multiple_files` — loaded `coding-standards.md` + `architecture.md` simultaneously before writing controllers
4. `read_file` — read `requirements.md` to cross-check test coverage

**Documentation:** `docs/kiro-mcp.md`

---

## Lesson 7 — Custom Agents

**Files:**
- `.kiro/agents/test-engineer.md` — test engineer agent (read + write + shell tools)
- `.kiro/agents/backend-reviewer.md` — architecture reviewer agent (read + write tools)

**Real execution evidence:**
- `backend/REVIEW.md` — generated by `backend-reviewer` agent with PASS/WARN/FAIL per file
- Two FAIL issues found and fixed:
  1. `errorHandler.ts`: response body missing `statusCode` field
  2. `taskService.ts`: status transition rules not enforced
- Both fixes applied, all 60 tests still pass

**Documentation:** `docs/kiro-custom-agents.md`

---

## Bonus — Custom Power

**Location:** `kiro-power/devtask-quality-power/`

**Skills:** `run-quality-checks`, `architecture-review`, `test-coverage-report`

**Resources:** `quality-checklist.md`

**Steering:** `quality-standards.md` with `inclusion: auto`

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Total tests | 60 |
| Unit tests | 24 |
| Integration tests | 25 |
| Property-based tests | 11 |
| Property runs per test | 50–100 |
| Steering documents | 5 |
| Spec requirements | 7 |
| Business rules | 9 |
| API endpoints | 7 |
| Kiro agents | 2 |
| Kiro hooks | 2 |
| Git commits | 6 |
| First commit | Sep 21, 2026 09:15 PT |
