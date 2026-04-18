import { prisma } from '@trustledger/db';
import { AppError } from '@trustledger/shared';

export class LenderService {
  static async getScoreByWallet(walletAddress: string) {
    const user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
      include: { creditScore: true },
    });

    if (!user || !user.creditScore) {
      throw AppError.notFound('No score found for this wallet');
    }

    return {
      walletAddress: user.walletAddress,
      score: user.creditScore.score,
      recommendation: user.creditScore.recommendation,
      scoreHash: user.creditScore.scoreHash,
      txHash: user.creditScore.txHash,
      computedAt: user.creditScore.computedAt,
      expiresAt: user.creditScore.expiresAt,
      breakdown: user.creditScore.breakdown,
    };
  }

  static async verifyZkProof(_proof: string, _publicInputs: string[]) {
    // Placeholder: In production, call ScoreVerifier contract on-chain
    return {
      valid: true,
      message: 'ZK proof verification placeholder — will integrate with Noir verifier',
    };
  }
}
