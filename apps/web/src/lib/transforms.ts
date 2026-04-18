import { timeAgo } from './utils';

// ── Score breakdown transform ──

export interface BreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface ScoreBreakdown {
  upiFinancialBehavior: number;
  bankHistory: number;
  utilityPayments: number;
  defiRepayment: number;
  walletBehavior: number;
  behaviorTokens: number;
}

const BREAKDOWN_CONFIG: { key: keyof ScoreBreakdown; label: string; color: string }[] = [
  { key: 'upiFinancialBehavior', label: 'UPI Financial Behavior', color: '#00F0FF' },
  { key: 'bankHistory', label: 'Bank History', color: '#8B5CF6' },
  { key: 'utilityPayments', label: 'Utility Payments', color: '#00FF88' },
  { key: 'defiRepayment', label: 'DeFi Repayment', color: '#FF8800' },
  { key: 'walletBehavior', label: 'Wallet Behavior', color: '#FF006E' },
  { key: 'behaviorTokens', label: 'Behavior Tokens', color: '#00F0FF' },
];

export function toBreakdownItems(breakdown: ScoreBreakdown): BreakdownItem[] {
  return BREAKDOWN_CONFIG.map(({ key, label, color }) => ({
    label,
    value: breakdown[key] ?? 0,
    color,
  }));
}

// ── Score history transform ──

export interface HistoryEntry {
  date: string;
  score: number;
  change: number;
}

interface ApiScoreHistory {
  score: number;
  computedAt: string;
}

export function toHistoryEntries(history: ApiScoreHistory[]): HistoryEntry[] {
  return history.map((entry, index) => {
    const prev = history[index + 1];
    return {
      date: entry.computedAt,
      score: entry.score,
      change: prev ? entry.score - prev.score : 0,
    };
  });
}

// ── Activity feed transform ──

export type ActivityType =
  | 'score_computed'
  | 'tokens_earned'
  | 'consent_granted'
  | 'consent_revoked'
  | 'wallet_connected';

export interface Activity {
  id: string;
  type: ActivityType;
  message: string;
  time: string;
  _timestamp: number; // for sorting, not rendered
}

export function toActivityFeed(
  scoreHistory: { id: string; score: number; computedAt: string }[],
  tokens: { id: string; tokensAwarded: number; action: string; createdAt: string }[],
  consents: { id: string; aaHandle: string; status: string; grantedAt: string }[],
): Activity[] {
  const activities: Activity[] = [];

  for (const s of scoreHistory) {
    activities.push({
      id: `score-${s.id}`,
      type: 'score_computed',
      message: `Credit score updated to ${s.score}`,
      time: timeAgo(s.computedAt),
      _timestamp: new Date(s.computedAt).getTime(),
    });
  }

  for (const t of tokens) {
    activities.push({
      id: `token-${t.id}`,
      type: 'tokens_earned',
      message: `Earned ${t.tokensAwarded} behavior tokens`,
      time: timeAgo(t.createdAt),
      _timestamp: new Date(t.createdAt).getTime(),
    });
  }

  for (const c of consents) {
    activities.push({
      id: `consent-${c.id}`,
      type: c.status === 'REVOKED' ? 'consent_revoked' : 'consent_granted',
      message:
        c.status === 'REVOKED'
          ? `Revoked consent from ${c.aaHandle}`
          : `Granted consent to ${c.aaHandle}`,
      time: timeAgo(c.grantedAt),
      _timestamp: new Date(c.grantedAt).getTime(),
    });
  }

  return activities.sort((a, b) => b._timestamp - a._timestamp).slice(0, 10);
}
