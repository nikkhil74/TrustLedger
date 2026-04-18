import type { FastifyRequest, FastifyReply } from 'fastify';
import { ScoreService } from './score.service.js';

function getUserId(request: FastifyRequest): string {
  return (request as unknown as Record<string, { sub: string }>).user.sub;
}

export class ScoreController {
  static async compute(request: FastifyRequest, reply: FastifyReply) {
    const { consentId, forceRefresh } = request.body as {
      consentId?: string;
      forceRefresh?: boolean;
    };
    const data = await ScoreService.computeScore(getUserId(request), consentId, forceRefresh);
    return reply.send({ success: true, data });
  }

  static async getStatus(request: FastifyRequest, reply: FastifyReply) {
    const { jobId } = request.params as { jobId: string };
    const data = await ScoreService.getJobStatus(jobId);
    return reply.send({ success: true, data });
  }

  static async getHistory(request: FastifyRequest, reply: FastifyReply) {
    const data = await ScoreService.getScoreHistory(getUserId(request));
    return reply.send({ success: true, data });
  }
}
