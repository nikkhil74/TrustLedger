import type { FastifyRequest, FastifyReply } from 'fastify';

export class WebhookController {
  static async aaConsent(request: FastifyRequest, reply: FastifyReply) {
    // In production: verify HMAC signature, process consent status change
    const body = request.body as Record<string, unknown>;
    request.server.log.info({ body }, 'AA consent webhook received');
    return reply.send({ success: true, data: { received: true } });
  }

  static async polygon(request: FastifyRequest, reply: FastifyReply) {
    // In production: verify event source, process on-chain events
    const body = request.body as Record<string, unknown>;
    request.server.log.info({ body }, 'Polygon webhook received');
    return reply.send({ success: true, data: { received: true } });
  }
}
