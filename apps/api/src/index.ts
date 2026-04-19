import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load .env from project root
const __dirname = fileURLToPath(new URL('.', import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

import { buildServer } from './server.js';
import { env } from './config/env.js';
import { initRedis } from './config/redis.js';
import { startWorkers } from './queue/workers/index.js';

async function main() {
  // Probe Redis availability before starting
  await initRedis();

  const server = await buildServer();

  // Start queue workers in the same process for dev (separate process in prod)
  if (env.NODE_ENV === 'development') {
    startWorkers();
  }

  try {
    await server.listen({ port: env.PORT, host: '0.0.0.0' });
    console.log(`TrustLedger API running on port ${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
