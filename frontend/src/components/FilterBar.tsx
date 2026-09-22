import type { TaskFilter, TaskStatus, TaskPriority } from '../types/task.js';

interface FilterBarProps {
  filter: TaskFilter;
  onChange: (filter: TaskFilter) => void;
  onCreateClick: () => void;
}

const selectStyle: React.CSSProperties = {
  background: '#1e293b',
  color: '#e2e8f0',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 14,
  cursor: 'pointer',
};

export function FilterBar({ filter, onChange, onCreateClick }: FilterBarProps): React.ReactElement {
  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value as TaskStatus | '';
    onChange({ ...filter, status: value || undefined });
  }

  function handlePriorityChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value as TaskPriority | '';
    onChange({ ...filter, priority: value || undefined });
  }

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'center',
      marginBottom: 20,
      flexWrap: 'wrap',
    }}>
      <select
        style={selectStyle}
        value={filter.status ?? ''}
        onChange={handleStatusChange}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="TODO">Todo</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>

      <select
        style={selectStyle}
        value={filter.priority ?? ''}
        onChange={handlePriorityChange}
        aria-label="Filter by priority"
      >
        <option value="">All priorities</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <div style={{ flex: 1 }} />

      <button
        onClick={onCreateClick}
        style={{
          background: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
        aria-label="Create new task"
      >
        + New Task
      </button>
    </div>
  );
}
