import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { userMiddleware } from '../middleware/user';
import { requestIdMiddleware } from '../middleware/requestId';
import { errorHandler } from '../middleware/errorHandler';
import { minimalStorage } from '../minimal-storage';

// Mock the storage module
vi.mock('../minimal-storage', () => ({
  minimalStorage: {
    listAnalyses: vi.fn(),
    createAnalysis: vi.fn(),
    getAnalysis: vi.fn(),
    deleteAnalysis: vi.fn(),
  }
}));

// Mock fetch for AI API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Endpoints', () => {
  let app: express.Application;
  let server: any;

  beforeAll(async () => {
    // Set up Express app with middleware (matching main server setup)
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(requestIdMiddleware);
    app.use(userMiddleware);
    
    // Register routes
    server = await registerRoutes(app);
    
    // Add error handler as final middleware (matching main server setup)
    app.use(errorHandler);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });
  
describe('GET /api/business-analyses', () => {
    it('should return empty array for new user', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return user analyses in reverse chronological order', async () => {
      const mockAnalyses = [
        {
          id: 'analysis-2',
          userId: 'user-123',
          url: 'https://example2.com',
          summary: 'Second analysis',
          model: 'openai:gpt-4o-mini',
          createdAt: '2024-01-02T00:00:00.000Z'
        },
        {
          id: 'analysis-1',
          userId: 'user-123',
          url: 'https://example1.com',
          summary: 'First analysis',
          model: 'openai:gpt-4o-mini',
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue(mockAnalyses);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      expect(response.body).toEqual(mockAnalyses);
      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle storage errors gracefully', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockRejectedValue(new Error('Storage error'));

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to fetch business analyses',
        code: 'INTERNAL',
        requestId: expect.any(String)
      });
    });

    it('should use userId from cookie middleware', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      await request(app)
        .get('/api/business-analyses')
        .set('Cookie', 'venture_user_id=test-user-123')
        .expect(200);

      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith('test-user-123');
    });

    it('should generate new userId if no cookie present', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      // Should have set a new cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toMatch(/venture_user_id=/);
      expect(cookieHeader).toMatch(/HttpOnly/);
      expect(cookieHeader).toMatch(/SameSite=Lax/);
    });
  });

  describe('POST /api/business-analyses/analyze', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment variables
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    describe('URL validation', () => {
      beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
      });

      it('should reject request without URL', async () => {
        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({})
          .expect(400);

        expect(response.body).toEqual({
          error: 'URL is required',
          code: 'BAD_REQUEST',
          requestId: expect.any(String)
        });
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should reject invalid URL format', async () => {
        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'not-a-valid-url' })
          .expect(400);

        expect(response.body).toEqual({
          error: 'Invalid URL format',
          code: 'BAD_REQUEST',
          requestId: expect.any(String)
        });
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should accept valid HTTP URL', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Test analysis result' }]
              }
            }]
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'new-analysis',
          userId: 'user-123',
          url: 'http://example.com',
          summary: 'Test analysis result',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'http://example.com' })
          .expect(200);

        expect(response.body.url).toBe('http://example.com');
        expect(minimalStorage.createAnalysis).toHaveBeenCalled();
      });

      it('should accept valid HTTPS URL', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Test analysis result' }]
              }
            }]
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'new-analysis',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'Test analysis result',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.url).toBe('https://example.com');
      });
    });

    describe('API key validation', () => {
      it('should reject request when no API keys are configured', async () => {
        delete process.env.GEMINI_API_KEY;
        delete process.env.OPENAI_API_KEY;

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body).toEqual({
          error: 'At least one AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is required',
          code: 'CONFIG_MISSING',
          requestId: expect.any(String)
        });
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should proceed when only GEMINI_API_KEY is configured', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        delete process.env.OPENAI_API_KEY;

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Gemini analysis result' }]
              }
            }]
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'new-analysis',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'Gemini analysis result',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.model).toBe('gemini:gemini-1.5-flash');
        expect(minimalStorage.createAnalysis).toHaveBeenCalled();
      });

      it('should proceed when only OPENAI_API_KEY is configured', async () => {
        delete process.env.GEMINI_API_KEY;
        process.env.OPENAI_API_KEY = 'test-openai-key';

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            choices: [{
              message: {
                content: 'OpenAI analysis result'
              }
            }]
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'new-analysis',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'OpenAI analysis result',
          model: 'openai:gpt-4o-mini',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.model).toBe('openai:gpt-4o-mini');
        expect(minimalStorage.createAnalysis).toHaveBeenCalled();
      });
    });

    describe('AI provider integration and fallback', () => {
      it('should use Gemini as primary provider when both keys are available', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Gemini primary analysis' }]
              }
            }]
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'new-analysis',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'Gemini primary analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.model).toBe('gemini:gemini-1.5-flash');
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('generativelanguage.googleapis.com'),
          expect.any(Object)
        );
      });

      it('should fallback to OpenAI when Gemini fails', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        // Mock Gemini failure
        mockFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
          })
          // Mock OpenAI success
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({
              choices: [{
                message: {
                  content: 'OpenAI fallback analysis'
                }
              }]
            })
          });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'new-analysis',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'OpenAI fallback analysis',
          model: 'openai:gpt-4o-mini',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.model).toBe('openai:gpt-4o-mini');
        expect(response.body.summary).toBe('OpenAI fallback analysis');
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      it('should return error when both AI providers fail', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        // Mock both providers failing
        mockFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({ error: { message: 'Invalid Gemini key' } })
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({ error: { message: 'Invalid OpenAI key' } })
          });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body).toEqual({ 
          error: 'Both AI providers failed. Please check your API keys and try again.' 
        });
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
        expect(mockFetch).toHaveBeenCalledTimes(2);
      });

      it('should handle network errors gracefully', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        // Mock network errors for both providers
        mockFetch
          .mockRejectedValueOnce(new Error('Network error - Gemini'))
          .mockRejectedValueOnce(new Error('Network error - OpenAI'));

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body).toEqual({ 
          error: 'Both AI providers failed. Please check your API keys and try again.' 
        });
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });
    }); 
   describe('Storage integration', () => {
      beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
      });

      it('should save successful analysis to storage', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Successful analysis content' }]
              }
            }]
          })
        });

        const mockCreatedAnalysis = {
          id: 'created-analysis-id',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'Successful analysis content',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        };

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockCreatedAnalysis);

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(minimalStorage.createAnalysis).toHaveBeenCalledWith(
          expect.any(String), // userId
          {
            url: 'https://example.com',
            summary: 'Successful analysis content',
            model: 'gemini:gemini-2.5-flash-preview-05-20'
          }
        );
        expect(response.body).toEqual(mockCreatedAnalysis);
      });

      it('should handle storage errors gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Analysis content' }]
              }
            }]
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockRejectedValue(new Error('Storage failure'));

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body).toEqual({
          error: 'Failed to create business analysis',
          code: 'INTERNAL',
          requestId: expect.any(String)
        });
      });

      it('should not save to storage if AI analysis fails', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({ error: { message: 'AI service error' } })
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
        expect(response.body.error).toContain('Both AI providers failed');
      });
    });

    describe('Response format validation', () => {
      beforeEach(() => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
      });

      it('should return properly formatted analysis response', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: 'Complete business analysis' }]
              }
            }]
          })
        });

        const mockAnalysis = {
          id: 'analysis-123',
          userId: 'user-456',
          url: 'https://example.com',
          summary: 'Complete business analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        };

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysis);

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          userId: expect.any(String),
          url: 'https://example.com',
          summary: 'Complete business analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: expect.any(String)
        });
      });

      it('should handle empty AI response gracefully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: []
          })
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'analysis-123',
          userId: 'user-456',
          url: 'https://example.com',
          summary: 'Analysis could not be completed.',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T00:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.summary).toBe('Analysis could not be completed.');
      });
    });
  }); 
 describe('User Middleware Functionality', () => {
    it('should generate new user ID for requests without cookie', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      // Should set a new cookie
      expect(response.headers['set-cookie']).toBeDefined();
      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toMatch(/venture_user_id=[a-f0-9-]{36}/); // UUID format
      expect(cookieHeader).toMatch(/HttpOnly/);
      expect(cookieHeader).toMatch(/SameSite=Lax/);
      expect(cookieHeader).toMatch(/Path=\//);
    });

    it('should use existing user ID from cookie', async () => {
      const existingUserId = 'existing-user-123';
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', `venture_user_id=${existingUserId}`)
        .expect(200);

      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith(existingUserId);
      
      // Should not set a new cookie when one already exists
      const setCookieHeaders = response.headers['set-cookie'];
      if (setCookieHeaders) {
        // If set-cookie is present, it should be the same user ID
        expect(setCookieHeaders[0]).toMatch(new RegExp(`venture_user_id=${existingUserId}`));
      }
    });

    it('should set secure cookie in production environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toMatch(/Secure/);

      process.env.NODE_ENV = originalEnv;
    });

    it('should not set secure cookie in development environment', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).not.toMatch(/Secure/);

      process.env.NODE_ENV = originalEnv;
    });

    it('should set cookie with 1-year expiration', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      const cookieHeader = response.headers['set-cookie'][0];
      expect(cookieHeader).toMatch(/Max-Age=31536000/); // 365 * 24 * 60 * 60 seconds
    });

    it('should maintain user ID consistency across multiple requests', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);
      
      // First request - should generate new user ID
      const firstResponse = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      const cookieHeader = firstResponse.headers['set-cookie'][0];
      const userIdMatch = cookieHeader.match(/venture_user_id=([^;]+)/);
      expect(userIdMatch).toBeTruthy();
      const userId = userIdMatch![1];

      // Second request with the same cookie - should use same user ID
      await request(app)
        .get('/api/business-analyses')
        .set('Cookie', `venture_user_id=${userId}`)
        .expect(200);

      // Verify both calls used the same user ID
      expect(minimalStorage.listAnalyses).toHaveBeenCalledTimes(2);
      expect(minimalStorage.listAnalyses).toHaveBeenNthCalledWith(1, userId);
      expect(minimalStorage.listAnalyses).toHaveBeenNthCalledWith(2, userId);
    });

    it('should handle malformed cookies gracefully', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', 'venture_user_id=malformed-cookie-value')
        .expect(200);

      // Should still work and use the malformed value as user ID
      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith('malformed-cookie-value');
    });

    it('should work with multiple cookies present', async () => {
      const userId = 'multi-cookie-user';
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      await request(app)
        .get('/api/business-analyses')
        .set('Cookie', `other_cookie=value; venture_user_id=${userId}; another_cookie=value2`)
        .expect(200);

      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith(userId);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle requests with invalid JSON', async () => {
      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      // Express should handle this automatically
      expect(response.body).toBeDefined();
    });

    it('should handle very long URLs', async () => {
      process.env.GEMINI_API_KEY = 'test-key';
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'Analysis of long URL' }]
            }
          }]
        })
      });

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
        id: 'long-url-analysis',
        userId: 'user-123',
        url: longUrl,
        summary: 'Analysis of long URL',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T00:00:00.000Z'
      });

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: longUrl })
        .expect(200);

      expect(response.body.url).toBe(longUrl);
    });

    it('should handle special characters in URLs', async () => {
      process.env.GEMINI_API_KEY = 'test-key';
      const specialUrl = 'https://example.com/path?query=value&special=ñáéíóú';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'Analysis with special chars' }]
            }
          }]
        })
      });

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
        id: 'special-char-analysis',
        userId: 'user-123',
        url: specialUrl,
        summary: 'Analysis with special chars',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T00:00:00.000Z'
      });

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: specialUrl })
        .expect(200);

      expect(response.body.url).toBe(specialUrl);
    });
  });
});