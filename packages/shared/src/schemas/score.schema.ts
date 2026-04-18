import { z } from 'zod';

export const computeScoreSchema = z.object({
  consentId: z.string().uuid().optional(),
  forceRefresh: z.boolean().default(false),
});

export const scoreStatusParamsSchema = z.object({
  jobId: z.string().min(1),
});

export type ComputeScoreInput = z.infer<typeof computeScoreSchema>;
export type ScoreStatusParams = z.infer<typeof scoreStatusParamsSchema>;
