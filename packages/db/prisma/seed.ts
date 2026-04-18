import { PrismaClient, KYCStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
    update: {},
    create: {
      aadhaarHash: 'a'.repeat(64),
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      phoneNumber: '+919876543210',
      kycStatus: KYCStatus.VERIFIED,
    },
  });

  // Create a sample credit score
  await prisma.creditScore.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      score: 742,
      offChainWeight: 0.6,
      onChainWeight: 0.4,
      scoreHash: '0x' + 'b'.repeat(64),
      txHash: '0x' + 'c'.repeat(64),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      confidence: 0.87,
      recommendation: 'APPROVE',
      dataCompleteness: 0.91,
      breakdown: {
        upiFinancialBehavior: 0.28,
        bankHistory: 0.22,
        utilityPayments: 0.15,
        defiRepayment: 0.20,
        walletBehavior: 0.10,
        behaviorTokens: 0.05,
      },
    },
  });

  // Create a lender API key
  await prisma.lenderAPIKey.upsert({
    where: { apiKey: 'test-lender-api-key-12345' },
    update: {},
    create: {
      lenderName: 'Test Lender',
      apiKey: 'test-lender-api-key-12345',
      permissions: ['SCORE_READ', 'ZK_VERIFY'],
      isActive: true,
      rateLimit: 100,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
