import { env } from '../config/env.js';

interface ScoreResult {
  score: number;
  confidence: number;
  recommendation: string;
  breakdown: Record<string, number>;
}

interface TokenBalance {
  balance: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.API_BASE_URL;
  }

  async getScoreByWallet(walletAddress: string): Promise<ScoreResult | null> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/lender/score/${walletAddress}`,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as { data: ScoreResult };
      return data.data;
    } catch {
      return null;
    }
  }

  async getTokenBalance(walletAddress: string): Promise<number> {
    try {
      const res = await fetch(
        `${this.baseUrl}/api/user/tokens?wallet=${walletAddress}`,
        {
          headers: { 'Content-Type': 'application/json' },
        },
      );
      if (!res.ok) return 0;
      const data = (await res.json()) as { data: TokenBalance };
      return data.data.balance ?? 0;
    } catch {
      return 0;
    }
  }
}

export const apiClient = new ApiClient();
