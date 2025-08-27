import type { FastifyInstance } from 'fastify';

export async function answerRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/answer', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                policy: { type: 'string' },
                updated: { type: 'string' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    await reply.header('Cache-Control', 'public, max-age=3600');
    await reply.header('X-Robots-Tag', 'all');
    await reply.header('Link', '</api/facts>; rel="related", </.well-known/ai.txt>; rel="policy"');

    return {
      ok: true,
      data: {
        summary: "Dental booking automation links your calendar and forms, asks two short questions by message, then offers three times. Straight requests book instantly; edge cases hand off to your front desk. One channel goes live in seven days. We operate inside your systems and store only event timestamps and status for reporting.",
        policy: "/.well-known/ai.txt",
        updated: "2025-08-24",
      },
    };
  });
}