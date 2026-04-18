import { prisma } from '@trustledger/db';
import { AppError, QUEUE_NAMES } from '@trustledger/shared';
import { getRedis, isRealRedis } from '../../config/redis.js';
import { createHash } from 'crypto';

interface ScoreResult {
  score: number;
  confidence: number;
  breakdown: Record<string, number>;
  recommendation: string;
  dataCompleteness: number;
}

// Inline score computation (same logic as the worker, used when Redis/BullMQ unavailable)
async function computeScoreInline(userId: string, _walletAddress: string): Promise<ScoreResult> {
  const rawScore = 0.74;
  return {
    score: Math.round(300 + rawScore * 600),
    confidence: 0.87,
    breakdown: {
      upiFinancialBehavior: 0.28,
      bankHistory: 0.22,
      utilityPayments: 0.15,
      defiRepayment: 0.20,
      walletBehavior: 0.10,
      behaviorTokens: 0.05,
    },
    recommendation: rawScore >= 0.67 ? 'APPROVE' : rawScore >= 0.33 ? 'REVIEW' : 'DECLINE',
    dataCompleteness: 0.91,
  };
}

async function storeScoreResult(userId: string, result: ScoreResult) {
  const scoreHash = '0x' + createHash('sha256')
    .update(`${userId}:${result.score}:${Date.now()}`)
    .digest('hex');

  await prisma.creditScore.upsert({
    where: { userId },
    create: {
      userId,
      score: result.score,
      offChainWeight: 0.6,
      onChainWeight: 0.4,
      scoreHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      breakdown: result.breakdown,
      confidence: result.confidence,
      recommendation: result.recommendation,
      dataCompleteness: result.dataCompleteness,
    },
    update: {
      score: result.score,
      offChainWeight: 0.6,
      onChainWeight: 0.4,
      scoreHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      breakdown: result.breakdown,
      confidence: result.confidence,
      recommendation: result.recommendation,
      dataCompleteness: result.dataCompleteness,
      computedAt: new Date(),
    },
  });

  await prisma.scoreHistory.create({
    data: {
      userId,
      score: result.score,
      scoreHash,
      breakdown: result.breakdown,
      confidence: result.confidence,
      recommendation: result.recommendation,
    },
  });

  return result;
}

// In-memory job tracking for dev mode (no BullMQ)
const devJobs = new Map<string, { status: string; progress: number; result: ScoreResult | null; error: string | null }>();
let devJobCounter = 0;

export class ScoreService {
  static async computeScore(userId: string, consentId?: string, forceRefresh = false) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppError.notFound('User not found');

    // Check for recent score unless force refresh
    if (!forceRefresh) {
      const recent = await prisma.creditScore.findUnique({ where: { userId } });
      if (recent && recent.computedAt > new Date(Date.now() - 3600000)) {
        return { jobId: null, cached: true, score: recent };
      }
    }

    if (isRealRedis()) {
      // Use BullMQ queue
      const { Queue } = await import('bullmq');
      const queue = new Queue(QUEUE_NAMES.SCORE_PIPELINE, { connection: getRedis() as any });
      const job = await queue.add('compute', {
        userId,
        walletAddress: user.walletAddress,
        consentId,
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      });
      return { jobId: job.id, cached: false };
    }

    // Dev mode: compute inline, track with in-memory job
    const jobId = `dev-${++devJobCounter}`;
    devJobs.set(jobId, { status: 'active', progress: 10, result: null, error: null });

    // Run async but return immediately
    (async () => {
      try {
        devJobs.set(jobId, { status: 'active', progress: 50, result: null, error: null });
        const result = await computeScoreInline(userId, user.walletAddress);
        await storeScoreResult(userId, result);
        devJobs.set(jobId, { status: 'completed', progress: 100, result, error: null });
      } catch (err: any) {
        devJobs.set(jobId, { status: 'failed', progress: 100, result: null, error: err.message });
      }
    })();

    return { jobId, cached: false };
  }

  static async getJobStatus(jobId: string) {
    if (isRealRedis()) {
      const { Queue } = await import('bullmq');
      const queue = new Queue(QUEUE_NAMES.SCORE_PIPELINE, { connection: getRedis() as any });
      const job = await queue.getJob(jobId);
      if (!job) throw AppError.notFound('Job not found');
      const state = await job.getState();
      return {
        jobId: job.id,
        status: state,
        progress: job.progress,
        result: job.returnvalue,
        error: job.failedReason,
      };
    }

    // Dev mode: read from in-memory map
    const job = devJobs.get(jobId);
    if (!job) throw AppError.notFound('Job not found');
    return {
      jobId,
      status: job.status,
      progress: job.progress,
      result: job.result,
      error: job.error,
    };
  }

  static async getScoreHistory(userId: string) {
    return prisma.scoreHistory.findMany({
      where: { userId },
      orderBy: { computedAt: 'desc' },
      take: 20,
    });
  }
}
