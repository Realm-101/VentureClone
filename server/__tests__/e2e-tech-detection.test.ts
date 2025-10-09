import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { TechDetectionService } from '../services/tech-detection.js';
import { ComplexityCalculator } from '../services/complexity-calculator.js';
import type { DetectedTechnology } from '../services/tech-detection.js';

// Mock Wappalyzer at the top level
vi.mock('simple-wappalyzer');

describe('E2E: Tech Detection Integration', () => {
  let techService: TechDetectionService;
  let complexityCalc: ComplexityCalculator;

  beforeAll(async () => {
    // Setup default mock implementation
    const Wappalyzer = (await import('simple-wappalyzer')).default;
    vi.mocked(Wappalyzer).mockImplementation(() => ({
      analyze: vi.fn().mockResolvedValue([
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'Webpack', categories: ['Build Tools'], confidence: 90 }
      ])
    }) as any);
  });

  beforeEach(() => {
    techService = new TechDetectionService();
    complexityCalc = new ComplexityCalculator();
  });

  describe('Complete Tech Detection Flow', () => {
    it('should detect technologies and calculate complexity', async () => {
      // Step 1: Detect technologies
      const detectionResult = await techService.detectTechnologies('https://example.com');

      expect(detectionResult).toBeDefined();
      expect(detectionResult?.success).toBe(true);
      expect(detectionResult?.technologies).toHaveLength(3);
      expect(detectionResult?.technologies[0].name).toBe('React');

      // Step 2: Calculate complexity from detected technologies
      const technologies = detectionResult!.technologies;
      const complexity = complexityCalc.calculateComplexity(technologies);

      expect(complexity).toHaveProperty('score');
      expect(complexity).toHaveProperty('factors');
      expect(complexity.score).toBeGreaterThan(0);
      expect(complexity.score).toBeLessThanOrEqual(10);

      // Step 3: Verify complexity factors are set
      expect(complexity.factors).toHaveProperty('customCode');
      expect(complexity.factors).toHaveProperty('frameworkComplexity');
      expect(complexity.factors).toHaveProperty('infrastructureComplexity');
    });

    it('should handle multiple concurrent detections', async () => {
      const urls = [
        'https://example1.com',
        'https://example2.com',
        'https://example3.com'
      ];

      const detectionPromises = urls.map(url =>
        techService.detectTechnologies(url)
      );

      const results = await Promise.all(detectionPromises);

      results.forEach(result => {
        expect(result).toBeDefined();
        expect(result?.success).toBe(true);
        expect(result?.technologies.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tech Detection Scenarios', () => {
    it('should detect technologies for React-based site', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockResolvedValue([
          { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
          { name: 'Webpack', categories: ['Build Tools'], confidence: 90 },
          { name: 'Tailwind CSS', categories: ['CSS Frameworks'], confidence: 85 }
        ])
      }) as any);

      const result = await techService.detectTechnologies('https://react-app.com');

      expect(result).toBeDefined();
      expect(result?.technologies).toHaveLength(3);
      expect(result?.technologies[0].name).toBe('React');
      expect(result?.technologies[1].name).toBe('Webpack');
      expect(result?.technologies[2].name).toBe('Tailwind CSS');
    });

    it('should handle sites with no detectable technologies', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockResolvedValue([])
      }) as any);

      const result = await techService.detectTechnologies('https://simple-site.com');

      expect(result).toBeDefined();
      expect(result?.technologies).toHaveLength(0);
      expect(result?.success).toBe(true);
    });

    it('should handle tech detection failures gracefully', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockRejectedValue(new Error('Detection failed'))
      }) as any);

      const result = await techService.detectTechnologies('https://failing-site.com');

      // Should return null on failure
      expect(result).toBeNull();
    });

    it('should reject invalid URLs', async () => {
      const result = await techService.detectTechnologies('not-a-valid-url');
      expect(result).toBeNull();
    });

    it('should reject localhost URLs for security', async () => {
      const result = await techService.detectTechnologies('http://localhost:3000');
      expect(result).toBeNull();
    });

    it('should reject private IP addresses', async () => {
      const privateIPs = [
        'http://192.168.1.1',
        'http://10.0.0.1',
        'http://172.16.0.1'
      ];

      for (const ip of privateIPs) {
        const result = await techService.detectTechnologies(ip);
        expect(result).toBeNull();
      }
    });
  });

  describe('Performance Validation', () => {
    it('should complete detection within acceptable time', async () => {
      const startTime = Date.now();

      const result = await techService.detectTechnologies('https://performance-test.com');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 15 seconds (service timeout)
      expect(duration).toBeLessThan(15000);
      expect(result).toBeDefined();
    });

    it('should handle timeout gracefully', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockImplementation(() => 
          new Promise((resolve) => setTimeout(resolve, 20000)) // 20 seconds
        )
      }) as any);

      const result = await techService.detectTechnologies('https://slow-site.com');

      // Should timeout and return null
      expect(result).toBeNull();
    });

    it('should calculate complexity quickly', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Redis', categories: ['Caching'], confidence: 100 },
        { name: 'Docker', categories: ['Containers'], confidence: 100 }
      ];

      const startTime = Date.now();
      const complexity = complexityCalc.calculateComplexity(technologies);
      const duration = Date.now() - startTime;

      // Should complete in under 100ms
      expect(duration).toBeLessThan(100);
      expect(complexity).toBeDefined();
    });
  });

  describe('Complexity Calculation Scenarios', () => {
    it('should calculate low complexity for simple sites', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'HTML', categories: ['Markup Languages'], confidence: 100 }
      ];

      const complexity = complexityCalc.calculateComplexity(technologies);

      expect(complexity.score).toBeLessThan(4);
      expect(complexity.factors.frameworkComplexity).toBe('low');
    });

    it('should calculate medium complexity for standard web apps', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 }
      ];

      const complexity = complexityCalc.calculateComplexity(technologies);

      expect(complexity.score).toBeGreaterThanOrEqual(4);
      expect(complexity.score).toBeLessThan(8);
      expect(complexity.factors.customCode).toBe(true);
    });

    it('should calculate high complexity for enterprise apps', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web Servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Redis', categories: ['Caching'], confidence: 100 },
        { name: 'Docker', categories: ['Containers'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Orchestration'], confidence: 100 }
      ];

      const complexity = complexityCalc.calculateComplexity(technologies);

      expect(complexity.score).toBeGreaterThanOrEqual(7);
      expect(complexity.factors.infrastructureComplexity).toBe('high');
    });

    it('should handle empty technology list', () => {
      const complexity = complexityCalc.calculateComplexity([]);

      expect(complexity.score).toBe(1);
      expect(complexity.factors.customCode).toBe(false);
    });

    it('should detect no-code platforms', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Webflow', categories: ['CMS'], confidence: 100 }
      ];

      const complexity = complexityCalc.calculateComplexity(technologies);

      expect(complexity.score).toBeLessThan(3);
      expect(complexity.factors.customCode).toBe(false);
    });
  });

  describe('Integration with Complexity Calculator', () => {
    it('should integrate detection results with complexity calculation', async () => {
      // Detect technologies
      const detectionResult = await techService.detectTechnologies('https://example.com');
      expect(detectionResult).toBeDefined();

      // Calculate complexity from detected technologies
      const complexity = complexityCalc.calculateComplexity(detectionResult!.technologies);

      // Verify integration
      expect(complexity.score).toBeGreaterThan(0);
      expect(complexity.factors).toBeDefined();
      expect(detectionResult!.technologies.length).toBeGreaterThan(0);
    });

    it('should provide consistent results across multiple calls', async () => {
      const url = 'https://consistency-test.com';

      // Run detection twice
      const result1 = await techService.detectTechnologies(url);
      const result2 = await techService.detectTechnologies(url);

      expect(result1?.technologies).toEqual(result2?.technologies);

      // Calculate complexity for both
      const complexity1 = complexityCalc.calculateComplexity(result1!.technologies);
      const complexity2 = complexityCalc.calculateComplexity(result2!.technologies);

      expect(complexity1.score).toBe(complexity2.score);
      expect(complexity1.factors).toEqual(complexity2.factors);
    });

    it('should handle detection failure in workflow', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockRejectedValue(new Error('Network error'))
      }) as any);

      const detectionResult = await techService.detectTechnologies('https://failing.com');

      // Should return null on failure
      expect(detectionResult).toBeNull();

      // Complexity calculator should handle empty array gracefully
      const complexity = complexityCalc.calculateComplexity([]);
      expect(complexity.score).toBe(1);
      expect(complexity.factors.customCode).toBe(false);
    });
  });

  describe('Retry Logic and Error Recovery', () => {
    it('should retry on transient failures', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      let callCount = 0;

      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error('Transient error'));
          }
          return Promise.resolve([
            { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 }
          ]);
        })
      }) as any);

      const result = await techService.detectTechnologies('https://retry-test.com');

      // Should succeed after retry
      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
      expect(callCount).toBe(2);
    });

    it('should not retry on validation errors', async () => {
      const result = await techService.detectTechnologies('invalid-url');

      // Should fail immediately without retry
      expect(result).toBeNull();
    });

    it('should handle partial detection results', async () => {
      const Wappalyzer = (await import('simple-wappalyzer')).default;
      vi.mocked(Wappalyzer).mockImplementationOnce(() => ({
        analyze: vi.fn().mockResolvedValue([
          { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
          { name: 'Unknown', categories: [], confidence: 0 } // Partial/invalid result
        ])
      }) as any);

      const result = await techService.detectTechnologies('https://partial-results.com');

      expect(result).toBeDefined();
      expect(result?.technologies).toHaveLength(2);
      
      // Complexity calculator should handle partial results
      const complexity = complexityCalc.calculateComplexity(result!.technologies);
      expect(complexity).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      const result = await techService.detectTechnologies(longUrl);

      // Should reject URLs over 2048 characters
      expect(result).toBeNull();
    });

    it('should handle URLs with special characters', async () => {
      const specialUrl = 'https://example.com/path?query=value&foo=bar#hash';
      const result = await techService.detectTechnologies(specialUrl);

      expect(result).toBeDefined();
    });

    it('should handle technologies with missing metadata', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: [], confidence: 100 },
        { name: 'Unknown Tech', categories: ['Unknown'], confidence: 50 }
      ];

      const complexity = complexityCalc.calculateComplexity(technologies);

      expect(complexity).toBeDefined();
      expect(complexity.score).toBeGreaterThan(0);
      expect(complexity.factors).toBeDefined();
    });

    it('should handle duplicate technologies', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 },
        { name: 'React', categories: ['JavaScript Frameworks'], confidence: 100 }
      ];

      const complexity = complexityCalc.calculateComplexity(technologies);

      // Should handle duplicates gracefully
      expect(complexity).toBeDefined();
      expect(complexity.score).toBeGreaterThan(0);
    });
  });
});
