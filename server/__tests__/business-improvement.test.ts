import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import express from 'express';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { BusinessImprovementService } from '../services/business-improvement.js';
import { BusinessImprovement, FirstPartyData, EnhancedStructuredAnalysis } from '../../shared/schema.js';
import { registerRoutes } from '../routes';
import { userMiddleware } from '../middleware/user';
import { minimalStorage } from '../minimal-storage';

// Mock AI Provider Service
const mockAIProvider = {
  generateStructuredContent: vi.fn(),
} as any;

// Mock the storage module
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
  };
});

// Mock fetch for first-party data extraction and AI calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BusinessImprovementService', () => {
  let service: BusinessImprovementService;
  let mockAnalysis: any;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BusinessImprovementService(mockAIProvider, { timeoutMs: 5000 });

    mockAnalysis = {
      overview: {
        valueProposition: "AI-powered business analysis tool",
        targetAudience: "Entrepreneurs and business analysts",
        monetization: "SaaS subscription model"
      },
      market: {
        competitors: [
          { name: "Competitor A", url: "https://competitor-a.com", notes: "Direct competitor" }
        ],
        swot: {
          strengths: ["AI integration", "User-friendly interface"],
          weaknesses: ["Limited market presence", "High competition"],
          opportunities: ["Growing AI market", "Enterprise adoption"],
          threats: ["Big tech competitors", "Market saturation"]
        }
      },
      technical: {
        techStack: ["React", "Node.js", "PostgreSQL"],
        confidence: 0.8,
        uiColors: ["#3B82F6", "#10B981"],
        keyPages: ["/dashboard", "/analysis", "/settings"]
      },
      data: {
        trafficEstimates: {
          value: "10,000 monthly visitors",
          source: "https://similarweb.com"
        },
        keyMetrics: [
          {
            name: "Monthly Active Users",
            value: "5,000",
            source: "https://analytics.com",
            asOf: "2024-01-01"
          }
        ]
      },
      synthesis: {
        summary: "Promising AI business analysis platform with growth potential",
        keyInsights: ["Strong technical foundation", "Clear market opportunity", "Need for better marketing"],
        nextActions: ["Improve SEO", "Add enterprise features", "Expand AI capabilities"]
      },
      sources: [
        {
          url: "https://example.com",
          excerpt: "AI-powered analysis platform for entrepreneurs"
        }
      ]
    };
  });

  describe('generateImprovement', () => {
    it('should generate valid business improvement with 3 twists and 7-day plan', async () => {
      const mockResponse = {
        twists: [
          "Add AI-powered competitor tracking with real-time alerts",
          "Implement collaborative analysis features for team workflows",
          "Create industry-specific analysis templates for faster insights"
        ],
        sevenDayPlan: [
          { day: 1, tasks: ["Research competitor APIs", "Define tracking metrics", "Set up project structure"] },
          { day: 2, tasks: ["Build competitor data collection", "Create alert system", "Test data accuracy"] },
          { day: 3, tasks: ["Implement real-time notifications", "Add user preferences", "Test alert delivery"] },
          { day: 4, tasks: ["Create competitor dashboard", "Add visualization charts", "Optimize performance"] },
          { day: 5, tasks: ["Polish user interface", "Add export features", "Implement user feedback"] },
          { day: 6, tasks: ["Conduct user testing", "Fix critical bugs", "Prepare documentation"] },
          { day: 7, tasks: ["Launch beta feature", "Monitor usage metrics", "Gather user feedback"] }
        ]
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(mockResponse);

      const result = await service.generateImprovement(mockAnalysis);

      expect(result).toMatchObject({
        twists: expect.arrayContaining([
          expect.stringMatching(/Add AI-powered competitor tracking/),
          expect.stringMatching(/collaborative analysis features/),
          expect.stringMatching(/industry-specific analysis templates/)
        ]),
        sevenDayPlan: expect.arrayContaining([
          expect.objectContaining({
            day: 1,
            tasks: expect.arrayContaining([
              expect.stringMatching(/Research competitor APIs/),
              expect.stringMatching(/Define tracking metrics/),
              expect.stringMatching(/Set up project structure/)
            ])
          })
        ]),
        generatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      expect(result.twists).toHaveLength(3);
      expect(result.sevenDayPlan).toHaveLength(7);
      expect(mockAIProvider.generateStructuredContent).toHaveBeenCalledWith(
        expect.stringContaining('Business Analysis:'),
        expect.objectContaining({
          type: 'object',
          properties: expect.objectContaining({
            twists: expect.objectContaining({ minItems: 3, maxItems: 3 }),
            sevenDayPlan: expect.objectContaining({ minItems: 7, maxItems: 7 })
          })
        }),
        expect.stringContaining('business strategy consultant')
      );
    });

    it('should include goal in prompt when provided', async () => {
      const mockResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          tasks: ["Task 1", "Task 2", "Task 3"]
        }))
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(mockResponse);

      const goal = "Increase user engagement by 50%";
      await service.generateImprovement(mockAnalysis, goal);

      expect(mockAIProvider.generateStructuredContent).toHaveBeenCalledWith(
        expect.stringContaining(`IMPROVEMENT GOAL: ${goal}`),
        expect.any(Object),
        expect.any(String)
      );
    });

    it('should handle timeout errors properly', async () => {
      const slowService = new BusinessImprovementService(mockAIProvider, { timeoutMs: 100 });
      
      mockAIProvider.generateStructuredContent.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 200))
      );

      await expect(slowService.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('Business improvement generation failed: Request timeout after 100ms');
    });

    it('should handle AI provider errors', async () => {
      mockAIProvider.generateStructuredContent.mockRejectedValue(
        new Error('AI service unavailable')
      );

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('Business improvement generation failed: AI generation error: AI service unavailable');
    });

    it('should handle empty AI response', async () => {
      mockAIProvider.generateStructuredContent.mockResolvedValue(null);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('Business improvement generation failed: AI generation error: AI provider returned empty response');
    });
  });

  describe('validation', () => {
    it('should reject improvement with wrong number of twists', async () => {
      const invalidResponse = {
        twists: ["Only one twist"],
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          tasks: ["Task 1", "Task 2", "Task 3"]
        }))
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: must have exactly 3 improvement twists');
    });

    it('should reject improvement with empty twists', async () => {
      const invalidResponse = {
        twists: ["Valid twist", "", "Another twist"],
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          tasks: ["Task 1", "Task 2", "Task 3"]
        }))
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: each twist must be a non-empty string');
    });

    it('should reject improvement with wrong number of days', async () => {
      const invalidResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: [
          { day: 1, tasks: ["Task 1", "Task 2", "Task 3"] },
          { day: 2, tasks: ["Task 1", "Task 2", "Task 3"] }
        ]
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: sevenDayPlan must have exactly 7 days');
    });

    it('should reject improvement with too many tasks per day', async () => {
      const invalidResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: [
          { day: 1, tasks: ["Task 1", "Task 2", "Task 3", "Task 4"] },
          ...Array.from({ length: 6 }, (_, i) => ({
            day: i + 2,
            tasks: ["Task 1", "Task 2", "Task 3"]
          }))
        ]
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: day 1 must have 1-3 tasks, got 4');
    });

    it('should reject improvement with no tasks for a day', async () => {
      const invalidResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: [
          { day: 1, tasks: [] },
          ...Array.from({ length: 6 }, (_, i) => ({
            day: i + 2,
            tasks: ["Task 1", "Task 2", "Task 3"]
          }))
        ]
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: day 1 must have 1-3 tasks, got 0');
    });

    it('should reject improvement with empty task strings', async () => {
      const invalidResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: [
          { day: 1, tasks: ["Valid task", "", "Another task"] },
          ...Array.from({ length: 6 }, (_, i) => ({
            day: i + 2,
            tasks: ["Task 1", "Task 2", "Task 3"]
          }))
        ]
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: day 1 tasks must be non-empty strings');
    });

    it('should reject improvement with incorrect day numbering', async () => {
      const invalidResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: [
          { day: 1, tasks: ["Task 1", "Task 2", "Task 3"] },
          { day: 3, tasks: ["Task 1", "Task 2", "Task 3"] }, // Should be day 2
          ...Array.from({ length: 5 }, (_, i) => ({
            day: i + 3,
            tasks: ["Task 1", "Task 2", "Task 3"]
          }))
        ]
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(invalidResponse);

      await expect(service.generateImprovement(mockAnalysis))
        .rejects
        .toThrow('validation failed: day 2 must have day property set to 2');
    });
  });

  describe('formatPlanForClipboard', () => {
    it('should format improvement plan for clipboard export', () => {
      const improvement: BusinessImprovement = {
        twists: [
          "Add AI-powered competitor tracking",
          "Implement collaborative features",
          "Create industry templates"
        ],
        sevenDayPlan: [
          { day: 1, tasks: ["Research APIs", "Define metrics", "Setup project"] },
          { day: 2, tasks: ["Build collection", "Create alerts", "Test accuracy"] }
        ],
        generatedAt: "2024-01-01T12:00:00.000Z"
      };

      const formatted = BusinessImprovementService.formatPlanForClipboard(improvement);

      expect(formatted).toContain('Business Improvement Plan');
      expect(formatted).toContain('Generated: 1/1/2024');
      expect(formatted).toContain('Improvement Angles:');
      expect(formatted).toContain('1. Add AI-powered competitor tracking');
      expect(formatted).toContain('2. Implement collaborative features');
      expect(formatted).toContain('3. Create industry templates');
      expect(formatted).toContain('7-Day Shipping Plan:');
      expect(formatted).toContain('Day 1:');
      expect(formatted).toContain('  • Research APIs');
      expect(formatted).toContain('  • Define metrics');
      expect(formatted).toContain('  • Setup project');
      expect(formatted).toContain('Day 2:');
      expect(formatted).toContain('  • Build collection');
      expect(formatted).toContain('  • Create alerts');
      expect(formatted).toContain('  • Test accuracy');
    });
  });

  describe('prompt generation', () => {
    it('should create comprehensive improvement prompt with analysis data', async () => {
      const mockResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          tasks: ["Task 1", "Task 2", "Task 3"]
        }))
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(mockResponse);

      await service.generateImprovement(mockAnalysis);

      const [prompt] = mockAIProvider.generateStructuredContent.mock.calls[0];

      expect(prompt).toContain('Value Proposition: AI-powered business analysis tool');
      expect(prompt).toContain('Target Audience: Entrepreneurs and business analysts');
      expect(prompt).toContain('Monetization: SaaS subscription model');
      expect(prompt).toContain('Competitors: Competitor A');
      expect(prompt).toContain('Strengths: AI integration, User-friendly interface');
      expect(prompt).toContain('Weaknesses: Limited market presence, High competition');
      expect(prompt).toContain('Tech Stack: React, Node.js, PostgreSQL');
      expect(prompt).toContain('Key Insights: Strong technical foundation, Clear market opportunity, Need for better marketing');
      expect(prompt).toContain('Summary: Promising AI business analysis platform with growth potential');
    });

    it('should handle missing technical data gracefully', async () => {
      const analysisWithoutTechnical = {
        ...mockAnalysis,
        technical: undefined
      };

      const mockResponse = {
        twists: ["Twist 1", "Twist 2", "Twist 3"],
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          tasks: ["Task 1", "Task 2", "Task 3"]
        }))
      };

      mockAIProvider.generateStructuredContent.mockResolvedValue(mockResponse);

      await service.generateImprovement(analysisWithoutTechnical);

      const [prompt] = mockAIProvider.generateStructuredContent.mock.calls[0];
      expect(prompt).toContain('Technical details not available');
    });
  });
});

// Enhanced Analysis Flow Integration Tests
describe('Enhanced Analysis Flow Integration Tests', () => {
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

  describe('Complete Enhanced Analysis Flow with First-Party Data', () => {
    it('should complete full workflow with first-party data extraction and structured analysis', async () => {
      // Setup environment
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      
      // Mock first-party data extraction
      const mockFirstPartyData: FirstPartyData = {
        title: 'AI Business Analysis Platform',
        description: 'Comprehensive business analysis using AI technology',
        h1: 'Transform Your Business Analysis',
        textSnippet: 'Our AI-powered platform helps entrepreneurs analyze business opportunities with precision and speed.',
        url: 'https://example-business.com'
      };

      // Mock successful first-party data fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(`
          <html>
            <head>
              <title>${mockFirstPartyData.title}</title>
              <meta name="description" content="${mockFirstPartyData.description}">
            </head>
            <body>
              <h1>${mockFirstPartyData.h1}</h1>
              <p>${mockFirstPartyData.textSnippet}</p>
            </body>
          </html>
        `)
      });

      // Mock enhanced structured analysis response
      const mockEnhancedAnalysis: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'AI-powered business analysis for entrepreneurs',
          targetAudience: 'Entrepreneurs and business analysts',
          monetization: 'SaaS subscription model'
        },
        market: {
          competitors: [
            { name: 'Competitor A', url: 'https://competitor-a.com', notes: 'Direct competitor' }
          ],
          swot: {
            strengths: ['AI integration', 'User-friendly interface'],
            weaknesses: ['Limited market presence'],
            opportunities: ['Growing AI market'],
            threats: ['Big tech competitors']
          }
        },
        technical: {
          techStack: ['React', 'Node.js', 'PostgreSQL'],
          confidence: 0.85,
          uiColors: ['#3B82F6', '#10B981'],
          keyPages: ['/dashboard', '/analysis']
        },
        data: {
          trafficEstimates: {
            value: '10,000 monthly visitors',
            source: 'https://similarweb.com'
          },
          keyMetrics: [
            {
              name: 'Monthly Active Users',
              value: '5,000',
              source: 'https://analytics.com',
              asOf: '2024-01-01'
            }
          ]
        },
        synthesis: {
          summary: 'Promising AI business analysis platform with strong technical foundation',
          keyInsights: ['Strong AI capabilities', 'Clear market opportunity'],
          nextActions: ['Improve marketing', 'Add enterprise features']
        },
        sources: [
          {
            url: 'https://example-business.com',
            excerpt: 'AI-powered platform helps entrepreneurs analyze business opportunities'
          }
        ]
      };

      // Mock AI response for enhanced analysis
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(mockEnhancedAnalysis) }]
            }
          }]
        })
      });

      // Mock storage operations
      const mockAnalysisRecord = {
        id: 'enhanced-analysis-123',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'Enhanced analysis with first-party data',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z',
        structured: mockEnhancedAnalysis,
        firstPartyData: mockFirstPartyData
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysisRecord);
      vi.mocked(minimalStorage.getAnalysis).mockResolvedValue(mockAnalysisRecord);

      // Step 1: Analyze URL with enhanced flow
      const analyzeResponse = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example-business.com' })
        .expect(200);

      // Verify enhanced analysis was created
      expect(analyzeResponse.body).toMatchObject({
        id: 'enhanced-analysis-123',
        url: 'https://example-business.com',
        summary: 'Enhanced analysis with first-party data',
        model: 'gemini:gemini-1.5-flash'
      });

      // Verify first-party data extraction was called
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example-business.com',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Mozilla')
          })
        })
      );

      // Verify storage was called with enhanced data
      expect(minimalStorage.createAnalysis).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          url: 'https://example-business.com',
          summary: expect.stringContaining('Enhanced analysis'),
          model: 'gemini:gemini-1.5-flash'
        })
      );
    });

    it('should handle first-party data extraction failures gracefully', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock failed first-party data fetch
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      // Mock fallback AI analysis without first-party data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'Fallback analysis without first-party data' }]
            }
          }]
        })
      });

      const mockAnalysisRecord = {
        id: 'fallback-analysis-123',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'Fallback analysis without first-party data',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysisRecord);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example-business.com' })
        .expect(200);

      expect(response.body.summary).toBe('Fallback analysis without first-party data');
      
      // Verify fallback behavior worked
      expect(minimalStorage.createAnalysis).toHaveBeenCalled();
    });
  });

  describe('Business Improvement Generation Integration', () => {
    it('should generate improvements for existing enhanced analysis', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock existing enhanced analysis
      const mockEnhancedAnalysis = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'Existing enhanced analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z',
        structured: {
          overview: {
            valueProposition: 'AI-powered business analysis',
            targetAudience: 'Entrepreneurs',
            monetization: 'SaaS model'
          },
          market: {
            competitors: [{ name: 'Competitor A' }],
            swot: {
              strengths: ['AI integration'],
              weaknesses: ['Limited presence'],
              opportunities: ['Growing market'],
              threats: ['Competition']
            }
          },
          synthesis: {
            summary: 'Strong potential for growth',
            keyInsights: ['AI advantage', 'Market opportunity'],
            nextActions: ['Improve marketing', 'Add features']
          },
          sources: []
        }
      };

      vi.mocked(minimalStorage.getAnalysis).mockResolvedValue(mockEnhancedAnalysis);

      // Mock improvement generation response
      const mockImprovement: BusinessImprovement = {
        twists: [
          'Add real-time competitor tracking',
          'Implement collaborative analysis features',
          'Create industry-specific templates'
        ],
        sevenDayPlan: [
          { day: 1, tasks: ['Research competitor APIs', 'Define tracking metrics'] },
          { day: 2, tasks: ['Build data collection', 'Create alert system'] },
          { day: 3, tasks: ['Implement notifications', 'Add user preferences'] },
          { day: 4, tasks: ['Create dashboard', 'Add visualizations'] },
          { day: 5, tasks: ['Polish UI', 'Add export features'] },
          { day: 6, tasks: ['Conduct testing', 'Fix bugs'] },
          { day: 7, tasks: ['Launch beta', 'Monitor metrics'] }
        ],
        generatedAt: '2024-01-01T12:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(mockImprovement) }]
            }
          }]
        })
      });

      const response = await request(app)
        .post('/api/business-analyses/550e8400-e29b-41d4-a716-446655440000/improve')
        .send({ goal: 'Increase user engagement by 50%' })
        .expect(200);

      expect(response.body).toMatchObject({
        twists: expect.arrayContaining([
          expect.stringContaining('competitor tracking'),
          expect.stringContaining('collaborative'),
          expect.stringContaining('templates')
        ]),
        sevenDayPlan: expect.arrayContaining([
          expect.objectContaining({
            day: 1,
            tasks: expect.arrayContaining([
              expect.stringContaining('Research'),
              expect.stringContaining('Define')
            ])
          })
        ]),
        generatedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      });

      // Verify analysis was retrieved
      expect(minimalStorage.getAnalysis).toHaveBeenCalledWith('user-456', '550e8400-e29b-41d4-a716-446655440000');
    });

    it('should handle improvement generation for analysis without structured data', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock analysis without structured data (backward compatibility)
      const mockLegacyAnalysis = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'Legacy analysis without structured data',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
        // No structured field
      };

      vi.mocked(minimalStorage.getAnalysis).mockResolvedValue(mockLegacyAnalysis);

      // Mock improvement generation for legacy analysis
      const mockImprovement: BusinessImprovement = {
        twists: [
          'Add structured analysis capabilities',
          'Implement data visualization',
          'Create export functionality'
        ],
        sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
          day: i + 1,
          tasks: ['Task 1', 'Task 2', 'Task 3']
        })),
        generatedAt: '2024-01-01T12:00:00.000Z'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: JSON.stringify(mockImprovement) }]
            }
          }]
        })
      });

      const response = await request(app)
        .post('/api/business-analyses/550e8400-e29b-41d4-a716-446655440001/improve')
        .expect(200);

      expect(response.body.twists).toHaveLength(3);
      expect(response.body.sevenDayPlan).toHaveLength(7);

      // Verify backward compatibility worked
      expect(minimalStorage.getAnalysis).toHaveBeenCalledWith('user-456', '550e8400-e29b-41d4-a716-446655440001');
    });
  });

  describe('Error Scenarios and Fallback Behavior', () => {
    it('should handle AI provider failures during enhanced analysis', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      // Mock successful first-party data extraction
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><head><title>Test</title></head><body><h1>Test</h1></body></html>')
      });

      // Mock AI provider failures
      mockFetch
        .mockRejectedValueOnce(new Error('Gemini API error'))
        .mockRejectedValueOnce(new Error('OpenAI API error'));

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example-business.com' })
        .expect(500);

      expect(response.body.error).toContain('Both AI providers failed');
      expect(minimalStorage.createAnalysis).not.toHaveBeenCalled();
    });

    it('should handle malformed structured analysis responses', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock first-party data extraction
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('<html><head><title>Test</title></head><body><h1>Test</h1></body></html>')
      });

      // Mock malformed AI response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          candidates: [{
            content: {
              parts: [{ text: 'Invalid JSON response' }]
            }
          }]
        })
      });

      const mockAnalysisRecord = {
        id: 'malformed-analysis-123',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'Analysis with parsing fallback',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(minimalStorage.createAnalysis).mockResolvedValue(mockAnalysisRecord);

      const response = await request(app)
        .post('/api/business-analyses/analyze')
        .send({ url: 'https://example-business.com' })
        .expect(200);

      // Should still create analysis even with parsing errors
      expect(response.body.summary).toBe('Analysis with parsing fallback');
      expect(minimalStorage.createAnalysis).toHaveBeenCalled();
    });

    it('should handle improvement generation failures gracefully', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      const mockAnalysis = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'Test analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z',
        structured: {
          overview: { valueProposition: 'Test', targetAudience: 'Test', monetization: 'Test' },
          market: { competitors: [], swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] } },
          synthesis: { summary: 'Test', keyInsights: [], nextActions: [] },
          sources: []
        }
      };

      vi.mocked(minimalStorage.getAnalysis).mockResolvedValue(mockAnalysis);

      // Mock AI failure
      mockFetch.mockRejectedValueOnce(new Error('AI service unavailable'));

      const response = await request(app)
        .post('/api/business-analyses/550e8400-e29b-41d4-a716-446655440002/improve')
        .expect(500);

      expect(response.body.error).toContain('Failed to generate business improvement');
    });
  });

  describe('Backward Compatibility Tests', () => {
    it('should work with existing analysis records without enhanced fields', async () => {
      process.env.GEMINI_API_KEY = 'test-gemini-key';

      // Mock legacy analysis record
      const mockLegacyAnalysis = {
        id: 'legacy-123',
        userId: 'user-456',
        url: 'https://legacy-business.com',
        summary: 'Legacy business analysis without enhanced fields',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
        // Missing: structured, firstPartyData, improvements
      };

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue([mockLegacyAnalysis]);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        id: 'legacy-123',
        url: 'https://legacy-business.com',
        summary: 'Legacy business analysis without enhanced fields'
      });

      // Should not have enhanced fields but still work
      expect(response.body[0].structured).toBeUndefined();
      expect(response.body[0].firstPartyData).toBeUndefined();
    });

    it('should handle mixed analysis records (legacy and enhanced)', async () => {
      const mockMixedAnalyses = [
        {
          id: 'enhanced-123',
          userId: 'user-456',
          url: 'https://enhanced-business.com',
          summary: 'Enhanced analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-02T12:00:00.000Z',
          structured: {
            overview: { valueProposition: 'Enhanced', targetAudience: 'Users', monetization: 'SaaS' },
            market: { competitors: [], swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] } },
            synthesis: { summary: 'Enhanced', keyInsights: [], nextActions: [] },
            sources: []
          }
        },
        {
          id: 'legacy-123',
          userId: 'user-456',
          url: 'https://legacy-business.com',
          summary: 'Legacy analysis',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T12:00:00.000Z'
          // No structured field
        }
      ];

      vi.mocked(minimalStorage.listAnalyses).mockResolvedValue(mockMixedAnalyses);

      const response = await request(app)
        .get('/api/business-analyses')
        .expect(200);

      expect(response.body).toHaveLength(2);
      
      // Enhanced analysis should have structured data
      const enhancedAnalysis = response.body.find((a: any) => a.id === 'enhanced-123');
      expect(enhancedAnalysis.structured).toBeDefined();
      
      // Legacy analysis should not have structured data
      const legacyAnalysis = response.body.find((a: any) => a.id === 'legacy-123');
      expect(legacyAnalysis.structured).toBeUndefined();
    });
  });
});