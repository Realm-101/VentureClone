import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { userMiddleware } from '../middleware/user';
import { requestIdMiddleware } from '../middleware/requestId';
import { errorHandler } from '../middleware/errorHandler';

describe('Middleware Integration', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = express();
    
    // Apply middleware in the correct order as per server/index.ts
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    app.use(userMiddleware);
    
    // Register routes (includes rate limiting on specific endpoints)
    await registerRoutes(app);
    
    // Error handler must be last
    app.use(errorHandler);
  });

  afterEach(() => {
    // Clean up any intervals or resources
  });

  it('should apply middleware in correct order', async () => {
    const response = await request(app)
      .get('/api/healthz')
      .expect(200);

    // Verify request ID is present (from requestIdMiddleware)
    expect(response.headers['x-request-id']).toBeDefined();
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    
    // Verify user cookie is set (from userMiddleware)
    expect(response.headers['set-cookie']).toBeDefined();
    const cookieHeader = response.headers['set-cookie'][0];
    expect(cookieHeader).toContain('venture_user_id=');
    expect(cookieHeader).toContain('HttpOnly');
  });

  it('should handle authentication flow correctly', async () => {
    // First request - should set user cookie
    const firstResponse = await request(app)
      .get('/api/business-analyses')
      .expect(200);

    expect(firstResponse.headers['set-cookie']).toBeDefined();
    const cookieHeader = firstResponse.headers['set-cookie'][0];
    const userId = cookieHeader.match(/venture_user_id=([^;]+)/)?.[1];
    expect(userId).toBeDefined();

    // Second request with cookie - should use existing user ID
    const secondResponse = await request(app)
      .get('/api/business-analyses')
      .set('Cookie', `venture_user_id=${userId}`)
      .expect(200);

    // Should not set a new cookie since user is already identified
    expect(secondResponse.headers['set-cookie']).toBeUndefined();
  });

  it('should apply rate limiting to protected endpoints', async () => {
    // Import the createRateLimit function to create a custom rate limiter for testing
    const { createRateLimit } = await import('../middleware/rateLimit');
    
    // Create a test app with very restrictive rate limiting
    const testApp = express();
    testApp.use(express.json());
    testApp.use(express.urlencoded({ extended: false }));
    testApp.use(cookieParser());
    testApp.use(requestIdMiddleware);
    testApp.use(userMiddleware);
    
    // Create a custom rate limiter with very low limits for testing
    const testRateLimit = createRateLimit({
      windowMs: 60000, // 1 minute
      max: 1 // Only 1 request allowed
    });
    
    // Import AppError for proper error handling
    const { AppError } = await import('../middleware/errorHandler');
    
    // Manually add the rate-limited route
    testApp.post('/api/business-analyses/analyze', testRateLimit, async (req, res, next) => {
      try {
        const { url } = req.body;
        if (!url) {
          throw new AppError('URL is required', 400, 'BAD_REQUEST');
        }
        
        // Simulate the same validation as the real route
        if (!url.startsWith('http')) {
          throw new AppError('Invalid URL format', 400, 'BAD_REQUEST');
        }
        
        // Simulate missing API keys
        throw new AppError('At least one AI provider API key is required', 500, 'CONFIG_MISSING');
      } catch (error) {
        next(error);
      }
    });
    
    testApp.use(errorHandler);

    const testUrl = 'https://example.com';
    
    // First request should succeed (but fail due to missing API keys)
    const firstResponse = await request(testApp)
      .post('/api/business-analyses/analyze')
      .send({ url: testUrl });
    
    expect(firstResponse.status).toBe(500);
    expect(firstResponse.body.error).toContain('At least one AI provider API key is required');

    // Second request should be rate limited
    const secondResponse = await request(testApp)
      .post('/api/business-analyses/analyze')
      .send({ url: testUrl });
    
    expect(secondResponse.status).toBe(429);
    expect(secondResponse.body.code).toBe('RATE_LIMITED');
    expect(secondResponse.body.error).toContain('Too many requests');
    expect(secondResponse.body.requestId).toBeDefined();
  });

  it('should handle errors consistently through error handler', async () => {
    // Test invalid URL format
    const response = await request(app)
      .post('/api/business-analyses/analyze')
      .send({ url: 'invalid-url' })
      .expect(400);

    // Verify consistent error format from error handler
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'BAD_REQUEST');
    expect(response.body).toHaveProperty('requestId');
    expect(response.body.error).toBe('Invalid URL format');
  });

  it('should not apply rate limiting to non-protected endpoints', async () => {
    // Health check should not be rate limited
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .get('/api/healthz')
        .expect(200);
      
      expect(response.body.ok).toBe(true);
    }

    // Business analyses list should not be rate limited
    for (let i = 0; i < 5; i++) {
      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    }
  });

  it('should propagate request ID through middleware chain', async () => {
    // Use a valid UUID format for the custom request ID
    const customRequestId = '550e8400-e29b-41d4-a716-446655440000';
    
    const response = await request(app)
      .get('/api/healthz')
      .set('x-request-id', customRequestId)
      .expect(200);

    // Should use the provided request ID
    expect(response.headers['x-request-id']).toBe(customRequestId);
  });
});