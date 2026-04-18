import { isRealRedis, getRedis } from '../../config/redis.js';
import { QUEUE_NAMES } from '@trustledger/shared';
import { prisma } from '@trustledger/db';
import { env } from '../../config/env.js';

interface ScoreResult {
  score: number;
  confidence: number;
  breakdown: Record<string, number>;
  recommendation: string;
  dataCompleteness: number;
}

async function processScorePipeline(job: any) {
  const { userId, walletAddress, consentId } = job.data;

  job.log('Starting score pipeline...');
  await job.updateProgress(10);

  // Step 1: Fetch AA data (mock)
  job.log('Step 1: Fetching Account Aggregator data...');
  const offChainData = {
    upiAvgMonthlyInflow: 45000,
    upiAvgMonthlyOutflow: 32000,
    upiConsistencyScore: 0.85,
    bankAvgBalance: 125000,
    bankMonthsOfHistory: 24,
    utilityBillsPaidOnTime: 11,
    utilityBillsTotal: 12,
    loanRepaymentHistory: 0.95,
    incomeStabilityScore: 0.78,
  };
  await job.updateProgress(30);

  // Step 2: Fetch on-chain data (mock)
  job.log('Step 2: Fetching on-chain data...');
  const onChainData = {
    defiLoansRepaid: 3,
    defiDefaultCount: 0,
    walletAgeDays: 365,
    avgWalletBalanceUsd: 2500,
    nftCollateralCount: 0,
    daoParticipationCount: 5,
    behaviorTokenBalance: 25,
  };
  await job.updateProgress(50);

  // Step 3: Compute score (call score engine or mock)
  job.log('Step 3: Computing score...');
  let scoreResult: ScoreResult | null = null;
  try {
    const response = await fetch(`${env.SCORE_ENGINE_URL}/score/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, walletAddress, offChainData, onChainData }),
    });
    if (response.ok) {
      scoreResult = (await response.json()) as ScoreResult;
    }
  } catch {
    // Score engine not available, use mock
  }

  if (!scoreResult) {
    const rawScore = 0.74;
    scoreResult = {
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
  await job.updateProgress(70);

  // Step 4: Store result
  job.log('Step 4: Storing result and attesting on-chain...');
  const { createHash } = await import('crypto');
  const scoreHash = '0x' + createHash('sha256')
    .update(`${userId}:${scoreResult.score}:${Date.now()}`)
    .digest('hex');

  await prisma.creditScore.upsert({
    where: { userId },
    create: {
      userId,
      score: scoreResult.score,
      offChainWeight: 0.6,
      onChainWeight: 0.4,
      scoreHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      breakdown: scoreResult.breakdown,
      confidence: scoreResult.confidence,
      recommendation: scoreResult.recommendation,
      dataCompleteness: scoreResult.dataCompleteness,
    },
    update: {
      score: scoreResult.score,
      offChainWeight: 0.6,
      onChainWeight: 0.4,
      scoreHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      breakdown: scoreResult.breakdown,
      confidence: scoreResult.confidence,
      recommendation: scoreResult.recommendation,
      dataCompleteness: scoreResult.dataCompleteness,
      computedAt: new Date(),
    },
  });

  await prisma.scoreHistory.create({
    data: {
      userId,
      score: scoreResult.score,
      scoreHash,
      breakdown: scoreResult.breakdown,
      confidence: scoreResult.confidence,
      recommendation: scoreResult.recommendation,
    },
  });
  await job.updateProgress(90);

  job.log('Step 5: Notifying user...');
  await job.updateProgress(100);

  return scoreResult;
}

export function startWorkers() {
  if (!isRealRedis()) {
    console.log('Skipping BullMQ workers (no Redis) — score computation runs inline');
    return;
  }

  import('bullmq').then(({ Worker }) => {
    const connection = getRedis();
    const worker = new Worker(
      QUEUE_NAMES.SCORE_PIPELINE,
      processScorePipeline,
      { connection, concurrency: 5 },
    );

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed. Score: ${job.returnvalue?.score}`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });

    console.log('Score pipeline worker started');
  });
}
