export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export enum ConsentStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED',
  PAUSED = 'PAUSED',
}

export interface User {
  id: string;
  aadhaarHash: string;
  walletAddress: string;
  phoneNumber: string;
  kycStatus: KYCStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  kycStatus: KYCStatus;
  phoneNumber: string;
  createdAt: Date;
}
