import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskFilterSchema,
} from '../models/task.js';
import type { TaskService } from '../services/taskService.js';

// Validates that a route param :id is a non-empty string (UUID checked by the DB layer)
const TaskIdSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

// ── Controller factory ────────────────────────────────────────────────────────

/**
 * Creates controller functions bound to the given service.
 * Controllers validate HTTP input, call the service, and format responses.
 * They do NOT contain business logic or SQL.
 */
export function createTaskController(service: TaskService) {

  function listTasks(req: Request, res: Response, next: NextFunction): void {
    const parsed = TaskFilterSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid query parameters' });
      return;
    }
    try {
      const tasks = service.listTasks(parsed.data);
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  }

  function createTask(req: Request, res: Response, next: NextFunction): void {
    const parsed = CreateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
      return;
    }
    try {
      const task = service.createTask(parsed.data);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }

  function getTaskById(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;
    try {
      const task = service.getTaskById(id);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }

  function updateTask(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;
    const parsed = UpdateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.errors[0]?.message ?? 'Invalid input' });
      return;
    }
    try {
      const task = service.updateTask(id, parsed.data);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }

  function deleteTask(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;
    try {
      service.deleteTask(id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  function completeTask(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;
    try {
      const task = service.completeTask(id);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }

  function getStats(_req: Request, res: Response, next: NextFunction): void {
    try {
      const stats = service.getStats();
      res.status(200).json(stats);
    } catch (err) {
      next(err);
    }
  }

  return { listTasks, createTask, getTaskById, updateTask, deleteTask, completeTask, getStats };
}
