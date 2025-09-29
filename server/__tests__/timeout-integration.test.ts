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

describe('Timeout Integration Tests', () => {
  let app: express.Express;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(requestIdMiddleware);
    app.use(userMiddleware);
    
    await registerRoutes(app);
    app.use(errorHandler);
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('AI Provider Timeout Scenarios', () => {
    it('should handle OpenAI timeout with proper error response', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      
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
      expect(response.body).toEqual({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: expect.any(String)
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('openai.com'),
        expect.objectContaining({
          timeoutMs: 8000
        })
      );
    });

    it('should handle Gemini timeout with proper error response', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
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
      expect(response.body).toEqual({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: expect.any(String)
      });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('googleapis.com'),
        expect.objectContaining({
          timeoutMs: 8000
        })
      );
    });

    it('should handle multiple provider timeouts in fallback scenario', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // Mock timeout for all providers
      const timeoutError = new Error('Request timeout after 8000ms');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(504);
      expect(response.body).toEqual({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: expect.any(String)
      });
      
      // Should have attempted multiple providers
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should handle partial timeout with successful fallback', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // First call times out, second succeeds
      const timeoutError = new Error('Request timeout after 8000ms');
      timeoutError.name = 'TimeoutError';
      
      const successResponse = {
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: 'Successful analysis after timeout fallback'
              }]
            }
          }]
        })
      } as Response;
      
      mockFetch
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce(successResponse);

      const { minimalStorage } = await import('../minimal-storage');
      const mockStorage = vi.mocked(minimalStorage);
      mockStorage.createAnalysis.mockResolvedValue({
        id: 'test-id',
        url: 'https://example.com',
        summary: 'Successful analysis after timeout fallback',
        model: 'gemini:gemini-2.5-flash-preview-05-20',
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary', 'Successful analysis after timeout fallback');
      
      // Should have attempted both providers
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Slow Response Scenarios', () => {
    it('should handle slow but successful AI provider response', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // Mock slow but successful response
      const slowResponse = {
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{
                text: 'Analysis completed after slow response'
              }]
            }
          }]
        })
      } as Response;
      
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(slowResponse), 100))
      );

      const { minimalStorage } = await import('../minimal-storage');
      const mockStorage = vi.mocked(minimalStorage);
      mockStorage.createAnalysis.mockResolvedValue({
        id: 'test-id',
        url: 'https://example.com',
        summary: 'Analysis completed after slow response',
        model: 'gemini:gemini-2.5-flash-preview-05-20',
        createdAt: new Date()
      });

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary', 'Analysis completed after slow response');
    });

    it('should handle AI provider returning error after timeout', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // Mock provider error that looks like timeout
      const providerError = new Error('Gateway timeout from provider');
      mockFetch.mockRejectedValue(providerError);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(502);
      expect(response.body).toEqual({
        error: 'AI provider is currently unavailable',
        code: 'AI_PROVIDER_DOWN',
        requestId: expect.any(String)
      });
    });
  });

  describe('Network-Level Timeout Scenarios', () => {
    it('should handle DNS resolution timeout', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // Mock DNS timeout
      const dnsError = new Error('getaddrinfo ENOTFOUND');
      dnsError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(dnsError);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(504);
      expect(response.body).toEqual({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: expect.any(String)
      });
    });

    it('should handle connection timeout', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // Mock connection timeout
      const connectionError = new Error('connect ETIMEDOUT');
      connectionError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(connectionError);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(504);
      expect(response.body).toEqual({
        error: 'Request timeout',
        code: 'GATEWAY_TIMEOUT',
        requestId: expect.any(String)
      });
    });
  });

  describe('Timeout Configuration', () => {
    it('should use 8-second timeout by default', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Success' }] } }]
        })
      } as Response);

      await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeoutMs: 8000
        })
      );
    });

    it('should handle concurrent requests with timeouts', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      // Mock timeout for all requests
      const timeoutError = new Error('Request timeout after 8000ms');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      // Make multiple concurrent requests
      const requests = Array.from({ length: 3 }, () =>
        request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
      );

      const responses = await Promise.all(requests);
      
      // All should timeout with proper error format
      responses.forEach(response => {
        expect(response.status).toBe(504);
        expect(response.body).toEqual({
          error: 'Request timeout',
          code: 'GATEWAY_TIMEOUT',
          requestId: expect.any(String)
        });
      });
      
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Response Consistency', () => {
    it('should include request ID in timeout responses', async () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      const timeoutError = new Error('Request timeout after 8000ms');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(504);
      expect(response.body.requestId).toBeDefined();
      expect(typeof response.body.requestId).toBe('string');
      expect(response.body.requestId.length).toBeGreaterThan(0);
    });

    it('should set proper headers for timeout responses', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const { fetchWithTimeout } = await import('../lib/fetchWithTimeout');
      const mockFetch = vi.mocked(fetchWithTimeout);
      
      const timeoutError = new Error('Request timeout after 8000ms');
      timeoutError.name = 'TimeoutError';
      mockFetch.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example.com' });

      expect(response.status).toBe(504);
      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });
});