'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export interface BehaviorToken {
  id: string;
  userId: string;
  action: string;
  tokensAwarded: number;
  txHash: string;
  createdAt: string;
}

export function useBehaviorTokens() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user', 'behavior-tokens'],
    queryFn: () => apiClient.get<BehaviorToken[]>('/user/behavior-tokens'),
    enabled: isAuthenticated,
  });
}
