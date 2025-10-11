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

  describe('Modern framework scoring (2-4)', () => {
    it('should score React as medium complexity (2-4)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // React frontend score is 2
      expect(result.score).toBe(2);
      expect(result.factors.frameworkComplexity).toBe('medium');
      expect(result.factors.customCode).toBe(true);
    });

    it('should score Vue.js as medium complexity (2)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Vue.js',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBe(2);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score Next.js as medium complexity (2)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Next.js',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBe(2);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score Angular as complex framework (3)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Angular',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBe(3);
      // Angular is in complexFrameworks, so without backend it's still 'low'
      expect(result.factors.frameworkComplexity).toBe('low');
    });

    it('should score Svelte as medium complexity (2)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Svelte',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      expect(result.score).toBe(2);
      expect(result.factors.frameworkComplexity).toBe('medium');
    });

    it('should score React with Node.js backend as higher complexity', () => {
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

      // Frontend (2) + Backend (3) = 5
      expect(result.score).toBe(5);
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

    it('should score Docker as microservices complexity (4)', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Docker',
          categories: ['Containers'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Backend (4 for microservices)
      expect(result.score).toBe(4);
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

      // Frontend (2) + Backend (4 for K8s) + Infrastructure (3 for K8s) = 9
      expect(result.score).toBe(9);
      expect(result.factors.frameworkComplexity).toBe('high');
      expect(result.factors.infrastructureComplexity).toBe('high');
      expect(result.factors.customCode).toBe(true);
    });

    it('should score Django with AWS as medium-high complexity', () => {
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

      // Backend (3) + Infrastructure (2) = 5
      expect(result.score).toBe(5);
      expect(result.factors.frameworkComplexity).toBe('high');
      expect(result.factors.infrastructureComplexity).toBe('medium');
    });

    it('should score Ruby on Rails with Google Cloud as medium-high complexity', () => {
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

      // Backend (3) + Infrastructure (2) = 5
      expect(result.score).toBe(5);
      expect(result.factors.frameworkComplexity).toBe('high');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty technology array', () => {
      const technologies: DetectedTechnology[] = [];

      const result = calculator.calculateComplexity(technologies);

      // Empty array gets clamped to minimum of 1
      expect(result.score).toBe(1);
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

      // Unknown tech gets clamped to minimum of 1
      expect(result.score).toBe(1);
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

      // Should match "React" in "React Native" - frontend score 2
      expect(result.score).toBe(2);
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

      // Should match "Next.js" despite version number - frontend score 2
      expect(result.score).toBe(2);
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

      // Frontend (2) + Backend (4) + Infrastructure (3) = 9
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.score).toBe(9);
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

      // Confidence doesn't affect scoring, only detection - frontend score 2
      expect(result.score).toBe(2);
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

      expect(result.score).toBe(2);
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

    it('should set frameworkComplexity to low for modern frameworks without backend', () => {
      const technologies: DetectedTechnology[] = [
        {
          name: 'Angular',
          categories: ['JavaScript frameworks'],
          confidence: 100,
        },
      ];

      const result = calculator.calculateComplexity(technologies);

      // Without backend, framework complexity is low
      expect(result.factors.frameworkComplexity).toBe('low');
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

  describe('Enhanced Complexity - Breakdown Calculation', () => {
    it('should calculate frontend breakdown for no-code platforms', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Webflow', categories: ['CMS'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(0);
      expect(result.breakdown.frontend.max).toBe(3);
      expect(result.breakdown.frontend.technologies).toContain('Webflow');
    });

    it('should calculate frontend breakdown for static site generators', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Hugo', categories: ['Static site generator'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(1);
      expect(result.breakdown.frontend.max).toBe(3);
      expect(result.breakdown.frontend.technologies).toContain('Hugo');
    });

    it('should calculate frontend breakdown for modern frameworks', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(2);
      expect(result.breakdown.frontend.max).toBe(3);
      expect(result.breakdown.frontend.technologies).toContain('React');
    });

    it('should calculate frontend breakdown for complex frameworks', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Angular', categories: ['JavaScript frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(3);
      expect(result.breakdown.frontend.max).toBe(3);
      expect(result.breakdown.frontend.technologies).toContain('Angular');
    });

    it('should calculate backend breakdown for serverless', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Firebase', categories: ['Backend'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.backend.score).toBe(1);
      expect(result.breakdown.backend.max).toBe(4);
      expect(result.breakdown.backend.technologies).toContain('Firebase');
    });

    it('should calculate backend breakdown for simple frameworks', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Express', categories: ['Web frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.backend.score).toBe(2);
      expect(result.breakdown.backend.max).toBe(4);
      expect(result.breakdown.backend.technologies).toContain('Express');
    });

    it('should calculate backend breakdown for complex frameworks', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Django', categories: ['Web frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.backend.score).toBe(3);
      expect(result.breakdown.backend.max).toBe(4);
      expect(result.breakdown.backend.technologies).toContain('Django');
    });

    it('should calculate backend breakdown for microservices', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.backend.score).toBe(4);
      expect(result.breakdown.backend.max).toBe(4);
      expect(result.breakdown.backend.technologies).toContain('Kubernetes');
    });

    it('should calculate infrastructure breakdown for managed hosting', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Vercel', categories: ['Hosting'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.infrastructure.score).toBe(0);
      expect(result.breakdown.infrastructure.max).toBe(3);
      expect(result.breakdown.infrastructure.technologies).toContain('Vercel');
    });

    it('should calculate infrastructure breakdown for simple hosting', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Heroku', categories: ['PaaS'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.infrastructure.score).toBe(1);
      expect(result.breakdown.infrastructure.max).toBe(3);
      expect(result.breakdown.infrastructure.technologies).toContain('Heroku');
    });

    it('should calculate infrastructure breakdown for cloud platforms', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'AWS', categories: ['Cloud platforms'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.infrastructure.score).toBe(2);
      expect(result.breakdown.infrastructure.max).toBe(3);
      expect(result.breakdown.infrastructure.technologies).toContain('AWS');
    });

    it('should calculate infrastructure breakdown for container orchestration', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.infrastructure.score).toBe(3);
      expect(result.breakdown.infrastructure.max).toBe(3);
      expect(result.breakdown.infrastructure.technologies).toContain('Kubernetes');
    });

    it('should calculate complete breakdown for full stack', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'AWS', categories: ['Cloud platforms'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.breakdown.frontend.score).toBe(2);
      expect(result.breakdown.backend.score).toBe(3);
      expect(result.breakdown.infrastructure.score).toBe(2);
      expect(result.breakdown.frontend.technologies).toContain('React');
      expect(result.breakdown.backend.technologies).toContain('Node.js');
      expect(result.breakdown.infrastructure.technologies).toContain('AWS');
    });
  });

  describe('Enhanced Complexity - Weighted Scoring', () => {
    it('should calculate base score from breakdown components', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Express', categories: ['Web frameworks'], confidence: 100 },
        { name: 'Heroku', categories: ['PaaS'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      // Frontend (2) + Backend (2) + Infrastructure (1) = 5
      expect(result.score).toBe(5);
    });

    it('should weight frontend, backend, and infrastructure equally', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Angular', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Django', categories: ['Web frameworks'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      // Frontend (3) + Backend (4 for K8s) + Infrastructure (3) = 10
      expect(result.score).toBe(10);
    });

    it('should combine component scores correctly', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Vue.js', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Firebase', categories: ['Backend'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      // Frontend (2) + Backend (1) + Infrastructure (0) = 3
      expect(result.score).toBe(3);
    });
  });

  describe('Enhanced Complexity - Technology Count Factor', () => {
    it('should not add bonus for small tech stacks (< 10)', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.technologyCount).toBe(3);
      // Score should be based only on breakdown: 2 + 3 + 0 = 5
      expect(result.score).toBe(5);
    });

    it('should add +1 for medium tech stacks (11-20)', () => {
      const technologies: DetectedTechnology[] = Array.from({ length: 15 }, (_, i) => ({
        name: `Tech${i}`,
        categories: ['Various'],
        confidence: 100,
      }));
      technologies[0] = { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 };

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.technologyCount).toBe(15);
      // Base score (2) + tech count bonus (1) = 3
      expect(result.score).toBe(3);
    });

    it('should add +2 for large tech stacks (> 20)', () => {
      const technologies: DetectedTechnology[] = Array.from({ length: 25 }, (_, i) => ({
        name: `Tech${i}`,
        categories: ['Various'],
        confidence: 100,
      }));
      technologies[0] = { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 };

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.technologyCount).toBe(25);
      // Base score (2) + tech count bonus (2) = 4
      expect(result.score).toBe(4);
    });

    it('should track technology count in factors', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Redis', categories: ['Caching'], confidence: 100 },
        { name: 'AWS', categories: ['Cloud platforms'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.technologyCount).toBe(5);
    });
  });

  describe('Enhanced Complexity - Licensing Complexity', () => {
    it('should detect Oracle as commercial license', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Oracle Database', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should detect Microsoft SQL Server as commercial license', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Microsoft SQL Server', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should detect SAP as commercial license', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'SAP', categories: ['Enterprise software'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should detect Salesforce as commercial license', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Salesforce', categories: ['CRM'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should detect Adobe as commercial license', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Adobe Experience Manager', categories: ['CMS'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should not flag open source technologies', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(false);
    });

    it('should add +1 to score for commercial licenses', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Oracle', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      // Base score (2) + licensing (1) = 3
      expect(result.score).toBe(3);
      expect(result.factors.licensingComplexity).toBe(true);
    });

    it('should handle mixed open source and commercial', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Node.js', categories: ['Web servers'], confidence: 100 },
        { name: 'PostgreSQL', categories: ['Databases'], confidence: 100 },
        { name: 'Oracle', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.factors.licensingComplexity).toBe(true);
      // Frontend (2) + Backend (3) + Infrastructure (0) + Licensing (1) = 6
      expect(result.score).toBe(6);
    });
  });

  describe('Enhanced Complexity - Explanation Generation', () => {
    it('should generate explanation for low complexity', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Webflow', categories: ['CMS'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('low-complexity');
      expect(result.explanation).toContain('easy to clone');
    });

    it('should generate explanation for medium complexity', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Express', categories: ['Web frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('moderate-complexity');
      expect(result.explanation).toContain('solid development skills');
    });

    it('should generate explanation for high complexity', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Angular', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Django', categories: ['Web frameworks'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('high-complexity');
      expect(result.explanation).toContain('challenging');
    });

    it('should include frontend assessment in explanation', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('frontend');
      expect(result.explanation).toContain('modern frameworks');
    });

    it('should include backend assessment in explanation', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Django', categories: ['Web frameworks'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('backend');
      expect(result.explanation).toContain('complex frameworks');
    });

    it('should include infrastructure assessment in explanation', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('Infrastructure');
      expect(result.explanation).toContain('container orchestration');
    });

    it('should mention technology count when high', () => {
      const technologies: DetectedTechnology[] = Array.from({ length: 25 }, (_, i) => ({
        name: `Tech${i}`,
        categories: ['Various'],
        confidence: 100,
      }));

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('25');
      expect(result.explanation).toContain('integration complexity');
    });

    it('should mention licensing complexity when present', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Oracle', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('Commercial licensing');
      expect(result.explanation).toContain('cost');
    });

    it('should provide comprehensive explanation for complex stack', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Angular', categories: ['JavaScript frameworks'], confidence: 100 },
        { name: 'Django', categories: ['Web frameworks'], confidence: 100 },
        { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 },
        { name: 'Oracle', categories: ['Databases'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.explanation).toContain('high-complexity');
      expect(result.explanation).toContain('frontend');
      expect(result.explanation).toContain('backend');
      expect(result.explanation).toContain('Infrastructure');
      expect(result.explanation).toContain('Commercial licensing');
    });
  });

  describe('Enhanced Complexity - Integration Tests', () => {
    it('should maintain backward compatibility with calculateComplexity', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'React', categories: ['JavaScript frameworks'], confidence: 100 },
      ];

      const basicResult = calculator.calculateComplexity(technologies);
      const enhancedResult = calculator.calculateEnhancedComplexity(technologies);

      expect(basicResult.score).toBe(enhancedResult.score);
      expect(basicResult.factors).toEqual(enhancedResult.factors);
    });

    it('should handle empty array in enhanced mode', () => {
      const technologies: DetectedTechnology[] = [];

      const result = calculator.calculateEnhancedComplexity(technologies);

      // Empty array gets clamped to minimum of 1
      expect(result.score).toBe(1);
      expect(result.breakdown.frontend.score).toBe(0);
      expect(result.breakdown.backend.score).toBe(0);
      expect(result.breakdown.infrastructure.score).toBe(0);
      expect(result.factors.technologyCount).toBe(0);
      expect(result.factors.licensingComplexity).toBe(false);
    });

    it('should clamp enhanced score to maximum of 10', () => {
      const technologies: DetectedTechnology[] = Array.from({ length: 30 }, (_, i) => ({
        name: `Tech${i}`,
        categories: ['Various'],
        confidence: 100,
      }));
      technologies[0] = { name: 'Angular', categories: ['JavaScript frameworks'], confidence: 100 };
      technologies[1] = { name: 'Kubernetes', categories: ['Container orchestration'], confidence: 100 };
      technologies[2] = { name: 'Oracle', categories: ['Databases'], confidence: 100 };

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.score).toBe(10);
    });

    it('should clamp enhanced score to minimum of 1', () => {
      const technologies: DetectedTechnology[] = [
        { name: 'Vercel', categories: ['Hosting'], confidence: 100 },
      ];

      const result = calculator.calculateEnhancedComplexity(technologies);

      expect(result.score).toBeGreaterThanOrEqual(1);
    });
  });
});
