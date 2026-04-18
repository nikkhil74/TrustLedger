'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export interface ScoreBreakdown {
  upiFinancialBehavior: number;
  bankHistory: number;
  utilityPayments: number;
  defiRepayment: number;
  walletBehavior: number;
  behaviorTokens: number;
}

export interface CreditScore {
  id: string;
  userId: string;
  score: number;
  offChainWeight: number;
  onChainWeight: number;
  scoreHash: string;
  txHash: string | null;
  computedAt: string;
  expiresAt: string;
  breakdown: ScoreBreakdown;
  confidence: number;
  recommendation: string;
  dataCompleteness: number;
}

export function useScore() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user', 'score'],
    queryFn: async () => {
      try {
        return await apiClient.get<CreditScore>('/user/score');
      } catch (err) {
        // 404 means no score computed yet — return null instead of erroring
        if (err instanceof ApiClientError && err.code === 'NOT_FOUND') {
          return null;
        }
        throw err;
      }
    },
    enabled: isAuthenticated,
  });
}
