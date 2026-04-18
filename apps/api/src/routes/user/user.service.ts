import { prisma } from '@trustledger/db';
import { AppError, consentExpiryDate } from '@trustledger/shared';
import type { GrantConsentInput } from '@trustledger/shared';

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        walletAddress: true,
        kycStatus: true,
        phoneNumber: true,
        createdAt: true,
      },
    });
    if (!user) throw AppError.notFound('User not found');
    return user;
  }

  static async getScore(userId: string) {
    const score = await prisma.creditScore.findUnique({
      where: { userId },
    });
    if (!score) throw AppError.notFound('Score not found. Please compute your score first.');
    return score;
  }

  static async grantConsent(userId: string, input: GrantConsentInput) {
    const consent = await prisma.dataConsent.create({
      data: {
        userId,
        aaHandle: input.aaHandle,
        consentId: crypto.randomUUID(),
        dataTypes: input.dataTypes,
        fiTypes: input.fiTypes,
        expiresAt: consentExpiryDate(input.durationDays),
      },
    });
    return consent;
  }

  static async revokeConsent(userId: string, consentId: string) {
    const consent = await prisma.dataConsent.findFirst({
      where: { id: consentId, userId },
    });
    if (!consent) throw AppError.notFound('Consent not found');
    if (consent.status !== 'ACTIVE') {
      throw AppError.validation('Consent is not active');
    }

    const updated = await prisma.dataConsent.update({
      where: { id: consentId },
      data: { status: 'REVOKED' },
    });
    return updated;
  }

  static async getConsents(userId: string) {
    return prisma.dataConsent.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  static async getBehaviorTokens(userId: string) {
    return prisma.behaviorToken.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
