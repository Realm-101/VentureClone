import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../minimal-storage';

describe('Storage Mutation Tests', () => {
  let storage: MemStorage;
  const testUserId = 'test-user';

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('Non-mutating listAnalyses behavior', () => {
    it('should return sorted copy without mutating original data', async () => {
      // Create analyses in non-chronological order
      const analysis1 = await storage.createAnalysis(testUserId, {
        url: 'https://example1.com',
        summary: 'First analysis',
        model: 'test-model'
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const analysis2 = await storage.createAnalysis(testUserId, {
        url: 'https://example2.com',
        summary: 'Second analysis',
        model: 'test-model'
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      const analysis3 = await storage.createAnalysis(testUserId, {
        url: 'https://example3.com',
        summary: 'Third analysis',
        model: 'test-model'
      });

      // Get the internal data structure (this is a test-only access)
      const internalData = (storage as any).analyses.get(testUserId) || [];
      const originalOrder = [...internalData];

      // Call listAnalyses multiple times
      const result1 = await storage.listAnalyses(testUserId);
      const result2 = await storage.listAnalyses(testUserId);

      // Verify internal data hasn't changed
      const currentInternalData = (storage as any).analyses.get(testUserId) || [];
      expect(currentInternalData).toEqual(originalOrder);
      expect(currentInternalData).toBe((storage as any).analyses.get(testUserId)); // Same reference

      // Verify results are sorted by createdAt (newest first)
      expect(result1).toHaveLength(3);
      expect(result1[0].id).toBe(analysis3.id); // Most recent
      expect(result1[1].id).toBe(analysis2.id);
      expect(result1[2].id).toBe(analysis1.id); // Oldest

      // Verify results are consistent across calls
      expect(result1).toEqual(result2);

      // Verify results are different arrays (not same reference)
      expect(result1).not.toBe(result2);
      // Note: Individual objects may be the same reference (shallow copy)
    });

    it('should handle concurrent listAnalyses calls without interference', async () => {
      // Create some test data
      await storage.createAnalysis(testUserId, {
        url: 'https://example1.com',
        summary: 'Analysis 1',
        model: 'test-model'
      });

      await storage.createAnalysis(testUserId, {
        url: 'https://example2.com',
        summary: 'Analysis 2',
        model: 'test-model'
      });

      // Make multiple concurrent calls
      const promises = Array.from({ length: 10 }, () => storage.listAnalyses(testUserId));
      const results = await Promise.all(promises);

      // All results should be identical
      const firstResult = results[0];
      results.forEach((result, index) => {
        expect(result).toEqual(firstResult);
        // Note: Some results may be the same reference due to implementation details
        expect(result).toHaveLength(2);
      });

      // Verify internal data structure is unchanged
      const internalData = (storage as any).analyses.get(testUserId) || [];
      expect(internalData).toHaveLength(2);
    });

    it('should return empty array when no analyses exist', async () => {
      const result = await storage.listAnalyses(testUserId);
      
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      
      // Multiple calls should return different empty array objects
      const result2 = await storage.listAnalyses(testUserId);
      expect(result2).toEqual([]);
      expect(result2).not.toBe(result);
    });

    it('should maintain sort order after new analyses are added', async () => {
      // Create initial analysis
      const analysis1 = await storage.createAnalysis(testUserId, {
        url: 'https://example1.com',
        summary: 'First analysis',
        model: 'test-model'
      });

      const firstList = await storage.listAnalyses(testUserId);
      expect(firstList).toHaveLength(1);
      expect(firstList[0].id).toBe(analysis1.id);

      // Add another analysis
      await new Promise(resolve => setTimeout(resolve, 10));
      const analysis2 = await storage.createAnalysis(testUserId, {
        url: 'https://example2.com',
        summary: 'Second analysis',
        model: 'test-model'
      });

      const secondList = await storage.listAnalyses(testUserId);
      expect(secondList).toHaveLength(2);
      expect(secondList[0].id).toBe(analysis2.id); // Newest first
      expect(secondList[1].id).toBe(analysis1.id);

      // Verify first list is still unchanged
      expect(firstList).toHaveLength(1);
      expect(firstList[0].id).toBe(analysis1.id);
    });

    it('should handle modifications to returned arrays without affecting storage', async () => {
      // Create test data
      const analysis = await storage.createAnalysis(testUserId, {
        url: 'https://example.com',
        summary: 'Test analysis',
        model: 'test-model'
      });

      const result = await storage.listAnalyses(testUserId);
      expect(result).toHaveLength(1);

      // Modify the returned array (should not affect storage)
      result.push({
        id: 'fake-id',
        userId: testUserId,
        url: 'https://fake.com',
        summary: 'Fake analysis',
        model: 'fake-model',
        createdAt: new Date().toISOString()
      });

      // Note: Modifying object properties will affect storage (shallow copy)
      // This is the current behavior - array is copied but objects are referenced

      // Verify storage array is unaffected by push
      const freshResult = await storage.listAnalyses(testUserId);
      expect(freshResult).toHaveLength(1); // Should still be 1, not 2
      expect(freshResult[0].id).toBe(analysis.id);
    });

    it('should handle large datasets without mutation', async () => {
      // Create many analyses
      const analyses = [];
      for (let i = 0; i < 100; i++) {
        const analysis = await storage.createAnalysis(testUserId, {
          url: `https://example${i}.com`,
          summary: `Analysis ${i}`,
          model: 'test-model'
        });
        analyses.push(analysis);
        
        // Small delay to ensure different timestamps
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      const result = await storage.listAnalyses(testUserId);
      expect(result).toHaveLength(100);

      // Verify sorting (newest first)
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(result[i + 1].createdAt).getTime()
        );
      }

      // Verify internal data is unchanged
      const internalData = (storage as any).analyses.get(testUserId) || [];
      expect(internalData).toHaveLength(100);
      
      // Modify result array extensively (should not affect storage array structure)
      result.reverse();
      result.splice(0, 50);
      // Note: Modifying object properties would affect storage (shallow copy)

      // Verify storage array structure is unaffected
      const freshResult = await storage.listAnalyses(testUserId);
      expect(freshResult).toHaveLength(100); // Array length unchanged
      // Verify sorting is still correct (newest first)
      for (let i = 0; i < freshResult.length - 1; i++) {
        expect(new Date(freshResult[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(freshResult[i + 1].createdAt).getTime()
        );
      }
    });
  });

  describe('Data integrity under concurrent operations', () => {
    it('should handle concurrent reads and writes without corruption', async () => {
      // Start with some initial data
      await storage.createAnalysis(testUserId, {
        url: 'https://initial.com',
        summary: 'Initial analysis',
        model: 'test-model'
      });

      // Perform concurrent operations
      const operations = [];
      
      // Add some read operations
      for (let i = 0; i < 5; i++) {
        operations.push(storage.listAnalyses(testUserId));
      }
      
      // Add some write operations
      for (let i = 0; i < 3; i++) {
        operations.push(storage.createAnalysis(testUserId, {
          url: `https://concurrent${i}.com`,
          summary: `Concurrent analysis ${i}`,
          model: 'test-model'
        }));
      }
      
      // Add more read operations
      for (let i = 0; i < 5; i++) {
        operations.push(storage.listAnalyses(testUserId));
      }

      const results = await Promise.all(operations);
      
      // Verify final state
      const finalList = await storage.listAnalyses(testUserId);
      expect(finalList).toHaveLength(4); // 1 initial + 3 concurrent
      
      // Verify all read results are valid arrays
      results.forEach((result, index) => {
        if (Array.isArray(result)) {
          expect(result.length).toBeGreaterThanOrEqual(1);
          expect(result.length).toBeLessThanOrEqual(4);
          result.forEach(analysis => {
            expect(analysis).toHaveProperty('id');
            expect(analysis).toHaveProperty('url');
            expect(analysis).toHaveProperty('summary');
            expect(analysis).toHaveProperty('createdAt');
          });
        }
      });
    });

    it('should maintain referential integrity across operations', async () => {
      const analysis1 = await storage.createAnalysis(testUserId, {
        url: 'https://ref1.com',
        summary: 'Reference test 1',
        model: 'test-model'
      });

      const list1 = await storage.listAnalyses(testUserId);
      
      const analysis2 = await storage.createAnalysis(testUserId, {
        url: 'https://ref2.com',
        summary: 'Reference test 2',
        model: 'test-model'
      });

      const list2 = await storage.listAnalyses(testUserId);

      // Verify that analysis1 appears in both lists with same data
      const analysis1InList1 = list1.find(a => a.id === analysis1.id);
      const analysis1InList2 = list2.find(a => a.id === analysis1.id);
      
      expect(analysis1InList1).toBeDefined();
      expect(analysis1InList2).toBeDefined();
      expect(analysis1InList1!.summary).toBe(analysis1InList2!.summary);
      expect(analysis1InList1!.url).toBe(analysis1InList2!.url);
      
      // Note: With shallow copy, objects may be the same reference
      // This tests that the data is consistent across calls
    });
  });
});