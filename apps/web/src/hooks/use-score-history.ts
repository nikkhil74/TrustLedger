'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export interface ScoreHistoryItem {
  id: string;
  userId: string;
  score: number;
  scoreHash: string;
  txHash: string | null;
  breakdown: Record<string, number>;
  confidence: number;
  recommendation: string;
  computedAt: string;
}

export function useScoreHistory() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['score', 'history'],
    queryFn: () => apiClient.get<ScoreHistoryItem[]>('/score/history'),
    enabled: isAuthenticated,
  });
}
