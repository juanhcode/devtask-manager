/**
 * Formats an ISO 8601 datetime string into a human-readable local date/time.
 */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Returns a CSS color token for a given task status.
 */
export function statusColor(status: string): string {
  switch (status) {
    case 'TODO': return '#94a3b8';
    case 'IN_PROGRESS': return '#f59e0b';
    case 'DONE': return '#22c55e';
    default: return '#64748b';
  }
}

/**
 * Returns a CSS color token for a given task priority.
 */
export function priorityColor(priority: string): string {
  switch (priority) {
    case 'HIGH': return '#ef4444';
    case 'MEDIUM': return '#f59e0b';
    case 'LOW': return '#22c55e';
    default: return '#64748b';
  }
}

/**
 * Converts a status/priority value to a display label.
 */
export function toLabel(value: string): string {
  return value.replace('_', ' ');
}
