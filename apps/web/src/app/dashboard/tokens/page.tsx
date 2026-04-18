'use client';

import { motion } from 'framer-motion';
import { Coins, ExternalLink } from 'lucide-react';
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useBehaviorTokens } from '@/hooks';

export default function TokensPage() {
  const { data: tokens, isLoading } = useBehaviorTokens();
  const totalTokens = tokens?.reduce((acc, t) => acc + t.tokensAwarded, 0) ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-tl-text">Behavior Tokens</h1>
        <p className="text-sm text-tl-text-secondary mt-1">
          Soulbound tokens earned through positive financial behavior.
        </p>
      </motion.div>

      {/* Balance card */}
      <Card glow="cyan" glass className="text-center py-8">
        <Coins size={32} className="mx-auto text-tl-cyan mb-3" />
        {isLoading ? (
          <Skeleton className="h-14 w-24 mx-auto" />
        ) : (
          <p className="text-5xl font-bold gradient-text">{totalTokens}</p>
        )}
        <p className="text-sm text-tl-text-secondary mt-2">Total Behavior Tokens</p>
        <Badge variant="cyan" className="mt-3">Soulbound (Non-Transferable)</Badge>
      </Card>

      {/* Token history */}
      <Card glass>
        <CardHeader>
          <CardTitle>Token History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : tokens && tokens.length > 0 ? (
            <div className="space-y-3">
              {tokens.map((token, i) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-3 border-b border-tl-border last:border-b-0"
                >
                  <div>
                    <p className="text-sm text-tl-text">{token.action.replace(/_/g, ' ')}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-tl-text-muted">
                        {new Date(token.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                      {token.txHash && (
                        <a
                          href={`https://polygonscan.com/tx/${token.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-tl-cyan hover:underline"
                        >
                          <ExternalLink size={10} />
                          tx
                        </a>
                      )}
                    </div>
                  </div>
                  <Badge variant="green">+{token.tokensAwarded}</Badge>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-tl-text-muted py-8 text-center">
              No behavior tokens earned yet. Complete positive financial actions to earn tokens.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
