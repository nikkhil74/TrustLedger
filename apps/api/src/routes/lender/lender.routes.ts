import type { FastifyInstance } from 'fastify';
import { LenderController } from './lender.controller.js';
import { authorizeLender } from '../../middleware/authorize-lender.js';
import { validate, validateParams } from '../../middleware/validate.js';
import { walletParamsSchema, verifyZkSchema } from '@trustledger/shared';

export async function lenderRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authorizeLender);

  fastify.get(
    '/lender/score/:wallet',
    { preHandler: [validateParams(walletParamsSchema)] },
    LenderController.getScore,
  );
  fastify.post(
    '/lender/verify-zk',
    { preHandler: [validate(verifyZkSchema)] },
    LenderController.verifyZk,
  );
}
