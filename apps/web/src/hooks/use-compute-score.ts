'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface ComputeScoreInput {
  consentId?: string;
  forceRefresh?: boolean;
}

interface ComputeScoreResult {
  jobId: string | null;
  cached: boolean;
  score?: unknown;
}

export function useComputeScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input?: ComputeScoreInput) =>
      apiClient.post<ComputeScoreResult>('/score/compute', input ?? {}),
    onSuccess: (data) => {
      if (data.cached) {
        queryClient.invalidateQueries({ queryKey: ['user', 'score'] });
        queryClient.invalidateQueries({ queryKey: ['score', 'history'] });
      }
    },
  });
}
