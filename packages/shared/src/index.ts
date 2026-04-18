// ============================================================================
// @trustledger/shared — Types
// ============================================================================

export { KYCStatus, ConsentStatus } from './types/user.js';
export type { User, UserProfile } from './types/user.js';
export type {
  CreditScore,
  ScoreBreakdown,
  ScoreRange,
  Recommendation,
} from './types/credit-score.js';
export type { DataConsent } from './types/consent.js';
export type { BehaviorToken, TokenMetadata } from './types/behavior-token.js';
export type { LenderAPIKey, ScoreReport } from './types/lender.js';
export type { JobPayload, JobStatus } from './types/jobs.js';
export { PipelineStage } from './types/jobs.js';
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
} from './types/api.js';
export type { AAConsentWebhook, PolygonWebhook } from './types/webhook.js';

// ============================================================================
// Schemas
// ============================================================================

export {
  initiateKycSchema,
  verifyKycSchema,
  refreshTokenSchema,
  siweLoginSchema,
} from './schemas/auth.schema.js';
export { grantConsentSchema } from './schemas/user.schema.js';
export type { GrantConsentInput } from './schemas/user.schema.js';
export { computeScoreSchema, scoreStatusParamsSchema } from './schemas/score.schema.js';
export { verifyZkSchema, walletParamsSchema } from './schemas/lender.schema.js';
export { aaConsentWebhookSchema, polygonWebhookSchema } from './schemas/webhook.schema.js';

// ============================================================================
// Constants
// ============================================================================

export {
  SCORE_MIN,
  SCORE_MAX,
  SCORE_TIERS,
  getScoreTier,
} from './constants/score-ranges.js';
export { QUEUE_NAMES } from './constants/queue-names.js';
export { REDIS_KEYS } from './constants/redis-keys.js';

// ============================================================================
// Utils
// ============================================================================

export {
  normalizeAddress,
  isValidEvmAddress,
  truncateAddress,
} from './utils/wallet.js';
export { AppError, ErrorCode, toApiError } from './utils/errors.js';
export { consentExpiryDate, formatISODate } from './utils/date.js';
