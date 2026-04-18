import { isValidEvmAddress } from '@trustledger/shared';
import {
  ConversationState,
  COMMANDS,
  matchCommand,
} from './state-machine.js';
import { getSession, saveSession, clearSession } from './session.js';
import { apiClient } from '../services/api-client.js';

/**
 * Process an incoming WhatsApp message and return a reply string.
 */
export async function handleMessage(
  phone: string,
  body: string,
): Promise<string> {
  const message = body.trim();
  const session = await getSession(phone);

  // Global commands
  if (matchCommand(message, COMMANDS.RESET)) {
    await clearSession(phone);
    return MESSAGES.welcome();
  }

  if (matchCommand(message, COMMANDS.HELP)) {
    session.state = ConversationState.HELP;
    await saveSession(session);
    return MESSAGES.help();
  }

  // State-based handling
  switch (session.state) {
    case ConversationState.IDLE:
      return handleIdle(session, message);

    case ConversationState.AWAITING_WALLET:
      return handleAwaitingWallet(session, message);

    case ConversationState.SCORE_READY:
      return handleScoreReady(session, message);

    case ConversationState.HELP:
      session.state = ConversationState.IDLE;
      await saveSession(session);
      return handleIdle(session, message);

    default:
      session.state = ConversationState.IDLE;
      await saveSession(session);
      return MESSAGES.welcome();
  }
}

async function handleIdle(
  session: ReturnType<typeof Object>,
  message: string,
): Promise<string> {
  const s = session as Awaited<ReturnType<typeof getSession>>;

  if (matchCommand(message, COMMANDS.START)) {
    if (s.walletAddress) {
      return MESSAGES.welcomeBack(s.walletAddress);
    }
    s.state = ConversationState.AWAITING_WALLET;
    await saveSession(s);
    return MESSAGES.askWallet();
  }

  if (matchCommand(message, COMMANDS.SCORE)) {
    if (!s.walletAddress) {
      s.state = ConversationState.AWAITING_WALLET;
      await saveSession(s);
      return MESSAGES.needWalletFirst();
    }
    return fetchAndReturnScore(s);
  }

  if (matchCommand(message, COMMANDS.TOKENS)) {
    if (!s.walletAddress) {
      s.state = ConversationState.AWAITING_WALLET;
      await saveSession(s);
      return MESSAGES.needWalletFirst();
    }
    const balance = await apiClient.getTokenBalance(s.walletAddress);
    return MESSAGES.tokenBalance(balance);
  }

  if (matchCommand(message, COMMANDS.STATUS)) {
    return MESSAGES.status(s.walletAddress);
  }

  // Default: show welcome
  s.state = ConversationState.IDLE;
  await saveSession(s);
  return MESSAGES.welcome();
}

async function handleAwaitingWallet(
  session: Awaited<ReturnType<typeof getSession>>,
  message: string,
): Promise<string> {
  const potentialAddress = message.trim();

  if (!isValidEvmAddress(potentialAddress)) {
    return MESSAGES.invalidWallet();
  }

  session.walletAddress = potentialAddress.toLowerCase();
  session.state = ConversationState.IDLE;
  await saveSession(session);

  return MESSAGES.walletLinked(session.walletAddress);
}

async function handleScoreReady(
  session: Awaited<ReturnType<typeof getSession>>,
  message: string,
): Promise<string> {
  session.state = ConversationState.IDLE;
  await saveSession(session);
  return handleIdle(session, message);
}

async function fetchAndReturnScore(
  session: Awaited<ReturnType<typeof getSession>>,
): Promise<string> {
  if (!session.walletAddress) return MESSAGES.needWalletFirst();

  session.state = ConversationState.COMPUTING_SCORE;
  await saveSession(session);

  const score = await apiClient.getScoreByWallet(session.walletAddress);

  session.state = ConversationState.SCORE_READY;
  await saveSession(session);

  if (!score) {
    return MESSAGES.noScoreFound();
  }

  return MESSAGES.scoreResult(score.score, score.confidence, score.recommendation);
}

// ─── Message templates ───────────────────────────────────────────────

const MESSAGES = {
  welcome: () =>
    `*Welcome to TrustLedger!* 🔗\n\nI can help you check your hybrid credit score.\n\nCommands:\n• *score* - Check your credit score\n• *tokens* - View behavior tokens\n• *status* - Account status\n• *help* - All commands\n\nType *hi* to get started!`,

  welcomeBack: (wallet: string) =>
    `*Welcome back!* 🔗\n\nWallet: ${wallet.slice(0, 6)}...${wallet.slice(-4)}\n\nType *score* to check your latest score or *help* for all commands.`,

  help: () =>
    `*TrustLedger Bot Commands:*\n\n• *hi / hello* - Start conversation\n• *score* - Get your credit score\n• *tokens* - Behavior token balance\n• *status* - Account status\n• *reset* - Reset session\n• *help* - Show this menu`,

  askWallet: () =>
    `Please send me your *Ethereum wallet address* (0x...) to link your account.`,

  needWalletFirst: () =>
    `I need your wallet address first. Please send your *Ethereum address* (0x...).`,

  invalidWallet: () =>
    `That doesn't look like a valid Ethereum address. Please send a valid *0x...* address (42 characters).`,

  walletLinked: (wallet: string) =>
    `*Wallet linked!* ✅\n\nAddress: ${wallet.slice(0, 6)}...${wallet.slice(-4)}\n\nType *score* to check your credit score.`,

  noScoreFound: () =>
    `No score found for your wallet yet. Please compute your score on the TrustLedger dashboard first, then check back here.`,

  scoreResult: (score: number, confidence: number, recommendation: string) => {
    const emoji = score >= 700 ? '🟢' : score >= 500 ? '🟡' : '🔴';
    return `*Your TrustLedger Score* ${emoji}\n\n*Score:* ${score} / 900\n*Confidence:* ${(confidence * 100).toFixed(0)}%\n*Recommendation:* ${recommendation}\n\nVisit the dashboard for detailed breakdown.`;
  },

  tokenBalance: (balance: number) =>
    `*Behavior Tokens:* ${balance} 🪙\n\nThese soulbound tokens represent your positive financial behavior on-chain.`,

  status: (wallet?: string) =>
    wallet
      ? `*Account Status:*\n\nWallet: ${wallet.slice(0, 6)}...${wallet.slice(-4)}\nStatus: Active ✅`
      : `*Account Status:*\n\nNo wallet linked. Type *hi* to get started.`,
};
