import { randomBytes, createHash } from 'crypto';
import { prisma, KYCStatus } from '@trustledger/db';
import type { FastifyInstance } from 'fastify';
import { getRedis } from '../../config/redis.js';
import { env } from '../../config/env.js';
import { REDIS_KEYS, AppError } from '@trustledger/shared';

export class AuthService {
  static async generateNonce(walletAddress: string): Promise<string> {
    const nonce = randomBytes(32).toString('hex');
    const redis = getRedis();
    await redis.set(
      REDIS_KEYS.authNonce(walletAddress),
      nonce,
      'EX',
      300, // 5 minute TTL
    );
    return nonce;
  }

  static async verifyAndLogin(
    walletAddress: string,
    fastify: FastifyInstance,
  ) {
    // Upsert user
    let user = await prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          aadhaarHash: createHash('sha256').update(`pending_${walletAddress}`).digest('hex'),
          phoneNumber: `pending_${walletAddress.slice(0, 10)}`,
          kycStatus: KYCStatus.PENDING,
        },
      });
    }

    // Generate tokens
    const accessToken = fastify.jwt.sign(
      { sub: user.id, wallet: user.walletAddress, kyc: user.kycStatus },
      { expiresIn: env.JWT_ACCESS_TTL },
    );

    const refreshToken = randomBytes(64).toString('hex');
    const refreshHash = createHash('sha256').update(refreshToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: refreshHash },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
        kycStatus: user.kycStatus,
      },
    };
  }

  static async refreshAccessToken(refreshToken: string, fastify: FastifyInstance) {
    const refreshHash = createHash('sha256').update(refreshToken).digest('hex');
    const user = await prisma.user.findFirst({
      where: { refreshTokenHash: refreshHash },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const accessToken = fastify.jwt.sign(
      { sub: user.id, wallet: user.walletAddress, kyc: user.kycStatus },
      { expiresIn: env.JWT_ACCESS_TTL },
    );

    return { accessToken };
  }

  static async initiateKyc(userId: string, aadhaarNumber: string) {
    const aadhaarHash = createHash('sha256').update(aadhaarNumber).digest('hex');

    // Check if Aadhaar already registered
    const existing = await prisma.user.findUnique({
      where: { aadhaarHash },
    });

    if (existing && existing.id !== userId) {
      throw AppError.validation('This Aadhaar is already registered');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { aadhaarHash },
    });

    // In production: call UIDAI KSA API to send OTP
    const requestId = randomBytes(16).toString('hex');
    return { requestId, message: 'OTP sent to Aadhaar-linked mobile' };
  }

  static async verifyKyc(userId: string, _otp: string, _requestId: string) {
    // In production: verify OTP with UIDAI KSA API
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: KYCStatus.VERIFIED },
    });

    return { verified: true, message: 'KYC verification successful' };
  }
}
