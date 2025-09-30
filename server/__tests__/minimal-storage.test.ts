import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage, type AnalysisRecord, type CreateAnalysisInput } from '../minimal-storage';
import { type BusinessImprovement, type FirstPartyData, type EnhancedStructuredAnalysis } from '@shared/schema';

describe('MemStorage Enhanced Analysis Support', () => {
  let storage: MemStorage;
  const userId = 'test-user-123';

  beforeEach(() => {
    storage = new MemStorage();
  });

  const mockFirstPartyData: FirstPartyData = {
    title: 'Test Business',
    description: 'A test business description',
    h1: 'Welcome to Test Business',
    textSnippet: 'This is a snippet of the business content...',
    url: 'https://example.com'
  };

  const mockBusinessImprovement: BusinessImprovement = {
    twists: [
      'Add AI-powered recommendations',
      'Implement subscription model',
      'Create mobile app version'
    ],
    sevenDayPlan: [
      { day: 1, tasks: ['Research competitors', 'Define MVP scope', 'Set up development environment'] },
      { day: 2, tasks: ['Create wireframes', 'Design database schema'] },
      { day: 3, tasks: ['Implement core features', 'Set up authentication'] }
    ],
    generatedAt: new Date().toISOString()
  };

  const mockEnhancedAnalysis: EnhancedStructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test audience',
      monetization: 'Test monetization'
    },
    market: {
      competitors: [{ name: 'Competitor 1', url: 'https://competitor1.com' }],
      swot: {
        strengths: ['Strong brand'],
        weaknesses: ['Limited features'],
        opportunities: ['Market expansion'],
        threats: ['New competitors']
      }
    },
    technical: {
      techStack: ['React', 'Node.js'],
      confidence: 0.8,
      uiColors: ['#FF0000', '#00FF00'],
      keyPages: ['/home', '/about']
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Insight 1', 'Insight 2'],
      nextActions: ['Action 1', 'Action 2']
    },
    sources: [
      {
        url: 'https://example.com',
        excerpt: 'This is a test excerpt from the source'
      }
    ]
  };

  it('should create analysis with enhanced data including improvements', async () => {
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      structured: mockEnhancedAnalysis,
      firstPartyData: mockFirstPartyData,
      improvements: mockBusinessImprovement
    };

    const result = await storage.createAnalysis(userId, input);

    expect(result).toMatchObject({
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      userId,
      structured: mockEnhancedAnalysis,
      firstPartyData: mockFirstPartyData,
      improvements: mockBusinessImprovement
    });
    expect(result.id).toBeDefined();
    expect(result.createdAt).toBeDefined();
  });

  it('should create analysis without improvements (backward compatibility)', async () => {
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      structured: mockEnhancedAnalysis,
      firstPartyData: mockFirstPartyData
    };

    const result = await storage.createAnalysis(userId, input);

    expect(result).toMatchObject({
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      userId,
      structured: mockEnhancedAnalysis,
      firstPartyData: mockFirstPartyData
    });
    expect(result.improvements).toBeUndefined();
  });

  it('should update analysis with improvements', async () => {
    // First create an analysis without improvements
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      structured: mockEnhancedAnalysis,
      firstPartyData: mockFirstPartyData
    };

    const analysis = await storage.createAnalysis(userId, input);
    expect(analysis.improvements).toBeUndefined();

    // Then update it with improvements
    const updatedAnalysis = await storage.updateAnalysisImprovements(
      userId,
      analysis.id,
      mockBusinessImprovement
    );

    expect(updatedAnalysis).not.toBeNull();
    expect(updatedAnalysis!.improvements).toEqual(mockBusinessImprovement);
    expect(updatedAnalysis!.id).toBe(analysis.id);
  });

  it('should return null when updating improvements for non-existent analysis', async () => {
    const result = await storage.updateAnalysisImprovements(
      userId,
      'non-existent-id',
      mockBusinessImprovement
    );

    expect(result).toBeNull();
  });

  it('should retrieve analysis improvements', async () => {
    // Create analysis with improvements
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      improvements: mockBusinessImprovement
    };

    const analysis = await storage.createAnalysis(userId, input);
    
    // Retrieve improvements
    const improvements = await storage.getAnalysisImprovements(userId, analysis.id);

    expect(improvements).toEqual(mockBusinessImprovement);
  });

  it('should return null when getting improvements for analysis without improvements', async () => {
    // Create analysis without improvements
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4'
    };

    const analysis = await storage.createAnalysis(userId, input);
    
    // Try to retrieve improvements
    const improvements = await storage.getAnalysisImprovements(userId, analysis.id);

    expect(improvements).toBeNull();
  });

  it('should return null when getting improvements for non-existent analysis', async () => {
    const improvements = await storage.getAnalysisImprovements(userId, 'non-existent-id');
    expect(improvements).toBeNull();
  });

  it('should maintain backward compatibility with existing analysis records', async () => {
    // Create analysis with old structure (no enhanced fields)
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4'
    };

    const analysis = await storage.createAnalysis(userId, input);
    
    // Should work without errors
    expect(analysis.structured).toBeUndefined();
    expect(analysis.firstPartyData).toBeUndefined();
    expect(analysis.improvements).toBeUndefined();

    // Should be retrievable
    const retrieved = await storage.getAnalysis(userId, analysis.id);
    expect(retrieved).toEqual(analysis);

    // Should appear in list
    const analyses = await storage.listAnalyses(userId);
    expect(analyses).toContain(analysis);
  });
});