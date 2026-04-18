'use client';

import { motion } from 'framer-motion';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScoreHistory } from '@/components/dashboard/score-history';
import { useScoreHistory } from '@/hooks';
import { toHistoryEntries } from '@/lib/transforms';

export default function HistoryPage() {
  const { data: history, isLoading } = useScoreHistory();
  const entries = history ? toHistoryEntries(history) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-tl-text">Score History</h1>
        <p className="text-sm text-tl-text-secondary mt-1">
          Track how your credit score has changed over time.
        </p>
      </motion.div>

      <Card glass>
        <CardHeader>
          <CardTitle>All Score Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : entries.length > 0 ? (
            <ScoreHistory entries={entries} />
          ) : (
            <p className="text-sm text-tl-text-muted py-8 text-center">
              No score history yet. Compute your first score to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
