import { z } from 'zod';

export const grantConsentSchema = z.object({
  aaHandle: z.string().min(1, 'Account Aggregator handle is required'),
  dataTypes: z
    .array(z.string())
    .min(1, 'At least one data type must be selected'),
  fiTypes: z.array(z.string()).min(1, 'At least one FI type must be selected'),
  durationDays: z
    .number()
    .int()
    .min(1)
    .max(365)
    .default(90),
  purpose: z.string().min(1).max(500).optional(),
});

export type GrantConsentInput = z.infer<typeof grantConsentSchema>;
