import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  MemStorage, 
  DbStorage, 
  createStorage, 
  type IStorage, 
  type AnalysisRecord, 
  type CreateAnalysisInput 
} from '../minimal-storage';

describe('IStorage Interface Compliance', () => {
  const testImplementations: Array<{ name: string; factory: () => IStorage }> = [
    { name: 'MemStorage', factory: () => new MemStorage() },
    { name: 'DbStorage', factory: () => new DbStorage() },
  ];

  testImplementations.forEach(({ name, factory }) => {
    describe(`${name} interface compliance`, () => {
      let storage: IStorage;

      beforeEach(() => {
        storage = factory();
      });

      it('should implement listAnalyses method', () => {
        expect(typeof storage.listAnalyses).toBe('function');
        expect(storage.listAnalyses.length).toBe(1); // userId parameter
      });

      it('should implement getAnalysis method', () => {
        expect(typeof storage.getAnalysis).toBe('function');
        expect(storage.getAnalysis.length).toBe(2); // userId, id parameters
      });

      it('should implement createAnalysis method', () => {
        expect(typeof storage.createAnalysis).toBe('function');
        expect(storage.createAnalysis.length).toBe(2); // userId, record parameters
      });

      it('should implement deleteAnalysis method', () => {
        expect(typeof storage.deleteAnalysis).toBe('function');
        expect(storage.deleteAnalysis.length).toBe(2); // userId, id parameters
      });

      it('should return promises from all methods', async () => {
        const userId = 'test-user';
        const analysisId = 'test-id';
        const record: CreateAnalysisInput = {
          url: 'https://example.com',
          summary: 'Test summary',
          model: 'test-model'
        };

        const listPromise = storage.listAnalyses(userId);
        const getPromise = storage.getAnalysis(userId, analysisId);
        const createPromise = storage.createAnalysis(userId, record);
        const deletePromise = storage.deleteAnalysis(userId, analysisId);

        expect(listPromise).toBeInstanceOf(Promise);
        expect(getPromise).toBeInstanceOf(Promise);
        expect(createPromise).toBeInstanceOf(Promise);
        expect(deletePromise).toBeInstanceOf(Promise);
        
        // Handle promises to avoid unhandled rejections
        if (storage instanceof DbStorage) {
          await expect(listPromise).rejects.toThrow();
          await expect(getPromise).rejects.toThrow();
          await expect(createPromise).rejects.toThrow();
          await expect(deletePromise).rejects.toThrow();
        } else {
          // For MemStorage, we can await them normally
          await listPromise;
          await getPromise;
          await createPromise;
          await deletePromise;
        }
      });
    });
  });
});

describe('MemStorage CRUD Operations', () => {
  let storage: MemStorage;
  const testUserId = 'test-user-123';
  const testRecord: CreateAnalysisInput = {
    url: 'https://example.com',
    summary: 'This is a test business analysis summary',
    model: 'openai:gpt-4o-mini'
  };

  beforeEach(() => {
    storage = new MemStorage();
  });

  describe('createAnalysis', () => {
    it('should create a new analysis with generated ID and timestamp', async () => {
      const result = await storage.createAnalysis(testUserId, testRecord);

      expect(result).toMatchObject({
        userId: testUserId,
        url: testRecord.url,
        summary: testRecord.summary,
        model: testRecord.model,
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.createdAt).toBeDefined();
      expect(new Date(result.createdAt)).toBeInstanceOf(Date);
    });

    it('should generate unique IDs for multiple analyses', async () => {
      const result1 = await storage.createAnalysis(testUserId, testRecord);
      const result2 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://different.com' });

      expect(result1.id).not.toBe(result2.id);
    });

    it('should store analyses per user', async () => {
      const user1 = 'user-1';
      const user2 = 'user-2';

      await storage.createAnalysis(user1, testRecord);
      await storage.createAnalysis(user2, { ...testRecord, url: 'https://user2.com' });

      const user1Analyses = await storage.listAnalyses(user1);
      const user2Analyses = await storage.listAnalyses(user2);

      expect(user1Analyses).toHaveLength(1);
      expect(user2Analyses).toHaveLength(1);
      expect(user1Analyses[0].url).toBe(testRecord.url);
      expect(user2Analyses[0].url).toBe('https://user2.com');
    });
  });

  describe('listAnalyses', () => {
    it('should return empty array for user with no analyses', async () => {
      const result = await storage.listAnalyses('non-existent-user');
      expect(result).toEqual([]);
    });

    it('should return analyses in reverse chronological order', async () => {
      // Create analyses with slight delay to ensure different timestamps
      const analysis1 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://first.com' });
      
      // Wait a bit to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const analysis2 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://second.com' });

      const result = await storage.listAnalyses(testUserId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(analysis2.id); // Most recent first
      expect(result[1].id).toBe(analysis1.id); // Older second
      expect(new Date(result[0].createdAt).getTime()).toBeGreaterThan(
        new Date(result[1].createdAt).getTime()
      );
    });

    it('should return all analyses for a user', async () => {
      const analyses = [];
      for (let i = 0; i < 3; i++) {
        analyses.push(await storage.createAnalysis(testUserId, { 
          ...testRecord, 
          url: `https://example${i}.com` 
        }));
      }

      const result = await storage.listAnalyses(testUserId);
      expect(result).toHaveLength(3);
      
      // Verify all analyses are present (should be in reverse chronological order)
      const resultIds = result.map(a => a.id);
      const analysisIds = analyses.map(a => a.id);
      
      // Check that all created analyses are in the result
      analysisIds.forEach(id => {
        expect(resultIds).toContain(id);
      });
      
      // Verify chronological ordering (newest first)
      for (let i = 0; i < result.length - 1; i++) {
        const currentTime = new Date(result[i].createdAt).getTime();
        const nextTime = new Date(result[i + 1].createdAt).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
      }
    });
  });

  describe('getAnalysis', () => {
    it('should return null for non-existent analysis', async () => {
      const result = await storage.getAnalysis(testUserId, 'non-existent-id');
      expect(result).toBeNull();
    });

    it('should return null for analysis belonging to different user', async () => {
      const analysis = await storage.createAnalysis('user-1', testRecord);
      const result = await storage.getAnalysis('user-2', analysis.id);
      expect(result).toBeNull();
    });

    it('should return the correct analysis for valid user and ID', async () => {
      const created = await storage.createAnalysis(testUserId, testRecord);
      const result = await storage.getAnalysis(testUserId, created.id);

      expect(result).toEqual(created);
    });

    it('should return the correct analysis when multiple exist', async () => {
      const analysis1 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://first.com' });
      const analysis2 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://second.com' });

      const result1 = await storage.getAnalysis(testUserId, analysis1.id);
      const result2 = await storage.getAnalysis(testUserId, analysis2.id);

      expect(result1).toEqual(analysis1);
      expect(result2).toEqual(analysis2);
    });
  });

  describe('deleteAnalysis', () => {
    it('should remove analysis from storage', async () => {
      const analysis = await storage.createAnalysis(testUserId, testRecord);
      
      // Verify it exists
      let result = await storage.getAnalysis(testUserId, analysis.id);
      expect(result).toEqual(analysis);

      // Delete it
      await storage.deleteAnalysis(testUserId, analysis.id);

      // Verify it's gone
      result = await storage.getAnalysis(testUserId, analysis.id);
      expect(result).toBeNull();
    });

    it('should not affect other analyses', async () => {
      const analysis1 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://keep.com' });
      const analysis2 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://delete.com' });

      await storage.deleteAnalysis(testUserId, analysis2.id);

      const remaining = await storage.listAnalyses(testUserId);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toEqual(analysis1);
    });

    it('should not affect analyses from other users', async () => {
      const user1Analysis = await storage.createAnalysis('user-1', testRecord);
      const user2Analysis = await storage.createAnalysis('user-2', testRecord);

      await storage.deleteAnalysis('user-1', user1Analysis.id);

      const user2Analyses = await storage.listAnalyses('user-2');
      expect(user2Analyses).toHaveLength(1);
      expect(user2Analyses[0]).toEqual(user2Analysis);
    });

    it('should handle deletion of non-existent analysis gracefully', async () => {
      // Should not throw error
      await expect(storage.deleteAnalysis(testUserId, 'non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('Data persistence within session', () => {
    it('should maintain data across multiple operations', async () => {
      // Create multiple analyses
      const analysis1 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://first.com' });
      const analysis2 = await storage.createAnalysis(testUserId, { ...testRecord, url: 'https://second.com' });

      // Verify they exist
      let analyses = await storage.listAnalyses(testUserId);
      expect(analyses).toHaveLength(2);

      // Delete one
      await storage.deleteAnalysis(testUserId, analysis1.id);

      // Verify state is maintained
      analyses = await storage.listAnalyses(testUserId);
      expect(analyses).toHaveLength(1);
      expect(analyses[0]).toEqual(analysis2);

      // Get the remaining one
      const retrieved = await storage.getAnalysis(testUserId, analysis2.id);
      expect(retrieved).toEqual(analysis2);
    });

    it('should handle concurrent operations correctly', async () => {
      const promises = [];
      
      // Create multiple analyses concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(storage.createAnalysis(testUserId, { 
          ...testRecord, 
          url: `https://concurrent${i}.com` 
        }));
      }

      const results = await Promise.all(promises);
      
      // Verify all were created
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.id).toBeDefined();
        expect(result.userId).toBe(testUserId);
      });

      // Verify they're all in storage
      const stored = await storage.listAnalyses(testUserId);
      expect(stored).toHaveLength(5);
    });
  });
});

describe('DbStorage Stub Methods', () => {
  let storage: DbStorage;
  const testUserId = 'test-user';
  const testRecord: CreateAnalysisInput = {
    url: 'https://example.com',
    summary: 'Test summary',
    model: 'test-model'
  };

  beforeEach(() => {
    storage = new DbStorage();
  });

  it('should throw appropriate error for listAnalyses', async () => {
    await expect(storage.listAnalyses(testUserId)).rejects.toThrow(
      'DbStorage not implemented yet - use STORAGE=mem for now'
    );
  });

  it('should throw appropriate error for getAnalysis', async () => {
    await expect(storage.getAnalysis(testUserId, 'test-id')).rejects.toThrow(
      'DbStorage not implemented yet - use STORAGE=mem for now'
    );
  });

  it('should throw appropriate error for createAnalysis', async () => {
    await expect(storage.createAnalysis(testUserId, testRecord)).rejects.toThrow(
      'DbStorage not implemented yet - use STORAGE=mem for now'
    );
  });

  it('should throw appropriate error for deleteAnalysis', async () => {
    await expect(storage.deleteAnalysis(testUserId, 'test-id')).rejects.toThrow(
      'DbStorage not implemented yet - use STORAGE=mem for now'
    );
  });

  it('should throw Error instances', async () => {
    try {
      await storage.listAnalyses(testUserId);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toContain('DbStorage not implemented yet');
    }
  });
});

describe('Storage Factory and Environment-based Selection', () => {
  const originalEnv = process.env.STORAGE;

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.STORAGE = originalEnv;
    } else {
      delete process.env.STORAGE;
    }
  });

  it('should create MemStorage when STORAGE=mem', () => {
    process.env.STORAGE = 'mem';
    const storage = createStorage();
    expect(storage).toBeInstanceOf(MemStorage);
  });

  it('should create DbStorage when STORAGE=db', () => {
    process.env.STORAGE = 'db';
    const storage = createStorage();
    expect(storage).toBeInstanceOf(DbStorage);
  });

  it('should default to MemStorage when STORAGE is unset', () => {
    delete process.env.STORAGE;
    const storage = createStorage();
    expect(storage).toBeInstanceOf(MemStorage);
  });

  it('should default to MemStorage for unknown STORAGE values', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    process.env.STORAGE = 'unknown';
    const storage = createStorage();
    
    expect(storage).toBeInstanceOf(MemStorage);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Unknown storage type: unknown, defaulting to memory storage'
    );
    
    consoleSpy.mockRestore();
  });

  it('should handle empty string STORAGE value', () => {
    process.env.STORAGE = '';
    const storage = createStorage();
    expect(storage).toBeInstanceOf(MemStorage);
  });

  it('should be case sensitive for storage type', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    process.env.STORAGE = 'MEM'; // uppercase
    const storage = createStorage();
    
    expect(storage).toBeInstanceOf(MemStorage);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Unknown storage type: MEM, defaulting to memory storage'
    );
    
    consoleSpy.mockRestore();
  });
});

describe('Integration Tests', () => {
  describe('Storage factory integration', () => {
    it('should create functional MemStorage instance', async () => {
      process.env.STORAGE = 'mem';
      const storage = createStorage();
      
      const testUserId = 'integration-user';
      const testRecord: CreateAnalysisInput = {
        url: 'https://integration-test.com',
        summary: 'Integration test summary',
        model: 'test-model'
      };

      // Test full CRUD cycle
      const created = await storage.createAnalysis(testUserId, testRecord);
      expect(created.url).toBe(testRecord.url);

      const retrieved = await storage.getAnalysis(testUserId, created.id);
      expect(retrieved).toEqual(created);

      const listed = await storage.listAnalyses(testUserId);
      expect(listed).toHaveLength(1);
      expect(listed[0]).toEqual(created);

      await storage.deleteAnalysis(testUserId, created.id);
      const afterDelete = await storage.listAnalyses(testUserId);
      expect(afterDelete).toHaveLength(0);
    });

    it('should create DbStorage instance that throws errors', async () => {
      process.env.STORAGE = 'db';
      const storage = createStorage();
      
      await expect(storage.listAnalyses('test')).rejects.toThrow(
        'DbStorage not implemented yet'
      );
    });
  });

  describe('Multiple storage instances', () => {
    it('should create independent MemStorage instances', async () => {
      const storage1 = new MemStorage();
      const storage2 = new MemStorage();
      
      const testRecord: CreateAnalysisInput = {
        url: 'https://test.com',
        summary: 'Test',
        model: 'test'
      };

      await storage1.createAnalysis('user1', testRecord);
      
      const storage1Analyses = await storage1.listAnalyses('user1');
      const storage2Analyses = await storage2.listAnalyses('user1');
      
      expect(storage1Analyses).toHaveLength(1);
      expect(storage2Analyses).toHaveLength(0);
    });
  });

  describe('Error handling integration', () => {
    it('should handle malformed data gracefully', async () => {
      const storage = new MemStorage();
      
      // Test with edge case data
      const edgeCaseRecord: CreateAnalysisInput = {
        url: '',
        summary: '',
        model: ''
      };

      const result = await storage.createAnalysis('test-user', edgeCaseRecord);
      expect(result.url).toBe('');
      expect(result.summary).toBe('');
      expect(result.model).toBe('');
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });
});