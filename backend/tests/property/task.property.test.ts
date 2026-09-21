/**
 * Property-Based Tests — DevTask
 *
 * These tests use fast-check to verify invariants that must hold across ALL
 * possible valid inputs — not just the specific examples we thought of.
 *
 * Each property maps directly to requirements in .kiro/specs/devtask/requirements.md
 * and business rules in the product steering document.
 */
import { describe, it, beforeEach } from 'vitest';
import fc from 'fast-check';

import { createTestApp } from '../helpers/createTestApp.js';
import { TASK_STATUSES, TASK_PRIORITIES } from '../../src/models/task.js';
import type { TaskService } from '../../src/services/taskService.js';

// ── Arbitraries ───────────────────────────────────────────────────────────────

/** Generates a valid non-empty task title (1–200 chars) */
const titleArbitrary = fc.string({ minLength: 1, maxLength: 200 }).filter(s => s.trim().length > 0);

/** Generates a valid TaskStatus */
const statusArbitrary = fc.constantFrom(...TASK_STATUSES);

/** Generates a valid TaskPriority */
const priorityArbitrary = fc.constantFrom(...TASK_PRIORITIES);

/** Generates a valid tag array */
const tagsArbitrary = fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 });

/** Generates a complete valid CreateTaskInput */
const validTaskInputArbitrary = fc.record({
  title: titleArbitrary,
  description: fc.string({ maxLength: 500 }),
  status: statusArbitrary,
  priority: priorityArbitrary,
  tags: tagsArbitrary,
});

// ── Property tests ─────────────────────────────────────────────────────────────

describe('Property: Unique IDs (BR-4)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should assign a different UUID to each created task', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, validTaskInputArbitrary, (input1, input2) => {
        const task1 = service.createTask(input1);
        const task2 = service.createTask(input2);
        return task1.id !== task2.id;
      }),
      { numRuns: 100 },
    );
  });

  it('should assign UUIDs matching the v4 format', () => {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    fc.assert(
      fc.property(validTaskInputArbitrary, (input) => {
        const task = service.createTask(input);
        return uuidV4Regex.test(task.id);
      }),
      { numRuns: 50 },
    );
  });
});

describe('Property: Valid status on retrieval (BR-2)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should always retrieve a task with a status in the allowed set', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, (input) => {
        const created = service.createTask(input);
        const retrieved = service.getTaskById(created.id);
        return (TASK_STATUSES as readonly string[]).includes(retrieved.status);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: Valid priority on retrieval (BR-3)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should always retrieve a task with a priority in the allowed set', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, (input) => {
        const created = service.createTask(input);
        const retrieved = service.getTaskById(created.id);
        return (TASK_PRIORITIES as readonly string[]).includes(retrieved.priority);
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: Completed task persists DONE status (REQ-6)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should always retrieve a task as DONE after marking it complete', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, (input) => {
        const created = service.createTask(input);
        service.completeTask(created.id);
        const retrieved = service.getTaskById(created.id);
        return retrieved.status === 'DONE';
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: Filter correctness (REQ-2)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should return only tasks with the specified status when filtering', () => {
    fc.assert(
      fc.property(
        fc.array(validTaskInputArbitrary, { minLength: 1, maxLength: 10 }),
        statusArbitrary,
        (inputs, filterStatus) => {
          // Create fresh app for each property run to avoid cross-run pollution
          const { service: freshService } = createTestApp();
          inputs.forEach(input => freshService.createTask(input));

          const filtered = freshService.listTasks({ status: filterStatus });
          return filtered.every(t => t.status === filterStatus);
        },
      ),
      { numRuns: 50 },
    );
  });

  it('should return only tasks with the specified priority when filtering', () => {
    fc.assert(
      fc.property(
        fc.array(validTaskInputArbitrary, { minLength: 1, maxLength: 10 }),
        priorityArbitrary,
        (inputs, filterPriority) => {
          const { service: freshService } = createTestApp();
          inputs.forEach(input => freshService.createTask(input));

          const filtered = freshService.listTasks({ priority: filterPriority });
          return filtered.every(t => t.priority === filterPriority);
        },
      ),
      { numRuns: 50 },
    );
  });
});

describe('Property: createdAt immutability (BR-5)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should never change createdAt when a task is updated', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, validTaskInputArbitrary, (createInput, updateInput) => {
        const created = service.createTask(createInput);
        const updated = service.updateTask(created.id, {
          title: updateInput.title,
          description: updateInput.description,
          status: updateInput.status,
          priority: updateInput.priority,
          tags: updateInput.tags,
        });
        return updated.createdAt === created.createdAt;
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: updatedAt advances on update (BR-6)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should set updatedAt >= createdAt after an update', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, validTaskInputArbitrary, (createInput, updateInput) => {
        const created = service.createTask(createInput);
        const updated = service.updateTask(created.id, {
          title: updateInput.title,
          description: updateInput.description,
          status: updateInput.status,
          priority: updateInput.priority,
          tags: updateInput.tags,
        });
        return new Date(updated.updatedAt).getTime() >= new Date(created.updatedAt).getTime();
      }),
      { numRuns: 100 },
    );
  });
});

describe('Property: Round-trip persistence (REQ-2, REQ-3)', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should retrieve a task with the same data that was used to create it', () => {
    fc.assert(
      fc.property(validTaskInputArbitrary, (input) => {
        const created = service.createTask(input);
        const retrieved = service.getTaskById(created.id);

        return (
          retrieved.title === input.title &&
          retrieved.description === input.description &&
          retrieved.status === input.status &&
          retrieved.priority === input.priority &&
          JSON.stringify(retrieved.tags) === JSON.stringify(input.tags)
        );
      }),
      { numRuns: 100 },
    );
  });

  it('should maintain stats invariant: total === todo + inProgress + done', () => {
    fc.assert(
      fc.property(
        fc.array(validTaskInputArbitrary, { minLength: 0, maxLength: 20 }),
        (inputs) => {
          const { service: freshService } = createTestApp();
          inputs.forEach(input => freshService.createTask(input));

          const stats = freshService.getStats();
          return stats.total === stats.todo + stats.inProgress + stats.done;
        },
      ),
      { numRuns: 50 },
    );
  });
});
