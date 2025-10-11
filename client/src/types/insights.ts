// Shared types for technology insights components

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

export interface Recommendation {
  type: 'simplify' | 'alternative' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface TimeAndCostEstimates {
  developmentTime: { min: number; max: number }; // months
  oneTimeCost: { min: number; max: number }; // dollars
  monthlyCost: { min: number; max: number }; // dollars
}

export interface EnhancedComplexityResult {
  score: number;
  breakdown: {
    frontend: { score: number; max: number; technologies: string[] };
    backend: { score: number; max: number; technologies: string[] };
    infrastructure: { score: number; max: number; technologies: string[] };
  };
  factors: {
    customCode: boolean;
    frameworkComplexity: 'low' | 'medium' | 'high';
    infrastructureComplexity: 'low' | 'medium' | 'high';
    technologyCount: number;
    licensingComplexity: boolean;
  };
  explanation: string;
}

export interface SaasAlternative {
  name: string;
  description: string;
  pricing: string;
  timeSavings: number; // hours
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  recommendedFor: 'mvp' | 'scale' | 'both';
}

export interface BuildVsBuyRecommendation {
  technology: string;
  recommendation: 'build' | 'buy';
  reasoning: string;
  saasAlternative?: SaasAlternative;
  estimatedSavings: {
    time: number; // hours
    cost: number; // dollars
  };
}

export interface LearningResource {
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'course' | 'video';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface SkillRequirement {
  skill: string;
  category: 'frontend' | 'backend' | 'infrastructure' | 'design';
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  priority: 'critical' | 'important' | 'nice-to-have';
  learningResources: LearningResource[];
  relatedTechnologies: string[];
}

export interface TechnologyInsights {
  alternatives: Map<string, any[]>;
  buildVsBuy: BuildVsBuyRecommendation[];
  skills: SkillRequirement[];
  estimates: TimeAndCostEstimates;
  recommendations: Recommendation[];
}
