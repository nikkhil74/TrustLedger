import type { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from './user.service.js';

function getUserId(request: FastifyRequest): string {
  return (request as unknown as Record<string, { sub: string }>).user.sub;
}

export class UserController {
  static async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const data = await UserService.getProfile(getUserId(request));
    return reply.send({ success: true, data });
  }

  static async getScore(request: FastifyRequest, reply: FastifyReply) {
    const data = await UserService.getScore(getUserId(request));
    return reply.send({ success: true, data });
  }

  static async grantConsent(request: FastifyRequest, reply: FastifyReply) {
    const data = await UserService.grantConsent(getUserId(request), request.body as Parameters<typeof UserService.grantConsent>[1]);
    return reply.status(201).send({ success: true, data });
  }

  static async revokeConsent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = await UserService.revokeConsent(getUserId(request), id);
    return reply.send({ success: true, data });
  }

  static async getConsents(request: FastifyRequest, reply: FastifyReply) {
    const data = await UserService.getConsents(getUserId(request));
    return reply.send({ success: true, data });
  }

  static async getBehaviorTokens(request: FastifyRequest, reply: FastifyReply) {
    const data = await UserService.getBehaviorTokens(getUserId(request));
    return reply.send({ success: true, data });
  }
}
