'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, Coins, ShieldCheck, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreGauge } from '@/components/dashboard/score-gauge';
import { ScoreBreakdown } from '@/components/dashboard/score-breakdown';
import { ScoreHistory } from '@/components/dashboard/score-history';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { useScore, useBehaviorTokens, useConsents, useScoreHistory } from '@/hooks';
import { toBreakdownItems, toHistoryEntries, toActivityFeed } from '@/lib/transforms';
import { timeAgo } from '@/lib/utils';

export default function DashboardPage() {
  const { data: score, isLoading: scoreLoading } = useScore();
  const { data: tokens, isLoading: tokensLoading } = useBehaviorTokens();
  const { data: consents, isLoading: consentsLoading } = useConsents();
  const { data: history, isLoading: historyLoading } = useScoreHistory();

  const isLoading = scoreLoading || tokensLoading || consentsLoading || historyLoading;

  // Derive quick stats
  const tokenCount = tokens?.reduce((acc, t) => acc + t.tokensAwarded, 0) ?? 0;
  const activeConsents = consents?.filter((c) => c.status === 'ACTIVE').length ?? 0;
  const scoreChange = history && history.length >= 2 ? history[0].score - history[1].score : 0;
  const lastUpdated = score?.computedAt ? timeAgo(score.computedAt) : '--';

  const quickStats = [
    { label: 'Score Change', value: scoreChange > 0 ? `+${scoreChange}` : `${scoreChange}`, icon: ArrowUpRight, color: 'text-tl-green', badge: 'green' as const },
    { label: 'Behavior Tokens', value: `${tokenCount}`, icon: Coins, color: 'text-tl-cyan', badge: 'cyan' as const },
    { label: 'Active Consents', value: `${activeConsents}`, icon: ShieldCheck, color: 'text-tl-purple', badge: 'purple' as const },
    { label: 'Last Updated', value: lastUpdated, icon: Clock, color: 'text-tl-orange', badge: 'orange' as const },
  ];

  // Transform data for components
  const breakdownItems = score ? toBreakdownItems(score.breakdown) : [];
  const historyEntries = history ? toHistoryEntries(history) : [];
  const activities = toActivityFeed(
    history ?? [],
    tokens ?? [],
    consents ?? [],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-tl-text">Dashboard</h1>
        <p className="text-sm text-tl-text-secondary mt-1">
          Your credit score overview and recent activity.
        </p>
      </motion.div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card glass className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-tl-text-muted">{stat.label}</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-lg font-semibold text-tl-text">{stat.value}</p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* No score CTA */}
      {!scoreLoading && !score && (
        <Card glow="cyan" glass className="p-8 text-center">
          <Zap className="h-12 w-12 text-tl-cyan mx-auto mb-4" />
          <h2 className="text-xl font-bold text-tl-text mb-2">Compute Your First Score</h2>
          <p className="text-sm text-tl-text-secondary mb-6">
            Grant data consent and compute your hybrid credit score combining UPI, bank, and on-chain data.
          </p>
          <Link
            href="/dashboard/score"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-tl-cyan to-tl-purple text-tl-deep hover:brightness-110 transition-all"
          >
            Get Started
          </Link>
        </Card>
      )}

      {/* Main grid - only show when score exists */}
      {score && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score gauge */}
          <Card glow="cyan" glass className="lg:col-span-1 flex flex-col items-center justify-center py-8">
            <Badge variant="cyan" className="mb-4">Live Score</Badge>
            <ScoreGauge score={score.score} />
            <div className="mt-4 flex gap-4 text-xs text-tl-text-muted">
              <span>Confidence: {Math.round(score.confidence * 100)}%</span>
              <span>Data: {Math.round(score.dataCompleteness * 100)}%</span>
            </div>
          </Card>

          {/* Score breakdown */}
          <Card glass className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreBreakdown items={breakdownItems} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score history */}
        <Card glass>
          <CardHeader>
            <CardTitle>Score History</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : historyEntries.length > 0 ? (
              <ScoreHistory entries={historyEntries} />
            ) : (
              <p className="text-sm text-tl-text-muted py-4 text-center">No score history yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card glass>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : activities.length > 0 ? (
              <ActivityFeed activities={activities} />
            ) : (
              <p className="text-sm text-tl-text-muted py-4 text-center">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
