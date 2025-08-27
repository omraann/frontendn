import type { FastifyInstance } from 'fastify';

export async function setupRateLimit(fastify: FastifyInstance): Promise<void> {
  await fastify.register(import('@fastify/rate-limit'), {
    max: 60,
    timeWindow: '1 minute',
    cache: 10000,
    allowList: ['127.0.0.1'],
    redis: undefined, // Use memory store
    skipOnError: true,
    keyGenerator: (request) => {
      return request.ip;
    },
    errorResponseBuilder: () => {
      return {
        ok: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
        },
      };
    },
  });
}