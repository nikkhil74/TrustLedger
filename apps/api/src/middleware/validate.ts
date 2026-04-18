import type { FastifyRequest, FastifyReply } from 'fastify';
import type { ZodSchema } from 'zod';
import { AppError } from '@trustledger/shared';

export function validate(schema: ZodSchema) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      throw AppError.validation('Validation failed', result.error.flatten().fieldErrors);
    }
    request.body = result.data;
  };
}

export function validateParams(schema: ZodSchema) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const result = schema.safeParse(request.params);
    if (!result.success) {
      throw AppError.validation('Invalid parameters', result.error.flatten().fieldErrors);
    }
    request.params = result.data as typeof request.params;
  };
}
