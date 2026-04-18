import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(3003),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  API_BASE_URL: z.string().default('http://localhost:3001'),
  TWILIO_ACCOUNT_SID: z.string().default('AC_TEST'),
  TWILIO_AUTH_TOKEN: z.string().default('test_token'),
  TWILIO_WHATSAPP_NUMBER: z.string().default('whatsapp:+14155238886'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
