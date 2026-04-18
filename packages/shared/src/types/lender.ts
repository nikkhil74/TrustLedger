export interface LenderAPIKey {
  id: string;
  lenderName: string;
  apiKey: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface ScoreReport {
  walletAddress: string;
  score: number;
  recommendation: string;
  scoreHash: string;
  txHash: string | null;
  computedAt: Date;
  expiresAt: Date;
  breakdown: Record<string, number>;
}
