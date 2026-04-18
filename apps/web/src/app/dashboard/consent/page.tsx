'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldOff, Clock, Pause, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { useConsents, useGrantConsent, useRevokeConsent } from '@/hooks';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { badge: 'green' | 'pink' | 'muted' | 'orange'; icon: typeof ShieldCheck; label: string }> = {
  ACTIVE: { badge: 'green', icon: ShieldCheck, label: 'Active' },
  REVOKED: { badge: 'pink', icon: ShieldOff, label: 'Revoked' },
  EXPIRED: { badge: 'muted', icon: Clock, label: 'Expired' },
  PAUSED: { badge: 'orange', icon: Pause, label: 'Paused' },
};

export default function ConsentPage() {
  const { data: consents, isLoading } = useConsents();
  const grantConsent = useGrantConsent();
  const revokeConsent = useRevokeConsent();
  const [showGrant, setShowGrant] = useState(false);
  const [aaHandle, setAaHandle] = useState('');
  const [dataTypes, setDataTypes] = useState('');
  const [fiTypes, setFiTypes] = useState('');

  const handleGrant = async () => {
    if (!aaHandle || !dataTypes) return;
    try {
      await grantConsent.mutateAsync({
        aaHandle,
        dataTypes: dataTypes.split(',').map((s) => s.trim()),
        fiTypes: fiTypes ? fiTypes.split(',').map((s) => s.trim()) : ['BANK'],
        durationDays: 90,
      });
      setShowGrant(false);
      setAaHandle('');
      setDataTypes('');
      setFiTypes('');
    } catch {
      // error handled by mutation
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeConsent.mutateAsync(id);
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-tl-text">Data Consent</h1>
          <p className="text-sm text-tl-text-secondary mt-1">
            Manage your data sharing permissions.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowGrant(true)}>
          <Plus size={14} className="mr-1" />
          Grant New Consent
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : consents && consents.length > 0 ? (
        <div className="space-y-4">
          {consents.map((consent, i) => {
            const config = statusConfig[consent.status] ?? statusConfig.EXPIRED;
            return (
              <motion.div
                key={consent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card glass>
                  <CardContent className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg bg-white/5 ${consent.status === 'ACTIVE' ? 'text-tl-green' : 'text-tl-text-muted'}`}>
                        <config.icon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-tl-text">
                          {consent.aaHandle}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {consent.dataTypes.map((dt) => (
                            <Badge key={dt} variant="muted">{dt}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-tl-text-muted mt-2">
                          Granted: {new Date(consent.grantedAt).toLocaleDateString('en-IN')} &middot; Expires: {new Date(consent.expiresAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.badge}>{config.label}</Badge>
                      {consent.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevoke(consent.id)}
                          disabled={revokeConsent.isPending}
                          className={cn(
                            'text-xs text-tl-pink hover:underline cursor-pointer',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                          )}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card glass className="p-8 text-center">
          <ShieldCheck className="h-12 w-12 text-tl-text-muted mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-tl-text mb-2">No Consents Yet</h2>
          <p className="text-sm text-tl-text-secondary">
            Grant data consent to an Account Aggregator to enable score computation.
          </p>
        </Card>
      )}

      {/* Grant consent modal */}
      <Modal open={showGrant} onClose={() => setShowGrant(false)} title="Grant New Consent">
        <div className="space-y-4">
          <Input
            label="Account Aggregator Handle"
            placeholder="e.g., HDFC AA, Finvu"
            id="aaHandle"
            value={aaHandle}
            onChange={(e) => setAaHandle(e.target.value)}
          />
          <Input
            label="Data Types (comma-separated)"
            placeholder="UPI Transactions, Bank Statements"
            id="dataTypes"
            value={dataTypes}
            onChange={(e) => setDataTypes(e.target.value)}
          />
          <Input
            label="FI Types (comma-separated)"
            placeholder="BANK, MOBILE"
            id="fiTypes"
            value={fiTypes}
            onChange={(e) => setFiTypes(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowGrant(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGrant}
              disabled={!aaHandle || !dataTypes || grantConsent.isPending}
            >
              {grantConsent.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Grant Consent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
