'use client';

import { motion } from 'framer-motion';

interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

export function ScoreBreakdown({
  items,
}: {
  items: BreakdownItem[];
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-tl-text-secondary">{item.label}</span>
            <span className="text-sm font-medium text-tl-text">
              {(item.value * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color }}
              initial={{ width: 0 }}
              animate={{ width: `${item.value * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
