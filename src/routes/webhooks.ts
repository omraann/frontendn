import type { FastifyInstance } from 'fastify';
import { createHmac } from 'crypto';
import { env } from '../lib/env.js';
import { Logger } from '../lib/logger.js';

export async function webhookRoutes(fastify: FastifyInstance): Promise<void> {
  const logger = Logger.getInstance();

  // N8N webhook
  if (env.N8N_TOKEN) {
    fastify.post('/api/webhooks/n8n', async (request, reply) => {
      const token = request.headers['authorization']?.replace('Bearer ', '');
      
      if (token !== env.N8N_TOKEN) {
        await reply.status(401);
        return {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid token',
          },
        };
      }

      // Process the webhook payload here
      // For now, just acknowledge receipt
      return { ok: true };
    });
  }

  // Calendly webhook
  if (env.CALENDLY_SIGNING_SECRET) {
    fastify.post('/api/webhooks/calendly', async (request, reply) => {
      const signature = request.headers['calendly-webhook-signature'] as string;
      const timestamp = request.headers['calendly-webhook-timestamp'] as string;
      
      if (!signature || !timestamp) {
        await reply.status(400);
        return {
          ok: false,
          error: {
            code: 'MISSING_HEADERS',
            message: 'Missing required headers',
          },
        };
      }

      // Verify signature
      const payload = JSON.stringify(request.body);
      const expectedSignature = createHmac('sha256', env.CALENDLY_SIGNING_SECRET!)
        .update(timestamp + payload)
        .digest('base64');

      if (signature !== expectedSignature) {
        await reply.status(401);
        return {
          ok: false,
          error: {
            code: 'INVALID_SIGNATURE',
            message: 'Invalid signature',
          },
        };
      }

      // Log the event
      const logData = {
        timestamp: new Date().toISOString(),
        event: JSON.stringify(request.body),
      };

      await logger.appendCsvLine('calendly.log', logData);

      return { ok: true };
    });
  }
}