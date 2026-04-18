'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { signMessage } from '@wagmi/core';
import { SiweMessage } from 'siwe';
import { wagmiConfig } from '@/lib/wagmi';
import { apiClient } from '@/lib/api-client';

type KYCStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'EXPIRED';

interface AuthUser {
  id: string;
  walletAddress: string;
  kycStatus: KYCStatus;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: string | null;
  login: (address: string, chainId: number) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const prevConnected = useRef(false);
  const loginInProgress = useRef(false);

  const isAuthenticated = user !== null && !!apiClient.getAccessToken();

  // ── Logout ──
  const logout = useCallback(() => {
    apiClient.clearTokens();
    setUser(null);
    setLoginError(null);
    disconnect();
  }, [disconnect]);

  // ── Refresh user profile ──
  const refreshUser = useCallback(async () => {
    try {
      const profile = await apiClient.get<AuthUser>('/user/profile');
      setUser(profile);
    } catch {
      apiClient.clearTokens();
      setUser(null);
    }
  }, []);

  // ── Login via SIWE ──
  const login = useCallback(
    async (walletAddress: string, chain: number) => {
      if (loginInProgress.current) return;
      loginInProgress.current = true;
      setIsLoading(true);
      setLoginError(null);

      try {
        // 1. Get nonce
        const { nonce } = await apiClient.get<{ nonce: string }>(
          `/auth/nonce?wallet=${walletAddress}`,
        );

        // 2. Create SIWE message
        const siweMessage = new SiweMessage({
          domain: window.location.host,
          address: walletAddress,
          statement: 'Sign in to TrustLedger',
          uri: window.location.origin,
          version: '1',
          chainId: chain,
          nonce,
        });

        const message = siweMessage.prepareMessage();

        // 3. Sign with wallet
        const signature = await signMessage(wagmiConfig, { message });

        // 4. Send to API
        const result = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
          user: AuthUser;
        }>('/auth/login', { message, signature });

        // 5. Store tokens and set user
        apiClient.setTokens(result.accessToken, result.refreshToken);
        setUser(result.user);
        setLoginError(null);
      } catch (err) {
        console.error('SIWE login failed:', err);
        apiClient.clearTokens();
        setUser(null);

        // Determine user-friendly error
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setLoginError('Backend API is not reachable. Make sure the API server is running on port 4000.');
        } else if (err instanceof Error && err.message.includes('User rejected')) {
          setLoginError('Signature rejected. Please try again.');
        } else {
          setLoginError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        }
      } finally {
        loginInProgress.current = false;
        setIsLoading(false);
      }
    },
    [],
  );

  // ── Register onAuthFailure callback ──
  useEffect(() => {
    apiClient.onAuthFailure = logout;
    return () => {
      apiClient.onAuthFailure = null;
    };
  }, [logout]);

  // ── Hydrate on mount: validate existing token ──
  useEffect(() => {
    async function hydrate() {
      const token = apiClient.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await apiClient.get<AuthUser>('/user/profile');
        setUser(profile);
      } catch {
        apiClient.clearTokens();
      }
      setIsLoading(false);
    }
    hydrate();
  }, []);

  // ── Auto-login when wallet newly connects ──
  useEffect(() => {
    const wasConnected = prevConnected.current;
    prevConnected.current = isConnected;

    // Only trigger on transition: disconnected -> connected
    if (!wasConnected && isConnected && address && chainId && !isAuthenticated) {
      login(address, chainId);
    }
  }, [isConnected, address, chainId, isAuthenticated, login]);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, loginError, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
