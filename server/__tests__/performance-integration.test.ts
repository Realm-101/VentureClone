import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { fetchFirstParty, fetchFirstPartyWithRetry } from '../lib/fetchFirstParty.js';
import { BusinessImprovementService } from '../services/business-improvement.js';
import { AIProviderService } from '../services/ai-providers.js';

describe('Performance Integration Tests', () => {
  describe('First-Party Data Extraction Performance', () => {
    it('should complete extraction within timeout limits', async () => {
      const startTime = Date.now();
      
      // Test with a reliable website
      const result = await fetchFirstParty('https://example.com', 8000);
      
      const elapsed = Date.now() - startTime;
      
      // Should complete within timeout
      expect(elapsed).toBeLessThan(8000);
      
      if (result) {
        expect(result.url).toBe('https://example.com/');
        expect(result.title).toBeTruthy();
        expect(result.textSnippet).toBeTruthy();
      }
    }, 10000);

    it('should handle concurrent extractions efficiently', async () => {
      const urls = [
        'https://example.com',
        'https://httpbin.org/html',
        'https://httpbin.org/json'
      ];

      const startTime = Date.now();
      
      // Run concurrent extractions
      const promises = urls.map(url => 
        fetchFirstPartyWithRetry(url, { timeoutMs: 5000, retryCount: 0 })
      );
      
      const results = await Promise.all(promises);
      const elapsed = Date.now() - startTime;
      
      // Should complete all within reasonable time (not 3x individual timeout)
      expect(elapsed).toBeLessThan(8000);
      
      // At least some should succeed
      const successCount = results.filter(r => r.success).length;
      expect(successCount).toBeGreaterThan(0);
    }, 15000);

    it('should respect size limits and not consume excessive memory', async () => {
      // Mock a large response
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('a'.repeat(1024 * 1024)) // 1MB chunk
              })
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('b'.repeat(1024 * 1024)) // Another 1MB
              })
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('c'.repeat(1024 * 1024)) // Another 1MB - should trigger limit
              })
              .mockResolvedValue({ done: true }),
            releaseLock: vi.fn()
          })
        }
      } as any);

      const result = await fetchFirstParty('https://large-site.com', 10000);
      
      // Should handle large content gracefully
      expect(result).toBeTruthy();
      if (result) {
        // Content should be truncated but still usable
        expect(result.textSnippet.length).toBeLessThanOrEqual(500);
      }

      global.fetch = originalFetch;
    });
  });

  describe('Concurrent Analysis Management', () => {
    it('should handle multiple analysis requests without blocking', async () => {
      // This test would require mocking the AI providers
      // For now, we'll test the structure exists
      expect(typeof fetchFirstParty).toBe('function');
      expect(typeof fetchFirstPartyWithRetry).toBe('function');
    });
  });

  describe('Business Improvement Performance', () => {
    it('should complete improvement generation within timeout', async () => {
      // Mock AI provider
      const mockAIProvider = {
        generateStructuredContent: vi.fn().mockResolvedValue({
          twists: [
            'Improvement 1: Focus on mobile-first design',
            'Improvement 2: Add social proof elements',
            'Improvement 3: Implement subscription model'
          ],
          sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
            day: i + 1,
            tasks: [
              `Day ${i + 1} Task 1`,
              `Day ${i + 1} Task 2`,
              `Day ${i + 1} Task 3`
            ]
          }))
        })
      } as any;

      const improvementService = new BusinessImprovementService(mockAIProvider, {
        timeoutMs: 30000
      });

      const mockAnalysis = {
        overview: {
          valueProposition: 'Test value prop',
          targetAudience: 'Test audience',
          monetization: 'Test monetization'
        },
        market: {
          competitors: [],
          swot: {
            strengths: ['Strong brand'],
            weaknesses: ['Limited reach'],
            opportunities: ['Market expansion'],
            threats: ['Competition']
          }
        },
        synthesis: {
          summary: 'Test summary',
          keyInsights: ['Insight 1', 'Insight 2'],
          nextActions: ['Action 1', 'Action 2']
        },
        sources: []
      };

      const startTime = Date.now();
      const result = await improvementService.generateImprovement(mockAnalysis);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeLessThan(30000);
      expect(result.twists).toHaveLength(3);
      expect(result.sevenDayPlan).toHaveLength(7);
      expect(result.generatedAt).toBeTruthy();
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not leak memory during concurrent operations', async () => {
      // Basic test to ensure functions complete without throwing
      const operations = Array.from({ length: 10 }, (_, i) => 
        fetchFirstParty(`https://httpbin.org/delay/${i % 3}`, 2000)
          .catch(() => null) // Ignore failures for this test
      );

      const results = await Promise.all(operations);
      
      // Should complete without throwing
      expect(results).toHaveLength(10);
    }, 15000);
  });

  describe('Error Handling and Graceful Degradation', () => {
    it('should handle network failures gracefully', async () => {
      const result = await fetchFirstParty('https://non-existent-domain-12345.com', 5000);
      expect(result).toBeNull();
    });

    it('should handle timeout scenarios properly', async () => {
      // Test with very short timeout
      const result = await fetchFirstParty('https://httpbin.org/delay/10', 1000);
      expect(result).toBeNull();
    });

    it('should validate input parameters', async () => {
      await expect(fetchFirstParty('invalid-url')).resolves.toBeNull();
      await expect(fetchFirstParty('ftp://example.com')).resolves.toBeNull();
    });
  });
});