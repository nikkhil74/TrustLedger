'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/providers/auth-provider';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const BANNER_CONFIG: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  PENDING: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    text: 'Complete KYC verification to unlock all features.',
  },
  FAILED: {
    bg: 'bg-tl-pink/10',
    border: 'border-tl-pink/30',
    icon: 'text-tl-pink',
    text: 'KYC verification failed. Please try again.',
  },
  EXPIRED: {
    bg: 'bg-tl-orange/10',
    border: 'border-tl-orange/30',
    icon: 'text-tl-orange',
    text: 'Your KYC has expired. Please re-verify.',
  },
};

export function KycBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.kycStatus === 'VERIFIED' || dismissed) return null;

  const config = BANNER_CONFIG[user.kycStatus];
  if (!config) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border mb-6',
        config.bg,
        config.border,
      )}
    >
      {user.kycStatus === 'PENDING' ? (
        <AlertCircle size={18} className={config.icon} />
      ) : (
        <CheckCircle size={18} className={config.icon} />
      )}
      <p className="text-sm text-tl-text flex-1">
        {config.text}{' '}
        <Link
          href="/dashboard/kyc"
          className="font-medium text-tl-cyan hover:underline"
        >
          Go to KYC
        </Link>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-tl-text-muted hover:text-tl-text transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
