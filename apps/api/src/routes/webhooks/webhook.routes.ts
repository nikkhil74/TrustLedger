import type { FastifyInstance } from 'fastify';
import { WebhookController } from './webhook.controller.js';

export async function webhookRoutes(fastify: FastifyInstance) {
  fastify.post('/webhooks/aa-consent', WebhookController.aaConsent);
  fastify.post('/webhooks/polygon', WebhookController.polygon);
}
