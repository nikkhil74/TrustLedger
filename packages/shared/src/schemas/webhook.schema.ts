import { z } from 'zod';

export const aaConsentWebhookSchema = z.object({
  consentId: z.string().min(1),
  status: z.enum(['ACTIVE', 'REVOKED', 'EXPIRED', 'PAUSED']),
  timestamp: z.string().datetime(),
  fiTypes: z.array(z.string()),
  signature: z.string().min(1),
});

export const polygonWebhookSchema = z.object({
  event: z.enum(['ScoreUpdated', 'TokensMinted']),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  blockNumber: z.number().int().positive(),
  data: z.object({
    user: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    score: z.number().int().min(300).max(900).optional(),
    amount: z.number().int().positive().optional(),
    timestamp: z.number().int().positive(),
  }),
});

export type AAConsentWebhookInput = z.infer<typeof aaConsentWebhookSchema>;
export type PolygonWebhookInput = z.infer<typeof polygonWebhookSchema>;
