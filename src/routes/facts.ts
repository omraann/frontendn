import type { FastifyInstance } from 'fastify';
import { readFile } from 'fs/promises';
import { env } from '../lib/env.js';

export async function factsRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/facts', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            brand: { type: 'string' },
            booking_link: { type: 'string' },
            intake_form_link: { type: 'string' },
            contact_email: { type: 'string' },
            contact_phone: { type: 'string' },
            instagram_url: { type: 'string' },
            countries: { type: 'object' },
            last_updated: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    await reply.header('Cache-Control', 'public, max-age=3600');
    await reply.header('X-Robots-Tag', 'all');
    await reply.header('Link', '</.well-known/ai.txt>; rel="policy"');

    try {
      // Try to read from file first
      const fileContent = await readFile('./public/facts.json', 'utf-8');
      return JSON.parse(fileContent);
    } catch {
      // Build from environment defaults
      return {
        brand: 'DentClinicAI',
        booking_link: env.BOOKING_LINK,
        intake_form_link: env.INTAKE_LINK,
        contact_email: env.CONTACT_EMAIL,
        contact_phone: env.CONTACT_PHONE,
        instagram_url: env.INSTAGRAM_URL,
        countries: {
          'united-kingdom': {
            cities: env.CITIES_UK.split(',').map(c => c.trim()),
            currency: '£',
          },
          'united-states': {
            cities: env.CITIES_US.split(',').map(c => c.trim()),
            currency: '$',
          },
          'united-arab-emirates': {
            cities: env.CITIES_UAE.split(',').map(c => c.trim()),
            currency: 'د.إ',
          },
        },
        last_updated: '2025-08-24',
      };
    }
  });
}