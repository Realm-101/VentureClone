import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TechnologyInsightsService } from '../services/technology-insights.js';
import { technologyKnowledgeBase } from '../services/technology-knowledge-base.js';
import { insightsCache } from '../services/insights-cache.js';
import type { DetectedTechnology } from '../services/tech-detection.js';

describe('Task 13: Error Handling and Graceful Degradation', () => {
  let service: TechnologyInsightsService;

  beforeEach(() => {
    service = new TechnologyInsightsService();
    // Clear cache before each test
    insightsCache.clear();
    // Ensure knowledge base is loaded
    if (!technologyKnowledgeBase.isDataLoaded()) {
      technologyKnowledgeBase.loadData();
    }
  });

  describe('Retry Logic', () => {
    it('should retry on transient failures', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock a transient failure by temporarily breaking the knowledge base
      const originalGetTechnology = technologyKnowledgeBase.getTechnology;
      let callCount = 0;
      
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation((name: string) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Transient failure');
        }
        return originalGetTechnology.call(technologyKnowledgeBase, name);
      });

      // Should succeed after retry
      const insights = service.generateInsights(technologies, 5);
      
      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(callCount).toBeGreaterThan(1); // Verify retry happened
      
      vi.restoreAllMocks();
    });

    it('should fall back to basic insights after max retries', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock persistent failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Persistent failure');
      });

      // Should return fallback insights
      const insights = service.generateInsights(technologies, 5);
      
      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.recommendations.some(r => 
        r.title === 'Limited Insights Available'
      )).toBe(true);
      
      vi.restoreAllMocks();
    });
  });

  describe('Fallback Insights', () => {
    it('should provide basic skills when knowledge base fails', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
        { name: 'Node.js', categories: ['Backend'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Database'], confidence: 100 },
      ];

      // Mock knowledge base failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Knowledge base unavailable');
      });

      const insights = service.generateInsights(technologies, 5);
      
      expect(insights.skills).toBeDefined();
      expect(insights.skills.length).toBeGreaterThan(0);
      expect(insights.skills.some(s => s.category === 'Frontend')).toBe(true);
      expect(insights.skills.some(s => s.category === 'Backend')).toBe(true);
      expect(insights.skills.some(s => s.category === 'Database')).toBe(true);
      
      vi.restoreAllMocks();
    });

    it('should provide default estimates when calculation fails', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock knowledge base failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Knowledge base unavailable');
      });

      const insights = service.generateInsights(technologies, 5);
      
      expect(insights.estimates).toBeDefined();
      expect(insights.estimates.timeEstimate).toBeDefined();
      expect(insights.estimates.costEstimate).toBeDefined();
      expect(insights.estimates.teamSize).toBeDefined();
      expect(insights.estimates.timeEstimate.realistic).toBeTruthy();
      
      vi.restoreAllMocks();
    });

    it('should provide fallback recommendations', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock knowledge base failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Knowledge base unavailable');
      });

      const insights = service.generateInsights(technologies, 5);
      
      expect(insights.recommendations).toBeDefined();
      expect(insights.recommendations.length).toBeGreaterThan(0);
      
      // Should have limited insights notice
      const limitedInsightsRec = insights.recommendations.find(r => 
        r.title === 'Limited Insights Available'
      );
      expect(limitedInsightsRec).toBeDefined();
      expect(limitedInsightsRec?.priority).toBe('high');
      expect(limitedInsightsRec?.category).toBe('Notice');
      
      vi.restoreAllMocks();
    });

    it('should generate fallback summary', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
        { name: 'Node.js', categories: ['Backend'], confidence: 100 },
      ];

      // Mock knowledge base failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Knowledge base unavailable');
      });

      const insights = service.generateInsights(technologies, 5);
      
      expect(insights.summary).toBeDefined();
      expect(insights.summary).toContain('2 detected technologies');
      expect(insights.summary.length).toBeGreaterThan(0);
      
      vi.restoreAllMocks();
    });
  });

  describe('Minimal Insights', () => {
    it('should return minimal insights when even fallback fails', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock complete failure in both main and fallback paths
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Complete failure');
      });

      const insights = service.generateInsights(technologies, 5);
      
      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      // Should have fallback recommendation
      expect(insights.recommendations.some(r => 
        r.title === 'Limited Insights Available'
      )).toBe(true);
      
      vi.restoreAllMocks();
    });
  });

  describe('Structured Logging', () => {
    it('should log errors with structured format', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock persistent failure to trigger error logging
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Test error');
      });

      service.generateInsights(technologies, 5);
      
      // Should have logged error
      expect(consoleSpy).toHaveBeenCalled();
      
      // Check if log is structured JSON
      const logCalls = consoleSpy.mock.calls;
      const errorLog = logCalls.find(call => {
        try {
          const parsed = JSON.parse(call[0] as string);
          return parsed.service === 'technology-insights' && parsed.status === 'error';
        } catch {
          return false;
        }
      });
      
      expect(errorLog).toBeDefined();
      
      vi.restoreAllMocks();
    });

    it('should log successful generation with structured format', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      service.generateInsights(technologies, 5);
      
      // Should have logged success
      expect(consoleSpy).toHaveBeenCalled();
      
      // Check if log is structured JSON
      const logCalls = consoleSpy.mock.calls;
      const successLog = logCalls.find(call => {
        try {
          const parsed = JSON.parse(call[0] as string);
          return parsed.service === 'technology-insights' && parsed.status === 'success';
        } catch {
          return false;
        }
      });
      
      expect(successLog).toBeDefined();
      
      vi.restoreAllMocks();
    });
  });

  describe('Analysis Continues on Error', () => {
    it('should not throw error even when insights generation fails', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock complete failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Complete failure');
      });

      // Should not throw
      expect(() => {
        service.generateInsights(technologies, 5);
      }).not.toThrow();
      
      vi.restoreAllMocks();
    });

    it('should return valid insights structure even on error', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock failure
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation(() => {
        throw new Error('Failure');
      });

      const insights = service.generateInsights(technologies, 5);
      
      // Verify structure is valid
      expect(insights).toHaveProperty('alternatives');
      expect(insights).toHaveProperty('buildVsBuy');
      expect(insights).toHaveProperty('skills');
      expect(insights).toHaveProperty('estimates');
      expect(insights).toHaveProperty('recommendations');
      expect(insights).toHaveProperty('summary');
      
      expect(Array.isArray(insights.buildVsBuy)).toBe(true);
      expect(Array.isArray(insights.skills)).toBe(true);
      expect(Array.isArray(insights.recommendations)).toBe(true);
      
      vi.restoreAllMocks();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty technology list gracefully', () => {
      const insights = service.generateInsights([], 1);
      
      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
      expect(insights.estimates).toBeDefined();
    });

    it('should handle very high complexity scores', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
        { name: 'Node.js', categories: ['Backend'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Database'], confidence: 100 },
      ];

      const insights = service.generateInsights(technologies, 10);
      
      expect(insights).toBeDefined();
      expect(insights.estimates.teamSize.minimum).toBeGreaterThanOrEqual(2);
    });

    it('should handle very low complexity scores', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      const insights = service.generateInsights(technologies, 1);
      
      expect(insights).toBeDefined();
      expect(insights.estimates.teamSize.minimum).toBe(1);
    });

    it('should handle unknown technologies gracefully', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'UnknownTech123', categories: ['Unknown'], confidence: 50 },
      ];

      const insights = service.generateInsights(technologies, 5);
      
      expect(insights).toBeDefined();
      expect(insights.recommendations).toBeDefined();
    });
  });

  describe('Performance Under Error Conditions', () => {
    it('should complete within reasonable time even with retries', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['Frontend'], confidence: 100 },
      ];

      // Mock transient failure
      let callCount = 0;
      vi.spyOn(technologyKnowledgeBase, 'getTechnology').mockImplementation((name: string) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Transient failure');
        }
        return technologyKnowledgeBase.getTechnology(name);
      });

      const startTime = Date.now();
      service.generateInsights(technologies, 5);
      const duration = Date.now() - startTime;
      
      // Should complete within 2 seconds even with retries
      expect(duration).toBeLessThan(2000);
      
      vi.restoreAllMocks();
    });
  });
});
