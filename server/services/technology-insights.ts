import type { DetectedTechnology } from './tech-detection.js';
import { technologyKnowledgeBase, type TechnologyProfile } from './technology-knowledge-base.js';
import { insightsCache } from './insights-cache.js';
import { performanceMonitor } from './performance-monitor.js';

/**
 * Skill requirement with proficiency level
 */
export interface SkillRequirement {
  skill: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  estimatedLearningTime?: string;
}

/**
 * Build vs Buy recommendation
 */
export interface BuildVsBuyRecommendation {
  technology: string;
  recommendation: 'build' | 'buy' | 'hybrid';
  reasoning: string;
  alternatives: string[];
  estimatedCost?: {
    build: string;
    buy: string;
  };
}

/**
 * Time and cost estimates
 */
export interface ProjectEstimates {
  timeEstimate: {
    minimum: string;
    maximum: string;
    realistic: string;
  };
  costEstimate: {
    development: string;
    infrastructure: string;
    maintenance: string;
    total: string;
  };
  teamSize: {
    minimum: number;
    recommended: number;
  };
}

/**
 * Actionable recommendation
 */
export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  impact: string;
}

/**
 * Complete technology insights
 */
export interface TechnologyInsights {
  alternatives: Record<string, string[]>;
  buildVsBuy: BuildVsBuyRecommendation[];
  skills: SkillRequirement[];
  estimates: ProjectEstimates;
  recommendations: Recommendation[];
  summary: string;
}

/**
 * TechnologyInsightsService
 * Generates actionable insights from detected technologies
 */
export class TechnologyInsightsService {
  private maxRetries = 2;
  private retryDelay = 100; // ms

  /**
   * Generate comprehensive insights from detected technologies
   * Includes error handling and graceful degradation
   */
  generateInsights(
    technologies: DetectedTechnology[],
    complexityScore: number
  ): TechnologyInsights {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const techNames = technologies.map(t => t.name);
      const cached = insightsCache.get(techNames);
      
      if (cached) {
        const duration = Date.now() - startTime;
        performanceMonitor.recordInsightsGeneration(duration, true);
        this.logInsightsGeneration('success', duration, true, technologies.length);
        return cached;
      }

      // Ensure knowledge base is loaded
      if (!technologyKnowledgeBase.isDataLoaded()) {
        technologyKnowledgeBase.loadData();
      }

      // Generate insights with retry logic
      const insights = this.generateInsightsWithRetry(technologies, complexityScore);
      
      // Cache the results
      insightsCache.set(techNames, insights, 'generated');
      
      // Record performance
      const duration = Date.now() - startTime;
      performanceMonitor.recordInsightsGeneration(duration, false);
      
      // Log if generation took too long
      if (duration > 500) {
        console.warn(`[TechnologyInsights] Insights generation took ${duration}ms (target: <500ms)`);
      }

      this.logInsightsGeneration('success', duration, false, technologies.length);
      return insights;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logInsightsError(error, technologies.length, duration);
      
      // Return fallback insights
      return this.generateFallbackInsights(technologies, complexityScore);
    }
  }

  /**
   * Generate insights with retry logic for transient failures
   */
  private generateInsightsWithRetry(
    technologies: DetectedTechnology[],
    complexityScore: number,
    attempt: number = 1
  ): TechnologyInsights {
    try {
      return this.generateInsightsInternal(technologies, complexityScore);
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`[TechnologyInsights] Attempt ${attempt} failed, retrying...`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          maxRetries: this.maxRetries
        });
        
        // Wait before retrying (exponential backoff)
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        this.sleep(delay);
        
        return this.generateInsightsWithRetry(technologies, complexityScore, attempt + 1);
      }
      
      // All retries exhausted, throw error
      throw error;
    }
  }

  /**
   * Sleep for specified milliseconds (synchronous)
   */
  private sleep(ms: number): void {
    const start = Date.now();
    while (Date.now() - start < ms) {
      // Busy wait
    }
  }

  /**
   * Generate fallback insights when full generation fails
   */
  private generateFallbackInsights(
    technologies: DetectedTechnology[],
    complexityScore: number
  ): TechnologyInsights {
    console.log('[TechnologyInsights] Generating fallback insights');
    
    try {
      // Provide basic insights without knowledge base lookups
      const basicSkills = this.extractBasicSkills(technologies);
      const basicEstimates = this.getDefaultEstimates(complexityScore);
      const fallbackRecommendations = this.getFallbackRecommendations(complexityScore);

      return {
        alternatives: {},
        buildVsBuy: [],
        skills: basicSkills,
        estimates: basicEstimates,
        recommendations: fallbackRecommendations,
        summary: this.generateFallbackSummary(technologies.length, complexityScore),
      };
    } catch (fallbackError) {
      // Even fallback failed, return minimal insights
      console.error('[TechnologyInsights] Fallback generation failed:', fallbackError);
      return this.getMinimalInsights();
    }
  }

  /**
   * Extract basic skills without knowledge base
   */
  private extractBasicSkills(technologies: DetectedTechnology[]): SkillRequirement[] {
    const skills: SkillRequirement[] = [];
    
    // Add generic skills based on technology names
    for (const tech of technologies) {
      const techName = tech.name.toLowerCase();
      
      if (techName.includes('react') || techName.includes('vue') || techName.includes('angular')) {
        skills.push({
          skill: 'Frontend Development',
          proficiency: 'intermediate',
          category: 'Frontend',
          estimatedLearningTime: '2-3 months',
        });
      }
      
      if (techName.includes('node') || techName.includes('express') || techName.includes('django')) {
        skills.push({
          skill: 'Backend Development',
          proficiency: 'intermediate',
          category: 'Backend',
          estimatedLearningTime: '2-3 months',
        });
      }
      
      if (techName.includes('postgres') || techName.includes('mysql') || techName.includes('mongo')) {
        skills.push({
          skill: 'Database Management',
          proficiency: 'beginner',
          category: 'Database',
          estimatedLearningTime: '1-2 months',
        });
      }
    }
    
    // Remove duplicates
    const uniqueSkills = skills.filter((skill, index, self) =>
      index === self.findIndex(s => s.skill === skill.skill)
    );
    
    return uniqueSkills.length > 0 ? uniqueSkills : [{
      skill: 'Full-Stack Development',
      proficiency: 'intermediate',
      category: 'General',
      estimatedLearningTime: '3-6 months',
    }];
  }

  /**
   * Get default estimates based on complexity
   */
  private getDefaultEstimates(complexityScore: number): ProjectEstimates {
    const timeMultiplier = complexityScore / 5;
    const baseWeeks = Math.round(12 * timeMultiplier);
    
    return {
      timeEstimate: {
        minimum: this.formatWeeksToTime(Math.round(baseWeeks * 0.7)),
        maximum: this.formatWeeksToTime(Math.round(baseWeeks * 1.5)),
        realistic: this.formatWeeksToTime(baseWeeks),
      },
      costEstimate: {
        development: complexityScore <= 5 ? '$15,000-$50,000' : '$50,000-$150,000',
        infrastructure: '$100-$500/month',
        maintenance: '$2,000-$10,000/month',
        total: complexityScore <= 5 ? '$50,000-$150,000 (first year)' : '$150,000-$500,000 (first year)',
      },
      teamSize: {
        minimum: complexityScore <= 5 ? 1 : 2,
        recommended: complexityScore <= 5 ? 2 : 3,
      },
    };
  }

  /**
   * Get fallback recommendations
   */
  private getFallbackRecommendations(complexityScore: number): Recommendation[] {
    return [
      {
        priority: 'high',
        category: 'Notice',
        title: 'Limited Insights Available',
        description: 'Detailed technology insights could not be generated. The analysis continues with basic recommendations.',
        impact: 'Some advanced recommendations may not be available. Consider manual research for specific technologies.',
      },
      {
        priority: 'medium',
        category: 'Strategy',
        title: 'Start with MVP',
        description: 'Focus on core features first to validate the concept before building the full solution.',
        impact: 'Reduces initial development time and allows for early user feedback.',
      },
      {
        priority: 'medium',
        category: 'Development',
        title: 'Use Established Technologies',
        description: 'Stick to well-documented, popular technologies to ensure good community support.',
        impact: 'Easier to find resources, tutorials, and developers familiar with the stack.',
      },
    ];
  }

  /**
   * Generate fallback summary
   */
  private generateFallbackSummary(techCount: number, complexityScore: number): string {
    const complexityLevel = complexityScore <= 3 ? 'simple' : complexityScore <= 6 ? 'moderate' : 'complex';
    return `This stack uses ${techCount} detected technologies with ${complexityLevel} complexity. ` +
           `Detailed insights are limited, but the analysis suggests careful planning and potentially consulting ` +
           `with experienced developers for successful implementation.`;
  }

  /**
   * Get minimal insights when everything fails
   */
  private getMinimalInsights(): TechnologyInsights {
    return {
      alternatives: {},
      buildVsBuy: [],
      skills: [],
      estimates: {
        timeEstimate: {
          minimum: '3 months',
          maximum: '12 months',
          realistic: '6 months',
        },
        costEstimate: {
          development: '$30,000-$100,000',
          infrastructure: '$100-$1,000/month',
          maintenance: '$5,000-$20,000/month',
          total: '$100,000-$300,000 (first year)',
        },
        teamSize: {
          minimum: 1,
          recommended: 2,
        },
      },
      recommendations: [
        {
          priority: 'high',
          category: 'Notice',
          title: 'Insights Unavailable',
          description: 'Technology insights could not be generated. Please review the detected technologies manually.',
          impact: 'Manual analysis required for accurate planning.',
        },
      ],
      summary: 'Technology insights are temporarily unavailable. The analysis continues with basic information.',
    };
  }

  /**
   * Log insights generation with structured format
   */
  private logInsightsGeneration(
    status: 'success' | 'cached',
    duration: number,
    cached: boolean,
    techCount: number
  ): void {
    console.log(JSON.stringify({
      service: 'technology-insights',
      action: 'generate-insights',
      status,
      duration,
      cached,
      techCount,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Log insights error with structured format
   */
  private logInsightsError(error: unknown, techCount: number, duration: number): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(JSON.stringify({
      service: 'technology-insights',
      action: 'generate-insights',
      status: 'error',
      error: errorMessage,
      stack: errorStack,
      techCount,
      duration,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Internal method to generate insights (without caching)
   */
  private generateInsightsInternal(
    technologies: DetectedTechnology[],
    complexityScore: number
  ): TechnologyInsights {
    // Generate alternatives map
    const alternatives: Record<string, string[]> = {};
    for (const tech of technologies) {
      const alts = this.getAlternatives(tech.name);
      if (alts.length > 0) {
        alternatives[tech.name] = alts;
      }
    }

    const buildVsBuy = this.analyzeBuildVsBuy(technologies);
    const skills = this.extractSkillRequirements(technologies);
    const estimates = this.calculateEstimates(technologies, complexityScore);
    const recommendations = this.generateRecommendations(
      { alternatives, buildVsBuy, skills, estimates, recommendations: [], summary: '' },
      complexityScore
    );
    const summary = this.generateSummary(technologies, complexityScore, recommendations);

    return {
      alternatives,
      buildVsBuy,
      skills,
      estimates,
      recommendations,
      summary,
    };
  }

  /**
   * Get alternatives for a specific technology
   */
  getAlternatives(technology: string): string[] {
    const profile = technologyKnowledgeBase.getTechnology(technology);
    return profile?.alternatives || [];
  }

  /**
   * Analyze build vs buy decisions for technologies
   */
  analyzeBuildVsBuy(technologies: DetectedTechnology[]): BuildVsBuyRecommendation[] {
    const recommendations: BuildVsBuyRecommendation[] = [];

    for (const tech of technologies) {
      const profile = technologyKnowledgeBase.getTechnology(tech.name);
      
      if (!profile) continue;

      // Determine recommendation based on category and complexity
      const recommendation = this.determineBuildVsBuy(profile);
      
      recommendations.push({
        technology: tech.name,
        recommendation: recommendation.type,
        reasoning: recommendation.reasoning,
        alternatives: profile.alternatives || [],
        estimatedCost: {
          build: profile.costEstimate.development,
          buy: this.estimateSaasCost(profile),
        },
      });
    }

    return recommendations;
  }

  /**
   * Determine build vs buy recommendation for a technology
   */
  private determineBuildVsBuy(profile: TechnologyProfile): {
    type: 'build' | 'buy' | 'hybrid';
    reasoning: string;
  } {
    const category = profile.category.toLowerCase();
    const difficulty = profile.difficulty.toLowerCase();

    // Authentication services - usually buy
    if (category.includes('authentication') || category.includes('auth')) {
      return {
        type: 'buy',
        reasoning: 'Authentication is security-critical and better handled by specialized services. Building custom auth increases security risks and maintenance burden.',
      };
    }

    // Hosting platforms - always buy
    if (category.includes('hosting') || category.includes('platform')) {
      return {
        type: 'buy',
        reasoning: 'Infrastructure and hosting are best left to specialized providers. Building your own hosting infrastructure is not cost-effective for most projects.',
      };
    }

    // Payment processing - always buy
    if (category.includes('payment') || category.includes('commerce')) {
      return {
        type: 'buy',
        reasoning: 'Payment processing requires PCI compliance and is highly regulated. Use established payment providers to ensure security and compliance.',
      };
    }

    // Email services - usually buy
    if (category.includes('email') || category.includes('messaging')) {
      return {
        type: 'buy',
        reasoning: 'Email deliverability is complex. Using established email services ensures better inbox placement and reduces spam issues.',
      };
    }

    // Databases - hybrid approach
    if (category.includes('database')) {
      if (difficulty === 'hard' || difficulty === 'very-hard') {
        return {
          type: 'buy',
          reasoning: 'Complex database setups benefit from managed services. They provide automatic backups, scaling, and maintenance.',
        };
      }
      return {
        type: 'hybrid',
        reasoning: 'Consider managed database services for production reliability, but self-hosting is viable for simpler setups or development.',
      };
    }

    // Frontend/Backend frameworks - usually build
    if (category.includes('framework') || category.includes('frontend') || category.includes('backend')) {
      if (difficulty === 'very-easy' || difficulty === 'easy') {
        return {
          type: 'build',
          reasoning: 'This framework is beginner-friendly and well-documented. Building with it gives you full control and customization.',
        };
      }
      if (difficulty === 'hard' || difficulty === 'very-hard') {
        return {
          type: 'hybrid',
          reasoning: 'Consider using templates, boilerplates, or hiring experienced developers to accelerate development with this complex framework.',
        };
      }
      return {
        type: 'build',
        reasoning: 'Building with this framework provides flexibility and control. The learning curve is manageable with available resources.',
      };
    }

    // Default to build for custom functionality
    return {
      type: 'build',
      reasoning: 'This technology is best implemented as part of your custom solution to maintain flexibility and control.',
    };
  }

  /**
   * Estimate SaaS cost based on profile
   */
  private estimateSaasCost(profile: TechnologyProfile): string {
    const category = profile.category.toLowerCase();
    
    if (category.includes('authentication')) {
      return 'free-to-medium ($0-$100/month for small apps)';
    }
    if (category.includes('hosting')) {
      return profile.costEstimate.hosting;
    }
    if (category.includes('database')) {
      return 'low-to-medium ($10-$200/month depending on scale)';
    }
    if (category.includes('email')) {
      return 'low ($10-$50/month for moderate volume)';
    }
    
    return 'variable (depends on usage and provider)';
  }

  /**
   * Extract skill requirements from technologies
   */
  extractSkillRequirements(technologies: DetectedTechnology[]): SkillRequirement[] {
    const skillsMap = new Map<string, SkillRequirement>();

    for (const tech of technologies) {
      const profile = technologyKnowledgeBase.getTechnology(tech.name);
      
      if (!profile) continue;

      const proficiency = this.mapDifficultyToProficiency(profile.difficulty);
      const learningTime = this.estimateLearningTime(profile.difficulty);

      // Add the technology as a skill requirement
      const skillKey = `${profile.name}-${profile.category}`;
      if (!skillsMap.has(skillKey)) {
        skillsMap.set(skillKey, {
          skill: profile.name,
          proficiency,
          category: this.normalizeCategoryName(profile.category),
          estimatedLearningTime: learningTime,
        });
      }

      // Add related skills based on category
      const relatedSkills = this.getRelatedSkills(profile);
      for (const relatedSkill of relatedSkills) {
        const relatedKey = `${relatedSkill.skill}-${relatedSkill.category}`;
        if (!skillsMap.has(relatedKey)) {
          skillsMap.set(relatedKey, relatedSkill);
        }
      }
    }

    // Sort by proficiency level (expert first) and then by category
    return Array.from(skillsMap.values()).sort((a, b) => {
      const proficiencyOrder = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 };
      const profDiff = proficiencyOrder[a.proficiency] - proficiencyOrder[b.proficiency];
      if (profDiff !== 0) return profDiff;
      return a.category.localeCompare(b.category);
    });
  }

  /**
   * Map difficulty to proficiency level
   */
  private mapDifficultyToProficiency(
    difficulty: string
  ): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    const difficultyLower = difficulty.toLowerCase();
    
    if (difficultyLower === 'very-easy' || difficultyLower === 'easy') {
      return 'beginner';
    }
    if (difficultyLower === 'medium') {
      return 'intermediate';
    }
    if (difficultyLower === 'hard') {
      return 'advanced';
    }
    if (difficultyLower === 'very-hard') {
      return 'expert';
    }
    
    return 'intermediate'; // default
  }

  /**
   * Estimate learning time based on difficulty
   */
  private estimateLearningTime(difficulty: string): string {
    const difficultyLower = difficulty.toLowerCase();
    
    if (difficultyLower === 'very-easy') {
      return '1-2 weeks';
    }
    if (difficultyLower === 'easy') {
      return '2-4 weeks';
    }
    if (difficultyLower === 'medium') {
      return '1-2 months';
    }
    if (difficultyLower === 'hard') {
      return '2-4 months';
    }
    if (difficultyLower === 'very-hard') {
      return '4-6 months';
    }
    
    return '1-2 months'; // default
  }

  /**
   * Normalize category name for display
   */
  private normalizeCategoryName(category: string): string {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get related skills based on technology profile
   */
  private getRelatedSkills(profile: TechnologyProfile): SkillRequirement[] {
    const relatedSkills: SkillRequirement[] = [];
    const category = profile.category.toLowerCase();

    // Frontend frameworks require JavaScript/TypeScript
    if (category.includes('frontend')) {
      relatedSkills.push({
        skill: 'JavaScript/TypeScript',
        proficiency: 'intermediate',
        category: 'Programming Language',
        estimatedLearningTime: '1-2 months',
      });
      relatedSkills.push({
        skill: 'HTML/CSS',
        proficiency: 'intermediate',
        category: 'Web Fundamentals',
        estimatedLearningTime: '2-4 weeks',
      });
    }

    // Backend frameworks require language-specific skills
    if (category.includes('backend')) {
      if (profile.name.toLowerCase().includes('express') || profile.name.toLowerCase().includes('node')) {
        relatedSkills.push({
          skill: 'Node.js',
          proficiency: 'intermediate',
          category: 'Backend Runtime',
          estimatedLearningTime: '1-2 months',
        });
      }
      if (profile.name.toLowerCase().includes('django') || profile.name.toLowerCase().includes('flask')) {
        relatedSkills.push({
          skill: 'Python',
          proficiency: 'intermediate',
          category: 'Programming Language',
          estimatedLearningTime: '1-2 months',
        });
      }
      if (profile.name.toLowerCase().includes('rails')) {
        relatedSkills.push({
          skill: 'Ruby',
          proficiency: 'intermediate',
          category: 'Programming Language',
          estimatedLearningTime: '1-2 months',
        });
      }
      if (profile.name.toLowerCase().includes('laravel')) {
        relatedSkills.push({
          skill: 'PHP',
          proficiency: 'intermediate',
          category: 'Programming Language',
          estimatedLearningTime: '1-2 months',
        });
      }
      
      // All backend requires API design
      relatedSkills.push({
        skill: 'REST API Design',
        proficiency: 'intermediate',
        category: 'Architecture',
        estimatedLearningTime: '2-4 weeks',
      });
    }

    // Database requires SQL or NoSQL knowledge
    if (category.includes('database')) {
      if (profile.name.toLowerCase().includes('mongo') || profile.name.toLowerCase().includes('couch')) {
        relatedSkills.push({
          skill: 'NoSQL Concepts',
          proficiency: 'beginner',
          category: 'Database',
          estimatedLearningTime: '1-2 weeks',
        });
      } else {
        relatedSkills.push({
          skill: 'SQL',
          proficiency: 'intermediate',
          category: 'Database',
          estimatedLearningTime: '2-4 weeks',
        });
      }
    }

    // Hosting/DevOps requires infrastructure knowledge
    if (category.includes('hosting') || category.includes('platform')) {
      relatedSkills.push({
        skill: 'DevOps Basics',
        proficiency: 'beginner',
        category: 'Infrastructure',
        estimatedLearningTime: '2-4 weeks',
      });
      
      if (profile.difficulty === 'hard' || profile.difficulty === 'very-hard') {
        relatedSkills.push({
          skill: 'Cloud Architecture',
          proficiency: 'advanced',
          category: 'Infrastructure',
          estimatedLearningTime: '2-4 months',
        });
      }
    }

    return relatedSkills;
  }

  /**
   * Calculate time and cost estimates
   */
  calculateEstimates(
    technologies: DetectedTechnology[],
    complexityScore: number
  ): ProjectEstimates {
    // Base estimates on complexity score
    const timeEstimate = this.estimateTime(complexityScore, technologies.length);
    const costEstimate = this.estimateCost(complexityScore, technologies);
    const teamSize = this.estimateTeamSize(complexityScore, technologies);

    return {
      timeEstimate,
      costEstimate,
      teamSize,
    };
  }

  /**
   * Estimate development time based on complexity
   */
  private estimateTime(
    complexityScore: number,
    techCount: number
  ): { minimum: string; maximum: string; realistic: string } {
    // Base time in weeks
    let baseWeeks = 4;

    // Adjust based on complexity (1-10 scale)
    if (complexityScore <= 3) {
      baseWeeks = 4; // 1 month
    } else if (complexityScore <= 6) {
      baseWeeks = 12; // 3 months
    } else {
      baseWeeks = 24; // 6 months
    }

    // Adjust for technology count
    const techFactor = Math.min(techCount / 10, 2); // Cap at 2x
    baseWeeks = Math.round(baseWeeks * (1 + techFactor * 0.3));

    const minimum = this.formatWeeksToTime(Math.round(baseWeeks * 0.7));
    const maximum = this.formatWeeksToTime(Math.round(baseWeeks * 1.5));
    const realistic = this.formatWeeksToTime(baseWeeks);

    return { minimum, maximum, realistic };
  }

  /**
   * Format weeks to human-readable time
   */
  private formatWeeksToTime(weeks: number): string {
    if (weeks < 4) {
      return `${weeks} weeks`;
    }
    const months = Math.round(weeks / 4);
    if (months < 12) {
      return `${months} months`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }
    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} months`;
  }

  /**
   * Estimate costs based on complexity and technologies
   */
  private estimateCost(
    complexityScore: number,
    technologies: DetectedTechnology[]
  ): { development: string; infrastructure: string; maintenance: string; total: string } {
    // Get cost profiles from knowledge base
    let devCostLevel = 'medium';
    let infraCostLevel = 'medium';
    let maintCostLevel = 'medium';

    const profiles = technologies
      .map(tech => technologyKnowledgeBase.getTechnology(tech.name))
      .filter((p): p is TechnologyProfile => p !== undefined);

    if (profiles.length > 0) {
      // Average development cost
      devCostLevel = this.averageCostLevel(profiles.map(p => p.costEstimate.development));
      infraCostLevel = this.averageCostLevel(profiles.map(p => p.costEstimate.hosting));
      maintCostLevel = this.averageCostLevel(profiles.map(p => p.costEstimate.maintenance));
    }

    // Adjust based on complexity
    if (complexityScore >= 8) {
      devCostLevel = this.increaseCostLevel(devCostLevel);
      maintCostLevel = this.increaseCostLevel(maintCostLevel);
    }

    const development = this.formatCostRange(devCostLevel, 'development');
    const infrastructure = this.formatCostRange(infraCostLevel, 'infrastructure');
    const maintenance = this.formatCostRange(maintCostLevel, 'maintenance');
    const total = this.calculateTotalCost(development, infrastructure, maintenance);

    return { development, infrastructure, maintenance, total };
  }

  /**
   * Average cost level from multiple values
   */
  private averageCostLevel(levels: string[]): string {
    const costMap: Record<string, number> = {
      'very-low': 1,
      'low': 2,
      'low-to-medium': 2.5,
      'medium': 3,
      'medium-to-high': 3.5,
      'high': 4,
      'very-high': 5,
      'free-to-low': 1.5,
      'free-to-medium': 2,
      'variable': 3,
    };

    const reverseMap: Record<number, string> = {
      1: 'very-low',
      2: 'low',
      3: 'medium',
      4: 'high',
      5: 'very-high',
    };

    const numericValues = levels.map(level => costMap[level.toLowerCase()] || 3);
    const average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    const rounded = Math.round(average);

    return reverseMap[rounded] || 'medium';
  }

  /**
   * Increase cost level by one tier
   */
  private increaseCostLevel(level: string): string {
    const progression = ['very-low', 'low', 'medium', 'high', 'very-high'];
    const currentIndex = progression.indexOf(level);
    if (currentIndex === -1 || currentIndex === progression.length - 1) {
      return level;
    }
    return progression[currentIndex + 1] ?? level;
  }

  /**
   * Format cost level to dollar range
   */
  private formatCostRange(level: string, type: 'development' | 'infrastructure' | 'maintenance'): string {
    const ranges: Record<string, Record<string, string>> = {
      development: {
        'very-low': '$5,000-$15,000',
        'low': '$15,000-$30,000',
        'medium': '$30,000-$75,000',
        'high': '$75,000-$150,000',
        'very-high': '$150,000+',
      },
      infrastructure: {
        'very-low': '$0-$50/month',
        'low': '$50-$200/month',
        'medium': '$200-$1,000/month',
        'high': '$1,000-$5,000/month',
        'very-high': '$5,000+/month',
      },
      maintenance: {
        'very-low': '$500-$2,000/month',
        'low': '$2,000-$5,000/month',
        'medium': '$5,000-$15,000/month',
        'high': '$15,000-$30,000/month',
        'very-high': '$30,000+/month',
      },
    };

    const typeRanges = ranges[type];
    if (!typeRanges) return '$0';
    return typeRanges[level] ?? typeRanges['medium'] ?? '$0';
  }

  /**
   * Calculate total cost from components
   */
  private calculateTotalCost(dev: string, infra: string, maint: string): string {
    // Extract minimum values for rough total
    const extractMin = (range: string): number => {
      const match = range.match(/\$([0-9,]+)/);
      if (match && match[1]) {
        return parseInt(match[1].replace(/,/g, ''));
      }
      return 0;
    };

    const devMin = extractMin(dev);
    const infraMin = extractMin(infra);
    const maintMin = extractMin(maint);

    // First year total (dev + 12 months infra + 12 months maint)
    const firstYearMin = devMin + (infraMin * 12) + (maintMin * 12);

    if (firstYearMin < 50000) {
      return '$25,000-$75,000 (first year)';
    } else if (firstYearMin < 150000) {
      return '$75,000-$200,000 (first year)';
    } else if (firstYearMin < 300000) {
      return '$200,000-$500,000 (first year)';
    } else {
      return '$500,000+ (first year)';
    }
  }

  /**
   * Estimate team size based on complexity
   */
  private estimateTeamSize(
    complexityScore: number,
    technologies: DetectedTechnology[]
  ): { minimum: number; recommended: number } {
    let minimum = 1;
    let recommended = 2;

    if (complexityScore <= 3) {
      minimum = 1;
      recommended = 1;
    } else if (complexityScore <= 6) {
      minimum = 1;
      recommended = 2;
    } else if (complexityScore <= 8) {
      minimum = 2;
      recommended = 3;
    } else {
      minimum = 3;
      recommended = 5;
    }

    // Adjust for technology diversity
    const categories = new Set(
      technologies
        .map(tech => technologyKnowledgeBase.getTechnology(tech.name)?.category)
        .filter(Boolean)
    );

    if (categories.size > 5) {
      recommended += 1;
    }

    return { minimum, recommended };
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(
    insights: TechnologyInsights,
    complexityScore: number
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Recommendation 1: Prioritize SaaS solutions
    const buyRecommendations = insights.buildVsBuy.filter(b => b.recommendation === 'buy');
    if (buyRecommendations.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Architecture',
        title: 'Leverage SaaS Solutions',
        description: `Use managed services for ${buyRecommendations.map(b => b.technology).join(', ')} to reduce development time and maintenance burden.`,
        impact: `Could save ${this.estimateSavings(buyRecommendations.length)} in development costs and reduce time to market by 30-50%.`,
      });
    }

    // Recommendation 2: Start with MVP
    if (complexityScore >= 7) {
      recommendations.push({
        priority: 'high',
        category: 'Strategy',
        title: 'Build an MVP First',
        description: 'Given the high complexity, start with a Minimum Viable Product focusing on core features. This reduces risk and allows for faster validation.',
        impact: 'Reduces initial development time by 40-60% and allows for early user feedback.',
      });
    }

    // Recommendation 3: Skill gaps
    const advancedSkills = insights.skills.filter(
      s => s.proficiency === 'advanced' || s.proficiency === 'expert'
    );
    if (advancedSkills.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Team',
        title: 'Address Skill Gaps',
        description: `Consider hiring or training for: ${advancedSkills.slice(0, 3).map(s => s.skill).join(', ')}. These are critical for successful implementation.`,
        impact: 'Proper expertise can reduce development time by 30% and improve code quality significantly.',
      });
    }

    // Recommendation 4: Use templates/boilerplates
    if (complexityScore >= 5) {
      recommendations.push({
        priority: 'medium',
        category: 'Development',
        title: 'Use Starter Templates',
        description: 'Leverage existing templates and boilerplates for your tech stack to accelerate initial setup and follow best practices.',
        impact: 'Can save 1-2 weeks of initial setup time and ensure proper project structure.',
      });
    }

    // Recommendation 5: Infrastructure as Code
    const hasComplexInfra = complexityScore >= 6;
    if (hasComplexInfra) {
      recommendations.push({
        priority: 'medium',
        category: 'Infrastructure',
        title: 'Implement Infrastructure as Code',
        description: 'Use tools like Terraform or AWS CDK to manage infrastructure. This ensures reproducibility and easier scaling.',
        impact: 'Reduces deployment errors by 70% and makes scaling much easier.',
      });
    }

    // Recommendation 6: Automated testing
    if (complexityScore >= 5) {
      recommendations.push({
        priority: 'medium',
        category: 'Quality',
        title: 'Invest in Automated Testing',
        description: 'Set up comprehensive testing (unit, integration, e2e) early. This is crucial for maintaining quality as complexity grows.',
        impact: 'Reduces bugs in production by 60% and makes refactoring safer.',
      });
    }

    // Recommendation 7: Monitoring and observability
    if (complexityScore >= 6) {
      recommendations.push({
        priority: 'medium',
        category: 'Operations',
        title: 'Set Up Monitoring Early',
        description: 'Implement logging, monitoring, and error tracking from day one. Tools like Sentry, DataDog, or New Relic are essential.',
        impact: 'Reduces mean time to resolution (MTTR) by 50% and improves user experience.',
      });
    }

    // Recommendation 8: Consider alternatives
    const techWithAlternatives = insights.buildVsBuy.filter(b => b.alternatives.length > 0);
    if (techWithAlternatives.length > 0) {
      const example = techWithAlternatives[0];
      if (example) {
        recommendations.push({
          priority: 'low',
          category: 'Technology',
          title: 'Evaluate Technology Alternatives',
          description: `Consider alternatives like ${example.alternatives.slice(0, 2).join(' or ')} for ${example.technology}. They might better fit your team's expertise or project requirements.`,
          impact: 'Could reduce learning curve and improve development velocity.',
        });
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Estimate savings from using SaaS
   */
  private estimateSavings(count: number): string {
    if (count === 1) return '$5,000-$15,000';
    if (count === 2) return '$15,000-$30,000';
    if (count >= 3) return '$30,000-$50,000';
    return '$5,000+';
  }

  /**
   * Generate summary of insights
   */
  private generateSummary(
    technologies: DetectedTechnology[],
    complexityScore: number,
    recommendations: Recommendation[]
  ): string {
    const parts: string[] = [];

    // Complexity assessment
    if (complexityScore <= 3) {
      parts.push('This is a relatively simple stack that can be cloned with basic development skills.');
    } else if (complexityScore <= 6) {
      parts.push('This is a moderately complex stack requiring solid full-stack development experience.');
    } else {
      parts.push('This is a highly complex stack that will require an experienced team and significant resources.');
    }

    // Technology count
    parts.push(`The stack uses ${technologies.length} detected technologies across multiple categories.`);

    // Top recommendation
    if (recommendations.length > 0) {
      const topRec = recommendations[0];
      if (topRec) {
        parts.push(`Key recommendation: ${topRec.title} - ${topRec.description}`);
      }
    }

    return parts.join(' ');
  }
}

// Export singleton instance
export const technologyInsightsService = new TechnologyInsightsService();
