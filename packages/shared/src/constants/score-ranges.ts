import type { ScoreRange } from '../types/credit-score.js';

export const SCORE_MIN = 300;
export const SCORE_MAX = 900;

export const SCORE_TIERS: ScoreRange[] = [
  { min: 300, max: 449, label: 'Poor', color: '#EF4444' },
  { min: 450, max: 549, label: 'Fair', color: '#F59E0B' },
  { min: 550, max: 649, label: 'Good', color: '#06B6D4' },
  { min: 650, max: 749, label: 'Very Good', color: '#10B981' },
  { min: 750, max: 900, label: 'Excellent', color: '#3B82F6' },
];

export function getScoreTier(score: number): ScoreRange {
  const tier = SCORE_TIERS.find((t) => score >= t.min && score <= t.max);
  return tier ?? SCORE_TIERS[0];
}
