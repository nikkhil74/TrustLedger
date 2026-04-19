import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  siweLoginSchema,
  refreshTokenSchema,
  initiateKycSchema,
  verifyKycSchema,
} from '@trustledger/shared';

export async function authRoutes(fastify: FastifyInstance) {
  // Get nonce for SIWE
  fastify.get('/auth/nonce', AuthController.getNonce);

  // SIWE Login
  fastify.post(
    '/auth/login',
    { preHandler: [validate(siweLoginSchema)] },
    AuthController.siweLogin,
  );

  // Refresh token
  fastify.post(
    '/auth/refresh-token',
    { preHandler: [validate(refreshTokenSchema)] },
    AuthController.refreshToken,
  );

  // Initiate KYC (requires auth)
  fastify.post(
    '/auth/initiate-kyc',
    { preHandler: [authenticate, validate(initiateKycSchema)] },
    AuthController.initiateKyc,
  );

  // Verify KYC OTP (requires auth)
  fastify.post(
    '/auth/verify-kyc',
    { preHandler: [authenticate, validate(verifyKycSchema)] },
    AuthController.verifyKyc,
  );

  // Disconnect KYC — reset to PENDING (demo/judging)
  fastify.post(
    '/auth/disconnect-kyc',
    { preHandler: [authenticate] },
    AuthController.disconnectKyc,
  );
}
