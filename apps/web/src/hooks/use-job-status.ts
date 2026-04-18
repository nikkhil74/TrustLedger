'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface JobStatus {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  result?: unknown;
  error?: string;
}

export function useJobStatus(jobId: string | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['score', 'job', jobId],
    queryFn: () => apiClient.get<JobStatus>(`/score/status/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'completed' || data.status === 'failed')) {
        // Invalidate score queries when job finishes
        if (data.status === 'completed') {
          queryClient.invalidateQueries({ queryKey: ['user', 'score'] });
          queryClient.invalidateQueries({ queryKey: ['score', 'history'] });
        }
        return false; // stop polling
      }
      return 2000; // poll every 2 seconds
    },
  });
}
