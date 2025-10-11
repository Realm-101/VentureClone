import type { ProjectEstimates } from './technology-insights.js';
import type { EnhancedStructuredAnalysis } from '@shared/schema';

/**
 * Clonability score result with detailed breakdown
 */
export interface ClonabilityScore {
  score: number; // 1-10 (10 = easiest to clone)
  rating: 'very-difficult' | 'difficult' | 'moderate' | 'easy' | 'very-easy';
  
  components: {
    technicalComplexity: { score: number; weight: number };
    marketOpportunity: { score: number; weight: number };
    resourceRequirements: { score: number; weight: number };
    timeToMarket: { score: number; weight: number };
  };
  
  recommendation: string;
  confidence: number; // 0-1
}

/**
 * ClonabilityScoreService
 * Calculates overall clonability score combining technical and business factors
 */
export class ClonabilityScoreService {
  // Component weights (must sum to 1.0)
  private readonly WEIGHTS = {
    technicalComplexity: 0.4,
    marketOpportunity: 0.3,
    resourceRequirements: 0.2,
    timeToMarket: 0.1,
  };

  /**
   * Calculate clonability score from multiple factors
   */
  calculateClonability(
    technicalComplexity: number,
    marketData: EnhancedStructuredAnalysis | null,
    resourceEstimates: ProjectEstimates
  ): ClonabilityScore {
    // Calculate component scores (all on 1-10 scale)
    const techScore = this.calculateTechnicalScore(technicalComplexity);
    const marketScore = this.calculateMarketScore(marketData);
    const resourceScore = this.calculateResourceScore(resourceEstimates);
    const timeScore = this.calculateTimeScore(resourceEstimates);

    // Calculate weighted total score
    const totalScore = 
      techScore * this.WEIGHTS.technicalComplexity +
      marketScore * this.WEIGHTS.marketOpportunity +
      resourceScore * this.WEIGHTS.resourceRequirements +
      timeScore * this.WEIGHTS.timeToMarket;

    // Round to nearest integer
    const finalScore = Math.round(totalScore);

    // Calculate confidence based on data availability
    const confidence = this.calculateConfidence(marketData, resourceEstimates);

    return {
      score: finalScore,
      rating: this.getRating(finalScore),
      components: {
        technicalComplexity: { score: techScore, weight: this.WEIGHTS.technicalComplexity },
        marketOpportunity: { score: marketScore, weight: this.WEIGHTS.marketOpportunity },
        resourceRequirements: { score: resourceScore, weight: this.WEIGHTS.resourceRequirements },
        timeToMarket: { score: timeScore, weight: this.WEIGHTS.timeToMarket },
      },
      recommendation: this.getRecommendation(finalScore, techScore, marketScore),
      confidence,
    };
  }

  /**
   * Calculate technical complexity score (inverted: lower complexity = higher score)
   */
  private calculateTechnicalScore(complexityScore: number): number {
    // Invert the complexity score (1-10 scale)
    // Complexity 1 (easiest) -> Score 10 (best clonability)
    // Complexity 10 (hardest) -> Score 1 (worst clonability)
    return 11 - complexityScore;
  }

  /**
   * Calculate market opportunity score based on SWOT and competition
   */
  calculateMarketScore(marketData: EnhancedStructuredAnalysis | null): number {
    if (!marketData?.market) {
      // Default to neutral score if no market data
      return 5;
    }

    let score = 5; // Start with neutral

    const { swot, competitors } = marketData.market;

    // Analyze SWOT components
    const strengthsCount = swot.strengths.length;
    const weaknessesCount = swot.weaknesses.length;
    const opportunitiesCount = swot.opportunities.length;
    const threatsCount = swot.threats.length;

    // More opportunities = better clonability (+0.5 per opportunity, max +2)
    score += Math.min(opportunitiesCount * 0.5, 2);

    // More strengths = harder to compete (-0.3 per strength, max -1.5)
    score -= Math.min(strengthsCount * 0.3, 1.5);

    // More weaknesses = easier to improve upon (+0.3 per weakness, max +1.5)
    score += Math.min(weaknessesCount * 0.3, 1.5);

    // More threats = riskier market (-0.4 per threat, max -2)
    score -= Math.min(threatsCount * 0.4, 2);

    // Competition analysis
    const competitorCount = competitors.length;
    if (competitorCount === 0) {
      // No competitors = blue ocean opportunity
      score += 2;
    } else if (competitorCount <= 3) {
      // Few competitors = good opportunity
      score += 1;
    } else if (competitorCount <= 5) {
      // Moderate competition = neutral
      score += 0;
    } else {
      // Many competitors = crowded market
      score -= 1;
    }

    // Clamp score to 1-10 range
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Calculate resource requirements score based on cost and time
   */
  calculateResourceScore(estimates: ProjectEstimates): number {
    let score = 5; // Start with neutral

    // Analyze development cost
    const devCost = this.extractCostValue(estimates.costEstimate.development);
    if (devCost < 20000) {
      score += 3; // Very affordable
    } else if (devCost < 50000) {
      score += 2; // Affordable
    } else if (devCost < 100000) {
      score += 0; // Moderate
    } else if (devCost < 200000) {
      score -= 2; // Expensive
    } else {
      score -= 3; // Very expensive
    }

    // Analyze infrastructure cost
    const infraCost = this.extractMonthlyCost(estimates.costEstimate.infrastructure);
    if (infraCost < 100) {
      score += 1; // Low monthly cost
    } else if (infraCost < 500) {
      score += 0; // Moderate monthly cost
    } else if (infraCost < 2000) {
      score -= 1; // High monthly cost
    } else {
      score -= 2; // Very high monthly cost
    }

    // Analyze team size requirements
    if (estimates.teamSize.minimum === 1) {
      score += 1; // Solo-friendly
    } else if (estimates.teamSize.minimum >= 3) {
      score -= 1; // Requires team
    }

    // Clamp score to 1-10 range
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Calculate time to market score based on development timeline
   */
  calculateTimeScore(estimates: ProjectEstimates): number {
    let score = 5; // Start with neutral

    // Parse realistic time estimate
    const timeInWeeks = this.parseTimeToWeeks(estimates.timeEstimate.realistic);

    // Score based on time to market
    if (timeInWeeks <= 4) {
      score = 10; // 1 month or less - excellent
    } else if (timeInWeeks <= 12) {
      score = 8; // 3 months - good
    } else if (timeInWeeks <= 24) {
      score = 6; // 6 months - moderate
    } else if (timeInWeeks <= 48) {
      score = 4; // 1 year - challenging
    } else {
      score = 2; // Over 1 year - very challenging
    }

    return score;
  }

  /**
   * Extract cost value from cost string
   */
  private extractCostValue(costString: string): number {
    // Extract first number from strings like "$30,000-$75,000"
    const match = costString.match(/\$([0-9,]+)/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return 50000; // Default to moderate cost
  }

  /**
   * Extract monthly cost from cost string
   */
  private extractMonthlyCost(costString: string): number {
    // Extract first number from strings like "$200-$1,000/month"
    const match = costString.match(/\$([0-9,]+)/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''));
    }
    return 200; // Default to moderate monthly cost
  }

  /**
   * Parse time estimate to weeks
   */
  private parseTimeToWeeks(timeString: string): number {
    const lowerTime = timeString.toLowerCase();

    // Extract number
    const numberMatch = lowerTime.match(/(\d+)/);
    if (!numberMatch || !numberMatch[1]) {
      return 24; // Default to 6 months
    }

    const value = parseInt(numberMatch[1]);

    // Convert to weeks based on unit
    if (lowerTime.includes('week')) {
      return value;
    } else if (lowerTime.includes('month')) {
      return value * 4;
    } else if (lowerTime.includes('year')) {
      return value * 52;
    }

    return 24; // Default to 6 months
  }

  /**
   * Map score to rating
   */
  getRating(score: number): 'very-difficult' | 'difficult' | 'moderate' | 'easy' | 'very-easy' {
    if (score >= 9) return 'very-easy';
    if (score >= 7) return 'easy';
    if (score >= 5) return 'moderate';
    if (score >= 3) return 'difficult';
    return 'very-difficult';
  }

  /**
   * Generate actionable recommendation based on score
   */
  getRecommendation(score: number, techScore: number, marketScore: number): string {
    if (score >= 9) {
      return 'Excellent cloning opportunity! This business has low technical complexity, good market opportunity, and reasonable resource requirements. Start with an MVP to validate the concept quickly.';
    }

    if (score >= 7) {
      return 'Good cloning opportunity. The business is feasible to clone with moderate effort. Focus on building an MVP first and leverage SaaS solutions to reduce complexity.';
    }

    if (score >= 5) {
      return 'Moderate cloning opportunity. This will require significant effort and resources. Consider starting with a simplified version focusing on core features, and evaluate if you have the necessary skills and budget.';
    }

    if (score >= 3) {
      // Provide specific guidance based on weak areas
      if (techScore <= 4) {
        return 'Challenging opportunity due to high technical complexity. Consider partnering with experienced developers or finding a simpler business to clone. If you proceed, plan for a longer timeline and higher costs.';
      }
      if (marketScore <= 4) {
        return 'Challenging opportunity due to difficult market conditions. The market may be crowded or have significant barriers. Consider if you can bring unique value or find a niche angle before proceeding.';
      }
      return 'Challenging opportunity. This business will require substantial resources, time, and expertise. Carefully evaluate if you have the necessary commitment before proceeding.';
    }

    // Score < 3
    return 'Not recommended for cloning. This business has very high complexity, significant resource requirements, or unfavorable market conditions. Consider finding a simpler opportunity that better matches your resources and timeline.';
  }

  /**
   * Calculate confidence score based on data availability
   */
  private calculateConfidence(
    marketData: EnhancedStructuredAnalysis | null,
    resourceEstimates: ProjectEstimates
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence if we have market data
    if (marketData?.market) {
      confidence += 0.2;
      
      // More confidence if we have detailed SWOT
      const swot = marketData.market.swot;
      const totalSwotItems = 
        swot.strengths.length +
        swot.weaknesses.length +
        swot.opportunities.length +
        swot.threats.length;
      
      if (totalSwotItems >= 12) {
        confidence += 0.1;
      }

      // More confidence if we have competitor data
      if (marketData.market.competitors.length > 0) {
        confidence += 0.1;
      }
    }

    // Confidence from resource estimates (always available)
    confidence += 0.1;

    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, confidence));
  }
}

// Export singleton instance
export const clonabilityScoreService = new ClonabilityScoreService();
