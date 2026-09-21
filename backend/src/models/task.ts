import { z } from 'zod';

// ── Status and Priority constants ────────────────────────────────────────────

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'] as const;
export const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

// ── Domain interface ──────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ── Statistics ────────────────────────────────────────────────────────────────

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

// ── Zod validation schemas ────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty').max(200, 'Title must be at most 200 characters'),
  description: z.string().default(''),
  status: z.enum(TASK_STATUSES, { errorMap: () => ({ message: 'status must be TODO, IN_PROGRESS, or DONE' }) }),
  priority: z.enum(TASK_PRIORITIES, { errorMap: () => ({ message: 'priority must be LOW, MEDIUM, or HIGH' }) }),
  tags: z.array(z.string()).default([]),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1, 'Title must not be empty').max(200, 'Title must be at most 200 characters'),
  description: z.string(),
  status: z.enum(TASK_STATUSES, { errorMap: () => ({ message: 'status must be TODO, IN_PROGRESS, or DONE' }) }),
  priority: z.enum(TASK_PRIORITIES, { errorMap: () => ({ message: 'priority must be LOW, MEDIUM, or HIGH' }) }),
  tags: z.array(z.string()),
});

export const TaskFilterSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});

// ── Inferred input types ──────────────────────────────────────────────────────

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskFilter = z.infer<typeof TaskFilterSchema>;
