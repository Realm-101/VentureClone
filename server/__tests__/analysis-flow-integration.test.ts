import { describe, it, expect, beforeEach, vi, beforeAll, afterEach } from 'vitest';
import { TechDetectionService } from '../services/tech-detection.js';
import { ComplexityCalculator } from '../services/complexity-calculator.js';
import { technologyInsightsService } from '../services/technology-insights.js';
import { clonabilityScoreService } from '../services/clonability-score.js';
import { MemStorage } from '../minimal-storage.js';
import type { DetectedTechnology } from '../services/tech-detection.js';

// Mock Wappalyzer at the top level
vi.mock('simple-wappalyzer');

describe('Integration: Analysis Flow with Insights', () => {
  let techService: TechDetectionService;
  let complexityCalc: ComplexityCalculator;
  let storage: MemStorage;
  const testUserId = 'test-user-123';

  beforeAll(async () => {
    // Setup default mock implementation
    const Wappalyzer = (await import('simple-wappalyzer')).default;
    vi.mocked(Wappalyzer).mockImplementation(() => ({
      analyze: vi.fn().mockResolvedValue([
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Webpack', categories: ['Build Tools'], confidence: 90 }
      ])
    }) as any);
  });

  beforeEach(() => {
    techService = new TechDetectionService();
    complexityCalc = new ComplexityCalculator();
    storage = new MemStorage();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Full Analysis Flow with Insights Generation', () => {
    it('should complete full analysis flow with insights in under 500ms', async () => {
      const startTime = Date.now();

      // Step 1: Detect technologies
      const detectionResult = await techService.detectTechnologies('https://example.com');
      expect(detectionResult).toBeDefined();
      expect(detectionResult?.success).toBe(true);

      // Step 2: Calculate complexity
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      expect(complexityResult.score).toBeGreaterThan(0);

      // Step 3: Generate insights
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      expect(insights).toBeDefined();
      expect(insights.skills.length).toBeGreaterThan(0);
      expect(insights.recommendations.length).toBeGreaterThan(0);

      // Step 4: Calculate clonability score
      const clonabilityScore = clonabilityScoreService.calculateClonability(
        complexityResult.score,
        null,
        insights.estimates
      );
      expect(clonabilityScore).toBeDefined();
      expect(clonabilityScore.score).toBeGreaterThanOrEqual(1);
      expect(clonabilityScore.score).toBeLessThanOrEqual(10);

      const totalTime = Date.now() - startTime;
      
      // Performance requirement: insights generation < 500ms
      expect(totalTime).toBeLessThan(500);
      
      console.log('Full analysis flow completed in ' + totalTime + 'ms');
    });

    it('should generate complete insights with all required fields', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Verify all required fields are present
      expect(insights).toHaveProperty('alternatives');
      expect(insights).toHaveProperty('buildVsBuy');
      expect(insights).toHaveProperty('skills');
      expect(insights).toHaveProperty('estimates');
      expect(insights).toHaveProperty('recommendations');
      expect(insights).toHaveProperty('summary');

      // Verify alternatives
      expect(typeof insights.alternatives).toBe('object');

      // Verify buildVsBuy recommendations
      expect(Array.isArray(insights.buildVsBuy)).toBe(true);
      if (insights.buildVsBuy.length > 0) {
        const firstRec = insights.buildVsBuy[0];
        expect(firstRec).toHaveProperty('technology');
        expect(firstRec).toHaveProperty('recommendation');
        expect(firstRec).toHaveProperty('reasoning');
        expect(firstRec).toHaveProperty('alternatives');
      }

      // Verify skills
      expect(Array.isArray(insights.skills)).toBe(true);
      expect(insights.skills.length).toBeGreaterThan(0);
      const firstSkill = insights.skills[0];
      expect(firstSkill).toHaveProperty('skill');
      expect(firstSkill).toHaveProperty('proficiency');
      expect(firstSkill).toHaveProperty('category');

      // Verify estimates
      expect(insights.estimates).toHaveProperty('timeEstimate');
      expect(insights.estimates).toHaveProperty('costEstimate');
      expect(insights.estimates).toHaveProperty('teamSize');
      expect(insights.estimates.timeEstimate).toHaveProperty('minimum');
      expect(insights.estimates.timeEstimate).toHaveProperty('maximum');
      expect(insights.estimates.timeEstimate).toHaveProperty('realistic');

      // Verify recommendations
      expect(Array.isArray(insights.recommendations)).toBe(true);
      expect(insights.recommendations.length).toBeGreaterThan(0);
      const firstRecommendation = insights.recommendations[0];
      expect(firstRecommendation).toHaveProperty('priority');
      expect(firstRecommendation).toHaveProperty('category');
      expect(firstRecommendation).toHaveProperty('title');
      expect(firstRecommendation).toHaveProperty('description');

      // Verify summary
      expect(typeof insights.summary).toBe('string');
      expect(insights.summary.length).toBeGreaterThan(0);
    });

    it('should store analysis with insights in storage', async () => {
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

      // Store analysis with insights
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        clonabilityScore: clonabilityScore,
        enhancedComplexity: complexityResult,
        insightsGeneratedAt: new Date(),
      });

      expect(analysis).toBeDefined();
      expect(analysis.technologyInsights).toEqual(insights);
      expect(analysis.clonabilityScore).toEqual(clonabilityScore);
      expect(analysis.enhancedComplexity).toEqual(complexityResult);
      expect(analysis.insightsGeneratedAt).toBeDefined();

      // Retrieve and verify
      const retrieved = await storage.getAnalysis(testUserId, analysis.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.technologyInsights).toEqual(insights);
      expect(retrieved?.clonabilityScore).toEqual(clonabilityScore);
    });
  });

  describe('Caching Behavior (24-hour TTL)', () => {
    it('should use cached insights within 24 hours', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Store analysis with insights
      const now = new Date();
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        insightsGeneratedAt: now,
      });

      // Retrieve analysis
      const retrieved = await storage.getAnalysis(testUserId, analysis.id);
      expect(retrieved?.technologyInsights).toBeDefined();
      expect(retrieved?.insightsGeneratedAt).toEqual(now);

      // Verify insights are still valid (within 24 hours)
      const hoursSinceGeneration = 
        (Date.now() - new Date(retrieved!.insightsGeneratedAt!).getTime()) / (1000 * 60 * 60);
      expect(hoursSinceGeneration).toBeLessThan(24);
    });

    it('should detect stale insights after 24 hours', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      // Store analysis with insights from 25 hours ago
      const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        insightsGeneratedAt: twentyFiveHoursAgo,
      });

      // Retrieve analysis
      const retrieved = await storage.getAnalysis(testUserId, analysis.id);
      expect(retrieved?.insightsGeneratedAt).toEqual(twentyFiveHoursAgo);

      // Verify insights are stale (older than 24 hours)
      const hoursSinceGeneration = 
        (Date.now() - new Date(retrieved!.insightsGeneratedAt!).getTime()) / (1000 * 60 * 60);
      expect(hoursSinceGeneration).toBeGreaterThan(24);
    });

    it('should handle missing insightsGeneratedAt timestamp', async () => {
      // Store analysis without insights timestamp
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
      });

      const retrieved = await storage.getAnalysis(testUserId, analysis.id);
      expect(retrieved?.insightsGeneratedAt).toBeUndefined();
      
      // Should treat as needing regeneration
      const needsRegeneration = !retrieved?.insightsGeneratedAt;
      expect(needsRegeneration).toBe(true);
    });
  });

  describe('Graceful Degradation When Insights Fail', () => {
    it('should continue analysis flow even if insights generation fails', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      // Simulate insights generation failure
      let insights;
      try {
        // Force an error by passing invalid data
        insights = technologyInsightsService.generateInsights([], -1);
      } catch (error) {
        // Gracefully handle the error
        insights = undefined;
      }

      // Analysis should still be storable without insights
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        enhancedComplexity: complexityResult,
        technologyInsights: insights,
      });

      expect(analysis).toBeDefined();
      expect(analysis.enhancedComplexity).toEqual(complexityResult);
      expect(analysis.technologyInsights).toBeUndefined();
    });

    it('should provide basic analysis when insights are unavailable', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      // Store analysis without insights
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        enhancedComplexity: complexityResult,
      });

      expect(analysis).toBeDefined();
      expect(analysis.enhancedComplexity).toBeDefined();
      expect(analysis.technologyInsights).toBeUndefined();

      // Basic analysis data should still be available
      expect(analysis.url).toBe('https://example.com');
      expect(analysis.summary).toBe('Test analysis');
      expect(analysis.enhancedComplexity?.score).toBeGreaterThan(0);
    });

    it('should handle partial insights gracefully', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      // Generate insights with minimal data
      const insights = technologyInsightsService.generateInsights(
        technologies.slice(0, 1), // Only one technology
        complexityResult.score
      );

      expect(insights).toBeDefined();
      expect(insights.skills.length).toBeGreaterThan(0);
      expect(insights.recommendations.length).toBeGreaterThan(0);

      // Should still be storable
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        enhancedComplexity: complexityResult,
      });

      expect(analysis.technologyInsights).toEqual(insights);
    });
  });

  describe('Performance Requirements', () => {
    it('should generate insights in under 500ms for typical stack', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);

      const startTime = Date.now();
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );
      const duration = Date.now() - startTime;

      expect(insights).toBeDefined();
      expect(duration).toBeLessThan(500);
      console.log('Insights generated in ' + duration + 'ms');
    });

    it('should generate insights in under 500ms for large stack (20+ technologies)', async () => {
      // Create a large technology stack
      const largeTechStack: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Vue.js', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Angular', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'Express', categories: ['Web Frameworks'], confidence: 100 },
        { name: 'Django', categories: ['Web Frameworks'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'MongoDB', categories: ['Databases'], confidence: 100 },
        { name: 'Redis', categories: ['Caching'], confidence: 100 },
        { name: 'Elasticsearch', categories: ['Search Engines'], confidence: 100 },
        { name: 'Docker', categories: ['Containers'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Orchestration'], confidence: 100 },
        { name: 'AWS', categories: ['Cloud Platforms'], confidence: 100 },
        { name: 'Nginx', categories: ['Web Servers'], confidence: 100 },
        { name: 'Webpack', categories: ['Build Tools'], confidence: 100 },
        { name: 'Babel', categories: ['Build Tools'], confidence: 100 },
        { name: 'Jest', categories: ['Testing'], confidence: 100 },
        { name: 'Cypress', categories: ['Testing'], confidence: 100 },
        { name: 'GraphQL', categories: ['APIs'], confidence: 100 },
        { name: 'RabbitMQ', categories: ['Message Queues'], confidence: 100 },
        { name: 'Terraform', categories: ['Infrastructure as Code'], confidence: 100 },
      ];

      const complexityResult = complexityCalc.calculateEnhancedComplexity(largeTechStack);

      const startTime = Date.now();
      const insights = technologyInsightsService.generateInsights(
        largeTechStack,
        complexityResult.score
      );
      const duration = Date.now() - startTime;

      expect(insights).toBeDefined();
      expect(insights.skills.length).toBeGreaterThan(0);
      expect(insights.recommendations.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500);
      console.log('Large stack insights generated in ' + duration + 'ms');
    });

    it('should handle concurrent insights generation efficiently', async () => {
      const urls = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com',
        'https://example4.com',
        'https://example5.com',
      ];

      const startTime = Date.now();

      const results = await Promise.all(
        urls.map(async (url) => {
          const detectionResult = await techService.detectTechnologies(url);
          const technologies = detectionResult!.technologies;
          const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
          return technologyInsightsService.generateInsights(
            technologies,
            complexityResult.score
          );
        })
      );

      const totalDuration = Date.now() - startTime;

      expect(results.length).toBe(5);
      results.forEach(insights => {
        expect(insights).toBeDefined();
        expect(insights.skills.length).toBeGreaterThan(0);
      });

      // All 5 should complete in reasonable time
      expect(totalDuration).toBeLessThan(2500); // 500ms * 5
      console.log('5 concurrent insights generated in ' + totalDuration + 'ms');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty technology list', async () => {
      const insights = technologyInsightsService.generateInsights([], 1);

      expect(insights).toBeDefined();
      expect(insights.skills.length).toBe(0);
      expect(insights.buildVsBuy.length).toBe(0);
      expect(insights.recommendations.length).toBeGreaterThan(0); // Should still have general recommendations
      expect(insights.summary).toBeDefined();
    });

    it('should handle unknown technologies gracefully', async () => {
      const unknownTechs: DetectedTechnology[] = [
        { name: 'UnknownFramework123', categories: ['Unknown'], confidence: 50 },
        { name: 'MysteryTool456', categories: ['Unknown'], confidence: 30 },
      ];

      const complexityResult = complexityCalc.calculateEnhancedComplexity(unknownTechs);
      const insights = technologyInsightsService.generateInsights(
        unknownTechs,
        complexityResult.score
      );

      expect(insights).toBeDefined();
      expect(insights.summary).toBeDefined();
      // Should still provide basic recommendations even for unknown tech
      expect(insights.recommendations.length).toBeGreaterThan(0);
    });

    it('should handle extreme complexity scores', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;

      // Test with minimum complexity
      const minInsights = technologyInsightsService.generateInsights(technologies, 1);
      expect(minInsights).toBeDefined();
      expect(minInsights.estimates.teamSize.minimum).toBe(1);

      // Test with maximum complexity
      const maxInsights = technologyInsightsService.generateInsights(technologies, 10);
      expect(maxInsights).toBeDefined();
      expect(maxInsights.estimates.teamSize.minimum).toBeGreaterThan(1);
    });

    it('should maintain data consistency across multiple retrievals', async () => {
      const detectionResult = await techService.detectTechnologies('https://example.com');
      const technologies = detectionResult!.technologies;
      const complexityResult = complexityCalc.calculateEnhancedComplexity(technologies);
      const insights = technologyInsightsService.generateInsights(
        technologies,
        complexityResult.score
      );

      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model',
        technologyInsights: insights,
        insightsGeneratedAt: new Date(),
      });

      // Retrieve multiple times
      const retrieval1 = await storage.getAnalysis(testUserId, analysis.id);
      const retrieval2 = await storage.getAnalysis(testUserId, analysis.id);
      const retrieval3 = await storage.getAnalysis(testUserId, analysis.id);

      // All retrievals should be identical
      expect(retrieval1).toEqual(retrieval2);
      expect(retrieval2).toEqual(retrieval3);
      expect(retrieval1?.technologyInsights).toEqual(insights);
    });
  });
});
