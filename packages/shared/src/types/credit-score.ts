export type Recommendation = 'APPROVE' | 'REVIEW' | 'DECLINE';

export interface ScoreBreakdown {
  upiFinancialBehavior: number;
  bankHistory: number;
  utilityPayments: number;
  defiRepayment: number;
  walletBehavior: number;
  behaviorTokens: number;
}

export interface CreditScore {
  id: string;
  userId: string;
  score: number;
  offChainWeight: number;
  onChainWeight: number;
  scoreHash: string;
  txHash: string | null;
  computedAt: Date;
  expiresAt: Date;
  breakdown: ScoreBreakdown;
  confidence: number;
  recommendation: Recommendation;
  dataCompleteness: number;
}

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  color: string;
}
