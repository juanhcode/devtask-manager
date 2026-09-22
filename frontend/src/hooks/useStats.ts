import { useState, useEffect } from 'react';

import { getStats } from '../services/apiClient.js';
import type { TaskStats } from '../types/task.js';

interface UseStatsResult {
  stats: TaskStats | null;
  loading: boolean;
  error: string | null;
}

export function useStats(refreshKey: number): UseStatsResult {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getStats()
      .then(setStats)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return { stats, loading, error };
}
