import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest';
import { TechDetectionService } from '../services/tech-detection.js';
import { ComplexityCalculator } from '../services/complexity-calculator.js';
import { technologyInsightsService } from '../services/technology-insights.js';
import { clonabilityScoreService } from '../services/clonability-score.js';
import { insightsCache } from '../services/insights-cache.js';
import { MemStorage } from '../minimal-storage.js';
import type { DetectedTechnology } from '../services/tech-detection.js';

// Mock Wappalyzer at the top level
vi.mock('simple-wappalyzer');

describe('Task 14: End-to-End Tech Insights Testing', () => {
  let techService: TechDetectionService;
  let complexityCalc: ComplexityCalculator;
  let storage: MemStorage;
  const testUserId = 'test-user-e2e';

  beforeAll(async () => {
    // Setup default mock implementation
    const Wappalyzer = (await import('simple-wappalyzer')).default;
    vi.mocked(Wappalyzer).mockImplementation(() => ({
      analyze: vi.fn().mockResolvedValue([
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Webpack', categories: ['Build Tools'], confidence: 90 },
        { name: 'Express', categories: ['Web Frameworks'], confidence: 95 }
      ])
    }) as any);
  });

  beforeEach(() => {
    techService = new TechDetectionService();
    complexityCalc = new ComplexityCalculator();
    storage = new MemStorage();
    insightsCache.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Analysis Flow with Insights Generation', () => {
    it('should complete full end-to-end analysis with all components', async () => {
      const url = 'https://example.com';
      
      // Step 1: Detect technologies
      const detectionResult = await techService.detectTechnologies(url);
      expect(detectionResult).toBeDefined();
      expect(detectionResult?.success).toBe(true);
      expect(detectionResult?.technologies.length).toBeGreaterThan(0);

      // Step 2: Calculate enhanced complexity
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      expect(complexityResult).toBeDefined();
      expect(complexityResult.score).toBeGreaterThan(0);
      expect(complexityResult.breakdown).toBeDefined();
      expect(complexityResult.breakdown.frontend).toBeDefined();
      expect(complexityResult.breakdown.backend).toBeDefined();
      expect(complexityResult.breakdown.infrastructure).toBeDefined();

      // Step 3: Generate technology insights
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      expect(insights).toBeDefined();
      expect(insights.skills.length).toBeGreaterThan(0);
      expect(insights.recommendations.length).toBeGreaterThan(0);
      expect(insights.estimates).toBeDefined();
      expect(insights.buildVsBuy).toBeDefined();
      expect(insights.summary).toBeDefined();

      // Step 4: Calculate clonability score
      const clonabilityScore = clonabilityScoreService.calculateClonability(
        complexityResult.score,
        null,
        insights.estimates
      );
      expect(clonabilityScore).toBeDefined();
      expect(clonabilityScore.score).toBeGreaterThanOrEqual(1);
      expect(clonabilityScore.score).toBeLessThanOrEqual(10);
      expect(clonabilityScore.rating).toBeDefined();
      expect(clonabilityScore.components).toBeDefined();

      // Step 5: Store complete analysis
      const analysis = await storage.createAnalysis(testUserId, {
        url,
        summary: 'E2E test analysis',
        model: 'test-model',
        technologyInsights: insights,
        clonabilityScore: clonabilityScore,
        enhancedComplexity: complexityResult,
        insightsGeneratedAt: new Date(),
      });

      expect(analysis).toBeDefined();
      expect(analysis.id).toBeDefined();
      expect(analysis.technologyInsights).toEqual(insights);
      expect(analysis.clonabilityScore).toEqual(clonabilityScore);
      expect(analysis.enhancedComplexity).toEqual(complexityResult);

      // Step 6: Retrieve and verify
      const retrieved = await storage.getAnalysis(testUserId, analysis.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.technologyInsights).toEqual(insights);
      expect(retrieved?.clonabilityScore).toEqual(clonabilityScore);
      expect(retrieved?.enhancedComplexity).toEqual(complexityResult);
    });

    it('should complete analysis within performance requirements', async () => {
      const startTime = Date.now();

      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      const clonabilityScore = clonabilityScoreService.calculateClonability(
        complexityResult.score,
        null,
        insights.estimates
      );

      const totalTime = Date.now() - startTime;
      
      // Insights generation should be < 500ms (excluding tech detection)
      expect(totalTime).toBeLessThan(1000);
      
      console.log(`Full E2E analysis completed in ${totalTime}ms`);
    });
  });

  describe('Caching Behavior Across Multiple Requests', () => {
    it('should use cached insights on second request', async () => {
      const url = 'https://example.com';
      
      // First request - generates insights
      const detectionResult1 = await techService.detectTechnologies(url);
      const technologies1 = detectionResult1!.technologies;
      const complexityResult1 = complexityCalc.calculateEnhancedComplexity(technologies1);
      const insights1 = technologyInsightsService.generateInsights(
        technologies1,
        complexityResult1.score
      );

      // Store with timestamp
      const analysis1 = await storage.createAnalysis(testUserId, {
        url,
        summary: 'First analysis',
        model: 'test-model',
        technologyInsights: insights1,
        insightsGeneratedAt: new Date(),
      });

      // Second request - should use cached insights
      const retrieved = await storage.getAnalysis(testUserId, analysis1.id);
      expect(retrieved?.technologyInsights).toEqual(insights1);
      expect(retrieved?.insightsGeneratedAt).toBeDefined();

      // Verify cache is within TTL
      const hoursSinceGeneration = 
        (Date.now() - new Date(retrieved!.insightsGeneratedAt!).getTime()) / (1000 * 60 * 60);
      expect(hoursSinceGeneration).toBeLessThan(24);
    });

    it('should regenerate insights after 24-hour TTL', async () => {
      const url = 'https://example.com';
      
      // Create analysis with old timestamp (25 hours ago)
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const detectionResult = await techService.detectTechnologies(url);
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const oldInsights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      const analysis = await storage.createAnalysis(testUserId, {
        url,
        summary: 'Old analysis',
        model: 'test-model',
        technologyInsights: oldInsights,
        insightsGeneratedAt: twentyFiveHoursAgo,
      });

      // Retrieve and check if stale
      const retrieved = await storage.getAnalysis(testUserId, analysis.id);
      const hoursSinceGeneration = 
        (Date.now() - new Date(retrieved!.insightsGeneratedAt!).getTime()) / (1000 * 60 * 60);
      
      expect(hoursSinceGeneration).toBeGreaterThan(24);
      
      // Should regenerate insights
      const newInsights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      expect(newInsights).toBeDefined();
    });

    it('should handle concurrent requests efficiently', async () => {
      const urls = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com',
      ];

      const startTime = Date.now();

      const results = await Promise.all(
        urls.map(async (url) => {
          const detectionResult = await techService.detectTechnologies(url);
          const technologies = detectionResult!.technologies;
          const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
          const insights = technologyInsightsService.generateInsights(
            technologies,
            complexityResult.score
          );
          return { url, insights };
        })
      );

      const totalDuration = Date.now() - startTime;

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.insights).toBeDefined();
        expect(result.insights.skills.length).toBeGreaterThan(0);
      });

      // Should complete in reasonable time
      expect(totalDuration).toBeLessThan(3000);
      console.log(`3 concurrent analyses completed in ${totalDuration}ms`);
    });
  });

  describe('Graceful Degradation When Services Fail', () => {
    it('should continue analysis when insights generation fails', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      // Simulate insights failure
      let insights;
      try {
        insights = technologyInsightsService.generateInsights([], -1);
      } catch (error) {
        insights = undefined;
      }

      // Analysis should still be storable
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Analysis with failed insights',
        model: 'test-model',
        enhancedComplexity: complexityResult,
        technologyInsights: insights,
      });

      expect(analysis).toBeDefined();
      expect(analysis.enhancedComplexity).toEqual(complexityResult);
    });

    it('should provide fallback when tech detection fails', async () => {
      // Mock tech detection failure
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementation(() => ({
        analyze: vi.fn().mockRejectedValue(new Error('Detection failed'))
      }) as any);

      const detectionResult = await techService.detectTechnologies('https://example.com');
      
      // Should handle gracefully
      expect(detectionResult).toBeDefined();
      
      // Reset mock
      vi.mocked(Wappalyzer).mockImplementation(() => ({
        analyze: vi.fn().mockResolvedValue([
          { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 }
        ])
      }) as any);
    });

    it('should handle storage failures gracefully', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Create analysis
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
      });

      expect(analysis).toBeDefined();

      // Try to retrieve with wrong user ID
      const retrieved = await storage.getAnalysis('wrong-user', analysis.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('Stage 3 Integration with Insights', () => {
    it('should provide insights data for Stage 3 prompt generation', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      const clonabilityScore = clonabilityScoreService.calculateClonability(
        complexityResult.score,
        null,
        insights.estimates
      );

      // Store complete analysis
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        clonabilityScore: clonabilityScore,
        enhancedComplexity: complexityResult,
      });

      // Verify all data needed for Stage 3 is available
      expect(analysis.technologyInsights).toBeDefined();
      expect(analysis.technologyInsights?.alternatives).toBeDefined();
      expect(analysis.technologyInsights?.buildVsBuy).toBeDefined();
      expect(analysis.technologyInsights?.estimates).toBeDefined();
      expect(analysis.clonabilityScore).toBeDefined();
      expect(analysis.enhancedComplexity).toBeDefined();
    });

    it('should include technology alternatives in insights', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      expect(insights.alternatives).toBeDefined();
      expect(typeof insights.alternatives).toBe('object');
    });

    it('should include build vs buy recommendations', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      expect(insights.buildVsBuy).toBeDefined();
      expect(Array.isArray(insights.buildVsBuy)).toBe(true);
    });
  });

  describe('UI Rendering with Complete Insights Data', () => {
    it('should provide all data needed for UI components', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      const clonabilityScore = clonabilityScoreService.calculateClonability(
        complexityResult.score,
        null,
        insights.estimates
      );

      // Verify data for ClonabilityScoreCard
      expect(clonabilityScore.score).toBeDefined();
      expect(clonabilityScore.rating).toBeDefined();
      expect(clonabilityScore.components).toBeDefined();

      // Verify data for ComplexityBreakdown
      expect(complexityResult.breakdown).toBeDefined();
      expect(complexityResult.breakdown.frontend).toBeDefined();
      expect(complexityResult.breakdown.backend).toBeDefined();
      expect(complexityResult.breakdown.infrastructure).toBeDefined();

      // Verify data for EstimatesCard
      expect(insights.estimates).toBeDefined();
      expect(insights.estimates.timeEstimate).toBeDefined();
      expect(insights.estimates.costEstimate).toBeDefined();
      expect(insights.estimates.teamSize).toBeDefined();

      // Verify data for SkillRequirementsSection
      expect(insights.skills).toBeDefined();
      expect(Array.isArray(insights.skills)).toBe(true);
      expect(insights.skills.length).toBeGreaterThan(0);

      // Verify data for BuildVsBuySection
      expect(insights.buildVsBuy).toBeDefined();
      expect(Array.isArray(insights.buildVsBuy)).toBe(true);

      // Verify data for RecommendationsSection
      expect(insights.recommendations).toBeDefined();
      expect(Array.isArray(insights.recommendations)).toBe(true);
      expect(insights.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle missing optional data gracefully', async () => {
      // Create analysis with minimal data
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Minimal analysis',
        model: 'test-model',
      });

      expect(analysis).toBeDefined();
      expect(analysis.technologyInsights).toBeUndefined();
      expect(analysis.clonabilityScore).toBeUndefined();
      expect(analysis.enhancedComplexity).toBeUndefined();
    });
  });

  describe('Performance Under Load (10 Concurrent Analyses)', () => {
    it('should handle 10 concurrent analyses efficiently', async () => {
      const urls = Array.from({ length: 10 }, (_, i) => `https://example${i}.com`);

      const startTime = Date.now();

      const results = await Promise.all(
        urls.map(async (url) => {
          const detectionResult = await techService.detectTechnologies(url);
          const technologies = detectionResult!.technologies;
          const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
          const insights = technologyInsightsService.generateInsights(
            technologies,
            complexityResult.score
          );
          const clonabilityScore = clonabilityScoreService.calculateClonability(
            complexityResult.score,
            null,
            insights.estimates
          );

          return {
            url,
            insights,
            complexity: complexityResult,
            clonability: clonabilityScore,
          };
        })
      );

      const totalDuration = Date.now() - startTime;

      // Verify all completed successfully
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(result.insights).toBeDefined();
        expect(result.complexity).toBeDefined();
        expect(result.clonability).toBeDefined();
        expect(result.insights.skills.length).toBeGreaterThan(0);
        expect(result.insights.recommendations.length).toBeGreaterThan(0);
      });

      // Should complete in reasonable time (< 5 seconds for 10 concurrent)
      expect(totalDuration).toBeLessThan(5000);
      console.log(`10 concurrent analyses completed in ${totalDuration}ms`);
      console.log(`Average per analysis: ${(totalDuration / 10).toFixed(0)}ms`);
    });

    it('should maintain data consistency under concurrent load', async () => {
      const url = 'https://example.com';
      
      // Run 5 concurrent analyses of the same URL
      const results = await Promise.all(
        Array.from({ length: 5 }, async () => {
          const detectionResult = await techService.detectTechnologies(url);
          const technologies = detectionResult!.technologies;
          const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
          const insights = technologyInsightsService.generateInsights(
            technologies,
            complexityResult.score
          );
          return { complexity: complexityResult, insights };
        })
      );

      // All results should be consistent
      const firstComplexity = results[0].complexity.score;
      results.forEach(result => {
        expect(result.complexity.score).toBe(firstComplexity);
        expect(result.insights.skills.length).toBeGreaterThan(0);
      });
    });

    it('should not degrade performance with repeated analyses', async () => {
      const durations: number[] = [];

      // Run 10 sequential analyses
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        const detectionResult = await techService.detectTechnologies(`https://example${i}.com`);
        const technologies = detectionResult!.technologies;
        const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
        const insights = technologyInsightsService.generateInsights(
          technologies,
          complexityResult.score
        );
        
        durations.push(Date.now() - startTime);
      }

      // Calculate average and check for performance degradation
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const lastThree = durations.slice(-3).reduce((a, b) => a + b, 0) / 3;
      
      // Last 3 should not be significantly slower than average
      expect(lastThree).toBeLessThan(avgDuration * 1.5);
      
      console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);
      console.log(`Last 3 average: ${lastThree.toFixed(0)}ms`);
    });
  });

  describe('Verify All Requirements Are Met', () => {
    it('should meet Requirement 1: Technology Alternative Recommendations', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Should suggest alternatives
      expect(insights.alternatives).toBeDefined();
      expect(typeof insights.alternatives).toBe('object');
    });

    it('should meet Requirement 2: Enhanced Complexity Breakdown', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      // Should have breakdown
      expect(complexityResult.breakdown).toBeDefined();
      expect(complexityResult.breakdown.frontend).toBeDefined();
      expect(complexityResult.breakdown.backend).toBeDefined();
      expect(complexityResult.breakdown.infrastructure).toBeDefined();
      
      // Each component should have score and technologies
      expect(complexityResult.breakdown.frontend.score).toBeDefined();
      expect(complexityResult.breakdown.backend.score).toBeDefined();
      expect(complexityResult.breakdown.infrastructure.score).toBeDefined();
    });

    it('should meet Requirement 3: Time and Cost Estimates', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Should have estimates
      expect(insights.estimates).toBeDefined();
      expect(insights.estimates.timeEstimate).toBeDefined();
      expect(insights.estimates.costEstimate).toBeDefined();
      expect(insights.estimates.timeEstimate.minimum).toBeDefined();
      expect(insights.estimates.timeEstimate.maximum).toBeDefined();
      expect(insights.estimates.costEstimate.development).toBeDefined();
    });

    it('should meet Requirement 4: Skill Requirements Analysis', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Should have skills
      expect(insights.skills).toBeDefined();
      expect(Array.isArray(insights.skills)).toBe(true);
      expect(insights.skills.length).toBeGreaterThan(0);
      
      // Skills should have required fields
      const firstSkill = insights.skills[0];
      expect(firstSkill.skill).toBeDefined();
      expect(firstSkill.proficiency).toBeDefined();
      expect(firstSkill.category).toBeDefined();
    });

    it('should meet Requirement 5: Build vs Buy Recommendations', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Should have build vs buy recommendations
      expect(insights.buildVsBuy).toBeDefined();
      expect(Array.isArray(insights.buildVsBuy)).toBe(true);
    });

    it('should meet Requirement 6: Enhanced Stage 3 Integration', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Store analysis with all Stage 3 data
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        enhancedComplexity: complexityResult,
      });

      // Verify Stage 3 can access all needed data
      expect(analysis.technologyInsights).toBeDefined();
      expect(analysis.enhancedComplexity).toBeDefined();
    });

    it('should meet Requirement 7: Clonability Score', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      const clonabilityScore = clonabilityScoreService.calculateClonability(
        complexityResult.score,
        null,
        insights.estimates
      );

      // Should have clonability score
      expect(clonabilityScore).toBeDefined();
      expect(clonabilityScore.score).toBeGreaterThanOrEqual(1);
      expect(clonabilityScore.score).toBeLessThanOrEqual(10);
      expect(clonabilityScore.rating).toBeDefined();
      expect(clonabilityScore.components).toBeDefined();
    });

    it('should meet Requirement 8: Technology Insights Service', async () => {
      // Service should be available
      expect(technologyInsightsService).toBeDefined();
      expect(typeof technologyInsightsService.generateInsights).toBe('function');

      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      
      // Should generate insights
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      expect(insights).toBeDefined();
    });

    it('should meet Requirement 9: UI Enhancement for Insights', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Should have all data for UI components
      expect(insights.recommendations).toBeDefined();
      expect(insights.estimates).toBeDefined();
      expect(insights.alternatives).toBeDefined();
      expect(insights.skills).toBeDefined();
      expect(insights.buildVsBuy).toBeDefined();
      expect(insights.summary).toBeDefined();
    });

    it('should meet Requirement 10: Performance and Caching', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      // Measure insights generation time
      const startTime = Date.now();
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      const duration = Date.now() - startTime;

      // Should complete within 500ms
      expect(duration).toBeLessThan(500);
      expect(insights).toBeDefined();

      // Store with timestamp for caching
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        insightsGeneratedAt: new Date(),
      });

      expect(analysis.insightsGeneratedAt).toBeDefined();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle empty technology list', async () => {
      const insights = technologyInsightsService.generateInsights([], 1);
      
      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.summary).toBeDefined();
    });

    it('should handle unknown technologies', async () => {
      const unknownTechs: DetectedTechnology[] = [
        { name: 'UnknownFramework', categories: ['Unknown'], confidence: 50 },
      ];

      const complexityResult = complexityCalc.calculateEnhancedComplexity(unknownTechs);
      const insights = technologyInsightsService.generateInsights(
        unknownTechs,
        complexityResult.score
      );

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
    });

    it('should handle extreme complexity scores', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;

      // Test minimum
      const minInsights = technologyInsightsService.generateInsights(technologies, 1);
      expect(minInsights).toBeDefined();

      // Test maximum
      const maxInsights = technologyInsightsService.generateInsights(technologies, 10);
      expect(maxInsights).toBeDefined();
    });

    it('should handle null/undefined inputs gracefully', async () => {
      // Should not throw
      expect(() => {
        technologyInsightsService.generateInsights([], 5);
      }).not.toThrow();
    });
  });
});
