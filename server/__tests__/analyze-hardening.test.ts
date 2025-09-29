import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { requestIdMiddleware } from '../middleware/requestId';
import { userMiddleware } from '../middleware/user';
import { errorHandler } from '../middleware/errorHandler';

// Mock the minimal storage
vi.mock('../minimal-storage', () => ({
  minimalStorage: {
    createAnalysis: vi.fn(),
    listAnalyses: vi.fn()
  }
}));

// Mock the fetch timeout utility
vi.mock('../lib/fetchWithTimeout', () => ({
  fetchWithTimeout: vi.fn()
}));

describe('Analyze Endpoint Hardening', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(requestIdMiddleware);
    app.use(userMiddleware);
    
    await registerRoutes(app);
    app.use(errorHandler);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    // Clear rate limit state between tests
    const { cleanupRateLimit } = await import('../middleware/rateLimit');
    cleanupRateLimit();
  });

  it('should apply rate limiting to analyze endpoint', async () => {
    // Set up environment variables
    process.env.GEMINI_API_KEY = 'test-key';
    
    const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
    const mockFetch = vi.mocked(fetchWithTimeout);
    
    // Mock successful AI response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{
          content: {
            parts: [{
              text: 'Test analysis result'
            }]
          }
        }]
      })
    } as Response);

    const { minimalStorage } = await import('../minimal-storage');
    const mockStorage = vi.mocked(minimalStorage);
    mockStorage.createAnalysis.mockResolvedValue({
      id: 'test-id',
      url: 'https://example.com',
      summary: 'Test analysis result',
      model: 'gemini:gemini-2.5-flash-preview-05-20',
      createdAt: new Date()
    });

    // Make multiple requests to trigger rate limiting
    const requests = Array.from({ length: 12 }, () =>
      request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' })
    );

    const responses = await Promise.all(requests);
    
    // First 10 should succeed, remaining should be rate limited
    const successfulResponses = responses.filter(r => r.status === 200);
    const rateLimitedResponses = responses.filter(r => r.status === 429);
    
    expect(successfulResponses.length).toBeLessThanOrEqual(10);
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
    
    // Check rate limited response format
    const rateLimitedResponse = rateLimitedResponses[0];
    expect(rateLimitedResponse.body).toHaveProperty('error');
    expect(rateLimitedResponse.body).toHaveProperty('code', 'RATE_LIMITED');
    expect(rateLimitedResponse.body).toHaveProperty('requestId');
  });

  it('should handle timeout errors with proper status codes', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
    const mockFetch = vi.mocked(fetchWithTimeout);
    
    // Mock timeout error
    const timeoutError = new Error('Request timeout after 8000ms');
    timeoutError.name = 'TimeoutError';
    mockFetch.mockRejectedValue(timeoutError);

    const response = await request(app)
      .post('/api/business-analyses/analyze')
      .send({ url: 'https://example.com' });

    expect(response.status).toBe(504);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'GATEWAY_TIMEOUT');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should handle AI provider errors with proper status codes', async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    
    const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
    const mockFetch = vi.mocked(fetchWithTimeout);
    
    // Mock AI provider error
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ error: { message: 'API Error' } })
    } as Response);

    const response = await request(app)
      .post('/api/business-analyses/analyze')
      .send({ url: 'https://example.com' });

    expect(response.status).toBe(502);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'AI_PROVIDER_DOWN');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should include request IDs in all error responses', async () => {
    const response = await request(app)
      .post('/api/business-analyses/analyze')
      .send({ url: 'invalid-url' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body).toHaveProperty('code', 'BAD_REQUEST');
    expect(response.body).toHaveProperty('requestId');
    expect(typeof response.body.requestId).toBe('string');
  });

  it('should validate URL format and return proper error', async () => {
    const response = await request(app)
      .post('/api/business-analyses/analyze')
      .send({ url: 'not-a-valid-url' });

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Invalid URL format');
    expect(response.body).toHaveProperty('code', 'BAD_REQUEST');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should require URL parameter', async () => {
    const response = await request(app)
      .post('/api/business-analyses/analyze')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'URL is required');
    expect(response.body).toHaveProperty('code', 'BAD_REQUEST');
    expect(response.body).toHaveProperty('requestId');
  });
});