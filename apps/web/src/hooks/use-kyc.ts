'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

interface InitiateKycResult {
  requestId: string;
  message: string;
}

interface VerifyKycResult {
  verified: boolean;
  message: string;
}

export function useInitiateKyc() {
  return useMutation({
    mutationFn: (aadhaarNumber: string) =>
      apiClient.post<InitiateKycResult>('/auth/initiate-kyc', { aadhaarNumber }),
  });
}

export function useVerifyKyc() {
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (input: { otp: string; requestId: string }) =>
      apiClient.post<VerifyKycResult>('/auth/verify-kyc', input),
    onSuccess: () => {
      refreshUser();
    },
  });
}
