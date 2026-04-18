import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default('postgresql://trustledger:trustledger@localhost:5432/trustledger'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  JWT_ACCESS_TTL: z.coerce.number().default(900),
  JWT_REFRESH_TTL: z.coerce.number().default(604800),
  SCORE_ENGINE_URL: z.string().default('http://localhost:5000'),
  POLYGON_RPC_URL: z.string().default('https://rpc-amoy.polygon.technology'),
  CHAIN_ID: z.coerce.number().default(80002),
  SCORE_ORACLE_PRIVATE_KEY: z.string().optional(),
  TRUSTLEDGER_SCORE_ADDRESS: z.string().optional(),
  BEHAVIOR_TOKEN_ADDRESS: z.string().optional(),
  AA_CLIENT_ID: z.string().optional(),
  AA_CLIENT_SECRET: z.string().optional(),
  AA_BASE_URL: z.string().default('https://fiu-uat.setu.co'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  return result.data;
}

export const env = loadEnv();
