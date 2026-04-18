import type { FastifyInstance } from 'fastify';
import { ScoreController } from './score.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate, validateParams } from '../../middleware/validate.js';
import { computeScoreSchema, scoreStatusParamsSchema } from '@trustledger/shared';

export async function scoreRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post(
    '/score/compute',
    { preHandler: [validate(computeScoreSchema)] },
    ScoreController.compute,
  );
  fastify.get(
    '/score/status/:jobId',
    { preHandler: [validateParams(scoreStatusParamsSchema)] },
    ScoreController.getStatus,
  );
  fastify.get('/score/history', ScoreController.getHistory);
}
