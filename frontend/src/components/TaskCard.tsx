import type { Task } from '../types/task.js';
import { statusColor, priorityColor, toLabel, formatDate } from '../utils/format.js';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 12,
  fontSize: 11,
  fontWeight: 600,
  color,
  border: `1px solid ${color}`,
  letterSpacing: '0.03em',
});

const btnStyle = (color: string): React.CSSProperties => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color,
  borderRadius: 5,
  padding: '4px 10px',
  fontSize: 12,
  cursor: 'pointer',
});

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps): React.ReactElement {
  return (
    <article
      style={{
        background: '#1e293b',
        borderRadius: 8,
        padding: 16,
        marginBottom: 10,
        borderLeft: `3px solid ${statusColor(task.status)}`,
      }}
      aria-label={`Task: ${task.title}`}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{task.title}</h3>
          {task.description && (
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, lineHeight: 1.4 }}>
              {task.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={badgeStyle(statusColor(task.status))}>{toLabel(task.status)}</span>
            <span style={badgeStyle(priorityColor(task.priority))}>{task.priority}</span>
            {task.tags.map(tag => (
              <span key={tag} style={{
                background: '#334155', color: '#94a3b8',
                padding: '2px 7px', borderRadius: 10, fontSize: 11,
              }}>
                {tag}
              </span>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#475569' }}>
            Updated {formatDate(task.updatedAt)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {task.status !== 'DONE' && (
            <button
              style={btnStyle('#22c55e')}
              onClick={() => onComplete(task.id)}
              aria-label={`Mark "${task.title}" as done`}
            >
              ✓ Done
            </button>
          )}
          <button
            style={btnStyle('#94a3b8')}
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
          >
            Edit
          </button>
          <button
            style={btnStyle('#ef4444')}
            onClick={() => onDelete(task.id)}
            aria-label={`Delete "${task.title}"`}
          >
            ✕
          </button>
        </div>
      </div>
    </article>
  );
}
