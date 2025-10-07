import { describe, it, expect } from 'vitest';
import {
  calculateOverallScore,
  calculateWeightedScore,
  validateWeights,
  DEFAULT_WEIGHTS,
  type ScorecardCriteria,
  type ScorecardWeights
} from '../services/scorecard-calculator';

describe('Scorecard Calculator', () => {
  describe('calculateOverallScore', () => {
    it('should calculate weighted sum correctly with default weights', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 8,
        marketOpportunity: 7,
        competitiveLandscape: 6,
        resourceRequirements: 5,
        timeToMarket: 9
      };

      // Expected: (8*0.20) + (7*0.25) + (6*0.15) + (5*0.20) + (9*0.20)
      // = 1.6 + 1.75 + 0.9 + 1.0 + 1.8 = 7.05
      const result = calculateOverallScore(criteria);
      expect(result).toBe(7.1); // Rounded to 1 decimal
    });

    it('should round to 1 decimal place', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 7.33,
        marketOpportunity: 8.67,
        competitiveLandscape: 6.11,
        resourceRequirements: 5.89,
        timeToMarket: 9.22
      };

      const result = calculateOverallScore(criteria);
      expect(result).toBeTypeOf('number');
      expect(result.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(1);
    });

    it('should handle all zeros', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 0,
        marketOpportunity: 0,
        competitiveLandscape: 0,
        resourceRequirements: 0,
        timeToMarket: 0
      };

      const result = calculateOverallScore(criteria);
      expect(result).toBe(0);
    });

    it('should handle all tens', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 10,
        marketOpportunity: 10,
        competitiveLandscape: 10,
        resourceRequirements: 10,
        timeToMarket: 10
      };

      // Expected: (10*0.20) + (10*0.25) + (10*0.15) + (10*0.20) + (10*0.20)
      // = 2 + 2.5 + 1.5 + 2 + 2 = 10
      const result = calculateOverallScore(criteria);
      expect(result).toBe(10);
    });

    it('should handle mixed values correctly', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 1,
        marketOpportunity: 10,
        competitiveLandscape: 5,
        resourceRequirements: 3,
        timeToMarket: 7
      };

      // Expected: (1*0.20) + (10*0.25) + (5*0.15) + (3*0.20) + (7*0.20)
      // = 0.2 + 2.5 + 0.75 + 0.6 + 1.4 = 5.45
      const result = calculateOverallScore(criteria);
      expect(result).toBe(5.5); // Rounded to 1 decimal
    });

    it('should work with custom weights', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 8,
        marketOpportunity: 7,
        competitiveLandscape: 6,
        resourceRequirements: 5,
        timeToMarket: 9
      };

      const customWeights: ScorecardWeights = {
        technicalComplexity: 0.30,
        marketOpportunity: 0.30,
        competitiveLandscape: 0.10,
        resourceRequirements: 0.15,
        timeToMarket: 0.15
      };

      // Expected: (8*0.30) + (7*0.30) + (6*0.10) + (5*0.15) + (9*0.15)
      // = 2.4 + 2.1 + 0.6 + 0.75 + 1.35 = 7.2
      const result = calculateOverallScore(criteria, customWeights);
      expect(result).toBe(7.2);
    });

    it('should handle decimal scores', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 7.5,
        marketOpportunity: 8.3,
        competitiveLandscape: 6.7,
        resourceRequirements: 5.2,
        timeToMarket: 9.1
      };

      const result = calculateOverallScore(criteria);
      expect(result).toBeTypeOf('number');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(10);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should calculate weighted score correctly', () => {
      const result = calculateWeightedScore(8, 0.20);
      expect(result).toBe(1.6);
    });

    it('should round to 1 decimal place', () => {
      const result = calculateWeightedScore(7.33, 0.25);
      expect(result).toBe(1.8); // 7.33 * 0.25 = 1.8325, rounded to 1.8
    });

    it('should handle zero score', () => {
      const result = calculateWeightedScore(0, 0.20);
      expect(result).toBe(0);
    });

    it('should handle zero weight', () => {
      const result = calculateWeightedScore(10, 0);
      expect(result).toBe(0);
    });
  });

  describe('validateWeights', () => {
    it('should validate default weights sum to 1.0', () => {
      const result = validateWeights(DEFAULT_WEIGHTS);
      expect(result).toBe(true);
    });

    it('should accept weights that sum to 1.0', () => {
      const weights: ScorecardWeights = {
        technicalComplexity: 0.25,
        marketOpportunity: 0.25,
        competitiveLandscape: 0.20,
        resourceRequirements: 0.15,
        timeToMarket: 0.15
      };

      const result = validateWeights(weights);
      expect(result).toBe(true);
    });

    it('should reject weights that sum to less than 1.0', () => {
      const weights: ScorecardWeights = {
        technicalComplexity: 0.20,
        marketOpportunity: 0.20,
        competitiveLandscape: 0.15,
        resourceRequirements: 0.15,
        timeToMarket: 0.15
      };

      const result = validateWeights(weights);
      expect(result).toBe(false);
    });

    it('should reject weights that sum to more than 1.0', () => {
      const weights: ScorecardWeights = {
        technicalComplexity: 0.30,
        marketOpportunity: 0.30,
        competitiveLandscape: 0.20,
        resourceRequirements: 0.20,
        timeToMarket: 0.20
      };

      const result = validateWeights(weights);
      expect(result).toBe(false);
    });

    it('should handle floating point precision errors', () => {
      const weights: ScorecardWeights = {
        technicalComplexity: 0.1,
        marketOpportunity: 0.2,
        competitiveLandscape: 0.3,
        resourceRequirements: 0.2,
        timeToMarket: 0.2
      };

      // Sum might be 1.0000000000000002 due to floating point
      const result = validateWeights(weights);
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small scores', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 0.1,
        marketOpportunity: 0.2,
        competitiveLandscape: 0.3,
        resourceRequirements: 0.4,
        timeToMarket: 0.5
      };

      const result = calculateOverallScore(criteria);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
    });

    it('should handle negative scores (edge case)', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: -5,
        marketOpportunity: 10,
        competitiveLandscape: 5,
        resourceRequirements: 5,
        timeToMarket: 5
      };

      const result = calculateOverallScore(criteria);
      expect(result).toBeTypeOf('number');
      // Should still calculate, even if negative (validation should happen elsewhere)
    });

    it('should handle scores above 10 (edge case)', () => {
      const criteria: ScorecardCriteria = {
        technicalComplexity: 15,
        marketOpportunity: 10,
        competitiveLandscape: 5,
        resourceRequirements: 5,
        timeToMarket: 5
      };

      const result = calculateOverallScore(criteria);
      expect(result).toBeTypeOf('number');
      // Should still calculate, even if above 10 (validation should happen elsewhere)
    });
  });
});
