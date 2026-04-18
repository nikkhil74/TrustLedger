'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

interface UserProfile {
  id: string;
  walletAddress: string;
  kycStatus: string;
  phoneNumber: string;
  createdAt: string;
}

export function useProfile() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => apiClient.get<UserProfile>('/user/profile'),
    enabled: isAuthenticated,
  });
}
