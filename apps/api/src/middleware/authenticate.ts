import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '@trustledger/shared';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}
