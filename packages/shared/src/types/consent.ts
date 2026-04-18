import { ConsentStatus } from './user.js';

export interface DataConsent {
  id: string;
  userId: string;
  aaHandle: string;
  consentId: string;
  dataTypes: string[];
  fiTypes: string[];
  status: ConsentStatus;
  grantedAt: Date;
  expiresAt: Date;
}
