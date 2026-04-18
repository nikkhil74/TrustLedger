export interface AAConsentWebhook {
  consentId: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PAUSED';
  timestamp: string;
  fiTypes: string[];
  signature: string;
}

export interface PolygonWebhook {
  event: 'ScoreUpdated' | 'TokensMinted';
  transactionHash: string;
  blockNumber: number;
  data: {
    user: string;
    score?: number;
    amount?: number;
    timestamp: number;
  };
}
