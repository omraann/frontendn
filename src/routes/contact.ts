import type { FastifyInstance } from 'fastify';
import { contactSchema, type ContactRequest } from '../lib/schemas.js';
import { Mailer } from '../lib/mailer.js';
import { Logger } from '../lib/logger.js';

export async function contactRoutes(fastify: FastifyInstance): Promise<void> {
  const mailer = new Mailer();
  const logger = Logger.getInstance();

  fastify.post<{ Body: ContactRequest }>('/api/contact', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          role: { type: 'string', minLength: 1, maxLength: 100 },
          clinic: { type: 'string', minLength: 1, maxLength: 200 },
          cityCountry: { type: 'string', minLength: 1, maxLength: 100 },
          contactMethod: { type: 'string', enum: ['Phone', 'Text message', 'WhatsApp', 'Email'] },
          phone: { type: 'string' },
          email: { type: 'string', format: 'email' },
          message: { type: 'string', maxLength: 1000 },
        },
        required: ['name', 'role', 'clinic', 'cityCountry', 'contactMethod', 'email'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
          },
        },
      },
    },
  }, async (request, reply) => {
    await reply.header('Cache-Control', 'no-store');

    try {
      const validated = contactSchema.parse(request.body);
      const sourceIp = request.ip;
      const userAgent = request.headers['user-agent'] || 'Unknown';

      // Send email
      await mailer.sendContactEmail(validated, sourceIp, userAgent);

      // Log to CSV
      const csvData = {
        timestamp: new Date().toISOString(),
        name: validated.name,
        role: validated.role,
        clinic: validated.clinic,
        cityCountry: validated.cityCountry,
        contactMethod: validated.contactMethod,
        phone: validated.phone || '',
        email: validated.email,
        message: validated.message || '',
        source_ip: sourceIp,
        user_agent: userAgent,
      };

      await logger.appendCsvLine('leads.csv', csvData);

      return { ok: true };
    } catch (error) {
      await logger.logError(error as Error, { route: '/api/contact' });
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