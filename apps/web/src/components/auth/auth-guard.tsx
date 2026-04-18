'use client';

import { useAccount } from 'wagmi';
import { useAuth } from '@/providers/auth-provider';
import { ConnectWallet } from '@/components/web3/connect-wallet';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, address, chainId } = useAccount();
  const { isAuthenticated, isLoading, loginError, login } = useAuth();

  // Wallet not connected
  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-tl-border bg-tl-card p-8 text-center max-w-md w-full">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-tl-cyan/20 to-tl-purple/20 flex items-center justify-center mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-tl-cyan to-tl-purple" />
          </div>
          <h2 className="text-xl font-bold text-tl-text mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-sm text-tl-text-secondary mb-6">
            Connect your Web3 wallet to access your TrustLedger dashboard and credit score.
          </p>
          <div className="flex justify-center">
            <ConnectWallet />
          </div>
        </div>
      </div>
    );
  }

  // Login failed — show error with retry
  if (!isLoading && !isAuthenticated && loginError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-tl-border bg-tl-card p-8 text-center max-w-md w-full">
          <AlertCircle className="h-10 w-10 text-tl-orange mx-auto mb-4" />
          <h2 className="text-lg font-bold text-tl-text mb-2">
            Authentication Failed
          </h2>
          <p className="text-sm text-tl-text-secondary mb-6">
            {loginError}
          </p>
          <button
            onClick={() => address && chainId && login(address, chainId)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110 transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Connected but SIWE in progress
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-tl-border bg-tl-card p-8 text-center max-w-md w-full">
          <Loader2 className="h-10 w-10 text-tl-cyan animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold text-tl-text mb-2">
            Authenticating...
          </h2>
          <p className="text-sm text-tl-text-secondary">
            Please sign the message in your wallet to continue.
          </p>
        </div>
      </div>
    );
  }

  // Authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback: connected but no auth and no error yet
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="rounded-2xl border border-tl-border bg-tl-card p-8 text-center max-w-md w-full">
        <h2 className="text-lg font-bold text-tl-text mb-2">
          Sign In Required
        </h2>
        <p className="text-sm text-tl-text-secondary mb-6">
          Sign a message with your wallet to verify ownership and access the dashboard.
        </p>
        <button
          onClick={() => address && chainId && login(address, chainId)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110 transition-all cursor-pointer"
        >
          Sign In with Wallet
        </button>
      </div>
    </div>
  );
}
