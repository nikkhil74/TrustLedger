import { z } from 'zod';

export const walletParamsSchema = z.object({
  wallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address'),
});

export const verifyZkSchema = z.object({
  proof: z.string().min(1, 'Proof data is required'),
  publicInputs: z.array(z.string()).min(1, 'Public inputs are required'),
});

export type WalletParams = z.infer<typeof walletParamsSchema>;
export type VerifyZkInput = z.infer<typeof verifyZkSchema>;
