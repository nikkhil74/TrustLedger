'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { useInitiateKyc, useVerifyKyc } from '@/hooks';
import { cn } from '@/lib/utils';

type Step = 'aadhaar' | 'otp' | 'success';

export default function KycPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('aadhaar');
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState('');

  const initiateKyc = useInitiateKyc();
  const verifyKyc = useVerifyKyc();

  // Already verified
  if (user?.kycStatus === 'VERIFIED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto"
      >
        <div className="rounded-2xl border border-tl-green/30 bg-tl-green/5 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-tl-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-tl-text mb-2">KYC Verified</h2>
          <p className="text-tl-text-secondary">
            Your identity has been successfully verified. You have full access to all TrustLedger features.
          </p>
        </div>
      </motion.div>
    );
  }

  const handleSubmitAadhaar = async () => {
    setError('');

    if (!/^\d{12}$/.test(aadhaar)) {
      setError('Aadhaar number must be exactly 12 digits');
      return;
    }

    try {
      const result = await initiateKyc.mutateAsync(aadhaar);
      setRequestId(result.requestId);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate KYC');
    }
  };

  const handleSubmitOtp = async () => {
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be exactly 6 digits');
      return;
    }

    try {
      await verifyKyc.mutateAsync({ otp, requestId });
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    }
  };

  const kycStatusBadge = () => {
    if (!user) return null;
    const cfg: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', label: 'Pending' },
      FAILED: { bg: 'bg-tl-pink/10 border-tl-pink/30', text: 'text-tl-pink', label: 'Failed' },
      EXPIRED: { bg: 'bg-tl-orange/10 border-tl-orange/30', text: 'text-tl-orange', label: 'Expired' },
    };
    const c = cfg[user.kycStatus];
    if (!c) return null;
    return (
      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border', c.bg, c.text)}>
        {c.label}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="h-8 w-8 text-tl-cyan" />
        <div>
          <h1 className="text-2xl font-bold text-tl-text">KYC Verification</h1>
          <p className="text-sm text-tl-text-secondary">
            Verify your identity with Aadhaar to unlock full features
          </p>
        </div>
        <div className="ml-auto">{kycStatusBadge()}</div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 mb-8">
        <div className={cn(
          'flex items-center gap-2 text-sm font-medium',
          step === 'aadhaar' ? 'text-tl-cyan' : 'text-tl-text-muted',
        )}>
          <div className={cn(
            'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
            step === 'aadhaar' ? 'bg-tl-cyan text-tl-deep' : step === 'otp' || step === 'success' ? 'bg-tl-green text-tl-deep' : 'bg-tl-card text-tl-text-muted',
          )}>
            {step === 'otp' || step === 'success' ? <CheckCircle size={14} /> : '1'}
          </div>
          Aadhaar
        </div>
        <div className="flex-1 h-px bg-tl-border" />
        <div className={cn(
          'flex items-center gap-2 text-sm font-medium',
          step === 'otp' ? 'text-tl-cyan' : step === 'success' ? 'text-tl-green' : 'text-tl-text-muted',
        )}>
          <div className={cn(
            'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold',
            step === 'otp' ? 'bg-tl-cyan text-tl-deep' : step === 'success' ? 'bg-tl-green text-tl-deep' : 'bg-tl-card text-tl-text-muted',
          )}>
            {step === 'success' ? <CheckCircle size={14} /> : '2'}
          </div>
          Verify OTP
        </div>
      </div>

      {/* Step 1: Aadhaar */}
      {step === 'aadhaar' && (
        <div className="rounded-2xl border border-tl-border bg-tl-card p-6">
          <h3 className="text-lg font-semibold text-tl-text mb-1">Enter Aadhaar Number</h3>
          <p className="text-sm text-tl-text-secondary mb-6">
            An OTP will be sent to your Aadhaar-linked mobile number.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tl-text-secondary mb-1.5">
                Aadhaar Number
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={12}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 12-digit Aadhaar number"
                className="w-full px-4 py-3 rounded-xl border border-tl-border bg-tl-surface text-tl-text placeholder:text-tl-text-muted focus:outline-none focus:border-tl-cyan/50 font-mono tracking-widest text-lg"
              />
              <p className="text-xs text-tl-text-muted mt-1.5">
                Your Aadhaar number is hashed and never stored in plain text.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-tl-pink">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmitAadhaar}
              disabled={aadhaar.length !== 12 || initiateKyc.isPending}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                'bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {initiateKyc.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  Send OTP
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: OTP */}
      {step === 'otp' && (
        <div className="rounded-2xl border border-tl-border bg-tl-card p-6">
          <h3 className="text-lg font-semibold text-tl-text mb-1">Verify OTP</h3>
          <p className="text-sm text-tl-text-secondary mb-6">
            Enter the 6-digit OTP sent to your Aadhaar-linked mobile number.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tl-text-secondary mb-1.5">
                One-Time Password
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 rounded-xl border border-tl-border bg-tl-surface text-tl-text placeholder:text-tl-text-muted focus:outline-none focus:border-tl-cyan/50 font-mono tracking-[0.5em] text-center text-2xl"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-tl-pink">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmitOtp}
              disabled={otp.length !== 6 || verifyKyc.isPending}
              className={cn(
                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
                'bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              {verifyKyc.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                'Verify & Complete KYC'
              )}
            </button>

            <button
              onClick={() => { setStep('aadhaar'); setOtp(''); setError(''); }}
              className="w-full text-sm text-tl-text-muted hover:text-tl-text transition-colors cursor-pointer"
            >
              Go back
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {step === 'success' && (
        <div className="rounded-2xl border border-tl-green/30 bg-tl-green/5 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-tl-green mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-tl-text mb-2">Verification Successful!</h2>
          <p className="text-tl-text-secondary mb-6">
            Your identity has been verified. You now have full access to all TrustLedger features.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110 transition-all"
          >
            Go to Dashboard
            <ArrowRight size={16} />
          </a>
        </div>
      )}
    </motion.div>
  );
}
