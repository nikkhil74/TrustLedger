'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  Coins,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'score_computed' | 'consent_granted' | 'consent_revoked' | 'tokens_earned' | 'score_shared' | 'wallet_connected';
  message: string;
  time: string;
}

const iconMap: Record<string, typeof CreditCard> = {
  score_computed: TrendingUp,
  consent_granted: Shield,
  consent_revoked: Shield,
  tokens_earned: Coins,
  score_shared: ArrowUpRight,
  wallet_connected: Wallet,
};

const colorMap: Record<string, string> = {
  score_computed: 'text-tl-green bg-tl-green/10',
  consent_granted: 'text-tl-purple bg-tl-purple/10',
  consent_revoked: 'text-tl-orange bg-tl-orange/10',
  tokens_earned: 'text-tl-cyan bg-tl-cyan/10',
  score_shared: 'text-tl-orange bg-tl-orange/10',
  wallet_connected: 'text-tl-pink bg-tl-pink/10',
};

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-3">
      {activities.map((activity, i) => {
        const Icon = iconMap[activity.type] || CreditCard;
        const colors = colorMap[activity.type] || 'text-tl-text-muted bg-white/5';

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 py-3 border-b border-tl-border last:border-b-0"
          >
            <div className={`p-2 rounded-lg ${colors}`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-tl-text truncate">{activity.message}</p>
              <p className="text-xs text-tl-text-muted mt-0.5">{activity.time}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
