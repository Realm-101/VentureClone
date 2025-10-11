import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InsightsCache } from '../services/insights-cache';
import type { TechnologyInsights } from '../services/technology-insights';

describe('InsightsCache', () => {
  let cache: InsightsCache;

  const mockInsights: TechnologyInsights = {
    alternatives: { React: ['Vue.js', 'Preact'] },
    buildVsBuy: [],
    skills: [],
    estimates: {
      timeEstimate: { minimum: '2 months', maximum: '4 months', realistic: '3 months' },
      costEstimate: {
        development: '$30,000-$75,000',
        infrastructure: '$200-$1,000/month',
        maintenance: '$5,000-$15,000/month',
        total: '$75,000-$200,000 (first year)',
      },
      teamSize: { minimum: 1, recommended: 2 },
    },
    recommendations: [],
    summary: 'Test summary',
  };

  beforeEach(() => {
    // Create a new instance for each test
    cache = InsightsCache.getInstance();
    cache.clear();
    cache.resetStats();
  });

  describe('Basic Cache Operations', () => {
    it('should return null for cache miss', () => {
      const result = cache.get(['React', 'Node.js']);
      expect(result).toBeNull();
    });

    it('should return cached insights for cache hit', () => {
      const technologies = ['React', 'Node.js'];
      cache.set(technologies, mockInsights, 'test-analysis');

      const result = cache.get(technologies);
      expect(result).toEqual(mockInsights);
    });

    it('should handle case-insensitive technology names', () => {
      cache.set(['React', 'Node.js'], mockInsights, 'test-analysis');

      const result = cache.get(['react', 'node.js']);
      expect(result).toEqual(mockInsights);
    });

    it('should handle technology order independence', () => {
      cache.set(['React', 'Node.js', 'PostgreSQL'], mockInsights, 'test-analysis');

      const result = cache.get(['PostgreSQL', 'React', 'Node.js']);
      expect(result).toEqual(mockInsights);
    });

    it('should handle whitespace in technology names', () => {
      cache.set(['  React  ', ' Node.js '], mockInsights, 'test-analysis');

      const result = cache.get(['React', 'Node.js']);
      expect(result).toEqual(mockInsights);
    });
  });

  describe('TTL Management', () => {
    it('should return null for expired cache entries', () => {
      const technologies = ['React', 'Node.js'];
      cache.set(technologies, mockInsights, 'test-analysis');

      // Mock time to be 25 hours in the future
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 25 * 60 * 60 * 1000);

      const result = cache.get(technologies);
      expect(result).toBeNull();

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should return cached entry within TTL', () => {
      const technologies = ['React', 'Node.js'];
      cache.set(technologies, mockInsights, 'test-analysis');

      // Mock time to be 23 hours in the future (within 24-hour TTL)
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 23 * 60 * 60 * 1000);

      const result = cache.get(technologies);
      expect(result).toEqual(mockInsights);

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should clear expired entries', () => {
      cache.set(['React'], mockInsights, 'test-1');
      cache.set(['Vue.js'], mockInsights, 'test-2');

      // Mock time to be 25 hours in the future
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 25 * 60 * 60 * 1000);

      const cleared = cache.clearExpired();
      expect(cleared).toBe(2);

      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('Cache Statistics', () => {
    it('should track cache hits and misses', () => {
      const technologies = ['React', 'Node.js'];
      
      // Miss
      cache.get(technologies);
      
      // Set and hit
      cache.set(technologies, mockInsights, 'test-analysis');
      cache.get(technologies);
      cache.get(technologies);

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.67, 1);
    });

    it('should track cache size', () => {
      cache.set(['React'], mockInsights, 'test-1');
      cache.set(['Vue.js'], mockInsights, 'test-2');
      cache.set(['Angular'], mockInsights, 'test-3');

      const stats = cache.getStats();
      expect(stats.size).toBe(3);
    });

    it('should track evictions', () => {
      const technologies = ['React', 'Node.js'];
      cache.set(technologies, mockInsights, 'test-analysis');

      // Mock time to be 25 hours in the future
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + 25 * 60 * 60 * 1000);

      // This should trigger eviction
      cache.get(technologies);

      const stats = cache.getStats();
      expect(stats.evictions).toBe(1);

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should reset statistics', () => {
      cache.set(['React'], mockInsights, 'test-1');
      cache.get(['React']);
      cache.get(['Vue.js']); // miss

      cache.resetStats();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.evictions).toBe(0);
      expect(stats.size).toBe(1); // Size is not reset
    });
  });

  describe('Cache Utility Methods', () => {
    it('should check if entry exists and is valid', () => {
      const technologies = ['React', 'Node.js'];
      
      expect(cache.has(technologies)).toBe(false);
      
      cache.set(technologies, mockInsights, 'test-analysis');
      expect(cache.has(technologies)).toBe(true);
    });

    it('should return entry age', () => {
      const technologies = ['React', 'Node.js'];
      
      expect(cache.getEntryAge(technologies)).toBeNull();
      
      cache.set(technologies, mockInsights, 'test-analysis');
      const age = cache.getEntryAge(technologies);
      
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1000); // Should be very recent
    });

    it('should clear all cache entries', () => {
      cache.set(['React'], mockInsights, 'test-1');
      cache.set(['Vue.js'], mockInsights, 'test-2');
      cache.set(['Angular'], mockInsights, 'test-3');

      cache.clear();

      const stats = cache.getStats();
      expect(stats.size).toBe(0);
      expect(cache.has(['React'])).toBe(false);
    });
  });

  describe('Cache Warming', () => {
    it('should warm cache with common technology patterns', async () => {
      const mockGenerator = vi.fn(async (techs: string[]) => mockInsights);

      await cache.warmCache(mockGenerator);

      // Should have called generator for each common pattern
      expect(mockGenerator).toHaveBeenCalled();
      
      // Check that common patterns are cached
      const reactNodePostgres = cache.get(['React', 'Node.js', 'PostgreSQL']);
      expect(reactNodePostgres).toEqual(mockInsights);
    });

    it('should skip already cached patterns during warming', async () => {
      // Pre-cache one pattern
      cache.set(['React', 'Node.js', 'PostgreSQL'], mockInsights, 'pre-cached');

      const mockGenerator = vi.fn(async (techs: string[]) => mockInsights);
      await cache.warmCache(mockGenerator);

      // Should not regenerate the pre-cached pattern
      const calls = mockGenerator.mock.calls;
      const hasCachedPattern = calls.some(
        call => JSON.stringify(call[0]?.sort()) === JSON.stringify(['React', 'Node.js', 'PostgreSQL'].sort())
      );
      expect(hasCachedPattern).toBe(false);
    });

    it('should handle errors during cache warming', async () => {
      const mockGenerator = vi.fn(async (techs: string[]) => {
        if (techs.includes('React')) {
          throw new Error('Test error');
        }
        return mockInsights;
      });

      // Should not throw, just log errors
      await expect(cache.warmCache(mockGenerator)).resolves.not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large number of cache entries', () => {
      const startTime = Date.now();

      // Add 100 entries
      for (let i = 0; i < 100; i++) {
        cache.set([`Tech${i}`], mockInsights, `test-${i}`);
      }

      // Lookup should still be fast
      for (let i = 0; i < 100; i++) {
        cache.get([`Tech${i}`]);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(100); // Should complete in <100ms
    });

    it('should generate consistent cache keys', () => {
      const key1 = ['React', 'Node.js', 'PostgreSQL'];
      const key2 = ['PostgreSQL', 'React', 'Node.js'];
      const key3 = ['  react  ', ' NODE.JS ', 'postgresql'];

      cache.set(key1, mockInsights, 'test-1');

      expect(cache.get(key2)).toEqual(mockInsights);
      expect(cache.get(key3)).toEqual(mockInsights);
    });
  });
});
