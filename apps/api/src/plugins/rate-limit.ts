import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance } from 'fastify';
import { getRedis, isRealRedis } from '../config/redis.js';

export default fp(async function rateLimitPlugin(fastify: FastifyInstance) {
  const opts: Record<string, unknown> = {
    max: 100,
    timeWindow: '1 minute',
  };
  if (isRealRedis()) {
    opts.redis = getRedis();
  }
  await fastify.register(rateLimit, opts);
});
