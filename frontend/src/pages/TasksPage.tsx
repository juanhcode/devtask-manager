import { useState, useCallback } from 'react';

import { useTasks } from '../hooks/useTasks.js';
import { useStats } from '../hooks/useStats.js';
import { StatsPanel } from '../components/StatsPanel.js';
import { FilterBar } from '../components/FilterBar.js';
import { TaskList } from '../components/TaskList.js';
import { TaskForm } from '../components/TaskForm.js';
import { EmptyState } from '../components/EmptyState.js';
import type { Task, TaskFilter, CreateTaskInput, UpdateTaskInput } from '../types/task.js';

export function TasksPage(): React.ReactElement {
  const [filter, setFilter] = useState<TaskFilter>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

  const refreshStats = useCallback(() => setStatsRefreshKey(k => k + 1), []);

  const { tasks, loading, error, createTask, updateTask, deleteTask, completeTask } = useTasks(filter);
  const { stats, loading: statsLoading } = useStats(statsRefreshKey);

  async function handleCreate(input: CreateTaskInput | UpdateTaskInput): Promise<void> {
    await createTask(input as CreateTaskInput);
    refreshStats();
    setShowCreateForm(false);
  }

  async function handleUpdate(input: CreateTaskInput | UpdateTaskInput): Promise<void> {
    if (!editingTask) return;
    await updateTask(editingTask.id, input as UpdateTaskInput);
    refreshStats();
    setEditingTask(null);
  }

  async function handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
    refreshStats();
  }

  async function handleComplete(id: string): Promise<void> {
    await completeTask(id);
    refreshStats();
  }

  const hasFilter = Boolean(filter.status ?? filter.priority);

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#f1f5f9' }}>
          DevTask
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Personal DevOps Task Manager
        </p>
      </header>

      <StatsPanel stats={stats} loading={statsLoading} />

      <FilterBar
        filter={filter}
        onChange={setFilter}
        onCreateClick={() => setShowCreateForm(true)}
      />

      {error && (
        <div style={{
          background: '#7f1d1d', color: '#fca5a5',
          borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {!loading && tasks.length === 0 ? (
        <EmptyState hasFilter={hasFilter} onCreateClick={() => setShowCreateForm(true)} />
      ) : (
        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={setEditingTask}
          onDelete={(id) => { void handleDelete(id); }}
          onComplete={(id) => { void handleComplete(id); }}
        />
      )}

      {showCreateForm && (
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingTask && (
        <TaskForm
          initial={editingTask}
          onSubmit={handleUpdate}
          onCancel={() => setEditingTask(null)}
        />
      )}
    </main>
  );
}
