'use client';

import { motion } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, useConsents, useRevokeConsent } from '@/hooks';
import Link from 'next/link';

const KYC_BADGE: Record<string, { variant: 'green' | 'orange' | 'pink' | 'muted'; label: string }> = {
  VERIFIED: { variant: 'green', label: 'Verified' },
  PENDING: { variant: 'orange', label: 'Pending' },
  FAILED: { variant: 'pink', label: 'Failed' },
  EXPIRED: { variant: 'muted', label: 'Expired' },
};

export default function SettingsPage() {
  const { address, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: consents } = useConsents();
  const revokeConsent = useRevokeConsent();

  const activeConsents = consents?.filter((c) => c.status === 'ACTIVE') ?? [];
  const kycBadge = profile ? KYC_BADGE[profile.kycStatus] ?? KYC_BADGE.PENDING : null;

  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '--';

  const handleRevokeAll = async () => {
    for (const consent of activeConsents) {
      try {
        await revokeConsent.mutateAsync(consent.id);
      } catch {
        // continue with others
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-tl-text">Settings</h1>
        <p className="text-sm text-tl-text-secondary mt-1">
          Manage your account and preferences.
        </p>
      </motion.div>

      {/* Wallet */}
      <Card glass>
        <CardHeader>
          <CardTitle>Connected Wallet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono text-tl-text">{truncatedAddress}</p>
              <p className="text-xs text-tl-text-muted mt-0.5">
                {chain?.name ?? 'Unknown Network'}
              </p>
              {balance && (
                <p className="text-xs text-tl-text-muted mt-0.5">
                  Balance: {parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} {balance.symbol}
                </p>
              )}
            </div>
            <Badge variant="green">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status */}
      <Card glass>
        <CardHeader>
          <CardTitle>KYC Status</CardTitle>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-tl-text">
                  Identity verification status
                </p>
                <p className="text-xs text-tl-text-muted mt-0.5">
                  {profile?.kycStatus === 'VERIFIED'
                    ? 'Your identity has been verified'
                    : 'Complete KYC to unlock all features'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {kycBadge && <Badge variant={kycBadge.variant}>{kycBadge.label}</Badge>}
                {profile?.kycStatus !== 'VERIFIED' && (
                  <Link
                    href="/dashboard/kyc"
                    className="text-xs text-tl-cyan hover:underline"
                  >
                    Complete KYC
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp notifications */}
      <Card glass>
        <CardHeader>
          <CardTitle>WhatsApp Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Phone Number"
            placeholder="+91 9876543210"
            id="phone"
            defaultValue={profile?.phoneNumber?.startsWith('pending_') ? '' : profile?.phoneNumber ?? ''}
          />
          <Button variant="secondary" size="sm">
            Link WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card glass className="border-tl-pink/20">
        <CardHeader>
          <CardTitle className="text-tl-pink">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-tl-text-secondary">
            Revoking all consents will delete your off-chain data and disable
            score computation. ({activeConsents.length} active consent{activeConsents.length !== 1 ? 's' : ''})
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleRevokeAll}
            disabled={activeConsents.length === 0 || revokeConsent.isPending}
          >
            {revokeConsent.isPending ? 'Revoking...' : 'Revoke All Consents'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
