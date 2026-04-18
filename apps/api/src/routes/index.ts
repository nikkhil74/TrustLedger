import type { FastifyInstance } from 'fastify';
import { authRoutes } from './auth/auth.routes.js';
import { userRoutes } from './user/user.routes.js';
import { scoreRoutes } from './score/score.routes.js';
import { lenderRoutes } from './lender/lender.routes.js';
import { webhookRoutes } from './webhooks/webhook.routes.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check
  fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // API routes
  await fastify.register(
    async (api) => {
      await api.register(authRoutes);
      await api.register(userRoutes);
      await api.register(scoreRoutes);
      await api.register(lenderRoutes);
      await api.register(webhookRoutes);
    },
    { prefix: '/api' },
  );
}
