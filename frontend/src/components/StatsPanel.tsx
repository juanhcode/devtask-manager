import type { TaskStats } from '../types/task.js';

interface StatsPanelProps {
  stats: TaskStats | null;
  loading: boolean;
}

const cardStyle: React.CSSProperties = {
  background: '#1e293b',
  borderRadius: 8,
  padding: '16px 20px',
  textAlign: 'center',
  flex: 1,
  minWidth: 120,
};

const numberStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  lineHeight: 1.2,
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginTop: 4,
};

export function StatsPanel({ stats, loading }: StatsPanelProps): React.ReactElement {
  if (loading || !stats) {
    return (
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ ...cardStyle, opacity: 0.4 }}>
            <div style={{ ...numberStyle, color: '#475569' }}>—</div>
            <div style={labelStyle}>Loading…</div>
          </div>
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total', value: stats.total, color: '#e2e8f0' },
    { label: 'Todo', value: stats.todo, color: '#94a3b8' },
    { label: 'In Progress', value: stats.inProgress, color: '#f59e0b' },
    { label: 'Done', value: stats.done, color: '#22c55e' },
  ];

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      {items.map(item => (
        <div key={item.label} style={cardStyle}>
          <div style={{ ...numberStyle, color: item.color }}>{item.value}</div>
          <div style={labelStyle}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}
