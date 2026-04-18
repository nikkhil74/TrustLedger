'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreGauge } from '@/components/dashboard/score-gauge';
import { ScoreBreakdown } from '@/components/dashboard/score-breakdown';
import { Lightbulb, RefreshCw, Loader2, Zap } from 'lucide-react';
import { useScore, useComputeScore, useJobStatus } from '@/hooks';
import { toBreakdownItems } from '@/lib/transforms';
import { cn } from '@/lib/utils';

const STATIC_RECOMMENDATIONS = [
  'Maintain regular UPI transaction patterns for consistency',
  'Earn more TrustLedger behavior tokens through positive actions',
  'Participate in DAO governance to demonstrate Web3 engagement',
  'Keep your wallet active over time to build on-chain history',
];

const RECOMMENDATION_BADGES: Record<string, { label: string; variant: 'green' | 'cyan' | 'orange' | 'pink' }> = {
  APPROVE: { label: 'Approved', variant: 'green' },
  REVIEW: { label: 'Under Review', variant: 'orange' },
  DECLINE: { label: 'Declined', variant: 'pink' },
};

export default function ScorePage() {
  const { data: score, isLoading } = useScore();
  const computeScore = useComputeScore();
  const [jobId, setJobId] = useState<string | null>(null);
  const { data: jobStatus } = useJobStatus(jobId);

  const handleRecompute = async () => {
    try {
      const result = await computeScore.mutateAsync({ forceRefresh: true });
      if (!result.cached && result.jobId) {
        setJobId(result.jobId);
      }
    } catch {
      // handled by mutation error state
    }
  };

  const isComputing = computeScore.isPending || (jobStatus && jobStatus.status !== 'completed' && jobStatus.status !== 'failed');
  const breakdownItems = score ? toBreakdownItems(score.breakdown) : [];
  const recBadge = score ? RECOMMENDATION_BADGES[score.recommendation] : null;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!score) {
    return (
      <div className="max-w-5xl mx-auto">
        <Card glow="cyan" glass className="p-8 text-center">
          <Zap className="h-12 w-12 text-tl-cyan mx-auto mb-4" />
          <h2 className="text-xl font-bold text-tl-text mb-2">No Score Yet</h2>
          <p className="text-sm text-tl-text-secondary mb-6">
            Grant data consent and compute your first hybrid credit score.
          </p>
          <button
            onClick={handleRecompute}
            disabled={!!isComputing}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer',
              'bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isComputing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isComputing ? 'Computing...' : 'Compute Score'}
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-tl-text">My Score</h1>
          <p className="text-sm text-tl-text-secondary mt-1">
            Detailed view of your TrustLedger credit score.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {recBadge && <Badge variant={recBadge.variant}>{recBadge.label}</Badge>}
          <button
            onClick={handleRecompute}
            disabled={!!isComputing}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer',
              'border border-tl-border hover:border-tl-cyan/30 hover:bg-tl-cyan/5 text-tl-text-secondary hover:text-tl-cyan',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isComputing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            {isComputing ? 'Computing...' : 'Recompute'}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score gauge card */}
        <Card glow="cyan" glass className="flex flex-col items-center justify-center py-10">
          <Badge variant="cyan" className="mb-4">Current Score</Badge>
          <ScoreGauge score={score.score} size={300} />
          <div className="mt-6 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="text-tl-text-muted">Off-Chain</p>
              <p className="text-tl-text font-semibold mt-0.5">
                {Math.round(score.offChainWeight * 100)}%
              </p>
            </div>
            <div>
              <p className="text-tl-text-muted">On-Chain</p>
              <p className="text-tl-text font-semibold mt-0.5">
                {Math.round(score.onChainWeight * 100)}%
              </p>
            </div>
            <div>
              <p className="text-tl-text-muted">Confidence</p>
              <p className="text-tl-text font-semibold mt-0.5">
                {Math.round(score.confidence * 100)}%
              </p>
            </div>
          </div>
        </Card>

        {/* Breakdown card */}
        <Card glass>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBreakdown items={breakdownItems} />
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb size={18} className="text-tl-orange" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {STATIC_RECOMMENDATIONS.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 text-sm text-tl-text-secondary"
              >
                <span className="mt-0.5 h-5 w-5 rounded-full bg-tl-orange/10 text-tl-orange flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {i + 1}
                </span>
                {rec}
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
