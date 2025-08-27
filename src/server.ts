import Fastify from 'fastify';
import { env } from './lib/env.js';
import { setupRateLimit } from './lib/rateLimit.js';
import { Logger } from './lib/logger.js';

// Route imports
import { healthzRoutes } from './routes/healthz.js';
import { answerRoutes } from './routes/answer.js';
import { factsRoutes } from './routes/facts.js';
import { qaRoutes } from './routes/qa.js';
import { datasetRoutes } from './routes/dataset.js';
import { roiRoutes } from './routes/roi.js';
import { contactRoutes } from './routes/contact.js';
import { webhookRoutes } from './routes/webhooks.js';

const logger = Logger.getInstance();

async function createServer() {
  const fastify = Fastify({
    logger: env.NODE_ENV === 'development',
    trustProxy: true,
  });

  // Security middleware
  await fastify.register(import('@fastify/helmet'), {
    contentSecurityPolicy: false,
  });

  await fastify.register(import('@fastify/compress'));

  // CORS configuration
  await fastify.register(import('@fastify/cors'), {
    origin: (origin, callback) => {
      // Allow GET requests from anywhere for public endpoints
      if (!origin) return callback(null, true);
      
      const publicEndpoints = ['/api/answer', '/api/facts', '/api/qa', '/api/dataset'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => 
        fastify.hasRoute({ method: 'GET', url: endpoint })
      );
      
      if (isPublicEndpoint) {
        return callback(null, true);
      }
      
      // For POST endpoints, restrict to SITE_ORIGIN
      const allowed = origin === env.SITE_ORIGIN;
      callback(null, allowed);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Rate limiting
  await setupRateLimit(fastify);

  // Static file serving
  await fastify.register(import('@fastify/static'), {
    root: './public',
    prefix: '/public/',
  });

  // Access logging
  fastify.addHook('onResponse', async (request, reply) => {
    const responseTime = reply.getResponseTime();
    await logger.logAccess(
      request.method,
      request.url,
      reply.statusCode,
      responseTime,
      request.ip
    );
  });

  // Error handling
  fastify.setErrorHandler(async (error, request, reply) => {
    await logger.logError(error, {
      method: request.method,
      url: request.url,
      ip: request.ip,
    });

    const statusCode = error.statusCode || 500;
    await reply.status(statusCode);

    return {
      ok: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: statusCode >= 500 ? 'Internal server error' : error.message,
      },
    };
  });

  // Register routes
  await fastify.register(healthzRoutes);
  await fastify.register(answerRoutes);
  await fastify.register(factsRoutes);
  await fastify.register(qaRoutes);
  await fastify.register(datasetRoutes);
  await fastify.register(roiRoutes);
  await fastify.register(contactRoutes);
  await fastify.register(webhookRoutes);

  return fastify;
}

// For serverless deployment
export default async function handler(request: Request): Promise<Response> {
  const fastify = await createServer();
  await fastify.ready();
  
  // Convert Web API Request to Fastify format
  const url = new URL(request.url);
  const body = request.method !== 'GET' ? await request.text() : undefined;
  
  const response = await fastify.inject({
    method: request.method as any,
    url: url.pathname + url.search,
    headers: Object.fromEntries(request.headers.entries()),
    payload: body,
  });

  return new Response(response.payload, {
    status: response.statusCode,
    headers: response.headers as any,
  });
}

// For local development
if (env.NODE_ENV === 'development') {
  const start = async (): Promise<void> => {
    try {
      const fastify = await createServer();
      await fastify.listen({ port: env.PORT, host: env.HOST });
      console.log(`🚀 Server running at http://${env.HOST}:${env.PORT}`);
    } catch (err) {
      console.error('Error starting server:', err);
      process.exit(1);
    }
  };

  void start();
}