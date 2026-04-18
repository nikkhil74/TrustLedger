import type { FastifyJWT } from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    user: FastifyJWT['user'];
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      wallet: string;
      kyc: string;
    };
    user: {
      sub: string;
      wallet: string;
      kyc: string;
    };
  }
}
