import { AIProviderService } from './ai-providers.js';
import { EnhancedStructuredAnalysis, BusinessImprovement } from '../../shared/schema.js';

export interface BusinessImprovementOptions {
  goal?: string;
  timeoutMs?: number;
}

export class BusinessImprovementService {
  private readonly timeoutMs: number;

  constructor(
    private aiProvider: AIProviderService,
    options: BusinessImprovementOptions = {}
  ) {
    this.timeoutMs = options.timeoutMs || 30000; // 30 seconds default timeout
  }

  /**
   * Generates business improvement suggestions based on analysis
   * Requirements: 3.2, 3.3, 3.4, 5.3
   */
  async generateImprovement(
    analysis: EnhancedStructuredAnalysis,
    goal?: string
  ): Promise<BusinessImprovement> {
    const startTime = Date.now();
    
    try {
      // Validate input analysis
      this.validateInputAnalysis(analysis);
      
      // Validate goal parameter if provided
      if (goal !== undefined) {
        this.validateGoal(goal);
      }

      // Create timeout promise for 30-second limit (requirement 5.3)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const elapsed = Date.now() - startTime;
          reject(new Error(`Business improvement generation timeout after ${elapsed}ms (limit: ${this.timeoutMs}ms)`));
        }, this.timeoutMs);
      });

      // Generate improvement content with AI
      const improvementPromise = this.generateImprovementContent(analysis, goal);

      // Race between content generation and timeout
      const result = await Promise.race([improvementPromise, timeoutPromise]);

      // Validate the generated improvement
      this.validateImprovement(result);

      const elapsed = Date.now() - startTime;
      console.log(`Business improvement generation completed in ${elapsed}ms`);

      return {
        ...result,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`Business improvement generation failed after ${elapsed}ms:`, error);
      
      // Comprehensive error handling (requirement 5.3)
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error(`Business improvement generation failed: Request timeout after ${elapsed}ms (limit: ${this.timeoutMs}ms)`);
        }
        if (error.message.includes('validation')) {
          throw new Error(`Business improvement generation failed: ${error.message}`);
        }
        if (error.message.includes('AI generation')) {
          throw new Error(`Business improvement generation failed: AI service error - ${error.message}`);
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error(`Business improvement generation failed: Network error - ${error.message}`);
        }
        throw new Error(`Business improvement generation failed: ${error.message}`);
      }
      throw new Error('Business improvement generation failed: Unknown error');
    }
  }

  /**
   * Validates input analysis for improvement generation
   */
  private validateInputAnalysis(analysis: EnhancedStructuredAnalysis): void {
    if (!analysis) {
      throw new Error('validation failed: analysis is required');
    }

    if (!analysis.overview) {
      throw new Error('validation failed: analysis must have overview section');
    }

    if (!analysis.overview.valueProposition || analysis.overview.valueProposition.trim().length === 0) {
      throw new Error('validation failed: analysis must have value proposition');
    }

    if (!analysis.overview.targetAudience || analysis.overview.targetAudience.trim().length === 0) {
      throw new Error('validation failed: analysis must have target audience');
    }

    if (!analysis.overview.monetization || analysis.overview.monetization.trim().length === 0) {
      throw new Error('validation failed: analysis must have monetization strategy');
    }

    if (!analysis.synthesis) {
      throw new Error('validation failed: analysis must have synthesis section');
    }

    if (!analysis.synthesis.keyInsights || analysis.synthesis.keyInsights.length === 0) {
      throw new Error('validation failed: analysis must have key insights');
    }
  }

  /**
   * Validates goal parameter
   */
  private validateGoal(goal: string): void {
    if (typeof goal !== 'string') {
      throw new Error('validation failed: goal must be a string');
    }

    const trimmedGoal = goal.trim();
    if (trimmedGoal.length === 0) {
      throw new Error('validation failed: goal cannot be empty');
    }

    if (trimmedGoal.length > 500) {
      throw new Error('validation failed: goal cannot exceed 500 characters');
    }

    // Check for potentially harmful content
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedGoal)) {
        throw new Error('validation failed: goal contains potentially harmful content');
      }
    }
  }

  /**
   * Generates improvement content using AI provider
   */
  private async generateImprovementContent(
    analysis: EnhancedStructuredAnalysis,
    goal?: string
  ): Promise<Omit<BusinessImprovement, 'generatedAt'>> {
    const startTime = Date.now();
    
    try {
      // Create the improvement prompt
      const prompt = this.createImprovementPrompt(analysis, goal);
      const systemPrompt = this.createImprovementSystemPrompt();

      // Validate prompt length to prevent issues
      if (prompt.length > 50000) {
        console.warn(`Improvement prompt is very long (${prompt.length} chars), truncating...`);
        // Truncate while preserving structure
        const truncatedPrompt = prompt.substring(0, 45000) + '\n\n[Content truncated for length]';
      }

      console.log(`Generating improvement content with AI provider (timeout: ${this.timeoutMs}ms)`);

      // Generate structured content using AI provider with timeout handling
      const response = await this.aiProvider.generateStructuredContent(
        prompt,
        this.getImprovementSchema(),
        systemPrompt
      );

      const elapsed = Date.now() - startTime;
      console.log(`AI improvement generation completed in ${elapsed}ms`);

      if (!response) {
        throw new Error('AI provider returned empty response');
      }

      // Validate response structure before returning
      if (typeof response !== 'object' || response === null) {
        throw new Error('AI provider returned invalid response format');
      }

      return response;

    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`AI improvement generation failed after ${elapsed}ms:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
          throw new Error(`AI generation timeout after ${elapsed}ms: ${error.message}`);
        }
        if (error.message.includes('rate limit') || error.message.includes('RATE_LIMITED')) {
          throw new Error(`AI generation rate limited: ${error.message}`);
        }
        if (error.message.includes('API key') || error.message.includes('authentication')) {
          throw new Error(`AI generation authentication error: ${error.message}`);
        }
        if (error.message.includes('network') || error.message.includes('fetch')) {
          throw new Error(`AI generation network error: ${error.message}`);
        }
        throw new Error(`AI generation error: ${error.message}`);
      }
      throw new Error('AI generation failed with unknown error');
    }
  }

  /**
   * Creates the system prompt for improvement generation
   */
  private createImprovementSystemPrompt(): string {
    return `You are a business strategy consultant who generates actionable improvement suggestions for existing businesses.

CRITICAL REQUIREMENTS:
- Generate exactly 3 distinct business improvement angles
- Create a 7-day shipping plan with exactly 3 tasks per day maximum
- Focus on lean scope, quick validation, and measurable KPIs
- Each improvement angle should be specific and actionable
- Tasks should build incrementally from day 1 to day 7
- Prioritize shipping a working prototype quickly
- Include validation and measurement tasks throughout the plan

IMPROVEMENT FOCUS AREAS:
- Competitive differentiation strategies
- User experience enhancements
- Technical or operational improvements
- Market positioning adjustments
- Revenue model optimizations

TASK REQUIREMENTS:
- Each task must be specific and actionable
- Tasks should be completable within a single day
- Include both building and validation activities
- Focus on measurable outcomes and KPIs
- Build toward a shippable prototype by day 7

Respond only with valid JSON in the exact format requested.`;
  }

  /**
   * Creates the improvement generation prompt
   */
  private createImprovementPrompt(analysis: EnhancedStructuredAnalysis, goal?: string): string {
    const goalSection = goal ? `
IMPROVEMENT GOAL: ${goal}

Focus the improvements on achieving this specific goal while maintaining the core business model.` : '';

    return `Based on this business analysis, generate 3 distinct improvement angles and a 7-day shipping plan.

BUSINESS ANALYSIS:
Value Proposition: ${analysis.overview.valueProposition}
Target Audience: ${analysis.overview.targetAudience}
Monetization: ${analysis.overview.monetization}

Market Analysis:
- Competitors: ${analysis.market.competitors.map(c => c.name).join(', ')}
- Strengths: ${analysis.market.swot.strengths.join(', ')}
- Weaknesses: ${analysis.market.swot.weaknesses.join(', ')}
- Opportunities: ${analysis.market.swot.opportunities.join(', ')}
- Threats: ${analysis.market.swot.threats.join(', ')}

Technical Details:
${analysis.technical ? `- Tech Stack: ${analysis.technical.techStack?.join(', ') || 'Unknown'}
- Key Pages: ${analysis.technical.keyPages?.join(', ') || 'Unknown'}` : '- Technical details not available'}

Key Insights: ${analysis.synthesis.keyInsights.join(', ')}
Summary: ${analysis.synthesis.summary}${goalSection}

Generate improvements that:
1. Address identified weaknesses and threats
2. Leverage opportunities and strengths
3. Differentiate from existing competitors
4. Improve user experience and engagement
5. Optimize revenue generation

Provide response in this exact JSON format:

{
  "twists": [
    "Improvement angle 1: Specific, actionable business twist that addresses a key weakness or opportunity",
    "Improvement angle 2: Different approach focusing on competitive differentiation or market positioning", 
    "Improvement angle 3: Technical, operational, or user experience improvement that enhances value proposition"
  ],
  "sevenDayPlan": [
    {
      "day": 1,
      "tasks": ["Research and validate core assumption", "Set up basic project structure", "Define success metrics and KPIs"]
    },
    {
      "day": 2,
      "tasks": ["Build minimum viable feature", "Create user feedback collection system", "Test core functionality"]
    },
    {
      "day": 3,
      "tasks": ["Implement key differentiator", "Gather initial user feedback", "Iterate based on feedback"]
    },
    {
      "day": 4,
      "tasks": ["Add essential integrations", "Optimize user experience", "Measure key performance indicators"]
    },
    {
      "day": 5,
      "tasks": ["Polish user interface", "Implement analytics tracking", "Prepare for user testing"]
    },
    {
      "day": 6,
      "tasks": ["Conduct user testing sessions", "Fix critical issues", "Prepare launch materials"]
    },
    {
      "day": 7,
      "tasks": ["Launch prototype to target audience", "Monitor key metrics", "Plan next iteration based on results"]
    }
  ]
}

REQUIREMENTS:
- Each day must have exactly 3 tasks maximum (requirement 3.4)
- Tasks should be specific and actionable
- Focus on shipping a working prototype quickly
- Include validation and measurement tasks
- Build incrementally from day 1 to day 7
- Each improvement angle should be distinct and address different aspects of the business

Respond ONLY with valid JSON.`;
  }

  /**
   * Gets the JSON schema for improvement generation
   */
  private getImprovementSchema(): any {
    return {
      type: "object",
      properties: {
        twists: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        sevenDayPlan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number", minimum: 1, maximum: 7 },
              tasks: {
                type: "array",
                items: { type: "string" },
                minItems: 1,
                maxItems: 3
              }
            },
            required: ["day", "tasks"]
          },
          minItems: 7,
          maxItems: 7
        }
      },
      required: ["twists", "sevenDayPlan"]
    };
  }

  /**
   * Validates the generated improvement data
   */
  private validateImprovement(improvement: Omit<BusinessImprovement, 'generatedAt'>): void {
    // Validate twists array (requirement 3.2)
    if (!improvement.twists || !Array.isArray(improvement.twists)) {
      throw new Error('validation failed: twists must be an array');
    }

    if (improvement.twists.length !== 3) {
      throw new Error('validation failed: must have exactly 3 improvement twists');
    }

    for (const twist of improvement.twists) {
      if (typeof twist !== 'string' || twist.trim().length === 0) {
        throw new Error('validation failed: each twist must be a non-empty string');
      }
    }

    // Validate seven day plan (requirement 3.3, 3.4)
    if (!improvement.sevenDayPlan || !Array.isArray(improvement.sevenDayPlan)) {
      throw new Error('validation failed: sevenDayPlan must be an array');
    }

    if (improvement.sevenDayPlan.length !== 7) {
      throw new Error('validation failed: sevenDayPlan must have exactly 7 days');
    }

    for (let i = 0; i < improvement.sevenDayPlan.length; i++) {
      const dayPlan = improvement.sevenDayPlan[i];
      
      if (!dayPlan || typeof dayPlan !== 'object') {
        throw new Error(`validation failed: day ${i + 1} plan must be an object`);
      }

      if (dayPlan.day !== i + 1) {
        throw new Error(`validation failed: day ${i + 1} must have day property set to ${i + 1}`);
      }

      if (!dayPlan.tasks || !Array.isArray(dayPlan.tasks)) {
        throw new Error(`validation failed: day ${i + 1} tasks must be an array`);
      }

      // Requirement 3.4: maximum 3 tasks per day
      if (dayPlan.tasks.length === 0 || dayPlan.tasks.length > 3) {
        throw new Error(`validation failed: day ${i + 1} must have 1-3 tasks, got ${dayPlan.tasks.length}`);
      }

      for (const task of dayPlan.tasks) {
        if (typeof task !== 'string' || task.trim().length === 0) {
          throw new Error(`validation failed: day ${i + 1} tasks must be non-empty strings`);
        }
      }
    }
  }

  /**
   * Creates a formatted text version of the 7-day plan for clipboard export
   */
  static formatPlanForClipboard(improvement: BusinessImprovement): string {
    let formatted = `Business Improvement Plan\n`;
    formatted += `Generated: ${new Date(improvement.generatedAt).toLocaleDateString()}\n\n`;
    
    formatted += `Improvement Angles:\n`;
    improvement.twists.forEach((twist, index) => {
      formatted += `${index + 1}. ${twist}\n`;
    });
    
    formatted += `\n7-Day Shipping Plan:\n`;
    improvement.sevenDayPlan.forEach(dayPlan => {
      formatted += `\nDay ${dayPlan.day}:\n`;
      dayPlan.tasks.forEach(task => {
        formatted += `  • ${task}\n`;
      });
    });
    
    return formatted;
  }
}