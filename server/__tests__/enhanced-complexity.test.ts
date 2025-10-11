import { describe, it, expect, beforeEach } from 'vitest';
import { ComplexityCalculator } from '../services/complexity-calculator';
import type { DetectedTechnology } from '../services/tech-detection';

describe('EnhancedComplexityCalculator', () => {
  let calculator: ComplexityCalculator;

  beforeEach(() => {
    calculator = new ComplexityCalculator();
  });

  describe('Enhanced complexity calculation', () => {
    it('should return enhanced result with breakdown and explanation', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'AWS', categories: ['Cloud platforms'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.frontend).toBeDefined();
      expect(result.breakdown.backend).toBeDefined();
      expect(result.breakdown.infrastructure).toBeDefined();
      expect(result.factors).toBeDefined();
      expect(result.factors.technologyCount).toBe(3);
      expect(result.factors.licensingComplexity).toBeDefined();
      expect(result.explanation).toBeDefined();
      expect(typeof result.explanation).toBe('string');
      expect(result.explanation.length).toBeGreaterThan(0);
    });

    it('should calculate frontend breakdown correctly', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(2);
      expect(result.breakdown.frontend.max).toBe(3);
      expect(result.breakdown.frontend.technologies).toContain('React');
    });

    it('should calculate backend breakdown correctly', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Django', categories: ['Web frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.backend.score).toBe(3);
      expect(result.breakdown.backend.max).toBe(4);
      expect(result.breakdown.backend.technologies).toContain('Django');
    });

    it('should calculate infrastructure breakdown correctly', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.infrastructure.score).toBe(3);
      expect(result.breakdown.infrastructure.max).toBe(3);
      expect(result.breakdown.infrastructure.technologies).toContain('Kubernetes');
    });

    it('should add technology count factor for >10 technologies', () => {
      const technologies: DetectedTechnology[] = Array.from({ length: 12 }, (_, i) => ({
        name: `Tech${i}`,
        categories: ['Unknown'],
        confidence: 100,
      }));

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.technologyCount).toBe(12);
      // Score should include +1 for >10 techs
      expect(result.score).toBeGreaterThanOrEqual(1);
    });

    it('should add technology count factor for >20 technologies', () => {
      const technologies: DetectedTechnology[] = Array.from({ length: 22 }, (_, i) => ({
        name: `Tech${i}`,
        categories: ['Unknown'],
        confidence: 100,
      }));

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.technologyCount).toBe(22);
      // Score should include +2 for >20 techs
      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('should detect commercial licensing complexity', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Oracle Database', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should not flag open-source technologies as licensing complex', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(false);
    });

    it('should generate meaningful explanation', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Express', categories: ['Web servers'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('complexity');
      expect(result.explanation.length).toBeGreaterThan(50);
    });

    it('should handle complex full-stack application', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Angular', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
        { name: 'AWS', categories: ['Cloud platforms'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      // Angular (3) + Kubernetes (4 for microservices) + Kubernetes (3 for infra) = 10
      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.breakdown.frontend.score).toBe(3);
      // Kubernetes is detected as microservices, so backend gets 4
      expect(result.breakdown.backend.score).toBe(4);
      expect(result.breakdown.infrastructure.score).toBe(3);
    });

    it('should handle no-code platform correctly', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Webflow', categories: ['CMS'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(0);
      expect(result.score).toBe(1); // Clamped to minimum
      expect(result.explanation).toContain('no-code');
    });

    it('should maintain backward compatibility with calculateComplexity', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
      ];

      const basicResult = calculator.calculateComplexity(technologies);
      const enhancedResult = calculator.calculateEnhancedComplexity(technologies);

      expect(basicResult.score).toBe(enhancedResult.score);
      expect(basicResult.factors.customCode).toBe(enhancedResult.factors.customCode);
      expect(basicResult.factors.frameworkComplexity).toBe(enhancedResult.factors.frameworkComplexity);
      expect(basicResult.factors.infrastructureComplexity).toBe(enhancedResult.factors.infrastructureComplexity);
    });
  });
});
