import type { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import type { FastifyInstance } from 'fastify';

export class AuthController {
  static async getNonce(request: FastifyRequest, reply: FastifyReply) {
    const { wallet } = request.query as { wallet: string };
    const nonce = await AuthService.generateNonce(wallet);
    return reply.send({ success: true, data: { nonce } });
  }

  static async siweLogin(request: FastifyRequest, reply: FastifyReply) {
    const { message, signature } = request.body as { message: string; signature: string };

    // In production: verify SIWE signature using siwe package
    // For now, extract wallet from message
    const walletMatch = message.match(/0x[a-fA-F0-9]{40}/);
    if (!walletMatch) {
      return reply.status(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid SIWE message' },
      });
    }

    const result = await AuthService.verifyAndLogin(
      walletMatch[0],
      request.server as FastifyInstance,
    );

    return reply.send({ success: true, data: result });
  }

  static async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = request.body as { refreshToken: string };
    const result = await AuthService.refreshAccessToken(
      refreshToken,
      request.server as FastifyInstance,
    );
    return reply.send({ success: true, data: result });
  }

  static async initiateKyc(request: FastifyRequest, reply: FastifyReply) {
    const { aadhaarNumber } = request.body as { aadhaarNumber: string };
    const user = (request as unknown as Record<string, { sub: string }>).user;
    const result = await AuthService.initiateKyc(user.sub, aadhaarNumber);
    return reply.send({ success: true, data: result });
  }

  static async verifyKyc(request: FastifyRequest, reply: FastifyReply) {
    const { otp, requestId } = request.body as { otp: string; requestId: string };
    const user = (request as unknown as Record<string, { sub: string }>).user;
    const result = await AuthService.verifyKyc(user.sub, otp, requestId);
    return reply.send({ success: true, data: result });
  }

  static async disconnectKyc(request: FastifyRequest, reply: FastifyReply) {
    const user = (request as unknown as Record<string, { sub: string }>).user;
    const result = await AuthService.disconnectKyc(user.sub);
    return reply.send({ success: true, data: result });
  }
}
