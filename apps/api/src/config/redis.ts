import { env } from './env.js';

// In-memory store that mimics the Redis subset we use (nonce storage + BullMQ connection)
// Used in dev mode when Redis is not available

interface StoreEntry {
  value: string;
  expiresAt: number | null;
}

class DevMemoryStore {
  private store = new Map<string, StoreEntry>();

  async set(key: string, value: string, mode?: string, ttl?: number): Promise<'OK'> {
    const expiresAt = mode === 'EX' && ttl ? Date.now() + ttl * 1000 : null;
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async quit(): Promise<void> {
    this.store.clear();
  }

  // BullMQ requires these — they are no-ops in dev mode
  duplicate() {
    return new DevMemoryStore();
  }
}

type RedisLike = DevMemoryStore;

let redis: RedisLike | null = null;
let useRealRedis = false;

async function tryRealRedis(): Promise<boolean> {
  try {
    const { default: Redis } = await import('ioredis');
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      connectTimeout: 2000,
      retryStrategy() { return null; }, // don't retry, just fail
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { client.disconnect(); reject(new Error('timeout')); }, 2000);
      client.once('ready', () => { clearTimeout(timer); resolve(); });
      client.once('error', (err) => { clearTimeout(timer); client.disconnect(); reject(err); });
    });
    await client.quit();
    return true;
  } catch {
    return false;
  }
}

export async function initRedis(): Promise<void> {
  useRealRedis = await tryRealRedis();
  if (useRealRedis) {
    console.log('Redis connected at', env.REDIS_URL);
  } else {
    console.log('Redis not available — using in-memory dev store (nonces only, no BullMQ queues)');
  }
}

export function getRedis(): RedisLike {
  if (!redis) {
    if (useRealRedis) {
      // Lazy import would need to be sync here — but we already know it's available
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Redis = require('ioredis');
      redis = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy(times: number) {
          return Math.min(times * 50, 2000);
        },
      });
    } else {
      redis = new DevMemoryStore();
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return redis as any;
}

export function isRealRedis(): boolean {
  return useRealRedis;
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
