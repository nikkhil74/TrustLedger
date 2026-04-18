import { z } from 'zod';

export const siweLoginSchema = z.object({
  message: z.string().min(1),
  signature: z.string().min(1),
});

export const initiateKycSchema = z.object({
  aadhaarNumber: z
    .string()
    .length(12, 'Aadhaar number must be 12 digits')
    .regex(/^\d{12}$/, 'Aadhaar number must contain only digits'),
});

export const verifyKycSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
  requestId: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type SiweLoginInput = z.infer<typeof siweLoginSchema>;
export type InitiateKycInput = z.infer<typeof initiateKycSchema>;
export type VerifyKycInput = z.infer<typeof verifyKycSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
