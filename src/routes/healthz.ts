import type { FastifyInstance } from 'fastify';

export async function healthzRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/healthz', async () => {
    return {
      ok: true,
      uptime: process.uptime(),
      now: new Date().toISOString(),
    };
  });
}