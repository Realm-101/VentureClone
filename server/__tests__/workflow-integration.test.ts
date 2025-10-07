import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { minimalStorage } from '../minimal-storage';
import { WorkflowService } from '../services/workflow';
import { AIProviderService } from '../services/ai-providers';

/**
 * Integration tests for workflow system
 * Tests stage generation with real analyses
 * Requirements: All (comprehensive testing)
 */

describe('Workflow Integration Tests', () => {
  const testUserId = 'test-user-workflow-integration';
  let testAnalysisId: string;
  let workflowService: WorkflowService;
  let aiProvider: AIProviderService;

  beforeAll(async () => {
    // Initialize services
    workflowService = new WorkflowService(minimalStorage);
    
    // Use Gemini for testing (or fallback to available provider)
    const apiKey = process.env.GEMINI_API_KEY || process.env.GROK_API_KEY || process.env.OPENAI_API_KEY;
    const provider = process.env.GEMINI_API_KEY ? 'gemini' : 
                     process.env.GROK_API_KEY ? 'grok' : 'openai';
    
    if (!apiKey) {
      throw new Error('No AI provider API key available for testing');
    }
    
    aiProvider = new AIProviderService(apiKey, provider as any, 30000);

    // Create a test analysis with structured data
    const testAnalysis = await minimalStorage.createAnalysis(testUserId, {
      url: 'https://example.com',
      summary: 'Test business for workflow testing',
      model: 'test-model',
      structured: {
        overview: {
          valueProposition: 'Provides online services',
          targetAudience: 'Small businesses',
          monetization: 'Subscription model'
        },
        market: {
          competitors: [{ name: 'Competitor A', url: 'https://competitor-a.com', notes: 'Main competitor' }],
          swot: {
            strengths: ['Strong brand', 'Good UX'],
            weaknesses: ['Limited features'],
            opportunities: ['Market expansion'],
            threats: ['New entrants']
          }
        },
        technical: {
          techStack: ['React', 'Node.js', 'PostgreSQL'],
          confidence: 0.8,
          uiColors: ['#000000', '#FFFFFF'],
          keyPages: ['/home', '/pricing']
        },
        data: {
          trafficEstimates: { value: '10K monthly', source: 'https://example.com' },
          keyMetrics: [
            { name: 'Users', value: '1000', source: 'https://example.com', asOf: '2024-01-01' }
          ]
        },
        synthesis: {
          summary: 'A promising business with good growth potential',
          keyInsights: ['Strong market fit', 'Scalable technology', 'Clear monetization'],
          nextActions: ['Validate demand', 'Build MVP', 'Launch marketing']
        }
      }
    });

    testAnalysisId = testAnalysis.id;
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      const analyses = await minimalStorage.listAnalyses(testUserId);
      for (const analysis of analyses) {
        // Note: minimalStorage doesn't have a delete method, so we'll leave test data
        // In production, implement proper cleanup
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

  describe('Stage 2: Lazy-Entrepreneur Filter', () => {
    it('should generate Stage 2 content with valid structure', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      expect(analysis).toBeDefined();

      // Get Stage 2 prompt
      const { prompt, systemPrompt } = workflowService.getStage2Prompt(analysis!);
      expect(prompt).toContain('Lazy-Entrepreneur Filter');
      expect(prompt).toContain('effortScore');
      expect(prompt).toContain('rewardScore');

      // Generate Stage 2 content
      const stage2Content = await aiProvider.generateStructuredContent(prompt, {}, systemPrompt);
      
      // Validate structure
      expect(stage2Content).toHaveProperty('effortScore');
      expect(stage2Content).toHaveProperty('rewardScore');
      expect(stage2Content).toHaveProperty('recommendation');
      expect(stage2Content).toHaveProperty('reasoning');
      expect(stage2Content).toHaveProperty('automationPotential');
      expect(stage2Content).toHaveProperty('resourceRequirements');
      expect(stage2Content).toHaveProperty('nextSteps');

      // Validate data types and ranges
      expect(stage2Content.effortScore).toBeGreaterThanOrEqual(1);
      expect(stage2Content.effortScore).toBeLessThanOrEqual(10);
      expect(stage2Content.rewardScore).toBeGreaterThanOrEqual(1);
      expect(stage2Content.rewardScore).toBeLessThanOrEqual(10);
      expect(['go', 'no-go', 'maybe']).toContain(stage2Content.recommendation);
      expect(stage2Content.automationPotential.score).toBeGreaterThanOrEqual(0);
      expect(stage2Content.automationPotential.score).toBeLessThanOrEqual(1);
      expect(Array.isArray(stage2Content.automationPotential.opportunities)).toBe(true);
      expect(Array.isArray(stage2Content.nextSteps)).toBe(true);

      console.log('Stage 2 Content Quality Check:', {
        effortScore: stage2Content.effortScore,
        rewardScore: stage2Content.rewardScore,
        recommendation: stage2Content.recommendation,
        automationScore: stage2Content.automationPotential.score,
        hasReasoning: stage2Content.reasoning.length > 50,
        opportunitiesCount: stage2Content.automationPotential.opportunities.length,
        nextStepsCount: stage2Content.nextSteps.length
      });
    }, 60000); // 60 second timeout for AI generation
  });

  describe('Stage 3: MVP Launch Planning', () => {
    it('should generate Stage 3 content with valid structure', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      expect(analysis).toBeDefined();

      // Get Stage 3 prompt
      const { prompt, systemPrompt } = workflowService.getStage3Prompt(analysis!);
      expect(prompt).toContain('MVP Launch Plan');
      expect(prompt).toContain('coreFeatures');
      expect(prompt).toContain('techStack');

      // Generate Stage 3 content
      const stage3Content = await aiProvider.generateStructuredContent(prompt, {}, systemPrompt);
      
      // Validate structure
      expect(stage3Content).toHaveProperty('coreFeatures');
      expect(stage3Content).toHaveProperty('niceToHaves');
      expect(stage3Content).toHaveProperty('techStack');
      expect(stage3Content).toHaveProperty('timeline');
      expect(stage3Content).toHaveProperty('estimatedCost');

      // Validate arrays and objects
      expect(Array.isArray(stage3Content.coreFeatures)).toBe(true);
      expect(stage3Content.coreFeatures.length).toBeGreaterThanOrEqual(3);
      expect(Array.isArray(stage3Content.niceToHaves)).toBe(true);
      expect(stage3Content.techStack).toHaveProperty('frontend');
      expect(stage3Content.techStack).toHaveProperty('backend');
      expect(stage3Content.techStack).toHaveProperty('infrastructure');
      expect(Array.isArray(stage3Content.timeline)).toBe(true);
      expect(stage3Content.timeline.length).toBeGreaterThanOrEqual(3);

      console.log('Stage 3 Content Quality Check:', {
        coreFeatureCount: stage3Content.coreFeatures.length,
        niceToHaveCount: stage3Content.niceToHaves.length,
        techStackComplete: !!(stage3Content.techStack.frontend && stage3Content.techStack.backend),
        timelinePhases: stage3Content.timeline.length,
        hasCostEstimate: stage3Content.estimatedCost.length > 0
      });
    }, 60000);
  });

  describe('Stage Progression', () => {
    it('should validate stage progression correctly', async () => {
      // Stage 1 should always be accessible
      const stage1Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 1);
      expect(stage1Valid.valid).toBe(true);

      // Stage 2 should be accessible (Stage 1 is auto-completed)
      const stage2Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 2);
      expect(stage2Valid.valid).toBe(true);

      // Stage 3 should NOT be accessible yet (Stage 2 not completed)
      const stage3Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 3);
      expect(stage3Valid.valid).toBe(false);
      expect(stage3Valid.reason).toContain('Stage 2');
    });

    it('should track completed stages correctly', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      const stages = analysis?.stages;
      
      const completedStages = workflowService.getCompletedStages(stages);
      expect(Array.isArray(completedStages)).toBe(true);
      
      const currentStage = workflowService.getCurrentStage(stages);
      expect(currentStage).toBeGreaterThanOrEqual(1);
      expect(currentStage).toBeLessThanOrEqual(6);
    });

    it('should get progress summary correctly', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      const stages = analysis?.stages;
      
      const progress = workflowService.getProgressSummary(stages);
      expect(progress).toHaveProperty('currentStage');
      expect(progress).toHaveProperty('completedStages');
      expect(progress).toHaveProperty('totalStages');
      expect(progress).toHaveProperty('isComplete');
      expect(progress).toHaveProperty('nextStage');
      expect(progress.totalStages).toBe(6);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid stage numbers', async () => {
      const result = await workflowService.validateStageProgression(testUserId, testAnalysisId, 0);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Invalid stage number');

      const result2 = await workflowService.validateStageProgression(testUserId, testAnalysisId, 7);
      expect(result2.valid).toBe(false);
      expect(result2.reason).toContain('Invalid stage number');
    });

    it('should handle non-existent analysis', async () => {
      const result = await workflowService.validateStageProgression(testUserId, 'non-existent-id', 2);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('not found');
    });

    it('should validate stage data structure', () => {
      const validData = { key: 'value', data: 'test' };
      const result = workflowService.validateStageData(2, validData);
      expect(result.valid).toBe(true);

      const emptyData = {};
      const result2 = workflowService.validateStageData(2, emptyData);
      expect(result2.valid).toBe(false);
      expect(result2.errors).toContain('Stage content cannot be empty');

      const nullData = null;
      const result3 = workflowService.validateStageData(2, nullData);
      expect(result3.valid).toBe(false);
      expect(result3.errors).toContain('Stage content must be an object');
    });
  });

  describe('Stage Navigation Flow (Task 15.1)', () => {
    it('should allow forward navigation through completed stages', async () => {
      // Stage 1 is auto-completed, so we should be able to navigate to Stage 2
      const stage2Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 2);
      expect(stage2Valid.valid).toBe(true);

      // Complete Stage 2 by saving stage data
      const stage2Data = {
        effortScore: 7,
        rewardScore: 8,
        recommendation: 'go',
        reasoning: 'Good opportunity with manageable effort',
        automationPotential: { score: 0.7, opportunities: ['API integration'] },
        resourceRequirements: { team: 2, budget: 10000 },
        nextSteps: ['Build MVP']
      };

      await minimalStorage.saveStageData(testUserId, testAnalysisId, 2, stage2Data);

      // Now Stage 3 should be accessible
      const stage3Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 3);
      expect(stage3Valid.valid).toBe(true);
    });

    it('should allow back navigation to any completed stage', async () => {
      // Get current analysis state
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      const stages = analysis?.stages;

      // Stage 1 should always be accessible (auto-completed)
      const stage1Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 1);
      expect(stage1Valid.valid).toBe(true);

      // If Stage 2 is completed, we should be able to navigate back to it
      if (stages && stages[2]) {
        const stage2Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 2);
        expect(stage2Valid.valid).toBe(true);
      }
    });

    it('should prevent navigation to incomplete stages', async () => {
      // Try to access Stage 6 without completing previous stages
      const stage6Valid = await workflowService.validateStageProgression(testUserId, testAnalysisId, 6);
      expect(stage6Valid.valid).toBe(false);
      expect(stage6Valid.reason).toBeDefined();
    });

    it('should track stage completion status correctly', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      const stages = analysis?.stages;

      // Check that completed stages are tracked
      const completedStages = workflowService.getCompletedStages(stages);
      expect(completedStages.length).toBeGreaterThanOrEqual(1); // At least Stage 1

      // Verify each completed stage has data
      for (const stageNum of completedStages) {
        expect(stages?.[stageNum]).toBeDefined();
        expect(stages?.[stageNum].stageData).toBeDefined();
      }
    });

    it('should handle stage progression with error states', async () => {
      // Test with invalid user ID
      const invalidUserResult = await workflowService.validateStageProgression('invalid-user', testAnalysisId, 2);
      expect(invalidUserResult.valid).toBe(false);

      // Test with invalid analysis ID
      const invalidAnalysisResult = await workflowService.validateStageProgression(testUserId, 'invalid-analysis', 2);
      expect(invalidAnalysisResult.valid).toBe(false);

      // Test with out-of-range stage number
      const invalidStageResult = await workflowService.validateStageProgression(testUserId, testAnalysisId, 99);
      expect(invalidStageResult.valid).toBe(false);
      expect(invalidStageResult.reason).toContain('Invalid stage number');
    });

    it('should update current stage indicator correctly', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      const stages = analysis?.stages;

      const currentStage = workflowService.getCurrentStage(stages);
      expect(currentStage).toBeGreaterThanOrEqual(1);
      expect(currentStage).toBeLessThanOrEqual(6);

      // Current stage should be the next incomplete stage
      const completedStages = workflowService.getCompletedStages(stages);
      if (completedStages.length < 6) {
        expect(currentStage).toBe(Math.max(...completedStages) + 1);
      } else {
        expect(currentStage).toBe(6);
      }
    });

    it('should provide accurate progress summary', async () => {
      const analysis = await minimalStorage.getAnalysis(testUserId, testAnalysisId);
      const stages = analysis?.stages;

      const progress = workflowService.getProgressSummary(stages);
      
      expect(progress.totalStages).toBe(6);
      expect(progress.completedStages).toBeGreaterThanOrEqual(0);
      expect(progress.completedStages).toBeLessThanOrEqual(6);
      expect(progress.currentStage).toBeGreaterThanOrEqual(1);
      expect(progress.currentStage).toBeLessThanOrEqual(6);
      
      // If all stages complete, isComplete should be true
      if (progress.completedStages === 6) {
        expect(progress.isComplete).toBe(true);
        expect(progress.nextStage).toBeNull();
      } else {
        expect(progress.isComplete).toBe(false);
        expect(progress.nextStage).toBeGreaterThan(progress.currentStage);
      }
    });
  });
});
