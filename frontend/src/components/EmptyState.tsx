interface EmptyStateProps {
  hasFilter: boolean;
  onCreateClick: () => void;
}

export function EmptyState({ hasFilter, onCreateClick }: EmptyStateProps): React.ReactElement {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 20px',
      color: '#475569',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>
        {hasFilter ? 'No tasks match this filter' : 'No tasks yet'}
      </h3>
      <p style={{ fontSize: 14, marginBottom: 20 }}>
        {hasFilter
          ? 'Try removing or changing the filters above.'
          : 'Create your first task to get started.'}
      </p>
      {!hasFilter && (
        <button
          onClick={onCreateClick}
          style={{
            background: '#3b82f6', color: '#fff',
            border: 'none', borderRadius: 6,
            padding: '10px 20px', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
          }}
        >
          + Create Task
        </button>
      )}
    </div>
  );
}
