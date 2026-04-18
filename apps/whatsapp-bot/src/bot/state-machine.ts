/**
 * Conversation state machine for WhatsApp bot.
 * Each user session moves through states based on their messages.
 */

export enum ConversationState {
  IDLE = 'IDLE',
  AWAITING_WALLET = 'AWAITING_WALLET',
  AWAITING_CONSENT = 'AWAITING_CONSENT',
  COMPUTING_SCORE = 'COMPUTING_SCORE',
  SCORE_READY = 'SCORE_READY',
  HELP = 'HELP',
}

export interface UserSession {
  state: ConversationState;
  walletAddress?: string;
  phone: string;
  lastActivity: number;
}

export const SESSION_TTL = 3600; // 1 hour

export const COMMANDS = {
  START: ['hi', 'hello', 'start', 'hey'],
  SCORE: ['score', 'my score', 'check score', 'credit score'],
  HELP: ['help', 'commands', 'menu'],
  STATUS: ['status'],
  TOKENS: ['tokens', 'behavior tokens'],
  RESET: ['reset', 'restart'],
} as const;

export function matchCommand(
  message: string,
  commands: readonly string[],
): boolean {
  const normalized = message.toLowerCase().trim();
  return commands.some(
    (cmd) => normalized === cmd || normalized.startsWith(cmd + ' '),
  );
}
