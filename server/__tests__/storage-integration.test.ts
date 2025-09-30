import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage, type CreateAnalysisInput } from '../minimal-storage';
import { type BusinessImprovement, type EnhancedStructuredAnalysis } from '@shared/schema';

describe('Storage Integration for Enhanced Analysis', () => {
  let storage: MemStorage;
  const userId = 'test-user-123';

  beforeEach(() => {
    storage = new MemStorage();
  });

  const mockEnhancedAnalysis: EnhancedStructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test audience',
      monetization: 'Test monetization'
    },
    market: {
      competitors: [{ name: 'Competitor 1' }],
      swot: {
        strengths: ['Strong brand'],
        weaknesses: ['Limited features'],
        opportunities: ['Market expansion'],
        threats: ['New competitors']
      }
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Insight 1'],
      nextActions: ['Action 1']
    },
    sources: []
  };

  const mockBusinessImprovement: BusinessImprovement = {
    twists: [
      'Add AI-powered recommendations',
      'Implement subscription model',
      'Create mobile app version'
    ],
    sevenDayPlan: [
      { day: 1, tasks: ['Research competitors', 'Define MVP scope'] },
      { day: 2, tasks: ['Create wireframes', 'Design database schema'] }
    ],
    generatedAt: new Date().toISOString()
  };

  it('should support complete workflow: create analysis, then add improvements', async () => {
    // Step 1: Create analysis without improvements
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      structured: mockEnhancedAnalysis
    };

    const analysis = await storage.createAnalysis(userId, input);
    expect(analysis.improvements).toBeUndefined();

    // Step 2: Add improvements to existing analysis
    const updatedAnalysis = await storage.updateAnalysisImprovements(
      userId,
      analysis.id,
      mockBusinessImprovement
    );

    expect(updatedAnalysis).not.toBeNull();
    expect(updatedAnalysis!.improvements).toEqual(mockBusinessImprovement);
    expect(updatedAnalysis!.id).toBe(analysis.id);

    // Step 3: Verify improvements can be retrieved
    const retrievedImprovements = await storage.getAnalysisImprovements(userId, analysis.id);
    expect(retrievedImprovements).toEqual(mockBusinessImprovement);

    // Step 4: Verify analysis list includes improvements
    const analyses = await storage.listAnalyses(userId);
    expect(analyses).toHaveLength(1);
    expect(analyses[0].improvements).toEqual(mockBusinessImprovement);
  });

  it('should handle analysis creation with improvements included', async () => {
    // Create analysis with improvements from the start
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4',
      structured: mockEnhancedAnalysis,
      improvements: mockBusinessImprovement
    };

    const analysis = await storage.createAnalysis(userId, input);
    
    expect(analysis.improvements).toEqual(mockBusinessImprovement);

    // Verify it can be retrieved
    const retrieved = await storage.getAnalysis(userId, analysis.id);
    expect(retrieved!.improvements).toEqual(mockBusinessImprovement);
  });

  it('should maintain backward compatibility with analyses without improvements', async () => {
    // Create old-style analysis
    const input: CreateAnalysisInput = {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'gpt-4'
    };

    const analysis = await storage.createAnalysis(userId, input);
    
    // Should work without errors
    expect(analysis.improvements).toBeUndefined();
    expect(analysis.structured).toBeUndefined();

    // Should be retrievable
    const retrieved = await storage.getAnalysis(userId, analysis.id);
    expect(retrieved).toEqual(analysis);

    // Should appear in list
    const analyses = await storage.listAnalyses(userId);
    expect(analyses).toContain(analysis);

    // Getting improvements should return null
    const improvements = await storage.getAnalysisImprovements(userId, analysis.id);
    expect(improvements).toBeNull();
  });

  it('should handle mixed analysis types in the same user account', async () => {
    // Create old-style analysis
    const oldInput: CreateAnalysisInput = {
      url: 'https://old-example.com',
      summary: 'Old analysis',
      model: 'gpt-3.5'
    };

    // Create new-style analysis with improvements
    const newInput: CreateAnalysisInput = {
      url: 'https://new-example.com',
      summary: 'New analysis',
      model: 'gpt-4',
      structured: mockEnhancedAnalysis,
      improvements: mockBusinessImprovement
    };

    const oldAnalysis = await storage.createAnalysis(userId, oldInput);
    const newAnalysis = await storage.createAnalysis(userId, newInput);

    // Both should be retrievable
    const analyses = await storage.listAnalyses(userId);
    expect(analyses).toHaveLength(2);

    // Verify old analysis has no improvements
    expect(oldAnalysis.improvements).toBeUndefined();
    const oldImprovements = await storage.getAnalysisImprovements(userId, oldAnalysis.id);
    expect(oldImprovements).toBeNull();

    // Verify new analysis has improvements
    expect(newAnalysis.improvements).toEqual(mockBusinessImprovement);
    const newImprovements = await storage.getAnalysisImprovements(userId, newAnalysis.id);
    expect(newImprovements).toEqual(mockBusinessImprovement);
  });
});