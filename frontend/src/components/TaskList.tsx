import type { Task } from '../types/task.js';
import { TaskCard } from './TaskCard.js';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onComplete: (id: string) => void;
}

export function TaskList({ tasks, loading, onEdit, onDelete, onComplete }: TaskListProps): React.ReactElement {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
        Loading tasks…
      </div>
    );
  }

  return (
    <div role="list" aria-label="Task list">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </div>
  );
}
