import { type IStorage } from "../minimal-storage";

// Stage status types
export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

// Stage data interface
export interface StageData {
  stageNumber: number;
  stageName: string;
  status: StageStatus;
  content: any;
  generatedAt: string;
  completedAt?: string;
}

// Stage names mapping
export const STAGE_NAMES: Record<number, string> = {
  1: 'Discovery & Selection',
  2: 'Lazy-Entrepreneur Filter',
  3: 'MVP Launch Planning',
  4: 'Demand Testing Strategy',
  5: 'Scaling & Growth',
  6: 'AI Automation Mapping',
};

// Valid stage numbers
export const VALID_STAGES = [1, 2, 3, 4, 5, 6];

/**
 * WorkflowService manages the 6-stage workflow system
 * Handles stage progression, validation, and state management
 */
export class WorkflowService {
  constructor(private storage: IStorage) {}

  /**
   * Validates if a user can progress to a specific stage
   * Requirements: 6.1, 6.2, 6.3
   * 
   * Rules:
   * - Stage 1 is auto-completed after analysis
   * - Must complete Stage N before accessing Stage N+1
   * - Can regenerate any completed stage
   */
  async validateStageProgression(
    userId: string,
    analysisId: string,
    targetStage: number
  ): Promise<{ valid: boolean; reason?: string }> {
    // Validate stage number
    if (!VALID_STAGES.includes(targetStage)) {
      return {
        valid: false,
        reason: `Invalid stage number: ${targetStage}. Must be between 1 and 6.`,
      };
    }

    // Get the analysis
    const analysis = await this.storage.getAnalysis(userId, analysisId);
    if (!analysis) {
      return {
        valid: false,
        reason: 'Analysis not found',
      };
    }

    // Stage 1 is always accessible (auto-completed after analysis)
    if (targetStage === 1) {
      return { valid: true };
    }

    // Get current stage data
    const stages = this.getStagesFromAnalysis(analysis);
    const completedStages = this.getCompletedStages(stages);

    // Check if previous stage is completed
    const previousStage = targetStage - 1;
    if (!completedStages.includes(previousStage)) {
      return {
        valid: false,
        reason: `Stage ${previousStage} (${STAGE_NAMES[previousStage]}) must be completed before accessing Stage ${targetStage}`,
      };
    }

    return { valid: true };
  }

  /**
   * Gets the current stage number for an analysis
   * Returns the highest completed stage + 1, or 1 if no stages completed
   */
  getCurrentStage(stages: Record<number, StageData> | undefined): number {
    if (!stages) {
      return 1;
    }
    const completedStages = this.getCompletedStages(stages);
    if (completedStages.length === 0) {
      return 1;
    }
    const maxCompleted = Math.max(...completedStages);
    return Math.min(maxCompleted + 1, 6);
  }

  /**
   * Gets list of completed stage numbers
   */
  getCompletedStages(stages: Record<number, StageData> | undefined): number[] {
    if (!stages) {
      return [];
    }
    return Object.values(stages)
      .filter(stage => stage.status === 'completed')
      .map(stage => stage.stageNumber)
      .sort((a, b) => a - b);
  }

  /**
   * Extracts stages data from analysis record
   * Handles both new format (stages object) and legacy format
   */
  private getStagesFromAnalysis(analysis: any): Record<number, StageData> {
    // Check if analysis has stages field
    if (analysis.stages && typeof analysis.stages === 'object') {
      return analysis.stages;
    }

    // Initialize with Stage 1 auto-completed (analysis is done)
    const now = new Date().toISOString();
    const createdAt = analysis.createdAt || now;
    const stages: Record<number, StageData> = {
      1: {
        stageNumber: 1,
        stageName: STAGE_NAMES[1] || 'Discovery & Selection',
        status: 'completed',
        content: {
          analysis: analysis.structured || {},
          summary: analysis.summary,
          url: analysis.url,
        },
        generatedAt: createdAt,
        completedAt: createdAt,
      },
    };

    return stages;
  }

  /**
   * Checks if a stage can be regenerated
   * Any completed stage can be regenerated without affecting other stages
   */
  canRegenerateStage(
    stages: Record<number, StageData> | undefined,
    stageNumber: number
  ): boolean {
    if (!stages) {
      return false;
    }
    const stage = stages[stageNumber];
    return stage?.status === 'completed';
  }

  /**
   * Gets the next available stage for an analysis
   * Returns null if all stages are completed
   */
  getNextStage(stages: Record<number, StageData> | undefined): number | null {
    const currentStage = this.getCurrentStage(stages);
    return currentStage <= 6 ? currentStage : null;
  }

  /**
   * Checks if all stages are completed
   */
  isWorkflowComplete(stages: Record<number, StageData> | undefined): boolean {
    const completedStages = this.getCompletedStages(stages);
    return completedStages.length === 6 && completedStages.includes(6);
  }

  /**
   * Gets stage progress summary
   */
  getProgressSummary(stages: Record<number, StageData> | undefined): {
    currentStage: number;
    completedStages: number[];
    totalStages: number;
    isComplete: boolean;
    nextStage: number | null;
  } {
    const completedStages = this.getCompletedStages(stages);
    const currentStage = this.getCurrentStage(stages);
    const nextStage = this.getNextStage(stages);
    const isComplete = this.isWorkflowComplete(stages);

    return {
      currentStage,
      completedStages,
      totalStages: 6,
      isComplete,
      nextStage,
    };
  }

  /**
   * Validates stage data structure
   * Ensures required fields are present
   */
  validateStageData(stageNumber: number, content: any): { valid: boolean; errors?: string[] } {
    const errors: string[] = [];

    if (!content || typeof content !== 'object') {
      errors.push('Stage content must be an object');
      return { valid: false, errors };
    }

    // Stage-specific validation can be added here
    // For now, just ensure content is not empty
    if (Object.keys(content).length === 0) {
      errors.push('Stage content cannot be empty');
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Creates a new stage data object
   */
  createStageData(
    stageNumber: number,
    content: any,
    status: StageStatus = 'completed'
  ): StageData {
    const now = new Date().toISOString();
    const stageName = STAGE_NAMES[stageNumber];
    if (!stageName) {
      throw new Error(`Invalid stage number: ${stageNumber}`);
    }
    
    const stageData: StageData = {
      stageNumber,
      stageName,
      status,
      content,
      generatedAt: now,
    };
    
    if (status === 'completed') {
      stageData.completedAt = now;
    }
    
    return stageData;
  }

  /**
   * Gets the AI prompt for Stage 2 (Lazy-Entrepreneur Filter)
   * Requirements: 1.1, 1.2, 1.3
   * 
   * Analyzes effort vs. reward and automation potential
   */
  getStage2Prompt(analysis: any): { prompt: string; systemPrompt: string } {
    const businessName = analysis.businessModel || analysis.url;
    const valueProposition = analysis.structured?.overview?.valueProposition || 'Unknown';
    const monetization = analysis.structured?.overview?.monetization || 'Unknown';
    const techStack = analysis.structured?.technical?.techStack?.join(', ') || 'Unknown';
    const targetAudience = analysis.structured?.overview?.targetAudience || 'Unknown';

    const systemPrompt = `You are a business efficiency analyst specializing in effort-reward analysis and automation potential assessment. Provide realistic, evidence-based evaluations without hedging language.`;

    const prompt = `Analyze this business opportunity for effort vs. reward and automation potential.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Tech Stack: ${techStack}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

Provide a "Lazy-Entrepreneur Filter" analysis in this exact JSON format:

{
  "effortScore": 5,
  "rewardScore": 7,
  "recommendation": "go",
  "reasoning": "Clear explanation of why this is or isn't worth pursuing based on effort/reward ratio",
  "automationPotential": {
    "score": 0.75,
    "opportunities": [
      "Specific automation opportunity 1",
      "Specific automation opportunity 2",
      "Specific automation opportunity 3"
    ]
  },
  "resourceRequirements": {
    "time": "Specific time estimate (e.g., '3-6 months to MVP')",
    "money": "Specific budget estimate (e.g., '$5,000-$10,000 initial investment')",
    "skills": ["Required skill 1", "Required skill 2", "Required skill 3"]
  },
  "nextSteps": [
    "Specific actionable step 1",
    "Specific actionable step 2",
    "Specific actionable step 3"
  ]
}

SCORING GUIDELINES:
- effortScore: 1-10 (1 = minimal effort, 10 = maximum effort)
  - Consider technical complexity, time investment, skill requirements
- rewardScore: 1-10 (1 = minimal reward, 10 = maximum reward)
  - Consider market size, revenue potential, scalability
- recommendation: "go" | "no-go" | "maybe"
  - "go": High reward, low-to-medium effort (reward > effort by 2+ points)
  - "no-go": Low reward or extremely high effort (effort > reward)
  - "maybe": Balanced or uncertain (within 1 point difference)
- automationPotential.score: 0-1 (0 = no automation, 1 = fully automatable)
  - Consider AI tools, no-code platforms, existing APIs

REQUIREMENTS:
- Be specific and actionable in all recommendations
- Base estimates on the actual business model and tech stack
- Identify concrete automation opportunities using modern tools
- Provide realistic resource requirements
- Make a clear go/no-go recommendation with solid reasoning

Respond ONLY with valid JSON.`;

    return { prompt, systemPrompt };
  }

  /**
   * Gets the AI prompt for Stage 3 (MVP Launch Planning)
   * Requirements: 2.1, 2.2, 2.3, 2.4
   * 
   * Identifies MVP features, tech stack, and timeline
   */
  getStage3Prompt(analysis: any): { prompt: string; systemPrompt: string } {
    const businessName = analysis.businessModel || analysis.url;
    const valueProposition = analysis.structured?.overview?.valueProposition || 'Unknown';
    const monetization = analysis.structured?.overview?.monetization || 'Unknown';
    const techStack = analysis.structured?.technical?.techStack?.join(', ') || 'Unknown';
    const targetAudience = analysis.structured?.overview?.targetAudience || 'Unknown';
    const keyFeatures = analysis.structured?.technical?.keyFeatures?.join(', ') || 'Unknown';

    // Get Stage 2 data if available for context
    const stage2Data = analysis.stages?.[2]?.content;
    const effortScore = stage2Data?.effortScore || 'Unknown';
    const recommendation = stage2Data?.recommendation || 'Unknown';

    const systemPrompt = `You are a product strategy expert specializing in MVP development and lean startup methodology. Provide specific, actionable recommendations for building a minimum viable product.`;

    const prompt = `Create an MVP launch plan for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Current Tech Stack: ${techStack}
- Target Audience: ${targetAudience}
- Key Features: ${keyFeatures}
- URL: ${analysis.url}

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Effort Score: ${effortScore}/10
- Recommendation: ${recommendation}

Provide an MVP Launch Plan in this exact JSON format:

{
  "coreFeatures": [
    "Essential feature 1 that delivers core value",
    "Essential feature 2 that enables monetization",
    "Essential feature 3 for user experience"
  ],
  "niceToHaves": [
    "Feature that can wait for v2",
    "Enhancement for future iteration",
    "Advanced feature for later"
  ],
  "techStack": {
    "frontend": ["React", "Tailwind CSS"],
    "backend": ["Node.js", "Express"],
    "infrastructure": ["Vercel", "PostgreSQL"]
  },
  "timeline": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "2 weeks",
      "deliverables": [
        "User authentication",
        "Basic UI/UX",
        "Database setup"
      ]
    },
    {
      "phase": "Phase 2: Core Features",
      "duration": "4 weeks",
      "deliverables": [
        "Core feature 1 implementation",
        "Core feature 2 implementation",
        "Payment integration"
      ]
    },
    {
      "phase": "Phase 3: Launch Prep",
      "duration": "2 weeks",
      "deliverables": [
        "Testing and bug fixes",
        "Performance optimization",
        "Launch marketing materials"
      ]
    }
  ],
  "estimatedCost": "$5,000-$10,000 (including hosting, tools, and initial marketing)"
}

REQUIREMENTS:
- Core features: 3-5 features that are ABSOLUTELY ESSENTIAL for the business to function
- Nice-to-haves: 3-5 features that add value but can wait for v2
- Tech stack: Recommend modern, proven technologies appropriate for the business
  - Frontend: UI framework and styling
  - Backend: Server framework and language
  - Infrastructure: Hosting, database, and key services
- Timeline: Break into 3-4 phases with realistic durations (weeks/months)
  - Each phase should have 3-5 specific deliverables
  - Total timeline should be 2-6 months for MVP
- Estimated cost: Provide realistic range including:
  - Development tools and services
  - Hosting and infrastructure
  - Initial marketing budget
  - Third-party integrations

GUIDELINES:
- Focus on MINIMUM viable product - what's the smallest version that delivers value?
- Prioritize features that enable monetization and user validation
- Choose tech stack based on speed to market and developer availability
- Be specific about deliverables - avoid vague descriptions
- Consider the effort score from Stage 2 when estimating timeline
- Recommend no-code/low-code solutions where appropriate to reduce effort

Respond ONLY with valid JSON.`;

    return { prompt, systemPrompt };
  }

  /**
   * Gets the AI prompt for Stage 4 (Demand Testing Strategy)
   * Requirements: 3.1, 3.2, 3.3, 3.4
   * 
   * Recommends demand testing strategies and validation methods
   */
  getStage4Prompt(analysis: any): { prompt: string; systemPrompt: string } {
    const businessName = analysis.businessModel || analysis.url;
    const valueProposition = analysis.structured?.overview?.valueProposition || 'Unknown';
    const monetization = analysis.structured?.overview?.monetization || 'Unknown';
    const targetAudience = analysis.structured?.overview?.targetAudience || 'Unknown';

    // Get Stage 2 data for context
    const stage2Data = analysis.stages?.[2]?.content;
    const effortScore = stage2Data?.effortScore || 'Unknown';
    const rewardScore = stage2Data?.rewardScore || 'Unknown';

    // Get Stage 3 data for context
    const stage3Data = analysis.stages?.[3]?.content;
    const coreFeatures = stage3Data?.coreFeatures?.join(', ') || 'Unknown';
    const estimatedCost = stage3Data?.estimatedCost || 'Unknown';

    const systemPrompt = `You are a lean startup expert specializing in demand validation and market testing. Provide specific, actionable testing strategies that minimize investment while maximizing learning.`;

    const prompt = `Create a demand testing strategy for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Effort Score: ${effortScore}/10
- Reward Score: ${rewardScore}/10

STAGE 3 CONTEXT (MVP Launch Planning):
- Core Features: ${coreFeatures}
- Estimated MVP Cost: ${estimatedCost}

Provide a Demand Testing Strategy in this exact JSON format:

{
  "testingMethods": [
    {
      "method": "Landing Page + Ads",
      "description": "Create a simple landing page describing the product and run targeted ads to measure interest",
      "cost": "$500-$1,000",
      "timeline": "1-2 weeks"
    },
    {
      "method": "Customer Interviews",
      "description": "Conduct 15-20 interviews with target customers to validate problem and solution",
      "cost": "$0-$200",
      "timeline": "2-3 weeks"
    },
    {
      "method": "Waitlist Campaign",
      "description": "Build email waitlist and measure conversion rate from awareness to signup",
      "cost": "$200-$500",
      "timeline": "2-4 weeks"
    }
  ],
  "successMetrics": [
    {
      "metric": "Landing Page Conversion Rate",
      "target": "5-10% of visitors sign up for waitlist",
      "measurement": "Track email signups vs. unique visitors"
    },
    {
      "metric": "Ad Click-Through Rate",
      "target": "2-5% CTR on targeted ads",
      "measurement": "Google/Facebook Ads dashboard"
    },
    {
      "metric": "Customer Interview Validation",
      "target": "70%+ of interviewees confirm they have the problem",
      "measurement": "Interview notes and scoring"
    }
  ],
  "budget": {
    "total": "$1,000-$2,500",
    "breakdown": [
      { "item": "Landing page design and hosting", "cost": "$200-$500" },
      { "item": "Paid advertising (Google/Facebook)", "cost": "$500-$1,000" },
      { "item": "Email marketing tool", "cost": "$50-$100" },
      { "item": "Interview incentives", "cost": "$200-$500" },
      { "item": "Analytics and tracking tools", "cost": "$50-$400" }
    ]
  },
  "timeline": "4-6 weeks total for comprehensive testing"
}

REQUIREMENTS:
- Testing methods: 3-5 specific, actionable testing approaches
  - Each method should include: name, description, cost estimate, timeline
  - Focus on low-cost, high-signal validation methods
  - Prioritize methods appropriate for the target audience
- Success metrics: 3-5 key performance indicators
  - Each metric should include: name, target value, measurement method
  - Metrics should be specific and measurable
  - Focus on leading indicators of product-market fit
- Budget: Realistic cost breakdown
  - Total budget should be 10-30% of MVP development cost
  - Break down by major expense categories
  - Include specific line items with cost ranges
- Timeline: Overall testing duration (typically 4-8 weeks)
  - Should be realistic for the testing methods chosen
  - Consider time for setup, execution, and analysis

GUIDELINES:
- Prioritize testing methods that validate demand BEFORE building the full product
- Recommend a mix of quantitative (ads, landing pages) and qualitative (interviews) methods
- Consider the target audience when recommending channels (B2B vs B2C)
- Budget should be accessible for bootstrapped entrepreneurs
- Focus on learning velocity - fast, cheap tests that provide clear signals
- Include at least one method that tests willingness to pay
- Metrics should help make a clear go/no-go decision

Respond ONLY with valid JSON.`;

    return { prompt, systemPrompt };
  }
}
