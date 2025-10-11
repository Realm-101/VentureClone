import { describe, it, expect } from 'vitest';
import { clonabilityScoreService, type ClonabilityScore } from '../services/clonability-score.js';
import type { ProjectEstimates } from '../services/technology-insights.js';
import type { EnhancedStructuredAnalysis } from '@shared/schema';

describe('ClonabilityScoreService', () => {
  describe('calculateClonability', () => {
    it('should calculate high clonability for simple projects', () => {
      const technicalComplexity = 2; // Very simple
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [],
          swot: {
            strengths: ['Strong brand'],
            weaknesses: ['Limited features', 'Poor UX'],
            opportunities: ['Market gap', 'Growing demand', 'New tech'],
            threats: [],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };
      const resourceEstimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 weeks',
          maximum: '6 weeks',
          realistic: '4 weeks',
        },
        costEstimate: {
          development: '$5,000-$15,000',
          infrastructure: '$0-$50/month',
          maintenance: '$500-$2,000/month',
          total: '$25,000-$75,000 (first year)',
        },
        teamSize: {
          minimum: 1,
          recommended: 1,
        },
      };

      const result = clonabilityScoreService.calculateClonability(
        technicalComplexity,
        marketData,
        resourceEstimates
      );

      expect(result.score).toBeGreaterThanOrEqual(7);
      expect(result.rating).toMatch(/easy|very-easy/);
      expect(result.components.technicalComplexity.score).toBe(9); // 11 - 2
      expect(result.components.technicalComplexity.weight).toBe(0.4);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should calculate low clonability for complex projects', () => {
      const technicalComplexity = 9; // Very complex
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [
            { name: 'Competitor 1' },
            { name: 'Competitor 2' },
            { name: 'Competitor 3' },
            { name: 'Competitor 4' },
            { name: 'Competitor 5' },
            { name: 'Competitor 6' },
          ],
          swot: {
            strengths: ['Strong brand', 'Large user base', 'Advanced features'],
            weaknesses: [],
            opportunities: [],
            threats: ['Regulation', 'Market saturation', 'High costs'],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };
      const resourceEstimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '12 months',
          maximum: '24 months',
          realistic: '18 months',
        },
        costEstimate: {
          development: '$150,000+',
          infrastructure: '$5,000+/month',
          maintenance: '$30,000+/month',
          total: '$500,000+ (first year)',
        },
        teamSize: {
          minimum: 5,
          recommended: 8,
        },
      };

      const result = clonabilityScoreService.calculateClonability(
        technicalComplexity,
        marketData,
        resourceEstimates
      );

      expect(result.score).toBeLessThanOrEqual(4);
      expect(result.rating).toMatch(/difficult|very-difficult/);
      expect(result.components.technicalComplexity.score).toBe(2); // 11 - 9
    });

    it('should handle missing market data gracefully', () => {
      const technicalComplexity = 5;
      const marketData = null;
      const resourceEstimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(
        technicalComplexity,
        marketData,
        resourceEstimates
      );

      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.components.marketOpportunity.score).toBe(5); // Default neutral
      expect(result.confidence).toBeLessThan(0.8); // Lower confidence without market data
    });
  });

  describe('calculateMarketScore', () => {
    it('should score blue ocean opportunities highly', () => {
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [], // No competitors
          swot: {
            strengths: [],
            weaknesses: ['Limited features'],
            opportunities: ['Market gap', 'Growing demand', 'New technology'],
            threats: [],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const score = clonabilityScoreService.calculateMarketScore(marketData);

      expect(score).toBeGreaterThanOrEqual(7); // High score for blue ocean
    });

    it('should score crowded markets lower', () => {
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [
            { name: 'Competitor 1' },
            { name: 'Competitor 2' },
            { name: 'Competitor 3' },
            { name: 'Competitor 4' },
            { name: 'Competitor 5' },
            { name: 'Competitor 6' },
            { name: 'Competitor 7' },
          ],
          swot: {
            strengths: ['Strong brand', 'Large user base', 'Advanced features'],
            weaknesses: [],
            opportunities: [],
            threats: ['Regulation', 'Market saturation'],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const score = clonabilityScoreService.calculateMarketScore(marketData);

      expect(score).toBeLessThanOrEqual(5); // Lower score for crowded market
    });

    it('should return neutral score for null market data', () => {
      const score = clonabilityScoreService.calculateMarketScore(null);
      expect(score).toBe(5);
    });
  });

  describe('calculateResourceScore', () => {
    it('should score low-cost projects highly', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 weeks',
          maximum: '6 weeks',
          realistic: '4 weeks',
        },
        costEstimate: {
          development: '$5,000-$15,000',
          infrastructure: '$0-$50/month',
          maintenance: '$500-$2,000/month',
          total: '$25,000-$75,000 (first year)',
        },
        teamSize: {
          minimum: 1,
          recommended: 1,
        },
      };

      const score = clonabilityScoreService.calculateResourceScore(estimates);

      expect(score).toBeGreaterThanOrEqual(7);
    });

    it('should score high-cost projects lower', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '12 months',
          maximum: '24 months',
          realistic: '18 months',
        },
        costEstimate: {
          development: '$200,000+',
          infrastructure: '$5,000+/month',
          maintenance: '$30,000+/month',
          total: '$500,000+ (first year)',
        },
        teamSize: {
          minimum: 5,
          recommended: 8,
        },
      };

      const score = clonabilityScoreService.calculateResourceScore(estimates);

      expect(score).toBeLessThanOrEqual(4);
    });
  });

  describe('calculateTimeScore', () => {
    it('should score quick projects highly', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 weeks',
          maximum: '6 weeks',
          realistic: '4 weeks',
        },
        costEstimate: {
          development: '$5,000-$15,000',
          infrastructure: '$0-$50/month',
          maintenance: '$500-$2,000/month',
          total: '$25,000-$75,000 (first year)',
        },
        teamSize: {
          minimum: 1,
          recommended: 1,
        },
      };

      const score = clonabilityScoreService.calculateTimeScore(estimates);

      expect(score).toBe(10); // 4 weeks = excellent
    });

    it('should score long projects lower', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '12 months',
          maximum: '24 months',
          realistic: '18 months',
        },
        costEstimate: {
          development: '$150,000+',
          infrastructure: '$5,000+/month',
          maintenance: '$30,000+/month',
          total: '$500,000+ (first year)',
        },
        teamSize: {
          minimum: 5,
          recommended: 8,
        },
      };

      const score = clonabilityScoreService.calculateTimeScore(estimates);

      expect(score).toBeLessThanOrEqual(4);
    });
  });

  describe('getRating', () => {
    it('should map scores to correct ratings', () => {
      expect(clonabilityScoreService.getRating(10)).toBe('very-easy');
      expect(clonabilityScoreService.getRating(9)).toBe('very-easy');
      expect(clonabilityScoreService.getRating(8)).toBe('easy');
      expect(clonabilityScoreService.getRating(7)).toBe('easy');
      expect(clonabilityScoreService.getRating(6)).toBe('moderate');
      expect(clonabilityScoreService.getRating(5)).toBe('moderate');
      expect(clonabilityScoreService.getRating(4)).toBe('difficult');
      expect(clonabilityScoreService.getRating(3)).toBe('difficult');
      expect(clonabilityScoreService.getRating(2)).toBe('very-difficult');
      expect(clonabilityScoreService.getRating(1)).toBe('very-difficult');
    });
  });

  describe('getRecommendation', () => {
    it('should provide positive recommendation for high scores', () => {
      const recommendation = clonabilityScoreService.getRecommendation(9, 9, 8);
      expect(recommendation).toContain('Excellent');
      expect(recommendation).toContain('MVP');
    });

    it('should provide cautious recommendation for moderate scores', () => {
      const recommendation = clonabilityScoreService.getRecommendation(5, 6, 5);
      expect(recommendation).toContain('Moderate');
      expect(recommendation).toContain('effort');
    });

    it('should provide negative recommendation for low scores', () => {
      const recommendation = clonabilityScoreService.getRecommendation(2, 2, 3);
      expect(recommendation).toContain('Not recommended');
    });

    it('should provide specific guidance for technical challenges', () => {
      const recommendation = clonabilityScoreService.getRecommendation(3, 3, 7);
      expect(recommendation).toContain('technical complexity');
    });

    it('should provide specific guidance for market challenges', () => {
      const recommendation = clonabilityScoreService.getRecommendation(3, 7, 3);
      expect(recommendation).toContain('market');
    });
  });

  describe('weighted scoring', () => {
    it('should apply correct weights to components', () => {
      const technicalComplexity = 5;
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [],
          swot: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };
      const resourceEstimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(
        technicalComplexity,
        marketData,
        resourceEstimates
      );

      // Verify weights sum to 1.0
      const totalWeight =
        result.components.technicalComplexity.weight +
        result.components.marketOpportunity.weight +
        result.components.resourceRequirements.weight +
        result.components.timeToMarket.weight;

      expect(totalWeight).toBeCloseTo(1.0, 5);

      // Verify correct weights
      expect(result.components.technicalComplexity.weight).toBe(0.4);
      expect(result.components.marketOpportunity.weight).toBe(0.3);
      expect(result.components.resourceRequirements.weight).toBe(0.2);
      expect(result.components.timeToMarket.weight).toBe(0.1);
    });

    it('should weight technical complexity most heavily (40%)', () => {
      const baseEstimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      // Test with low complexity
      const lowComplexityResult = clonabilityScoreService.calculateClonability(
        1,
        null,
        baseEstimates
      );

      // Test with high complexity
      const highComplexityResult = clonabilityScoreService.calculateClonability(
        10,
        null,
        baseEstimates
      );

      // The difference should be significant due to 40% weight
      const scoreDifference = lowComplexityResult.score - highComplexityResult.score;
      expect(scoreDifference).toBeGreaterThanOrEqual(3); // At least 3 points difference
    });
  });

  describe('edge cases', () => {
    it('should handle extreme technical complexity values', () => {
      const resourceEstimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      // Test minimum complexity
      const minResult = clonabilityScoreService.calculateClonability(1, null, resourceEstimates);
      expect(minResult.score).toBeGreaterThanOrEqual(1);
      expect(minResult.score).toBeLessThanOrEqual(10);
      expect(minResult.components.technicalComplexity.score).toBe(10); // 11 - 1

      // Test maximum complexity
      const maxResult = clonabilityScoreService.calculateClonability(10, null, resourceEstimates);
      expect(maxResult.score).toBeGreaterThanOrEqual(1);
      expect(maxResult.score).toBeLessThanOrEqual(10);
      expect(maxResult.components.technicalComplexity.score).toBe(1); // 11 - 10
    });

    it('should handle malformed cost strings gracefully', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: 'Unknown cost',
          infrastructure: 'Variable',
          maintenance: 'TBD',
          total: 'Contact for pricing',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(5, null, estimates);

      // Should not crash and should return valid score
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.rating).toBeDefined();
    });

    it('should handle malformed time strings gracefully', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: 'Unknown',
          maximum: 'TBD',
          realistic: 'Depends on team',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(5, null, estimates);

      // Should not crash and should return valid score
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
      expect(result.components.timeToMarket.score).toBe(6); // Default to 6 months
    });

    it('should handle empty SWOT data', () => {
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [],
          swot: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: [],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const score = clonabilityScoreService.calculateMarketScore(marketData);

      // Should return a valid score even with empty SWOT
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should handle very large SWOT arrays', () => {
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: Array(20).fill({ name: 'Competitor' }),
          swot: {
            strengths: Array(10).fill('Strength'),
            weaknesses: Array(10).fill('Weakness'),
            opportunities: Array(10).fill('Opportunity'),
            threats: Array(10).fill('Threat'),
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const score = clonabilityScoreService.calculateMarketScore(marketData);

      // Should clamp to valid range despite extreme values
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    });

    it('should handle zero team size', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 0,
          recommended: 0,
        },
      };

      const result = clonabilityScoreService.calculateClonability(5, null, estimates);

      // Should not crash and should return valid score
      expect(result.score).toBeGreaterThanOrEqual(1);
      expect(result.score).toBeLessThanOrEqual(10);
    });

    it('should handle extremely high costs', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 years',
          maximum: '5 years',
          realistic: '3 years',
        },
        costEstimate: {
          development: '$10,000,000+',
          infrastructure: '$100,000+/month',
          maintenance: '$500,000+/month',
          total: '$15,000,000+ (first year)',
        },
        teamSize: {
          minimum: 50,
          recommended: 100,
        },
      };

      const result = clonabilityScoreService.calculateClonability(10, null, estimates);

      // Should return very low clonability
      expect(result.score).toBeLessThanOrEqual(3);
      expect(result.rating).toMatch(/difficult|very-difficult/);
    });

    it('should handle extremely low costs', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '1 week',
          maximum: '2 weeks',
          realistic: '1 week',
        },
        costEstimate: {
          development: '$500-$2,000',
          infrastructure: '$0/month',
          maintenance: '$0/month',
          total: '$500-$2,000 (first year)',
        },
        teamSize: {
          minimum: 1,
          recommended: 1,
        },
      };

      const result = clonabilityScoreService.calculateClonability(1, null, estimates);

      // Should return very high clonability
      expect(result.score).toBeGreaterThanOrEqual(8);
      expect(result.rating).toMatch(/easy|very-easy/);
    });
  });

  describe('confidence calculation', () => {
    it('should have low confidence with minimal data', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(5, null, estimates);

      expect(result.confidence).toBeLessThanOrEqual(0.6);
    });

    it('should have high confidence with comprehensive data', () => {
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [
            { name: 'Competitor 1' },
            { name: 'Competitor 2' },
            { name: 'Competitor 3' },
          ],
          swot: {
            strengths: ['S1', 'S2', 'S3'],
            weaknesses: ['W1', 'W2', 'W3'],
            opportunities: ['O1', 'O2', 'O3'],
            threats: ['T1', 'T2', 'T3'],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(5, marketData, estimates);

      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should cap confidence at 1.0', () => {
      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: Array(10).fill({ name: 'Competitor' }),
          swot: {
            strengths: Array(10).fill('Strength'),
            weaknesses: Array(10).fill('Weakness'),
            opportunities: Array(10).fill('Opportunity'),
            threats: Array(10).fill('Threat'),
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '2 months',
          maximum: '4 months',
          realistic: '3 months',
        },
        costEstimate: {
          development: '$30,000-$75,000',
          infrastructure: '$200-$1,000/month',
          maintenance: '$5,000-$15,000/month',
          total: '$75,000-$200,000 (first year)',
        },
        teamSize: {
          minimum: 2,
          recommended: 3,
        },
      };

      const result = clonabilityScoreService.calculateClonability(5, marketData, estimates);

      expect(result.confidence).toBeLessThanOrEqual(1.0);
    });
  });

  describe('score boundary conditions', () => {
    it('should never return score below 1', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '5 years',
          maximum: '10 years',
          realistic: '7 years',
        },
        costEstimate: {
          development: '$50,000,000+',
          infrastructure: '$1,000,000+/month',
          maintenance: '$5,000,000+/month',
          total: '$100,000,000+ (first year)',
        },
        teamSize: {
          minimum: 100,
          recommended: 200,
        },
      };

      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: Array(50).fill({ name: 'Competitor' }),
          swot: {
            strengths: Array(20).fill('Strength'),
            weaknesses: [],
            opportunities: [],
            threats: Array(20).fill('Threat'),
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const result = clonabilityScoreService.calculateClonability(10, marketData, estimates);

      expect(result.score).toBeGreaterThanOrEqual(1);
    });

    it('should never return score above 10', () => {
      const estimates: ProjectEstimates = {
        timeEstimate: {
          minimum: '1 day',
          maximum: '3 days',
          realistic: '2 days',
        },
        costEstimate: {
          development: '$100-$500',
          infrastructure: '$0/month',
          maintenance: '$0/month',
          total: '$100-$500 (first year)',
        },
        teamSize: {
          minimum: 1,
          recommended: 1,
        },
      };

      const marketData: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test',
          targetAudience: 'Test',
          monetization: 'Test',
        },
        market: {
          competitors: [],
          swot: {
            strengths: [],
            weaknesses: Array(20).fill('Weakness'),
            opportunities: Array(20).fill('Opportunity'),
            threats: [],
          },
        },
        synthesis: {
          summary: 'Test',
          keyInsights: [],
          nextActions: [],
        },
        sources: [],
      };

      const result = clonabilityScoreService.calculateClonability(1, marketData, estimates);

      expect(result.score).toBeLessThanOrEqual(10);
    });
  });
});
