import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@trustledger/shared';
import { prisma } from '@trustledger/db';
import { createHash } from 'crypto';

export async function authorizeLender(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const apiKey = request.headers['x-api-key'] as string | undefined;
  if (!apiKey) {
    throw AppError.unauthorized('API key required');
  }

  const hashedKey = createHash('sha256').update(apiKey).digest('hex');
  const lenderKey = await prisma.lenderAPIKey.findFirst({
    where: { apiKey: apiKey, isActive: true },
  });

  if (!lenderKey) {
    throw AppError.unauthorized('Invalid API key');
  }

  // Update last used timestamp
  await prisma.lenderAPIKey.update({
    where: { id: lenderKey.id },
    data: { lastUsedAt: new Date() },
  });

  (request as unknown as Record<string, unknown>).lenderKey = lenderKey;
}
