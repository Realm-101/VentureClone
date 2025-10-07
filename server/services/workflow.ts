import { type IStorage, type StagesRecord } from "../minimal-storage";

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
   * Requirements: 6.1, 6.2, 6.3, 7.4, 7.6
   * 
   * Rules:
   * - Stage 1 is auto-completed after analysis
   * - Must complete Stage N before accessing Stage N+1
   * - Can regenerate any completed stage
   * - Can view any completed stage without validation errors
   */
  async validateStageProgression(
    userId: string,
    analysisId: string,
    targetStage: number,
    isRegenerate: boolean = false
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

    // Allow viewing/regenerating completed stages without validation
    // Requirement 7.4, 7.6: Fix false errors when viewing completed stages
    if (completedStages.includes(targetStage)) {
      return { valid: true };
    }

    // For new stage generation, check if previous stage is completed
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
  getCurrentStage(stages: StagesRecord | undefined): number {
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
  getCompletedStages(stages: StagesRecord | undefined): number[] {
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
    stages: StagesRecord | undefined,
    stageNumber: number
  ): boolean {
    if (!stages) {
      return false;
    }
    const stage = stages[stageNumber as keyof StagesRecord];
    return stage?.status === 'completed';
  }

  /**
   * Gets the next available stage for an analysis
   * Returns null if all stages are completed
   */
  getNextStage(stages: StagesRecord | undefined): number | null {
    const currentStage = this.getCurrentStage(stages);
    return currentStage <= 6 ? currentStage : null;
  }

  /**
   * Checks if all stages are completed
   */
  isWorkflowComplete(stages: StagesRecord | undefined): boolean {
    const completedStages = this.getCompletedStages(stages);
    return completedStages.length === 6 && completedStages.includes(6);
  }

  /**
   * Gets stage progress summary
   */
  getProgressSummary(stages: StagesRecord | undefined): {
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
   * REFINED: Added clearer scoring criteria and more specific examples
   */
  getStage2Prompt(analysis: any): { prompt: string; systemPrompt: string } {
    const businessName = analysis.businessModel || analysis.url;
    const valueProposition = analysis.structured?.overview?.valueProposition || 'Unknown';
    const monetization = analysis.structured?.overview?.monetization || 'Unknown';
    const techStack = analysis.structured?.technical?.techStack?.join(', ') || 'Unknown';
    const targetAudience = analysis.structured?.overview?.targetAudience || 'Unknown';

    const systemPrompt = `You are a business efficiency analyst specializing in effort-reward analysis and automation potential assessment. 

CRITICAL INSTRUCTIONS:
- Provide realistic, evidence-based evaluations without hedging language
- Use definitive statements based on the business context provided
- Focus on actionable insights that help entrepreneurs make go/no-go decisions
- Consider modern tools and AI capabilities when assessing automation potential
- Base all estimates on the specific business model, not generic assumptions`;

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
    "time": "Specific time estimate (e.g., '2-4 weeks to MVP' for simple, '2-3 months' for moderate, '4-6 months' for complex)",
    "money": "Specific budget estimate (e.g., '$500-$2,000' for simple, '$3,000-$8,000' for moderate, '$10,000-$25,000' for complex)",
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
  * 1-3: Simple landing page, no-code tools, minimal custom development
  * 4-6: Standard web app with common features, moderate complexity
  * 7-9: Complex platform with custom features, significant development
  * 10: Highly technical, requires specialized skills, long development cycle
  
- rewardScore: 1-10 (1 = minimal reward, 10 = maximum reward)
  * 1-3: Niche market, limited revenue potential, low scalability
  * 4-6: Moderate market size, decent revenue potential, some scalability
  * 7-9: Large market, strong revenue potential, highly scalable
  * 10: Massive market opportunity, exceptional revenue potential, unlimited scale
  
- recommendation: "go" | "no-go" | "maybe"
  * "go": High reward, low-to-medium effort (reward > effort by 2+ points) - Worth pursuing
  * "no-go": Low reward or extremely high effort (effort > reward) - Not recommended
  * "maybe": Balanced or uncertain (within 1 point difference) - Requires more validation
  
- automationPotential.score: 0-1 (0 = no automation, 1 = fully automatable)
  * 0.0-0.3: Requires significant manual work, limited automation opportunities
  * 0.4-0.6: Moderate automation possible with AI tools and APIs
  * 0.7-0.9: Highly automatable with modern AI and no-code platforms
  * 1.0: Fully automatable, minimal human intervention needed

REQUIREMENTS:
- Be specific and actionable in all recommendations
- Base estimates on the actual business model and tech stack provided
- Identify concrete automation opportunities using modern tools (ChatGPT API, Zapier, Make, n8n, etc.)
- Provide realistic, LEAN resource requirements - assume modern tools and frameworks reduce costs significantly
- Make a clear go/no-go recommendation with solid reasoning (minimum 100 words)
- Each automation opportunity should name specific tools or services
- Resource requirements should reflect MODERN development practices (AI tools, no-code platforms, open-source libraries)
- Time estimates should assume focused, part-time work (10-20 hours/week) for solo entrepreneurs
- Budget estimates should be CONSERVATIVE and account for free/low-cost tools available today
- Next steps should be immediately actionable (not vague suggestions)

EXAMPLE AUTOMATION OPPORTUNITIES:
- "Use ChatGPT API for customer support chatbot (saves 20-30 hours/week)"
- "Implement Stripe for payment processing (no custom payment code needed)"
- "Use Zapier to automate email marketing workflows (reduces manual work by 80%)"

Respond ONLY with valid JSON.`;

    return { prompt, systemPrompt };
  }

  /**
   * Gets the AI prompt for Stage 3 (MVP Launch Planning)
   * Requirements: 2.1, 2.2, 2.3, 2.4
   * 
   * Identifies MVP features, tech stack, and timeline
   * REFINED: Added clearer feature prioritization and realistic timeline guidance
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
    const automationScore = stage2Data?.automationPotential?.score || 'Unknown';

    const systemPrompt = `You are a product strategy expert specializing in MVP development and lean startup methodology.

CRITICAL INSTRUCTIONS:
- Focus on MINIMUM viable product - the smallest version that delivers core value
- Prioritize features that enable monetization and user validation
- Recommend modern, proven technologies that accelerate development
- Provide realistic timelines based on the effort score from Stage 2
- Consider no-code/low-code solutions where appropriate
- Every recommendation should be specific and actionable`;

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
- Automation Potential: ${automationScore}

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
  * Must enable the core value proposition
  * Must enable monetization (payment, subscription, etc.)
  * Must provide minimum viable user experience
  * Be specific - "User authentication with email/password" not just "Authentication"
  
- Nice-to-haves: 3-5 features that add value but can wait for v2
  * Features that enhance but aren't critical
  * Advanced features that can be added after validation
  * Optimizations that can wait until there's user feedback
  
- Tech stack: Recommend modern, proven technologies appropriate for the business
  * Frontend: Specific framework (React, Vue, Next.js) + styling solution (Tailwind, CSS-in-JS)
  * Backend: Specific runtime and framework (Node.js + Express, Python + FastAPI, etc.)
  * Infrastructure: Specific hosting (Vercel, Railway, AWS), database (PostgreSQL, MongoDB), and key services
  * Consider the automation score - recommend no-code/low-code where appropriate
  * Prioritize technologies that accelerate development
  
- Timeline: Break into 3-4 phases with realistic durations
  * Adjust timeline based on effort score: Low effort (1-3) = 1-2 months, Medium (4-6) = 2-4 months, High (7-10) = 4-6 months
  * Each phase should have 3-5 specific, measurable deliverables
  * Phase 1 should focus on foundation (auth, database, basic UI)
  * Phase 2 should implement core features
  * Phase 3 should focus on polish and launch prep
  * Each deliverable should be concrete - "Implement Stripe payment integration" not "Add payments"
  
- Estimated cost: Provide realistic range including all expenses
  * Development tools and services ($50-500/month)
  * Hosting and infrastructure ($20-200/month initially)
  * Initial marketing budget ($500-2000)
  * Third-party integrations and APIs ($100-500/month)
  * Total should be realistic for bootstrapped entrepreneurs
  * Break down by category with specific ranges

GUIDELINES:
- Focus on MINIMUM viable product - what's the smallest version that delivers value?
- Prioritize features that enable monetization and user validation FIRST
- Choose tech stack based on: 1) Speed to market, 2) Developer availability, 3) Cost
- Be specific about deliverables - avoid vague descriptions like "Build feature X"
- Consider the effort score from Stage 2 when estimating timeline
- If automation score is high (>0.7), strongly recommend no-code/low-code solutions
- Every feature should map to a specific user need or business requirement
- Timeline should be aggressive but achievable - aim for 2-4 months total for most MVPs

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

  /**
   * Gets the AI prompt for Stage 5 (Scaling & Growth)
   * Requirements: 4.1, 4.2, 4.3, 4.4
   * 
   * Plans growth strategy and resource scaling
   */
  getStage5Prompt(analysis: any): { prompt: string; systemPrompt: string } {
    const businessName = analysis.businessModel || analysis.url;
    const valueProposition = analysis.structured?.overview?.valueProposition || 'Unknown';
    const monetization = analysis.structured?.overview?.monetization || 'Unknown';
    const targetAudience = analysis.structured?.overview?.targetAudience || 'Unknown';

    // Get Stage 2 data for context
    const stage2Data = analysis.stages?.[2]?.content;
    const rewardScore = stage2Data?.rewardScore || 'Unknown';

    // Get Stage 3 data for context
    const stage3Data = analysis.stages?.[3]?.content;
    const coreFeatures = stage3Data?.coreFeatures?.join(', ') || 'Unknown';
    const mvpTimeline = stage3Data?.timeline?.map((t: any) => t.phase).join(' → ') || 'Unknown';

    // Get Stage 4 data for context
    const stage4Data = analysis.stages?.[4]?.content;
    const testingMethods = stage4Data?.testingMethods?.map((m: any) => m.method).join(', ') || 'Unknown';
    const successMetrics = stage4Data?.successMetrics?.map((m: any) => m.metric).join(', ') || 'Unknown';

    const systemPrompt = `You are a growth strategy expert specializing in scaling startups and optimizing growth channels. Provide specific, actionable strategies for sustainable business growth.`;

    const prompt = `Create a scaling and growth plan for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Reward Score: ${rewardScore}/10

STAGE 3 CONTEXT (MVP Launch Planning):
- Core Features: ${coreFeatures}
- MVP Timeline: ${mvpTimeline}

STAGE 4 CONTEXT (Demand Testing Strategy):
- Testing Methods: ${testingMethods}
- Success Metrics: ${successMetrics}

Provide a Scaling & Growth Plan in this exact JSON format:

{
  "growthChannels": [
    {
      "channel": "Content Marketing & SEO",
      "strategy": "Create high-quality blog content targeting long-tail keywords in the niche, build backlinks through guest posting",
      "priority": "high"
    },
    {
      "channel": "Paid Advertising",
      "strategy": "Run targeted Google Ads and Facebook campaigns with A/B testing to optimize conversion rates",
      "priority": "medium"
    },
    {
      "channel": "Partnerships & Affiliates",
      "strategy": "Build affiliate program and partner with complementary businesses for cross-promotion",
      "priority": "medium"
    }
  ],
  "milestones": [
    {
      "milestone": "First 100 Paying Customers",
      "timeline": "3-6 months post-launch",
      "metrics": ["$10K MRR", "20% month-over-month growth", "< 5% churn rate"]
    },
    {
      "milestone": "Product-Market Fit Validation",
      "timeline": "6-9 months post-launch",
      "metrics": ["40%+ organic growth", "NPS > 50", "80%+ retention rate"]
    },
    {
      "milestone": "Scale to $100K MRR",
      "timeline": "12-18 months post-launch",
      "metrics": ["1,000+ active customers", "CAC < 3 months payback", "Positive unit economics"]
    }
  ],
  "resourceScaling": [
    {
      "phase": "Phase 1: Foundation (0-6 months)",
      "team": ["1 founder/developer", "1 part-time marketer", "Freelance designer as needed"],
      "infrastructure": "Basic hosting ($50-100/mo), essential SaaS tools ($200-300/mo), minimal ad spend ($500-1K/mo)"
    },
    {
      "phase": "Phase 2: Growth (6-12 months)",
      "team": ["2 full-time developers", "1 full-time marketer", "1 customer success manager"],
      "infrastructure": "Scaled hosting ($200-500/mo), growth tools ($500-1K/mo), increased ad spend ($2-5K/mo)"
    },
    {
      "phase": "Phase 3: Scale (12-24 months)",
      "team": ["5-7 team members across engineering, marketing, sales, and support"],
      "infrastructure": "Enterprise hosting ($1-2K/mo), full marketing stack ($2-3K/mo), significant ad spend ($10-20K/mo)"
    }
  ]
}

REQUIREMENTS:
- Growth channels: 3-5 specific acquisition channels
  - Each channel should include: name, strategy description, priority (high/medium/low)
  - Focus on channels appropriate for the target audience and business model
  - Mix of organic (SEO, content) and paid (ads, partnerships) channels
  - Prioritize channels with best ROI for this specific business
- Milestones: 3-4 major growth milestones
  - Each milestone should include: name, timeline, 3-4 specific metrics
  - Milestones should be sequential and build on each other
  - Timeline should span 12-24 months post-launch
  - Metrics should be specific, measurable, and realistic
- Resource scaling: 3 phases of team and infrastructure growth
  - Each phase should include: phase name/timeline, team composition, infrastructure needs
  - Show clear progression from lean startup to scaled operation
  - Include specific cost estimates for infrastructure
  - Team should scale based on business needs and revenue

GUIDELINES:
- Prioritize sustainable, profitable growth over vanity metrics
- Consider the business model when recommending channels (B2B vs B2C, SaaS vs marketplace, etc.)
- Focus on channels that can scale efficiently (good unit economics)
- Recommend a mix of short-term and long-term growth strategies
- Resource scaling should be tied to revenue milestones (don't overhire)
- Infrastructure costs should scale proportionally with usage
- Include both customer acquisition and retention strategies
- Consider the reward score from Stage 2 when setting growth targets
- Be realistic about timelines - sustainable growth takes time
- Emphasize building systems and processes that enable scale

Respond ONLY with valid JSON.`;

    return { prompt, systemPrompt };
  }

  /**
   * Gets the AI prompt for Stage 6 (AI Automation Mapping)
   * Requirements: 5.1, 5.2, 5.3, 5.4
   * 
   * Identifies automation opportunities and AI tools
   */
  getStage6Prompt(analysis: any): { prompt: string; systemPrompt: string } {
    const businessName = analysis.businessModel || analysis.url;
    const valueProposition = analysis.structured?.overview?.valueProposition || 'Unknown';
    const monetization = analysis.structured?.overview?.monetization || 'Unknown';
    const targetAudience = analysis.structured?.overview?.targetAudience || 'Unknown';

    // Get Stage 2 data for context
    const stage2Data = analysis.stages?.[2]?.content;
    const automationPotential = stage2Data?.automationPotential?.score || 'Unknown';
    const automationOpportunities = stage2Data?.automationPotential?.opportunities?.join(', ') || 'Unknown';

    // Get Stage 3 data for context
    const stage3Data = analysis.stages?.[3]?.content;
    const coreFeatures = stage3Data?.coreFeatures?.join(', ') || 'Unknown';
    const techStack = stage3Data?.techStack ? 
      `Frontend: ${stage3Data.techStack.frontend?.join(', ')}, Backend: ${stage3Data.techStack.backend?.join(', ')}` : 
      'Unknown';

    // Get Stage 5 data for context
    const stage5Data = analysis.stages?.[5]?.content;
    const growthChannels = stage5Data?.growthChannels?.map((c: any) => c.channel).join(', ') || 'Unknown';
    const resourceScaling = stage5Data?.resourceScaling?.map((r: any) => r.phase).join(' → ') || 'Unknown';

    const systemPrompt = `You are an AI automation expert specializing in identifying opportunities to leverage AI tools and services for business efficiency. Provide specific, actionable recommendations with realistic ROI estimates.`;

    const prompt = `Create an AI automation mapping plan for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Automation Potential Score: ${automationPotential}
- Initial Opportunities: ${automationOpportunities}

STAGE 3 CONTEXT (MVP Launch Planning):
- Core Features: ${coreFeatures}
- Tech Stack: ${techStack}

STAGE 5 CONTEXT (Scaling & Growth):
- Growth Channels: ${growthChannels}
- Resource Scaling: ${resourceScaling}

Provide an AI Automation Mapping Plan in this exact JSON format:

{
  "automationOpportunities": [
    {
      "process": "Customer Support",
      "tool": "ChatGPT API + Custom Knowledge Base",
      "roi": "Save 20-30 hours/week, reduce support costs by 60%",
      "priority": 1
    },
    {
      "process": "Content Generation",
      "tool": "Claude API for blog posts, social media content",
      "roi": "Generate 10x more content, reduce content costs by 70%",
      "priority": 2
    },
    {
      "process": "Email Marketing",
      "tool": "Mailchimp AI + Personalization Engine",
      "roi": "Increase open rates by 40%, save 10 hours/week",
      "priority": 3
    },
    {
      "process": "Data Analysis & Reporting",
      "tool": "Google Analytics + AI-powered dashboards",
      "roi": "Real-time insights, save 15 hours/week on reporting",
      "priority": 4
    }
  ],
  "implementationPlan": [
    {
      "phase": "Phase 1: Quick Wins (Month 1-2)",
      "automations": [
        "Implement AI chatbot for customer support",
        "Set up automated email sequences with AI personalization",
        "Deploy AI content generation for social media"
      ],
      "timeline": "6-8 weeks"
    },
    {
      "phase": "Phase 2: Core Operations (Month 3-4)",
      "automations": [
        "Automate data analysis and reporting",
        "Implement AI-powered lead scoring",
        "Deploy automated content calendar with AI suggestions"
      ],
      "timeline": "6-8 weeks"
    },
    {
      "phase": "Phase 3: Advanced Optimization (Month 5-6)",
      "automations": [
        "Implement predictive analytics for customer behavior",
        "Deploy AI-powered A/B testing automation",
        "Set up automated inventory/resource management"
      ],
      "timeline": "6-8 weeks"
    }
  ],
  "estimatedSavings": "$50,000-$100,000 annually in labor costs + 40-60 hours/week in time savings"
}

REQUIREMENTS:
- Automation opportunities: 4-6 specific processes that can be automated
  - Each opportunity should include: process name, specific tool/service, ROI estimate, priority (1-6)
  - Focus on high-impact, achievable automations
  - Prioritize based on ROI and implementation difficulty
  - Include both cost savings and time savings in ROI
  - Recommend specific, real AI tools and services (ChatGPT, Claude, Zapier, Make, etc.)
- Implementation plan: 3 phases of automation rollout
  - Each phase should include: phase name/timeline, 3-4 specific automations, duration
  - Phases should build on each other (quick wins → core operations → advanced)
  - Timeline should span 4-6 months total
  - Start with easiest/highest-impact automations first
- Estimated savings: Overall financial and time impact
  - Include both annual cost savings and weekly time savings
  - Be realistic and conservative with estimates
  - Consider both direct costs (labor) and indirect benefits (speed, quality)

GUIDELINES:
- Focus on AI tools that are readily available and proven (ChatGPT, Claude, Gemini, etc.)
- Prioritize automations that directly impact revenue or reduce major costs
- Consider the business model and target audience when recommending tools
- Include both customer-facing (chatbots, personalization) and internal (analytics, reporting) automations
- Recommend no-code/low-code solutions where possible (Zapier, Make, n8n)
- Consider the tech stack from Stage 3 when recommending integrations
- Balance quick wins (easy to implement) with long-term strategic automations
- Include specific ROI metrics (% cost reduction, hours saved, revenue increase)
- Consider the automation potential score from Stage 2
- Emphasize tools that scale with the business (from Stage 5 context)
- Recommend automations that free up time for high-value activities
- Include both AI-powered tools and traditional automation platforms
- Consider data privacy and security when recommending tools
- Provide realistic implementation timelines based on team size and technical capability

Respond ONLY with valid JSON.`;

    return { prompt, systemPrompt };
  }
}
