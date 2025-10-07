/**
 * Scorecard Calculator Service
 * Handles calculation of weighted scores for clonability scorecard
 */

export interface ScorecardCriteria {
  technicalComplexity: number;  // 1-10
  marketOpportunity: number;     // 1-10
  competitiveLandscape: number;  // 1-10
  resourceRequirements: number;  // 1-10
  timeToMarket: number;          // 1-10
}

export interface ScorecardWeights {
  technicalComplexity: number;
  marketOpportunity: number;
  competitiveLandscape: number;
  resourceRequirements: number;
  timeToMarket: number;
}

/**
 * Default weights for scorecard criteria
 * Total must equal 1.0 (100%)
 */
export const DEFAULT_WEIGHTS: ScorecardWeights = {
  technicalComplexity: 0.20,   // 20%
  marketOpportunity: 0.25,      // 25%
  competitiveLandscape: 0.15,   // 15%
  resourceRequirements: 0.20,   // 20%
  timeToMarket: 0.20            // 20%
};

/**
 * Calculate the overall weighted score from individual criteria scores
 * 
 * Formula: Overall Score = Σ(Score × Weight)
 * 
 * @param criteria - Individual scores for each criterion (1-10)
 * @param weights - Optional custom weights (defaults to DEFAULT_WEIGHTS)
 * @returns Overall score rounded to 1 decimal place
 */
export function calculateOverallScore(
  criteria: ScorecardCriteria,
  weights: ScorecardWeights = DEFAULT_WEIGHTS
): number {
  const weightedSum = 
    (criteria.technicalComplexity * weights.technicalComplexity) +
    (criteria.marketOpportunity * weights.marketOpportunity) +
    (criteria.competitiveLandscape * weights.competitiveLandscape) +
    (criteria.resourceRequirements * weights.resourceRequirements) +
    (criteria.timeToMarket * weights.timeToMarket);
  
  // Round to 1 decimal place
  return Math.round(weightedSum * 10) / 10;
}

/**
 * Calculate individual weighted score for a criterion
 * 
 * @param score - Raw score (1-10)
 * @param weight - Weight as decimal (e.g., 0.20 for 20%)
 * @returns Weighted score rounded to 1 decimal place
 */
export function calculateWeightedScore(score: number, weight: number): number {
  return Math.round((score * weight) * 10) / 10;
}

/**
 * Validate that weights sum to 1.0 (100%)
 * 
 * @param weights - Weights to validate
 * @returns true if weights sum to 1.0 (within tolerance)
 */
export function validateWeights(weights: ScorecardWeights): boolean {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const tolerance = 0.001; // Allow small floating point errors
  return Math.abs(sum - 1.0) < tolerance;
}
