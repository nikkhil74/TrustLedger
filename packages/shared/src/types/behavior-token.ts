export interface TokenMetadata {
  trait: string;
  tier: string;
  description: string;
}

export interface BehaviorToken {
  id: string;
  userId: string;
  action: string;
  tokensAwarded: number;
  txHash: string;
  createdAt: Date;
}
