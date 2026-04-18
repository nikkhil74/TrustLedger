import type { FastifyInstance } from 'fastify';
import { UserController } from './user.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { grantConsentSchema } from '@trustledger/shared';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/user/profile', UserController.getProfile);
  fastify.get('/user/score', UserController.getScore);
  fastify.get('/user/consents', UserController.getConsents);
  fastify.post(
    '/user/consent/grant',
    { preHandler: [validate(grantConsentSchema)] },
    UserController.grantConsent,
  );
  fastify.delete('/user/consent/:id', UserController.revokeConsent);
  fastify.get('/user/behavior-tokens', UserController.getBehaviorTokens);
}
