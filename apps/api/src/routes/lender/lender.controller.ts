import type { FastifyRequest, FastifyReply } from 'fastify';
import { LenderService } from './lender.service.js';

export class LenderController {
  static async getScore(request: FastifyRequest, reply: FastifyReply) {
    const { wallet } = request.params as { wallet: string };
    const data = await LenderService.getScoreByWallet(wallet);
    return reply.send({ success: true, data });
  }

  static async verifyZk(request: FastifyRequest, reply: FastifyReply) {
    const { proof, publicInputs } = request.body as {
      proof: string;
      publicInputs: string[];
    };
    const data = await LenderService.verifyZkProof(proof, publicInputs);
    return reply.send({ success: true, data });
  }
}
