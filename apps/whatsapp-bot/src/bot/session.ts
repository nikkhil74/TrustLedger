import { getRedis } from '../config/redis.js';
import {
  ConversationState,
  type UserSession,
  SESSION_TTL,
} from './state-machine.js';

const SESSION_PREFIX = 'wa:session:';

export async function getSession(phone: string): Promise<UserSession> {
  const redis = getRedis();
  const data = await redis.get(SESSION_PREFIX + phone);

  if (data) {
    return JSON.parse(data) as UserSession;
  }

  return {
    state: ConversationState.IDLE,
    phone,
    lastActivity: Date.now(),
  };
}

export async function saveSession(session: UserSession): Promise<void> {
  const redis = getRedis();
  session.lastActivity = Date.now();
  await redis.set(
    SESSION_PREFIX + session.phone,
    JSON.stringify(session),
    'EX',
    SESSION_TTL,
  );
}

export async function clearSession(phone: string): Promise<void> {
  const redis = getRedis();
  await redis.del(SESSION_PREFIX + phone);
}
