---
inclusion: always
---

# DevTask — Testing Steering Document

## Testing Philosophy

Every piece of business logic MUST be tested. Testing is not optional and is not added "later." Tests are written alongside the implementation, not after.

The test suite has three layers:

| Layer              | Tool        | Location                        | Purpose                                    |
|--------------------|-------------|---------------------------------|--------------------------------------------|
| Unit               | Vitest      | `backend/tests/unit/`           | Test services and repositories in isolation |
| Integration        | Vitest + supertest | `backend/tests/integration/` | Test full HTTP request/response cycle    |
| Property-based     | fast-check  | `backend/tests/property/`       | Verify invariants across random inputs    |

## Unit Tests

- **Target**: Services and repositories.
- **Isolation**: Services are tested with a real in-memory SQLite database (`:memory:`), not mocks.
- **Coverage**: Every public function in a service MUST have at least one test.
- **Naming convention**: `describe('functionName')` → `it('should <expected behavior> when <condition>')`

```typescript
describe('createTask', () => {
  it('should return a task with a UUID id when given valid input', async () => { ... });
  it('should throw AppError with status 400 when title is empty', async () => { ... });
});
```

## Integration Tests

- **Target**: HTTP endpoints end-to-end (routes → controllers → services → repository → SQLite).
- **Tool**: `supertest` against the Express `app` instance.
- **Database**: Each test suite uses a fresh in-memory SQLite database — no test pollution.
- **Coverage**: Every endpoint in the API contract must have at least one happy-path and one error-path test.

```typescript
describe('POST /api/v1/tasks', () => {
  it('should return 201 and the created task', async () => { ... });
  it('should return 400 when title is missing', async () => { ... });
});
```

## Property-Based Tests

- **Tool**: `fast-check`
- **Location**: `backend/tests/property/`
- **Purpose**: Verify invariants that must hold across ALL possible inputs, not just the ones we thought of.

### Required Properties

| Property | Description | Requirement covered |
|----------|-------------|---------------------|
| Unique IDs | Any two tasks created in the same session have different IDs | BR-4 |
| Valid status | A task retrieved from the store always has a status in {TODO, IN_PROGRESS, DONE} | BR-2 |
| Valid priority | A task retrieved from the store always has a priority in {LOW, MEDIUM, HIGH} | BR-3 |
| Completed task persists | A task marked DONE is always retrieved as DONE | REQ-6 |
| Filter correctness | All tasks returned by a status filter have exactly that status | REQ-4 |
| CreatedAt immutability | Updating a task never changes its createdAt | BR-5 |
| UpdatedAt advances | Updating a task always sets updatedAt ≥ the previous updatedAt | BR-6 |
| Round-trip persistence | Creating then retrieving a task returns equivalent data | REQ-2, REQ-3 |

### Property Test Structure

```typescript
import fc from 'fast-check';

describe('Property: Unique IDs', () => {
  it('should assign a different ID to each created task', () => {
    fc.assert(
      fc.property(validTaskArbitrary, validTaskArbitrary, (input1, input2) => {
        const task1 = createTask(input1);
        const task2 = createTask(input2);
        return task1.id !== task2.id;
      })
    );
  });
});
```

## Test Configuration

- Tests run with `vitest --run` (single pass, not watch mode).
- All tests MUST pass before a task is considered complete.
- TypeScript type errors in test files are treated as test failures.
- Test files are co-located with their layer in `tests/unit/`, `tests/integration/`, `tests/property/`.

## What NOT to Test

- Do NOT test Express internals or third-party library behavior.
- Do NOT test TypeScript types directly — they are compile-time guarantees.
- Do NOT write tests that only verify that a mock was called — test real behavior.
- Do NOT write tests that duplicate what property-based tests already cover.

## Running Tests

```bash
# All tests (from backend/)
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Property-based tests only
npm run test:property

# With coverage report
npm run test:coverage
```
