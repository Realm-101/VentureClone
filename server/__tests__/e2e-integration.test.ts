import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { registerRoutes } from '../routes';
import { userMiddleware } from '../middleware/user';
import { minimalStorage, createStorage, MemStorage, DbStorage } from '../minimal-storage';

// Mock the storage module to allow switching between implementations
vi.mock('../minimal-storage', async () => {
  const actual = await vi.importActual('../minimal-storage');
  return {
    ...actual,
    minimalStorage: {
      listAnalyses: vi.fn(),
      createAnalysis: vi.fn(),
      getAnalysis: vi.fn(),
      deleteAnalysis: vi.fn(),
    },
    createStorage: vi.fn(),
    MemStorage: actual.MemStorage,
    DbStorage: actual.DbStorage,
  };
});

// Mock fetch for AI API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('End-to-End Integration Tests', () => {
  let app: express.Application;
  let server: any;
  const originalEnv = process.env;

  beforeAll(async () => {
    // Set up Express app with middleware
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(userMiddleware);
    
    // Register routes
    server = await registerRoutes(app);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    mockFetch.mockClear();
    
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });
 
 describe('Complete User Flow: Paste URL → Analyze → Save → Display', () => {
    it('should complete full workflow from URL input to analysis display', async () => {
      // Setup: Configure environment for successful analysis
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      // Mock successful AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'This is a comprehensive business analysis of the provided URL. The business shows strong potential for cloning with moderate technical complexity.' }]
            }
          }]
        })
      });

      // Mock storage operations
      const mockAnalysis = {
        id: 'test-analysis-123',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'This is a comprehensive business analysis of the provided URL. The business shows strong potential for cloning with moderate technical complexity.',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysis);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockAnalysis]);

      // Step 1: User pastes URL and submits for analysis
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example-business.com' })
        .expect(200);

      // Verify analysis was created successfully
      expect(analyzeResponse.body).toMatchObject({
        id: 'test-analysis-123',
        url: 'https://example-business.com',
        summary: expect.stringContaining('comprehensive business analysis'),
        model: 'gemini:gemini-1.5-flash',
        createdAt: expect.any(String)
      });

      // Verify storage was called to save the analysis
      expect(minimalStorage.createAnalysis).toHaveBeenCalledWith(
        expect.any(String), // userId
        {
          url: 'https://example-business.com',
          summary: expect.stringContaining('comprehensive business analysis'),
          model: 'gemini:gemini-1.5-flash'
        }
      );

      // Step 2: User retrieves analysis list to see saved analysis
      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', analyzeResponse.headers['set-cookie'])
        .expect(200);

      // Verify the analysis appears in the list
      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0]).toMatchObject({
        id: 'test-analysis-123',
        url: 'https://example-business.com',
        summary: expect.stringContaining('comprehensive business analysis'),
        model: 'gemini:gemini-1.5-flash'
      });

      // Verify storage was called to retrieve analyses
      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith(expect.any(String));
    });

    it('should handle multiple analyses in chronological order', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      const mockAnalyses = [
        {
          id: 'analysis-2',
          userId: 'user-123',
          url: 'https://newer-business.com',
          summary: 'Newer business analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-02T12:00:00.000Z'
        },
        {
          id: 'analysis-1',
          userId: 'user-123',
          url: 'https://older-business.com',
          summary: 'Older business analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T12:00:00.000Z'
        }
      ];

      // Mock AI responses for both analyses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Older business analysis' }] } }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Newer business analysis' }] } }]
          })
        });

      vi.mocked(minimalStorage.createAnalysis)
        .mockResolvedValueOnce(mockAnalyses[1]) // First analysis (older)
        .mockResolvedValueOnce(mockAnalyses[0]); // Second analysis (newer)

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue(mockAnalyses);

      // Create first analysis
      const firstResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://older-business.com' })
        .expect(200);

      // Create second analysis using same session
      const secondResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://newer-business.com' })
        .set('Cookie', firstResponse.headers['set-cookie'])
        .expect(200);

      // Retrieve list - should show newer analysis first
      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', secondResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body).toHaveLength(2);
      expect(listResponse.body[0].url).toBe('https://newer-business.com');
      expect(listResponse.body[1].url).toBe('https://older-business.com');
    });
  });

  describe('Error Scenarios', () => {
    describe('Network Failures', () => {
      it('should handle network timeout gracefully', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        // Mock network timeout for both providers
        mockFetch
          .mockRejectedValueOnce(new Error('Network timeout'))
          .mockRejectedValueOnce(new Error('Network timeout'));

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body).toEqual({
          error: 'Both AI providers failed. Please check your API keys and try again.'
        });

        // Verify no storage operations were attempted
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should handle DNS resolution failures', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';

        // Mock DNS resolution failure
        mockFetch.mockRejectedValueOnce(new Error('getaddrinfo ENOTFOUND'));

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body.error).toContain('Both AI providers failed');
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should handle connection refused errors', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';

        // Mock connection refused
        mockFetch.mockRejectedValueOnce(new Error('connect ECONNREFUSED'));

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body.error).toContain('Both AI providers failed');
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });
    });

    describe('Invalid API Responses', () => {
      it('should handle malformed JSON responses from AI providers', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        // Mock malformed JSON responses
        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.reject(new Error('Unexpected token in JSON'))
          })
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.reject(new Error('Unexpected token in JSON'))
          });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body.error).toContain('Both AI providers failed');
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should handle empty response bodies from AI providers', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';

        // Mock empty response
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({})
        });

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValue({
          id: 'empty-response-analysis',
          userId: 'user-123',
          url: 'https://example.com',
          summary: 'Analysis could not be completed.',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T12:00:00.000Z'
        });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(200);

        expect(response.body.summary).toBe('Analysis could not be completed.');
      });

      it('should handle API rate limiting errors', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';
        process.env.OPENAI_API_KEY = 'test-openai-key';

        // Mock rate limiting responses
        mockFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
            json: () => Promise.resolve({ error: { message: 'Rate limit exceeded' } })
          });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body.error).toContain('Both AI providers failed');
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });

      it('should handle API authentication errors', async () => {
        process.env.GEMINI_API_KEY = 'invalid-key';
        process.env.OPENAI_API_KEY = 'invalid-key';

        // Mock authentication failures
        mockFetch
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
          })
          .mockResolvedValueOnce({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
          });

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body.error).toContain('Both AI providers failed');
        expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
      });
    });

    describe('Storage Failures', () => {
      it('should handle storage creation failures gracefully', async () => {
        process.env.GEMINI_API_KEY = 'test-gemini-key';

        // Mock successful AI response
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: { parts: [{ text: 'Successful analysis' }] }
            }]
          })
        });

        // Mock storage failure
        vi.mocked(minimalStorage.createAnalysis).mockRejectedValue(
          new Error('Database connection failed')
        );

        const response = await request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://example.com' })
          .expect(500);

        expect(response.body).toEqual({
          error: 'Failed to create business analysis'
        });
      });

      it('should handle storage retrieval failures gracefully', async () => {
        // Mock storage retrieval failure
        vi.mocked(minimalStorage.listAnalyses).mockRejectedValue(
          new Error('Database connection failed')
        );

        const response = await request(app)
          .get('/api/business-analyses')
          .expect(500);

        expect(response.body).toEqual({
          error: 'Failed to fetch business analyses'
        });
      });
    });
  });

  describe('Storage Switching Tests', () => {
    it('should work correctly with memory storage', async () => {
      // Test with memory storage (default)
      process.env.STORAGE = 'mem';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Create a new storage instance to test
      const memStorage = new MemStorage();
      vi.mocked(createStorage).mockReturnValue(memStorage);

      // Mock successful AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Memory storage test analysis' }] }
          }]
        })
      });

      // Test analysis creation
      const mockAnalysis = {
        id: 'mem-analysis-123',
        userId: 'user-456',
        url: 'https://memory-test.com',
        summary: 'Memory storage test analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      // Spy on the actual memory storage methods
      const createSpy = vi.spyOn(memStorage, 'createAnalysis').mockResolvedValue(mockAnalysis);
      const listSpy = vi.spyOn(memStorage, 'listAnalyses').mockResolvedValue([mockAnalysis]);

      // Test the flow
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://memory-test.com' })
        .expect(200);

      expect(analyzeResponse.body.summary).toBe('Memory storage test analysis');

      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', analyzeResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].summary).toBe('Memory storage test analysis');

      // Verify memory storage methods were called
      expect(createSpy).toHaveBeenCalled();
      expect(listSpy).toHaveBeenCalled();
    });

    it('should handle database storage configuration', async () => {
      // Test with database storage
      process.env.STORAGE = 'db';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Create a new storage instance to test
      const dbStorage = new DbStorage();
      vi.mocked(createStorage).mockReturnValue(dbStorage);

      // Mock database storage methods to throw "not implemented" errors
      const createSpy = vi.spyOn(dbStorage, 'createAnalysis')
        .mockRejectedValue(new Error('DbStorage not implemented yet - use STORAGE=mem for now'));
      const listSpy = vi.spyOn(dbStorage, 'listAnalyses')
        .mockRejectedValue(new Error('DbStorage not implemented yet - use STORAGE=mem for now'));

      // Test that database storage throws appropriate errors
      const listResponse = await request(app)
        .get('/api/business-analyses')
        .expect(500);

      expect(listResponse.body.error).toBe('Failed to fetch business analyses');
      expect(listSpy).toHaveBeenCalled();

      // Mock successful AI response for analysis test
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Database storage test' }] }
          }]
        })
      });

      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://database-test.com' })
        .expect(500);

      expect(analyzeResponse.body.error).toBe('Failed to create business analysis');
      expect(createSpy).toHaveBeenCalled();
    });

    it('should default to memory storage for unknown storage types', async () => {
      // Test with unknown storage type
      process.env.STORAGE = 'unknown';
      
      // The createStorage function should default to memory storage
      const memStorage = new MemStorage();
      vi.mocked(createStorage).mockReturnValue(memStorage);

      const listSpy = vi.spyOn(memStorage, 'listAnalyses').mockResolvedValue([]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(listSpy).toHaveBeenCalled();
    });

    it('should maintain data consistency within memory storage session', async () => {
      process.env.STORAGE = 'mem';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Use actual memory storage to test data persistence
      const memStorage = new MemStorage();
      vi.mocked(createStorage).mockReturnValue(memStorage);

      // Don't mock the storage methods - use real implementation
      vi.mocked(minimalStorage.createAnalysis).mockImplementation(
        (userId, record) => memStorage.createAnalysis(userId, record)
      );
      vi.mocked(minimalStorage.listAnalyses).mockImplementation(
        (userId) => memStorage.listAnalyses(userId)
      );

      // Mock AI responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'First analysis' }] } }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Second analysis' }] } }]
          })
        });

      // Create first analysis
      const firstResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://first.com' })
        .expect(200);

      // Create second analysis with same user session
      const secondResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://second.com' })
        .set('Cookie', firstResponse.headers['set-cookie'])
        .expect(200);

      // Verify both analyses are stored and retrieved
      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', secondResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body).toHaveLength(2);
      expect(listResponse.body.map((a: any) => a.url)).toContain('https://first.com');
      expect(listResponse.body.map((a: any) => a.url)).toContain('https://second.com');
    });
  });  describe
('Feature Flag Behavior Tests', () => {
    it('should work correctly with minimal features enabled (VITE_ENABLE_EXTRAS=0)', async () => {
      // Set minimal feature configuration
      process.env.VITE_ENABLE_EXTRAS = '0';
      process.env.STORAGE = 'mem';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock successful AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Minimal feature analysis' }] }
          }]
        })
      });

      const mockAnalysis = {
        id: 'minimal-analysis',
        userId: 'user-123',
        url: 'https://minimal-test.com',
        summary: 'Minimal feature analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysis);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockAnalysis]);

      // Test core functionality works with minimal features
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://minimal-test.com' })
        .expect(200);

      expect(analyzeResponse.body.summary).toBe('Minimal feature analysis');

      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', analyzeResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].summary).toBe('Minimal feature analysis');
    });

    it('should work correctly with full features enabled (VITE_ENABLE_EXTRAS=1)', async () => {
      // Set full feature configuration
      process.env.VITE_ENABLE_EXTRAS = '1';
      process.env.STORAGE = 'mem';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock successful AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Full feature analysis with advanced insights' }] }
          }]
        })
      });

      const mockAnalysis = {
        id: 'full-analysis',
        userId: 'user-123',
        url: 'https://full-test.com',
        summary: 'Full feature analysis with advanced insights',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysis);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockAnalysis]);

      // Test core functionality still works with full features
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://full-test.com' })
        .expect(200);

      expect(analyzeResponse.body.summary).toBe('Full feature analysis with advanced insights');

      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', analyzeResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0].summary).toBe('Full feature analysis with advanced insights');
    });

    it('should handle missing feature flag environment variable', async () => {
      // Remove feature flag environment variable
      delete process.env.VITE_ENABLE_EXTRAS;
      process.env.STORAGE = 'mem';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock successful AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Default configuration analysis' }] }
          }]
        })
      });

      const mockAnalysis = {
        id: 'default-analysis',
        userId: 'user-123',
        url: 'https://default-test.com',
        summary: 'Default configuration analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysis);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockAnalysis]);

      // Test that system works with default configuration
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://default-test.com' })
        .expect(200);

      expect(analyzeResponse.body.summary).toBe('Default configuration analysis');

      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', analyzeResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });

    it('should handle different environment combinations', async () => {
      // Test production-like environment
      process.env.NODE_ENV = 'production';
      process.env.VITE_ENABLE_EXTRAS = '0';
      process.env.STORAGE = 'mem';
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock successful AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: 'Production environment analysis' }] }
          }]
        })
      });

      const mockAnalysis = {
        id: 'prod-analysis',
        userId: 'user-123',
        url: 'https://production-test.com',
        summary: 'Production environment analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysis);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockAnalysis]);

      // Test functionality in production-like environment
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://production-test.com' })
        .expect(200);

      expect(analyzeResponse.body.summary).toBe('Production environment analysis');

      // Verify secure cookie is set in production
      const cookieHeader = analyzeResponse.headers['set-cookie']?.[0];
      if (cookieHeader) {
        expect(cookieHeader).toMatch(/Secure/);
      }
    });
  });

  describe('Session and User Management Integration', () => {
    it('should maintain user session across multiple requests', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock multiple AI responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'First session analysis' }] } }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Second session analysis' }] } }]
          })
        });

      const mockAnalyses = [
        {
          id: 'session-analysis-1',
          userId: 'session-user-123',
          url: 'https://first-session.com',
          summary: 'First session analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T12:00:00.000Z'
        },
        {
          id: 'session-analysis-2',
          userId: 'session-user-123',
          url: 'https://second-session.com',
          summary: 'Second session analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T12:30:00.000Z'
        }
      ];

      vi.mocked(minimalStorage.createAnalysis)
        .mockResolvedValueOnce(mockAnalyses[0])
        .mockResolvedValueOnce(mockAnalyses[1]);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue(mockAnalyses);

      // First request - should create new session
      const firstResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://first-session.com' })
        .expect(200);

      const sessionCookie = firstResponse.headers['set-cookie'];
      expect(sessionCookie).toBeDefined();

      // Second request - should use same session
      const secondResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://second-session.com' })
        .set('Cookie', sessionCookie)
        .expect(200);

      // Third request - retrieve analyses with same session
      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', sessionCookie)
        .expect(200);

      expect(listResponse.body).toHaveLength(2);
      
      // Verify all storage calls used the same user ID
      const createCalls = vi.mocked(minimalStorage.createAnalysis).mock.calls;
      expect(createCalls).toHaveLength(2);
      expect(createCalls[0][0]).toBe(createCalls[1][0]); // Same userId for both calls
    });

    it('should isolate data between different users', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock AI responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'User 1 analysis' }] } }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'User 2 analysis' }] } }]
          })
        });

      const user1Analysis = {
        id: 'user1-analysis',
        userId: 'user-1',
        url: 'https://user1-test.com',
        summary: 'User 1 analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      const user2Analysis = {
        id: 'user2-analysis',
        userId: 'user-2',
        url: 'https://user2-test.com',
        summary: 'User 2 analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis)
        .mockResolvedValueOnce(user1Analysis)
        .mockResolvedValueOnce(user2Analysis);

      // Mock different responses for different users
      vi.mocked(minimalStorage.listAnalyses)
        .mockImplementation(async (userId) => {
          if (userId === 'user-1') return [user1Analysis];
          if (userId === 'user-2') return [user2Analysis];
          return [];
        });

      // User 1 creates analysis
      const user1Response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://user1-test.com' })
        .expect(200);

      // User 2 creates analysis (different session)
      const user2Response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://user2-test.com' })
        .expect(200);

      // User 1 retrieves their analyses
      const user1ListResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', user1Response.headers['set-cookie'])
        .expect(200);

      // User 2 retrieves their analyses
      const user2ListResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', user2Response.headers['set-cookie'])
        .expect(200);

      // Verify data isolation
      expect(user1ListResponse.body).toHaveLength(1);
      expect(user1ListResponse.body[0].url).toBe('https://user1-test.com');

      expect(user2ListResponse.body).toHaveLength(1);
      expect(user2ListResponse.body[0].url).toBe('https://user2-test.com');
    });

    it('should handle cookie expiration and renewal', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      // Request without cookie - should create new session
      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      const cookieHeader = response.headers['set-cookie']?.[0];
      expect(cookieHeader).toBeDefined();
      expect(cookieHeader).toMatch(/venture_user_id=/);
      expect(cookieHeader).toMatch(/Max-Age=31536000/); // 1 year
      expect(cookieHeader).toMatch(/HttpOnly/);
      expect(cookieHeader).toMatch(/SameSite=Lax/);
    });

    it('should handle malformed or invalid cookies gracefully', async () => {
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([]);

      // Test with malformed cookie
      const response = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', 'venture_user_id=invalid-format-cookie')
        .expect(200);

      expect(response.body).toEqual([]);
      
      // Should still call storage with the malformed value
      expect(minimalStorage.listAnalyses).toHaveBeenCalledWith('invalid-format-cookie');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle concurrent requests from same user', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock multiple AI responses
      mockFetch
        .mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{ content: { parts: [{ text: 'Concurrent analysis' }] } }]
          })
        });

      const mockAnalyses = Array.from({ length: 3 }, (_, i) => ({
        id: `concurrent-analysis-${i}`,
        userId: 'concurrent-user',
        url: `https://concurrent-${i}.com`,
        summary: 'Concurrent analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      }));

      vi.mocked(minimalStorage.createAnalysis)
        .mockResolvedValueOnce(mockAnalyses[0])
        .mockResolvedValueOnce(mockAnalyses[1])
        .mockResolvedValueOnce(mockAnalyses[2]);

      // Create session first
      const sessionResponse = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      const sessionCookie = sessionResponse.headers['set-cookie'];

      // Make concurrent requests
      const concurrentRequests = [
        request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://concurrent-0.com' })
          .set('Cookie', sessionCookie),
        request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://concurrent-1.com' })
          .set('Cookie', sessionCookie),
        request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: 'https://concurrent-2.com' })
          .set('Cookie', sessionCookie)
      ];

      const responses = await Promise.all(concurrentRequests);

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.summary).toBe('Concurrent analysis');
      });

      expect(minimalStorage.createAnalysis).toHaveBeenCalledTimes(3);
    });

    it('should handle very large analysis responses', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Create a very large analysis response
      const largeAnalysis = 'A'.repeat(10000); // 10KB analysis

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: largeAnalysis }] }
          }]
        })
      });

      const mockAnalysisRecord = {
        id: 'large-analysis',
        userId: 'user-123',
        url: 'https://large-response.com',
        summary: largeAnalysis,
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysisRecord);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://large-response.com' })
        .expect(200);

      expect(response.body.summary).toBe(largeAnalysis);
      expect(response.body.summary.length).toBe(10000);
    });

    it('should handle special characters in URLs and responses', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const specialUrl = 'https://example.com/path?query=test&special=ñáéíóú&emoji=🚀';
      const specialAnalysis = 'Analysis with special characters: ñáéíóú and emojis: 🚀🎯💡';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: { parts: [{ text: specialAnalysis }] }
          }]
        })
      });

      const mockAnalysisRecord = {
        id: 'special-chars-analysis',
        userId: 'user-123',
        url: specialUrl,
        summary: specialAnalysis,
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysisRecord);
      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockAnalysisRecord]);

      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: specialUrl })
        .expect(200);

      expect(analyzeResponse.body.url).toBe(specialUrl);
      expect(analyzeResponse.body.summary).toBe(specialAnalysis);

      const listResponse = await request(app)
        .get('/api/business-analyses')
        .set('Cookie', analyzeResponse.headers['set-cookie'])
        .expect(200);

      expect(listResponse.body[0].url).toBe(specialUrl);
      expect(listResponse.body[0].summary).toBe(specialAnalysis);
    });

    it('should handle request timeout scenarios', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      // Mock slow responses that eventually timeout
      mockFetch
        .mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 100)
          )
        );

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://timeout-test.com' })
        .expect(500);

      expect(response.body.error).toContain('Both AI providers failed');
      expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
    });

    it('should maintain data integrity under stress', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock consistent AI responses
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{ content: { parts: [{ text: 'Stress test analysis' }] } }]
        })
      });

      // Create multiple analyses rapidly
      const stressTestPromises = Array.from({ length: 10 }, (_, i) => {
        const mockAnalysis = {
          id: `stress-analysis-${i}`,
          userId: 'stress-user',
          url: `https://stress-${i}.com`,
          summary: 'Stress test analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: `2024-01-01T12:${i.toString().padStart(2, '0')}:00.000Z`
        };

        vi.mocked(minimalStorage.createAnalysis).mockResolvedValueOnce(mockAnalysis);

        return request(app)
          .post('/api/business-analyses/analyze')
          .send({ url: `https://stress-${i}.com` });
      });

      const responses = await Promise.allSettled(stressTestPromises);

      // Most requests should succeed (allowing for some potential failures under stress)
      const successfulResponses = responses.filter(r => r.status === 'fulfilled');
      expect(successfulResponses.length).toBeGreaterThan(7); // At least 70% success rate

      // Verify storage was called for successful requests
      expect(minimalStorage.createAnalysis).toHaveBeenCalled();
    });
  });
});