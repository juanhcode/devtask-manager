import { useState } from 'react';

import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, TaskPriority } from '../types/task.js';

interface TaskFormProps {
  initial?: Task;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#0f172a',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 14,
  marginTop: 4,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  color: '#94a3b8',
  marginBottom: 12,
};

export function TaskForm({ initial, onSubmit, onCancel }: TaskFormProps): React.ReactElement {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'MEDIUM');
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(', '));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    const tags = tagsRaw
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), description, status, priority, tags });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
      setSubmitting(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#1e293b', borderRadius: 10, padding: 28,
        width: '100%', maxWidth: 480,
      }}>
        <h2 style={{ marginBottom: 20, fontSize: 18 }}>
          {initial ? 'Edit Task' : 'New Task'}
        </h2>

        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <label style={labelStyle}>
            Title *
            <input
              style={inputStyle}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Setup CI pipeline"
              maxLength={200}
              required
            />
          </label>

          <label style={labelStyle}>
            Description
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Optional details…"
            />
          </label>

          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              Status
              <select
                style={inputStyle}
                value={status}
                onChange={e => setStatus(e.target.value as TaskStatus)}
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </label>

            <label style={{ ...labelStyle, flex: 1 }}>
              Priority
              <select
                style={inputStyle}
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </label>
          </div>

          <label style={labelStyle}>
            Tags (comma-separated)
            <input
              style={inputStyle}
              value={tagsRaw}
              onChange={e => setTagsRaw(e.target.value)}
              placeholder="e.g. ci, devops, backend"
            />
          </label>

          {error && (
            <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{
                background: 'transparent', color: '#94a3b8',
                border: '1px solid #334155', borderRadius: 6,
                padding: '8px 16px', cursor: 'pointer', fontSize: 14,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: '#3b82f6', color: '#fff',
                border: 'none', borderRadius: 6,
                padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}
            >
              {submitting ? 'Saving…' : (initial ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
