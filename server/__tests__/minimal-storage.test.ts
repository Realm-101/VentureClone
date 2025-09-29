import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../minimal-storage';

describe('MemStorage', () => {
  let storage: MemStorage;
  const userId = 'test-user-id';

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('listAnalyses', () => {
    it('should return sorted copy without mutating original data', async () => {
      // Create multiple analyses with different timestamps
      const analysis1 = await storage.createAnalysis(userId, {
        url: 'https://example1.com',
        summary: 'First analysis',
        model: 'test-model'
      });

      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));

      const analysis2 = await storage.createAnalysis(userId, {
        url: 'https://example2.com', 
        summary: 'Second analysis',
        model: 'test-model'
      });

      // Get the internal array reference to verify non-mutation
      const internalArray = (storage as any).analyses.get(userId);
      const originalOrder = [...internalArray];
      const originalLength = internalArray.length;

      // Call listAnalyses multiple times
      const result1 = await storage.listAnalyses(userId);
      const result2 = await storage.listAnalyses(userId);

      // Verify results are sorted (newest first)
      expect(result1).toHaveLength(2);
      expect(result1[0].id).toBe(analysis2.id); // Second analysis should be first (newest)
      expect(result1[1].id).toBe(analysis1.id); // First analysis should be second (oldest)

      // Verify original internal array was not mutated
      expect(internalArray).toEqual(originalOrder);
      expect(internalArray.length).toBe(originalLength);
      
      // Verify multiple calls return consistent results
      expect(result1).toEqual(result2);

      // Verify concurrent reads don't interfere
      const [concurrent1, concurrent2] = await Promise.all([
        storage.listAnalyses(userId),
        storage.listAnalyses(userId)
      ]);
      expect(concurrent1).toEqual(concurrent2);

      // Verify that returned arrays are different objects (not references to internal array)
      expect(result1).not.toBe(internalArray);
      expect(result2).not.toBe(internalArray);
      expect(concurrent1).not.toBe(internalArray);
      expect(concurrent2).not.toBe(internalArray);
    });

    it('should return empty array for non-existent user', async () => {
      const result = await storage.listAnalyses('non-existent-user');
      expect(result).toEqual([]);
    });

    it('should handle concurrent operations without data corruption', async () => {
      // Create initial analysis
      await storage.createAnalysis(userId, {
        url: 'https://initial.com',
        summary: 'Initial analysis',
        model: 'test-model'
      });

      // Perform concurrent reads and writes
      const operations = [
        storage.listAnalyses(userId),
        storage.createAnalysis(userId, {
          url: 'https://concurrent1.com',
          summary: 'Concurrent analysis 1',
          model: 'test-model'
        }),
        storage.listAnalyses(userId),
        storage.createAnalysis(userId, {
          url: 'https://concurrent2.com',
          summary: 'Concurrent analysis 2',
          model: 'test-model'
        }),
        storage.listAnalyses(userId)
      ];

      const results = await Promise.all(operations);
      
      // Verify that all list operations returned arrays
      expect(Array.isArray(results[0])).toBe(true);
      expect(Array.isArray(results[2])).toBe(true);
      expect(Array.isArray(results[4])).toBe(true);

      // Verify final state has all analyses
      const finalList = await storage.listAnalyses(userId);
      expect(finalList).toHaveLength(3);
    });
  });
});