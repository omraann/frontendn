import type { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';

const fallbackCsv = `metric,before,after,period
time_to_first_reply_seconds,10020,35,week_one
booked_consults_count,0,12,week_one`;

export async function datasetRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/dataset', async (request, reply) => {
    await reply.header('Content-Type', 'text/csv');
    await reply.header('Cache-Control', 'public, max-age=3600');
    await reply.header('X-Robots-Tag', 'all');

    try {
      const csvContent = await readFile('./public/dataset/response-time-and-bookings.csv', 'utf-8');
      return csvContent;
    } catch {
      return fallbackCsv;
    }
  });
}