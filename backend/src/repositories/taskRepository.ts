import type Database from 'better-sqlite3';

import type { Task, TaskFilter, TaskStats, CreateTaskInput, UpdateTaskInput } from '../models/task.js';

// ── SQLite row shape (snake_case columns) ─────────────────────────────────────

interface TaskRow {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tags: string; // JSON-encoded string[]
  created_at: string;
  updated_at: string;
}

interface StatsRow {
  status: string;
  count: number;
}

// ── Row ↔ Domain mappers ──────────────────────────────────────────────────────

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    tags: JSON.parse(row.tags) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ── Repository interface ──────────────────────────────────────────────────────

export interface TaskRepository {
  findAll(filter?: TaskFilter): Task[];
  findById(id: string): Task | null;
  create(id: string, input: CreateTaskInput, now: string): Task;
  update(id: string, input: UpdateTaskInput, now: string): Task | null;
  remove(id: string): boolean;
  getStats(): TaskStats;
}

// ── Factory ───────────────────────────────────────────────────────────────────

/**
 * Creates a task repository bound to the given SQLite database instance.
 * Using a factory (not a class) per coding standards.
 */
export function createTaskRepository(db: Database.Database): TaskRepository {

  function findAll(filter?: TaskFilter): Task[] {
    const conditions: string[] = [];
    const params: string[] = [];

    if (filter?.status) {
      conditions.push('status = ?');
      params.push(filter.status);
    }
    if (filter?.priority) {
      conditions.push('priority = ?');
      params.push(filter.priority);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM tasks ${where} ORDER BY created_at DESC`;

    const rows = db.prepare(sql).all(...params) as TaskRow[];
    return rows.map(rowToTask);
  }

  function findById(id: string): Task | null {
    const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as TaskRow | undefined;
    return row ? rowToTask(row) : null;
  }

  function create(id: string, input: CreateTaskInput, now: string): Task {
    db.prepare(`
      INSERT INTO tasks (id, title, description, status, priority, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      input.title,
      input.description,
      input.status,
      input.priority,
      JSON.stringify(input.tags),
      now,
      now,
    );

    // Return the inserted row to ensure consistency with what was persisted
    return findById(id) as Task;
  }

  function update(id: string, input: UpdateTaskInput, now: string): Task | null {
    const result = db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, status = ?, priority = ?, tags = ?, updated_at = ?
      WHERE id = ?
    `).run(
      input.title,
      input.description,
      input.status,
      input.priority,
      JSON.stringify(input.tags),
      now,
      id,
    );

    // SQLite returns 0 for affected rows on a no-op UPDATE;
    // we treat this as "not found" so the service can throw 404.
    if (result.changes === 0) {
      return null;
    }

    return findById(id) as Task;
  }

  function remove(id: string): boolean {
    const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  function getStats(): TaskStats {
    const rows = db.prepare(`
      SELECT status, COUNT(*) as count FROM tasks GROUP BY status
    `).all() as StatsRow[];

    const counts = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    for (const row of rows) {
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = row.count;
      }
    }

    return {
      total: counts.TODO + counts.IN_PROGRESS + counts.DONE,
      todo: counts.TODO,
      inProgress: counts.IN_PROGRESS,
      done: counts.DONE,
    };
  }

  return { findAll, findById, create, update, remove, getStats };
}
