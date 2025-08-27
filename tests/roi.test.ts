import { createServer } from '../src/server.js';

describe('/api/roi', () => {
  let fastify: any;

  beforeAll(async () => {
    fastify = await createServer();
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should calculate ROI correctly', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/roi',
      headers: {
        'content-type': 'application/json',
      },
      payload: {
        revenuePerPatient: 300,
        missedPerDay: 8,
        capturePct: 30,
        showRatePct: 80,
      },
    });

    expect(response.statusCode).toBe(200);
    
    const data = JSON.parse(response.payload);
    expect(data.ok).toBe(true);
    expect(data.data).toHaveProperty('additionalBookings');
    expect(data.data).toHaveProperty('addedRevenue');
    
    // 8 * 30 * 0.3 * 0.8 = 57.6 additional bookings
    // 57.6 * 300 = 17,280 added revenue
    expect(data.data.additionalBookings).toBe(57.6);
    expect(data.data.addedRevenue).toBe(17280);
  });

  it('should validate input data', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/roi',
      headers: {
        'content-type': 'application/json',
      },
      payload: {
        revenuePerPatient: -100, // Invalid: negative
        missedPerDay: 8,
        capturePct: 30,
        showRatePct: 80,
      },
    });

    expect(response.statusCode).toBe(400);
    
    const data = JSON.parse(response.payload);
    expect(data.ok).toBe(false);
    expect(data.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should validate percentage ranges', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/roi',
      headers: {
        'content-type': 'application/json',
      },
      payload: {
        revenuePerPatient: 300,
        missedPerDay: 8,
        capturePct: 150, // Invalid: > 100
        showRatePct: 80,
      },
    });

    expect(response.statusCode).toBe(400);
    
    const data = JSON.parse(response.payload);
    expect(data.ok).toBe(false);
    expect(data.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  it('should require all fields', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/api/roi',
      headers: {
        'content-type': 'application/json',
      },
      payload: {
        revenuePerPatient: 300,
        // Missing other required fields
      },
    });

    expect(response.statusCode).toBe(400);
  });
});