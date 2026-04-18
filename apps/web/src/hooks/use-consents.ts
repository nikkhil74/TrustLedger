'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

export interface DataConsent {
  id: string;
  userId: string;
  aaHandle: string;
  consentId: string;
  dataTypes: string[];
  fiTypes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PAUSED';
  grantedAt: string;
  expiresAt: string;
}

export interface GrantConsentInput {
  aaHandle: string;
  dataTypes: string[];
  fiTypes: string[];
  durationDays?: number;
  purpose?: string;
}

export function useConsents() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user', 'consents'],
    queryFn: () => apiClient.get<DataConsent[]>('/user/consents'),
    enabled: isAuthenticated,
  });
}

export function useGrantConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: GrantConsentInput) =>
      apiClient.post<DataConsent>('/user/consent/grant', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'consents'] });
    },
  });
}

export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (consentId: string) =>
      apiClient.del<DataConsent>(`/user/consent/${consentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'consents'] });
    },
  });
}
