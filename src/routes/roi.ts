import type { FastifyInstance } from 'fastify';
import { roiSchema, type RoiRequest } from '../lib/schemas.js';

export async function roiRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: RoiRequest }>('/api/roi', {
    schema: {
      body: {
        type: 'object',
        properties: {
          revenuePerPatient: { type: 'number', minimum: 0 },
          missedPerDay: { type: 'number', minimum: 0 },
          capturePct: { type: 'number', minimum: 0, maximum: 100 },
          showRatePct: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['revenuePerPatient', 'missedPerDay', 'capturePct', 'showRatePct'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                additionalBookings: { type: 'number' },
                addedRevenue: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    await reply.header('Cache-Control', 'no-store');

    try {
      const validated = roiSchema.parse(request.body);
      
      const additionalBookings = 
        validated.missedPerDay * 30 * (validated.capturePct / 100) * (validated.showRatePct / 100);
      const addedRevenue = additionalBookings * validated.revenuePerPatient;

      return {
        ok: true,
        data: {
          additionalBookings: Math.round(additionalBookings * 100) / 100,
          addedRevenue: Math.round(addedRevenue * 100) / 100,
        },
      };
    } catch (error) {
      await reply.status(400);
      return {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
        },
      };
    }
  });
}