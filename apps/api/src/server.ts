import Fastify from 'fastify';
import { env } from './config/env.js';
import corsPlugin from './plugins/cors.js';
import authPlugin from './plugins/auth.js';
import errorHandlerPlugin from './plugins/error-handler.js';
import { registerRoutes } from './routes/index.js';

export async function buildServer() {
  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  });

  // Register plugins
  await fastify.register(corsPlugin);
  await fastify.register(authPlugin);
  await fastify.register(errorHandlerPlugin);

  // Register routes
  await registerRoutes(fastify);

  return fastify;
}
