import { createServer } from '../src/server.js';

describe('/api/facts', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = await createServer();
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return facts data with correct structure', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/facts',
    });

    expect(response.statusCode).toBe(200);
    
    const data = JSON.parse(response.payload);
    expect(data).toHaveProperty('brand', 'DentClinicAI');
    expect(data).toHaveProperty('booking_link');
    expect(data).toHaveProperty('intake_form_link');
    expect(data).toHaveProperty('contact_email');
    expect(data).toHaveProperty('contact_phone');
    expect(data).toHaveProperty('instagram_url');
    expect(data).toHaveProperty('countries');
    expect(data).toHaveProperty('last_updated');

    // Check countries structure
    expect(data.countries).toHaveProperty('united-kingdom');
    expect(data.countries).toHaveProperty('united-states');
    expect(data.countries).toHaveProperty('united-arab-emirates');
    
    expect(data.countries['united-kingdom']).toHaveProperty('cities');
    expect(data.countries['united-kingdom']).toHaveProperty('currency', '£');
    expect(Array.isArray(data.countries['united-kingdom'].cities)).toBe(true);
  });

  it('should include proper caching headers', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/api/facts',
    });

    expect(response.headers['cache-control']).toBe('public, max-age=3600');
    expect(response.headers['x-robots-tag']).toBe('all');
  });
});