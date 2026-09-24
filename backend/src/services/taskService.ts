import { randomUUID } from 'node:crypto';

import type { Task, TaskStats, CreateTaskInput, UpdateTaskInput, TaskFilter, TaskStatus } from '../models/task.js';
import type { TaskRepository } from '../repositories/taskRepository.js';
import { AppError } from '../middleware/errorHandler.js';

// ── Status transition rules (product.md) ─────────────────────────────────────

const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO:        ['IN_PROGRESS', 'DONE'],
  IN_PROGRESS: ['DONE'],
  DONE:        ['TODO'],
};

function validateStatusTransition(current: TaskStatus, next: TaskStatus): void {
  if (current === next) return; // idempotent — always allowed
  if (!ALLOWED_TRANSITIONS[current].includes(next)) {
    throw new AppError(
      `Cannot transition task from ${current} to ${next}`,
      422,
    );
  }
}

// ── Service interface ─────────────────────────────────────────────────────────

export interface TaskService {
  createTask(input: CreateTaskInput): Task;
  listTasks(filter?: TaskFilter): Task[];
  getTaskById(id: string): Task;
  updateTask(id: string, input: UpdateTaskInput): Task;
  deleteTask(id: string): void;
  completeTask(id: string): Task;
  getStats(): TaskStats;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a task service bound to the given repository.
 * All business rules from product.md are enforced here.
 */
export function createTaskService(repository: TaskRepository): TaskService {

  /**
   * Creates a new task with a unique UUID and timestamps.
   */
  function createTask(input: CreateTaskInput): Task {
    const id = randomUUID();
    const now = new Date().toISOString();
    return repository.create(id, input, now);
  }

  /**
   * Returns all tasks, optionally filtered by status and/or priority.
   */
  function listTasks(filter?: TaskFilter): Task[] {
    return repository.findAll(filter);
  }

  /**
   * Returns a single task by ID.
   * Throws 404 if the task does not exist.
   */
  function getTaskById(id: string): Task {
    const task = repository.findById(id);
    if (!task) {
      throw new AppError(`Task with id '${id}' not found`, 404);
    }
    return task;
  }

  /**
   * Updates all mutable fields of an existing task.
   * Enforces allowed status transitions from product.md.
   * Throws 404 if the task does not exist, 422 for invalid transitions.
   */
  function updateTask(id: string, input: UpdateTaskInput): Task {
    const existing = getTaskById(id); // throws 404 if not found
    validateStatusTransition(existing.status, input.status);
    const now = new Date().toISOString();
    const updated = repository.update(id, input, now);
    if (!updated) {
      throw new AppError(`Task with id '${id}' not found`, 404);
    }
    return updated;
  }

  /**
   * Deletes a task by ID.
   * Throws 404 if the task does not exist.
   */
  function deleteTask(id: string): void {
    const deleted = repository.remove(id);
    if (!deleted) {
      throw new AppError(`Task with id '${id}' not found`, 404);
    }
  }

  /**
   * Marks a task as DONE. Shorthand for updateTask with status = DONE.
   * Throws 404 if the task does not exist.
   */
  function completeTask(id: string): Task {
    const task = getTaskById(id);
    return updateTask(id, {
      title: task.title,
      description: task.description,
      status: 'DONE',
      priority: task.priority,
      tags: task.tags,
    });
  }

  /**
   * Returns aggregate statistics for all tasks.
   */
  function getStats(): TaskStats {
    return repository.getStats();
  }

  return { createTask, listTasks, getTaskById, updateTask, deleteTask, completeTask, getStats };
}
