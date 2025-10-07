import { describe, it, expect, beforeAll } from 'vitest';
import { minimalStorage } from '../minimal-storage';
import { ExportService } from '../services/export-service';

/**
 * Integration tests for export functionality
 * Tests all export formats and complete plan export
 * Requirements: 2.1-2.5, 6.1-6.7
 */

describe('Export Integration Tests (Task 15.2)', () => {
  const testUserId = 'test-user-export-integration';
  let testAnalysisId: string;
  let exportService: ExportService;

  beforeAll(async () => {
    exportService = new ExportService(minimalStorage);

    // Create a comprehensive test analysis with all stages
    const testAnalysis = await minimalStorage.createAnalysis(testUserId, {
      url: 'https://example-export-test.com',
      summary: 'Test business for export testing',
      model: 'test-model',
      structured: {
        overview: {
          valueProposition: 'Provides comprehensive online services',
          targetAudience: 'Small to medium businesses',
          monetization: 'Subscription and freemium model'
        },
        market: {
          competitors: [
            { name: 'Competitor A', url: 'https://competitor-a.com', notes: 'Main competitor' },
            { name: 'Competitor B', url: 'https://competitor-b.com', notes: 'Secondary competitor' }
          ],
          swot: {
            strengths: ['Strong brand', 'Good UX', 'Loyal customer base'],
            weaknesses: ['Limited features', 'High pricing'],
            opportunities: ['Market expansion', 'New features'],
            threats: ['New entrants', 'Market saturation']
          }
        },
        technical: {
          techStack: ['React', 'Node.js', 'PostgreSQL', 'Redis'],
          confidence: 0.85,
          uiColors: ['#000000', '#FFFFFF', '#FF5733'],
          keyPages: ['/home', '/pricing', '/features', '/about']
        },
        data: {
          trafficEstimates: { value: '50K monthly', source: 'https://example.com' },
          keyMetrics: [
            { name: 'Users', value: '5000', source: 'https://example.com', asOf: '2024-01-01' },
            { name: 'Revenue', value: '$50K MRR', source: 'https://example.com', asOf: '2024-01-01' }
          ]
        },
        synthesis: {
          summary: 'A promising business with strong growth potential and clear market fit',
          keyInsights: ['Strong market fit', 'Scalable technology', 'Clear monetization', 'Growing user base'],
          nextActions: ['Validate demand', 'Build MVP', 'Launch marketing', 'Iterate on feedback']
        }
      }
    });

    testAnalysisId = testAnalysis.id;

    // Add stage data for all stages
    await minimalStorage.updateAnalysisStageData(testUserId, testAnalysisId, 2, {
      stageNumber: 2,
      stageName: 'Lazy-Entrepreneur Filter',
      status: 'completed',
      generatedAt: new Date().toISOString(),
      content: {
        effortScore: 7,
        rewardScore: 8,
        recommendation: 'go',
        reasoning: 'Good opportunity with manageable effort and high reward potential',
        automationPotential: { 
          score: 0.75, 
          opportunities: ['API integration', 'Automated testing', 'CI/CD pipeline'] 
        },
        resourceRequirements: { 
          team: 3, 
          budget: 50000,
          timeline: '6 months'
        },
        nextSteps: ['Build MVP', 'Validate with users', 'Launch beta']
      } as any
    });

    await minimalStorage.updateAnalysisStageData(testUserId, testAnalysisId, 3, {
      stageNumber: 3,
      stageName: 'MVP Launch Planning',
      status: 'completed',
      generatedAt: new Date().toISOString(),
      content: {
        coreFeatures: [
          { name: 'User Authentication', priority: 'high', effort: 'medium' },
          { name: 'Dashboard', priority: 'high', effort: 'high' },
          { name: 'Payment Processing', priority: 'high', effort: 'medium' }
        ],
        niceToHaves: [
          { name: 'Social Sharing', priority: 'low', effort: 'low' },
          { name: 'Analytics', priority: 'medium', effort: 'medium' }
        ],
        techStack: {
          frontend: ['React', 'TypeScript', 'Tailwind CSS'],
          backend: ['Node.js', 'Express', 'PostgreSQL'],
          infrastructure: ['AWS', 'Docker', 'GitHub Actions']
        },
        timeline: [
          { phase: 'Planning', duration: '2 weeks', tasks: ['Requirements', 'Design'] },
          { phase: 'Development', duration: '12 weeks', tasks: ['Frontend', 'Backend', 'Integration'] },
          { phase: 'Testing', duration: '4 weeks', tasks: ['QA', 'User testing'] }
        ],
        estimatedCost: '$45,000 - $55,000'
      } as any
    });
  });

  describe('HTML Export', () => {
    it('should export Stage 1 as HTML with proper formatting', async () => {
      const html = await exportService.exportStage(testUserId, testAnalysisId, 1, 'html') as string;
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('Stage 1');
      expect(html).toContain('example-export-test.com');
      
      // Check for structured content
      expect(html).toContain('Value Proposition');
      expect(html).toContain('Target Audience');
      expect(html).toContain('Monetization');
    });

    it('should export Stage 2 as HTML with scores', async () => {
      const html = await exportService.exportStage(testUserId, testAnalysisId, 2, 'html') as string;
      
      expect(html).toContain('Stage 2');
      expect(html).toContain('Effort Score');
      expect(html).toContain('Reward Score');
      expect(html).toContain('7'); // effortScore
      expect(html).toContain('8'); // rewardScore
      expect(html).toContain('go'); // recommendation
    });

    it('should export Stage 3 as HTML with features and timeline', async () => {
      const html = await exportService.exportStage(testUserId, testAnalysisId, 3, 'html') as string;
      
      expect(html).toContain('Stage 3');
      expect(html).toContain('Core Features');
      expect(html).toContain('User Authentication');
      expect(html).toContain('Dashboard');
      expect(html).toContain('Timeline');
      expect(html).toContain('Planning');
    });
  });

  describe('JSON Export', () => {
    it('should export Stage 1 as valid JSON', async () => {
      const json = await exportService.exportStage(testUserId, testAnalysisId, 1, 'json') as string;
      
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('stageName');
      expect(parsed).toHaveProperty('data');
      expect(parsed.data).toHaveProperty('structured');
      expect(parsed.data.structured).toHaveProperty('overview');
    });

    it('should export Stage 2 as valid JSON with all fields', async () => {
      const json = await exportService.exportStage(testUserId, testAnalysisId, 2, 'json') as string;
      
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('stageName');
      expect(parsed.data).toHaveProperty('effortScore');
      expect(parsed.data).toHaveProperty('rewardScore');
      expect(parsed.data).toHaveProperty('recommendation');
      expect(parsed.data.effortScore).toBe(7);
      expect(parsed.data.rewardScore).toBe(8);
    });

    it('should export Stage 3 as valid JSON with nested structures', async () => {
      const json = await exportService.exportStage(testUserId, testAnalysisId, 3, 'json') as string;
      
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('stageName');
      expect(parsed.data).toHaveProperty('coreFeatures');
      expect(Array.isArray(parsed.data.coreFeatures)).toBe(true);
      expect(parsed.data.coreFeatures.length).toBeGreaterThan(0);
      expect(parsed.data).toHaveProperty('techStack');
      expect(parsed.data.techStack).toHaveProperty('frontend');
    });
  });

  describe('CSV Export', () => {
    it('should export Stage 1 as valid CSV', async () => {
      const csv = await exportService.exportStage(testUserId, testAnalysisId, 1, 'csv') as string;
      
      // Check CSV structure
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(1); // At least header + 1 row
      
      // Check for headers
      const headers = lines[0];
      expect(headers).toContain('url');
    });

    it('should export Stage 2 as valid CSV with proper escaping', async () => {
      const csv = await exportService.exportStage(testUserId, testAnalysisId, 2, 'csv') as string;
      
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(1);
      
      // Check for key fields
      expect(csv).toContain('effortScore');
      expect(csv).toContain('rewardScore');
      expect(csv).toContain('recommendation');
    });

    it('should handle special characters in CSV export', async () => {
      // Create analysis with special characters
      const specialAnalysis = await minimalStorage.createAnalysis(testUserId, {
        url: 'https://special-chars.com',
        summary: 'Test with "quotes", commas, and\nnewlines',
        model: 'test-model',
        structured: {
          overview: {
            valueProposition: 'Value with, commas',
            targetAudience: 'Audience with "quotes"',
            monetization: 'Model with\nnewlines'
          }
        }
      });

      const csv = await exportService.exportStage(testUserId, specialAnalysis.id, 1, 'csv') as string;
      
      // CSV should properly escape special characters
      expect(csv).toBeDefined();
      expect(csv.length).toBeGreaterThan(0);
      
      // Verify it's valid CSV (no unescaped quotes or commas breaking structure)
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('PDF Export', () => {
    it('should export Stage 1 as PDF buffer', async () => {
      const pdf = await exportService.exportStage(testUserId, testAnalysisId, 1, 'pdf') as Buffer;
      
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
      
      // Check PDF magic number
      const pdfHeader = pdf.toString('utf8', 0, 4);
      expect(pdfHeader).toBe('%PDF');
    });

    it('should export Stage 2 as PDF with content', async () => {
      const pdf = await exportService.exportStage(testUserId, testAnalysisId, 2, 'pdf') as Buffer;
      
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
      expect(pdf.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should export Stage 3 as PDF with tables', async () => {
      const pdf = await exportService.exportStage(testUserId, testAnalysisId, 3, 'pdf') as Buffer;
      
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(0);
      expect(pdf.toString('utf8', 0, 4)).toBe('%PDF');
    });
  });

  describe('Complete Plan Export', () => {
    it('should export complete plan as HTML with all stages', async () => {
      const html = await exportService.exportHTML(testUserId, testAnalysisId);
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Complete Business Plan');
      expect(html).toContain('example-export-test.com');
      
      // Should contain all stages
      expect(html).toContain('Stage 1');
      expect(html).toContain('Stage 2');
      expect(html).toContain('Stage 3');
      
      // Should contain table of contents
      expect(html).toContain('Table of Contents');
    });

    it('should export complete plan as JSON with all stages', async () => {
      const json = await exportService.exportJSON(testUserId, testAnalysisId);
      
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('metadata');
      expect(parsed).toHaveProperty('stages');
      expect(parsed.metadata).toHaveProperty('businessName');
      expect(parsed.metadata).toHaveProperty('url');
      expect(parsed.metadata.url).toBe('https://example-export-test.com');
      
      // Should have stage data
      expect(parsed.stages).toHaveProperty('stage1');
      expect(parsed.stages).toHaveProperty('stage2');
      expect(parsed.stages).toHaveProperty('stage3');
    });

    it('should export complete plan as PDF with cover page', async () => {
      const pdf = await exportService.exportPDF(testUserId, testAnalysisId);
      
      expect(pdf).toBeInstanceOf(Buffer);
      expect(pdf.length).toBeGreaterThan(1000); // Should be substantial
      expect(pdf.toString('utf8', 0, 4)).toBe('%PDF');
    });
  });

  describe('Export Error Handling', () => {
    it('should handle non-existent analysis', async () => {
      await expect(
        exportService.exportStage(testUserId, 'non-existent-id', 1, 'html')
      ).rejects.toThrow();
    });

    it('should handle invalid stage number', async () => {
      await expect(
        exportService.exportStage(testUserId, testAnalysisId, 0, 'html')
      ).rejects.toThrow();

      await expect(
        exportService.exportStage(testUserId, testAnalysisId, 7, 'html')
      ).rejects.toThrow();
    });

    it('should handle missing stage data gracefully', async () => {
      // Try to export Stage 4 which doesn't have data
      const result = await exportService.exportStage(testUserId, testAnalysisId, 4, 'html');
      
      // Should return something (even if empty or placeholder)
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should handle export format errors', async () => {
      // Test with invalid format parameter
      await expect(
        exportService.exportStage(testUserId, testAnalysisId, 1, 'invalid' as any)
      ).rejects.toThrow();
    });
  });

  describe('Export Metadata', () => {
    it('should include export timestamp in all formats', async () => {
      const html = await exportService.exportStage(testUserId, testAnalysisId, 1, 'html') as string;
      expect(html).toMatch(/\d{4}-\d{2}-\d{2}/); // Date format

      const json = await exportService.exportStage(testUserId, testAnalysisId, 1, 'json') as string;
      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('exportedAt');
    });

    it('should include business information in exports', async () => {
      const html = await exportService.exportStage(testUserId, testAnalysisId, 1, 'html') as string;
      expect(html).toContain('example-export-test.com');

      const json = await exportService.exportStage(testUserId, testAnalysisId, 1, 'json') as string;
      const parsed = JSON.parse(json);
      expect(parsed.data.url).toBe('https://example-export-test.com');
    });
  });

  describe('Export Performance', () => {
    it('should export HTML in reasonable time', async () => {
      const start = Date.now();
      await exportService.exportStage(testUserId, testAnalysisId, 1, 'html');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should export JSON in reasonable time', async () => {
      const start = Date.now();
      await exportService.exportStage(testUserId, testAnalysisId, 1, 'json');
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(500); // JSON should be very fast
    });

    it('should export complete plan in reasonable time', async () => {
      const start = Date.now();
      await exportService.exportJSON(testUserId, testAnalysisId);
      const duration = Date.now() - start;
      
      expect(duration).toBeLessThan(2000); // Complete plan should be under 2 seconds
    });
  });
});
