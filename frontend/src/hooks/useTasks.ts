import { useState, useEffect, useCallback } from 'react';

import * as api from '../services/apiClient.js';
import type { Task, TaskFilter, CreateTaskInput, UpdateTaskInput } from '../types/task.js';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (input: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  refresh: () => void;
}

export function useTasks(filter: TaskFilter = {}): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize filter to use as effect dependency
  const filterKey = JSON.stringify(filter);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks(filter);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: CreateTaskInput): Promise<void> => {
    await api.createTask(input);
    void fetchTasks();
  };

  const updateTask = async (id: string, input: UpdateTaskInput): Promise<void> => {
    await api.updateTask(id, input);
    void fetchTasks();
  };

  const deleteTask = async (id: string): Promise<void> => {
    await api.deleteTask(id);
    void fetchTasks();
  };

  const completeTask = async (id: string): Promise<void> => {
    await api.completeTask(id);
    void fetchTasks();
  };

  return { tasks, loading, error, createTask, updateTask, deleteTask, completeTask, refresh: fetchTasks };
}
