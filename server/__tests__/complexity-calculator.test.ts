import { describe, it, expect, beforeEach } from 'vitest';
import { ComplexityCalculator } from '../services/complexity-calculator';
import type { DetectedTechnology } from '../services/tech-detection';

describe('ComplexityCalculator', () => {
  let calculator: ComplexityCalculator;

  beforeEach(() => {
    calculator = new ComplexityCalculator();
  });

  describe('No-code platform scoring (1-3)', () => {
    it('should score Webflow as low complexity (1-3)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Webflow',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.factors.frameworkComplexity).toBe('low');
      expect(result.factors.customCode).toBe(false);
    });

    it('should score Wix as low complexity (1-3)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Wix',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should score Squarespace as low complexity (1-3)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Squarespace',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should score Shopify as low complexity (1-3)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Shopify',
          categories: ['Ecommerce'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should score WordPress.com as low complexity (1-3)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'WordPress.com',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should handle case-insensitive no-code platform detection', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'webflow',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(3);
    });
  });

  describe('Modern framework scoring (4-6)', () => {
    it('should score React as medium complexity (4-6)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors.frameworkComplexity).toBe('medium');
      expect(result.factors.customCode).toBe(true);
    });

    it('should score Vue.js as medium complexity (4-6)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Vue.js',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score Next.js as medium complexity (4-6)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Next.js',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score Angular as medium complexity (4-6)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Angular',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score Svelte as medium complexity (4-6)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Svelte',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score React with Node.js backend as higher medium complexity', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
        {
          name: 'Node.js',
          categories: ['Web servers'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // React (+1) + Node.js (+2) = base 5 + 3 = 8, but clamped
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.factors.customCode).toBe(true);
    });
  });

  describe('Complex infrastructure scoring (7-10)', () => {
    it('should score Kubernetes as high complexity (7-10)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Kubernetes',
          categories: ['Container orchestration'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.factors.infrastructureComplexity).toBe('high');
    });

    it('should score Docker as high complexity (7-10)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Docker',
          categories: ['Containers'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.factors.infrastructureComplexity).toBe('high');
    });

    it('should score complex stack with React, Node.js, and Kubernetes as high complexity', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
        {
          name: 'Node.js',
          categories: ['Web servers'],
          confidence: 100,
        },
        {
          name: 'Kubernetes',
          categories: ['Container orchestration'],
          confidence: 100,
        },
        {
          name: 'AWS',
          categories: ['Cloud platforms'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // React (+1) + Node.js (+2) + Kubernetes (+2) + AWS (+1) = 5 + 6 = 11, clamped to 10
      expect(result.score).toBe(10);
      expect(result.factors.frameworkComplexity).toBe('high');
      expect(result.factors.infrastructureComplexity).toBe('high');
      expect(result.factors.customCode).toBe(true);
    });

    it('should score Django with AWS as high complexity', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Django',
          categories: ['Web frameworks'],
          confidence: 100,
        },
        {
          name: 'AWS',
          categories: ['Cloud platforms'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Django (+2) + AWS (+1) = 5 + 3 = 8
      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.factors.frameworkComplexity).toBe('high');
      expect(result.factors.infrastructureComplexity).toBe('medium');
    });

    it('should score Ruby on Rails with Google Cloud as high complexity', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Ruby on Rails',
          categories: ['Web frameworks'],
          confidence: 100,
        },
        {
          name: 'Google Cloud',
          categories: ['Cloud platforms'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.factors.frameworkComplexity).toBe('high');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty technology array', () => {
      const technologies: DetectedTechnology[] = [];

      const result = calculator.calculateComplexity(technologies);

      // Base score of 5, no modifications
      expect(result.score).toBe(5);
      expect(result.factors.customCode).toBe(false);
      expect(result.factors.frameworkComplexity).toBe('low');
      expect(result.factors.infrastructureComplexity).toBe('low');
    });

    it('should handle unknown technologies', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'UnknownFramework',
          categories: ['Unknown'],
          confidence: 50,
        },
        {
          name: 'MysteryTool',
          categories: ['Tools'],
          confidence: 30,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Base score of 5, no modifications for unknown tech
      expect(result.score).toBe(5);
      expect(result.factors.customCode).toBe(false);
      expect(result.factors.frameworkComplexity).toBe('low');
      expect(result.factors.infrastructureComplexity).toBe('low');
    });

    it('should handle technologies with partial name matches', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React Native',
          categories: ['Mobile frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Should match "React" in "React Native"
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should handle technologies with version numbers', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Next.js 13.4.1',
          categories: ['JavaScript frameworks'],
          confidence: 100,
          version: '13.4.1',
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Should match "Next.js" despite version number
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should ensure score never exceeds 10', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
        { name: 'Docker', categories: ['Containers'], confidence: 100 },
        { name: 'AWS', categories: ['Cloud platforms'], confidence: 100 },
        { name: 'Terraform', categories: ['IaC'], confidence: 100 },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.score).toBe(10);
    });

    it('should ensure score never goes below 1', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Webflow',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
    });

    it('should handle mixed complexity technologies', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Shopify',
          categories: ['Ecommerce'],
          confidence: 100,
        },
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 80,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Shopify (-3) + React (+1) = 5 - 3 + 1 = 3
      // But no-code takes precedence in framework complexity
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should handle technologies with low confidence', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 10,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Confidence doesn't affect scoring, only detection
      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should handle technologies with missing optional fields', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Vue.js',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(4);
      expect(result.score).toBeLessThanOrEqual(6);
      expect(result.factors).toBeDefined();
      expect(result.factors.frameworkComplexity).toBe('medium');
      expect(result.factors.infrastructureComplexity).toBe('low');
    });
  });

  describe('Complexity factors', () => {
    it('should set customCode to false for no-code platforms', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Wix',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.customCode).toBe(false);
    });

    it('should set customCode to true for modern frameworks', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.customCode).toBe(true);
    });

    it('should set customCode to true for complex backends', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Django',
          categories: ['Web frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.customCode).toBe(true);
    });

    it('should set frameworkComplexity to low for no-code', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Squarespace',
          categories: ['CMS'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should set frameworkComplexity to medium for modern frameworks', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Angular',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should set frameworkComplexity to high for complex backends', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Laravel',
          categories: ['Web frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.frameworkComplexity).toBe('high');
    });

    it('should set infrastructureComplexity to low by default', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.infrastructureComplexity).toBe('low');
    });

    it('should set infrastructureComplexity to medium for cloud platforms', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Azure',
          categories: ['Cloud platforms'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.infrastructureComplexity).toBe('medium');
    });

    it('should set infrastructureComplexity to high for microservices', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Kubernetes',
          categories: ['Container orchestration'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.factors.infrastructureComplexity).toBe('high');
    });
  });
});
