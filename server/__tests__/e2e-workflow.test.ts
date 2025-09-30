import { describe, it, expect, vi } from 'vitest';
import { fetchFirstParty } from '../lib/fetchFirstParty.js';
import { BusinessImprovementService } from '../services/business-improvement.js';

describe('End-to-End Workflow Integration', () => {
  describe('Complete Analysis Workflow', () => {
    it('should handle the complete enhanced analysis workflow', async () => {
      // Test the workflow components individually since we can't test with real APIs
      
      // 1. First-party data extraction (mocked)
      const mockHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Business</title>
          <meta name="description" content="A test business for analysis">
        </head>
        <body>
          <h1>Welcome to Test Business</h1>
          <main>
            <p>We provide excellent services to our customers.</p>
            <p>Our business model is subscription-based.</p>
          </main>
        </body>
        </html>
      `;

      // Mock fetch for first-party data
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode(mockHtml)
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn()
          })
        }
      } as any);

      const firstPartyData = await fetchFirstParty('https://test-business.com');
      
      expect(firstPartyData).toBeTruthy();
      expect(firstPartyData?.title).toBe('Test Business');
      expect(firstPartyData?.description).toBe('A test business for analysis');
      expect(firstPartyData?.h1).toBe('Welcome to Test Business');
      expect(firstPartyData?.textSnippet).toContain('excellent services');

      // 2. Business improvement generation (mocked)
      const mockAIProvider = {
        generateStructuredContent: vi.fn().mockResolvedValue({
          twists: [
            'Focus on mobile-first user experience',
            'Implement freemium pricing model',
            'Add social proof and testimonials'
          ],
          sevenDayPlan: [
            { day: 1, tasks: ['Research target audience', 'Analyze competitors', 'Define MVP features'] },
            { day: 2, tasks: ['Create wireframes', 'Design user flow', 'Set up development environment'] },
            { day: 3, tasks: ['Build core functionality', 'Implement user authentication', 'Create basic UI'] },
            { day: 4, tasks: ['Add payment integration', 'Implement subscription logic', 'Test core features'] },
            { day: 5, tasks: ['Add social proof elements', 'Optimize for mobile', 'Implement analytics'] },
            { day: 6, tasks: ['User testing sessions', 'Fix critical bugs', 'Prepare launch materials'] },
            { day: 7, tasks: ['Launch MVP', 'Monitor metrics', 'Gather user feedback'] }
          ]
        })
      } as any;

      const improvementService = new BusinessImprovementService(mockAIProvider);
      
      const mockAnalysis = {
        overview: {
          valueProposition: 'Excellent services for customers',
          targetAudience: 'Business professionals',
          monetization: 'Subscription-based model'
        },
        market: {
          competitors: [{ name: 'Competitor A' }],
          swot: {
            strengths: ['Strong service quality'],
            weaknesses: ['Limited mobile presence'],
            opportunities: ['Mobile market expansion'],
            threats: ['Increasing competition']
          }
        },
        synthesis: {
          summary: 'A subscription-based business with growth potential',
          keyInsights: ['Mobile optimization needed', 'Strong service foundation'],
          nextActions: ['Develop mobile app', 'Expand marketing']
        },
        sources: []
      };

      const improvement = await improvementService.generateImprovement(mockAnalysis);
      
      expect(improvement.twists).toHaveLength(3);
      expect(improvement.sevenDayPlan).toHaveLength(7);
      expect(improvement.sevenDayPlan[0].day).toBe(1);
      expect(improvement.sevenDayPlan[0].tasks).toHaveLength(3);
      expect(improvement.generatedAt).toBeTruthy();

      // Restore original fetch
      global.fetch = originalFetch;
    });

    it('should handle graceful degradation when components fail', async () => {
      // Test that the system continues to work even when some components fail
      
      // 1. First-party extraction fails
      const firstPartyData = await fetchFirstParty('https://non-existent-site.com', 1000);
      expect(firstPartyData).toBeNull();

      // 2. Analysis should still work without first-party data
      // (This would be tested in the actual route handlers)
      
      // 3. Improvement generation with minimal data
      const mockAIProvider = {
        generateStructuredContent: vi.fn().mockResolvedValue({
          twists: ['Basic improvement 1', 'Basic improvement 2', 'Basic improvement 3'],
          sevenDayPlan: [
            { day: 1, tasks: ['Basic task'] },
            { day: 2, tasks: ['Another task'] },
            { day: 3, tasks: ['Third task'] },
            { day: 4, tasks: ['Fourth task'] },
            { day: 5, tasks: ['Fifth task'] },
            { day: 6, tasks: ['Sixth task'] },
            { day: 7, tasks: ['Final task'] }
          ]
        })
      } as any;

      const improvementService = new BusinessImprovementService(mockAIProvider);
      
      const minimalAnalysis = {
        overview: {
          valueProposition: 'Basic value prop',
          targetAudience: 'General audience',
          monetization: 'Unknown'
        },
        market: {
          competitors: [],
          swot: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          }
        },
        synthesis: {
          summary: 'Minimal analysis',
          keyInsights: ['Limited data available'],
          nextActions: ['Gather more information']
        },
        sources: []
      };

      const improvement = await improvementService.generateImprovement(minimalAnalysis);
      expect(improvement).toBeTruthy();
      expect(improvement.twists).toHaveLength(1);
      expect(improvement.sevenDayPlan).toHaveLength(7);
    });
  });

  describe('Performance Characteristics', () => {
    it('should complete workflow steps within acceptable time limits', async () => {
      // Test that each component completes within expected timeframes
      
      const startTime = Date.now();
      
      // Mock fast first-party extraction
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('<html><head><title>Fast Site</title></head><body><p>Content</p></body></html>')
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn()
          })
        }
      } as any);

      global.fetch = mockFetch;
      
      const firstPartyResult = await fetchFirstParty('https://fast-site.com', 5000);
      const firstPartyTime = Date.now() - startTime;
      
      expect(firstPartyTime).toBeLessThan(1000); // Should be very fast with mock
      expect(firstPartyResult).toBeTruthy();

      // Mock fast improvement generation
      const mockAIProvider = {
        generateStructuredContent: vi.fn().mockResolvedValue({
          twists: ['Quick improvement 1', 'Quick improvement 2', 'Quick improvement 3'],
          sevenDayPlan: Array.from({ length: 7 }, (_, i) => ({
            day: i + 1,
            tasks: [`Day ${i + 1} task`]
          }))
        })
      } as any;

      const improvementService = new BusinessImprovementService(mockAIProvider, { timeoutMs: 5000 });
      
      const improvementStart = Date.now();
      const improvement = await improvementService.generateImprovement({
        overview: { valueProposition: 'Test', targetAudience: 'Test', monetization: 'Test' },
        market: { competitors: [], swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] } },
        synthesis: { summary: 'Test', keyInsights: ['Test'], nextActions: ['Test'] },
        sources: []
      });
      const improvementTime = Date.now() - improvementStart;
      
      expect(improvementTime).toBeLessThan(1000); // Should be very fast with mock
      expect(improvement).toBeTruthy();
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle network timeouts gracefully', async () => {
      // Test timeout handling
      const result = await fetchFirstParty('https://slow-site.com', 100); // Very short timeout
      expect(result).toBeNull();
    });

    it('should handle malformed responses gracefully', async () => {
      // Mock malformed response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Map([['content-type', 'text/html']]),
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('<<invalid html>>')
              })
              .mockResolvedValueOnce({ done: true }),
            releaseLock: vi.fn()
          })
        }
      } as any);

      const result = await fetchFirstParty('https://malformed-site.com');
      
      // Should handle malformed HTML gracefully
      expect(result).toBeTruthy();
      if (result) {
        expect(result.url).toBe('https://malformed-site.com/');
      }
    });
  });
});