import { createServer } from '../src/server.js';

describe('/api/answer', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = await createServer();
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return answer data', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/answer',
    });

    expect(response.statusCode).toBe(200);
    
    const data = JSON.parse(response.payload);
    expect(data.ok).toBe(true);
    expect(data.data).toHaveProperty('summary');
    expect(data.data).toHaveProperty('policy');
    expect(data.data).toHaveProperty('updated');
    expect(data.data.summary).toContain('Dental booking automation');
    expect(data.data.policy).toBe('/.well-known/ai.txt');
  });

  it('should include proper headers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/answer',
    });

    expect(response.headers['cache-control']).toBe('public, max-age=3600');
    expect(response.headers['x-robots-tag']).toBe('all');
    expect(response.headers['link']).toContain('/.well-known/ai.txt');
  });
});