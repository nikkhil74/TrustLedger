export const REDIS_KEYS = {
  score: (wallet: string) => `score:${wallet.toLowerCase()}`,
  userProfile: (userId: string) => `user:${userId}:profile`,
  jobStatus: (jobId: string) => `job:${jobId}:status`,
  authNonce: (wallet: string) => `nonce:${wallet.toLowerCase()}`,
  whatsappState: (phone: string) => `whatsapp:state:${phone}`,
  rateLimitLender: (apiKey: string) => `ratelimit:lender:${apiKey}`,
} as const;
