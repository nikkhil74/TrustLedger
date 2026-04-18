'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HistoryEntry {
  date: string;
  score: number;
  change: number;
}

export function ScoreHistory({ entries }: { entries: HistoryEntry[] }) {
  return (
    <div className="space-y-3">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.date}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between py-3 border-b border-tl-border last:border-b-0"
        >
          <div>
            <p className="text-sm font-medium text-tl-text">{entry.score}</p>
            <p className="text-xs text-tl-text-muted">
              {new Date(entry.date).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {entry.change > 0 ? (
              <>
                <TrendingUp size={14} className="text-tl-green" />
                <span className="text-sm font-medium text-tl-green">
                  +{entry.change}
                </span>
              </>
            ) : entry.change < 0 ? (
              <>
                <TrendingDown size={14} className="text-tl-pink" />
                <span className="text-sm font-medium text-tl-pink">
                  {entry.change}
                </span>
              </>
            ) : (
              <>
                <Minus size={14} className="text-tl-text-muted" />
                <span className="text-sm font-medium text-tl-text-muted">0</span>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
