import type { Task, TaskStats, CreateTaskInput, UpdateTaskInput, TaskFilter } from '../types/task.js';

const BASE_URL = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '/api/v1';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

function buildQuery(filter: TaskFilter): string {
  const params = new URLSearchParams();
  if (filter.status) params.set('status', filter.status);
  if (filter.priority) params.set('priority', filter.priority);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

// ── API functions ──────────────────────────────────────────────────────────────

export async function getTasks(filter: TaskFilter = {}): Promise<Task[]> {
  const res = await fetch(`${BASE_URL}/tasks${buildQuery(filter)}`);
  return handleResponse<Task[]>(res);
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<Task>(res);
}

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`);
  return handleResponse<Task>(res);
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return handleResponse<Task>(res);
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' });
  return handleResponse<void>(res);
}

export async function completeTask(id: string): Promise<Task> {
  const res = await fetch(`${BASE_URL}/tasks/${id}/complete`, { method: 'PATCH' });
  return handleResponse<Task>(res);
}

export async function getStats(): Promise<TaskStats> {
  const res = await fetch(`${BASE_URL}/tasks/stats`);
  return handleResponse<TaskStats>(res);
}
