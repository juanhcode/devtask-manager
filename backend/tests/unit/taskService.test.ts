import { describe, it, expect, beforeEach } from 'vitest';

import { createTestApp } from '../helpers/createTestApp.js';
import { AppError } from '../../src/middleware/errorHandler.js';
import type { TaskService } from '../../src/services/taskService.js';

const VALID_INPUT = {
  title: 'Setup CI pipeline',
  description: 'Configure GitHub Actions for automated testing',
  status: 'TODO' as const,
  priority: 'HIGH' as const,
  tags: ['ci', 'devops'],
};

describe('createTask', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should return a task with a UUID id when given valid input', () => {
    const task = service.createTask(VALID_INPUT);

    expect(task.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should set createdAt and updatedAt to the same ISO 8601 timestamp', () => {
    const task = service.createTask(VALID_INPUT);

    expect(task.createdAt).toBe(task.updatedAt);
    expect(() => new Date(task.createdAt)).not.toThrow();
  });

  it('should persist title, status, priority, and tags', () => {
    const task = service.createTask(VALID_INPUT);

    expect(task.title).toBe(VALID_INPUT.title);
    expect(task.status).toBe('TODO');
    expect(task.priority).toBe('HIGH');
    expect(task.tags).toEqual(['ci', 'devops']);
  });

  it('should default description to empty string when not provided', () => {
    const task = service.createTask({
      title: 'Quick task',
      description: '',
      status: 'TODO',
      priority: 'LOW',
      tags: [],
    });

    expect(task.description).toBe('');
  });

  it('should default tags to empty array when not provided', () => {
    const task = service.createTask({
      title: 'Quick task',
      description: '',
      status: 'TODO',
      priority: 'LOW',
      tags: [],
    });

    expect(task.tags).toEqual([]);
  });
});

describe('getTaskById', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should return the created task when given a valid id', () => {
    const created = service.createTask(VALID_INPUT);
    const found = service.getTaskById(created.id);

    expect(found.id).toBe(created.id);
    expect(found.title).toBe(created.title);
  });

  it('should throw AppError with status 404 when task does not exist', () => {
    expect(() => service.getTaskById('non-existent-id')).toThrow(AppError);
    expect(() => service.getTaskById('non-existent-id')).toThrow('not found');
  });
});

describe('updateTask', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should update title and status correctly', () => {
    const created = service.createTask(VALID_INPUT);
    const updated = service.updateTask(created.id, {
      title: 'Updated title',
      description: created.description,
      status: 'IN_PROGRESS',
      priority: created.priority,
      tags: created.tags,
    });

    expect(updated.title).toBe('Updated title');
    expect(updated.status).toBe('IN_PROGRESS');
  });

  it('should not modify createdAt', () => {
    const created = service.createTask(VALID_INPUT);
    const updated = service.updateTask(created.id, {
      title: 'Updated title',
      description: created.description,
      status: 'IN_PROGRESS',
      priority: created.priority,
      tags: created.tags,
    });

    expect(updated.createdAt).toBe(created.createdAt);
  });

  it('should update updatedAt timestamp', () => {
    const created = service.createTask(VALID_INPUT);

    // Small delay to ensure timestamp difference is measurable
    const updated = service.updateTask(created.id, {
      title: 'Updated title',
      description: created.description,
      status: 'IN_PROGRESS',
      priority: created.priority,
      tags: created.tags,
    });

    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(created.updatedAt).getTime(),
    );
  });

  it('should throw AppError with status 404 for non-existent task', () => {
    expect(() =>
      service.updateTask('non-existent', {
        title: 'x',
        description: '',
        status: 'TODO',
        priority: 'LOW',
        tags: [],
      }),
    ).toThrow(AppError);
  });
});

describe('deleteTask', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should remove the task from the store', () => {
    const created = service.createTask(VALID_INPUT);
    service.deleteTask(created.id);

    expect(() => service.getTaskById(created.id)).toThrow(AppError);
  });

  it('should throw AppError with status 404 for non-existent task', () => {
    expect(() => service.deleteTask('non-existent')).toThrow(AppError);
  });
});

describe('completeTask', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should set status to DONE', () => {
    const created = service.createTask(VALID_INPUT);
    const completed = service.completeTask(created.id);

    expect(completed.status).toBe('DONE');
  });

  it('should work on a task with any initial status', () => {
    const inProgress = service.createTask({ ...VALID_INPUT, status: 'IN_PROGRESS' });
    const completed = service.completeTask(inProgress.id);

    expect(completed.status).toBe('DONE');
  });

  it('should throw AppError with status 404 for non-existent task', () => {
    expect(() => service.completeTask('non-existent')).toThrow(AppError);
  });
});

describe('getStats', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should return zeros when no tasks exist', () => {
    const stats = service.getStats();

    expect(stats).toEqual({ total: 0, todo: 0, inProgress: 0, done: 0 });
  });

  it('should count tasks by status correctly', () => {
    service.createTask({ ...VALID_INPUT, status: 'TODO' });
    service.createTask({ ...VALID_INPUT, status: 'TODO' });
    service.createTask({ ...VALID_INPUT, status: 'IN_PROGRESS' });
    service.createTask({ ...VALID_INPUT, status: 'DONE' });

    const stats = service.getStats();

    expect(stats.total).toBe(4);
    expect(stats.todo).toBe(2);
    expect(stats.inProgress).toBe(1);
    expect(stats.done).toBe(1);
  });

  it('should update stats after task completion', () => {
    const task = service.createTask({ ...VALID_INPUT, status: 'TODO' });
    service.completeTask(task.id);

    const stats = service.getStats();

    expect(stats.todo).toBe(0);
    expect(stats.done).toBe(1);
  });

  it('should satisfy total === todo + inProgress + done invariant', () => {
    service.createTask({ ...VALID_INPUT, status: 'TODO' });
    service.createTask({ ...VALID_INPUT, status: 'IN_PROGRESS' });
    service.createTask({ ...VALID_INPUT, status: 'DONE' });

    const stats = service.getStats();

    expect(stats.total).toBe(stats.todo + stats.inProgress + stats.done);
  });
});

describe('listTasks', () => {
  let service: TaskService;

  beforeEach(() => {
    ({ service } = createTestApp());
  });

  it('should return empty array when no tasks exist', () => {
    expect(service.listTasks()).toEqual([]);
  });

  it('should return all tasks when no filter is applied', () => {
    service.createTask({ ...VALID_INPUT, status: 'TODO' });
    service.createTask({ ...VALID_INPUT, status: 'DONE' });

    expect(service.listTasks()).toHaveLength(2);
  });

  it('should return only tasks matching the status filter', () => {
    service.createTask({ ...VALID_INPUT, status: 'TODO' });
    service.createTask({ ...VALID_INPUT, status: 'DONE' });

    const todos = service.listTasks({ status: 'TODO' });

    expect(todos).toHaveLength(1);
    expect(todos[0]?.status).toBe('TODO');
  });

  it('should return only tasks matching the priority filter', () => {
    service.createTask({ ...VALID_INPUT, priority: 'HIGH' });
    service.createTask({ ...VALID_INPUT, priority: 'LOW' });

    const high = service.listTasks({ priority: 'HIGH' });

    expect(high).toHaveLength(1);
    expect(high[0]?.priority).toBe('HIGH');
  });
});
