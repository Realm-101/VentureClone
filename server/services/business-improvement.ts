import { AIProviderService, AIProvider } from './ai-providers.js';
import { BusinessImprovement, EnhancedStructuredAnalysis } from '@shared/schema.js';

export interface BusinessImprovementOptions {
  goal?: string;
  provider?: AIProvider;
  apiKey?: string;
  timeoutMs?: number;
}

export class BusinessImprovementService {
  private readonly timeoutMs: number;

  constructor(options: BusinessImprovementOptions = {}) {
    this.timeoutMs = options.timeoutMs || 30000; // 30 seconds default timeout
  }

  /**
   * Generates business improvement suggestions with 3 improvement angles and a 7-day plan
   * Requirements: 3.2, 3.3, 3.4, 5.3
   */
  async generateBusinessImprovement(
    analysis: EnhancedStructuredAnalysis,
    options: BusinessImprovementOptions = {}
  ): Promise<BusinessImprovement> {
    try {
      // Validate input analysis
      if (!analysis || !analysis.overview || !analysis.synthesis) {
        throw new Error('Invalid analysis data: missing required sections');
      }

      // Get AI provider configuration
      const provider = options.provider || 'openai';
      const apiKey = options.apiKey;
      
      if (!apiKey) {
        throw new Error('API key is required for business improvement generation');
      }

      // Create AI provider service with timeout configuration
      const aiService = new AIProviderService(apiKey, provider, this.timeoutMs);

      // Generate improvement suggestions using AI
      const improvementData = await this.generateImprovementWithAI(aiService, analysis, options.goal);

      // Validate the generated improvement data
      this.validateImprovementData(improvementData);

      // Return structured business improvement
      return {
        twists: improvementData.twists,
        sevenDayPlan: improvementData.sevenDayPlan,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      // Comprehensive error handling (requirement 5.3)
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error(`Business improvement generation timeout after ${this.timeoutMs}ms`);
        }
        throw new Error(`Business improvement generation failed: ${error.message}`);
      }
      throw new Error('Business improvement generation failed: Unknown error');
    }
  }

  /**
   * Generates improvement suggestions using AI provider
   */
  private async generateImprovementWithAI(
    aiService: AIProviderService,
    analysis: EnhancedStructuredAnalysis,
    goal?: string
  ): Promise<{ twists: string[]; sevenDayPlan: { day: number; tasks: string[] }[] }> {
    try {
      // Create improvement generation prompt
      const prompt = this.createImprovementPrompt(analysis, goal);
      const systemPrompt = this.createImprovementSystemPrompt();

      // Generate structured content with timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Business improvement generation timeout after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });

      const generationPromise = aiService.generateStructuredContent(prompt, this.getImprovementSchema(), systemPrompt);
      
      const result = await Promise.race([generationPromise, timeoutPromise]);

      if (!result) {
        throw new Error('AI provider returned empty response');
      }

      return result;

    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        throw error; // Re-throw timeout errors as-is
      }
      throw new Error(`AI improvement generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates the improvement generation prompt based on analysis data
   * Requirements: 3.2, 3.3, 3.4
   */
  private createImprovementPrompt(analysis: EnhancedStructuredAnalysis, goal?: string): string {
    const goalSection = goal ? `
IMPROVEMENT GOAL: ${goal}` : '';

    return `Based on this business analysis, generate 3 distinct improvement angles and a 7-day shipping plan.

BUSINESS ANALYSIS:
${JSON.stringify(analysis, null, 2)}${goalSection}

Generate improvements focused on:
- Lean scope and quick validation
- Measurable KPIs and success metrics
- Competitive differentiation opportunities
- User experience enhancements
- Technical improvements that add value

Each improvement angle should be:
- Specific and actionable
- Different from the others (no overlap)
- Focused on creating competitive advantage
- Achievable within resource constraints

The 7-day plan should:
- Build incrementally from day 1 to day 7
- Include validation and measurement tasks
- Focus on shipping a working prototype quickly
- Have exactly 3 tasks per day maximum
- Be specific and actionable

Provide response in this exact JSON format:

{
  "twists": [
    "Improvement angle 1: Specific, actionable business twist with clear value proposition",
    "Improvement angle 2: Different approach or market angle with competitive advantage", 
    "Improvement angle 3: Technical or operational improvement with measurable impact"
  ],
  "sevenDayPlan": [
    {
      "day": 1,
      "tasks": ["Foundation task 1", "Setup task 2", "Research task 3"]
    },
    {
      "day": 2,
      "tasks": ["Development task 1", "Design task 2", "Validation task 3"]
    },
    {
      "day": 3,
      "tasks": ["Implementation task 1", "Testing task 2", "Feedback task 3"]
    },
    {
      "day": 4,
      "tasks": ["Enhancement task 1", "Integration task 2", "Optimization task 3"]
    },
    {
      "day": 5,
      "tasks": ["Polish task 1", "Marketing task 2", "Analytics task 3"]
    },
    {
      "day": 6,
      "tasks": ["Launch prep task 1", "Final testing task 2", "Documentation task 3"]
    },
    {
      "day": 7,
      "tasks": ["Launch task 1", "Monitor task 2", "Iterate task 3"]
    }
  ]
}

CRITICAL REQUIREMENTS:
- Each day must have exactly 3 tasks maximum
- Tasks should be specific and actionable (not vague)
- Focus on shipping a working prototype quickly
- Include validation and measurement tasks throughout
- Build incrementally from day 1 to day 7
- Each twist must be distinct and non-overlapping

Respond ONLY with valid JSON.`;
  }

  /**
   * Creates the system prompt for improvement generation
   */
  private createImprovementSystemPrompt(): string {
    return `You are a business strategy consultant specializing in rapid prototype development and competitive differentiation.

Your role is to analyze existing businesses and generate actionable improvement strategies that can be implemented quickly with measurable results.

CORE PRINCIPLES:
- Focus on lean startup methodology
- Prioritize quick validation over perfect execution
- Generate measurable KPIs for success tracking
- Create competitive advantages through differentiation
- Emphasize user experience improvements
- Suggest technical enhancements that add real value

IMPROVEMENT ANGLE REQUIREMENTS:
- Each angle must be distinct and non-overlapping
- Focus on specific, actionable improvements
- Consider market gaps and competitive opportunities
- Include both strategic and tactical elements
- Ensure feasibility within typical startup constraints

7-DAY PLAN REQUIREMENTS:
- Exactly 3 tasks per day, no more, no less
- Tasks must be specific and actionable
- Build incrementally toward a working prototype
- Include validation checkpoints throughout
- Focus on shipping something testable by day 7
- Balance development, testing, and market validation

OUTPUT FORMAT:
- Respond only with valid JSON
- No additional text or explanations
- Follow the exact schema provided in the prompt

Your goal is to help entrepreneurs build better versions of existing businesses, not just copy them.`;
  }

  /**
   * Returns the JSON schema for improvement generation
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
                minItems: 3,
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
   * Requirements: 3.3, 3.4
   */
  private validateImprovementData(data: any): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid improvement data: not an object');
    }

    // Validate twists array
    if (!Array.isArray(data.twists) || data.twists.length !== 3) {
      throw new Error('Invalid improvement data: twists must be an array of exactly 3 items');
    }

    for (let i = 0; i < data.twists.length; i++) {
      if (typeof data.twists[i] !== 'string' || data.twists[i].trim().length === 0) {
        throw new Error(`Invalid improvement data: twist ${i + 1} must be a non-empty string`);
      }
    }

    // Validate seven day plan
    if (!Array.isArray(data.sevenDayPlan) || data.sevenDayPlan.length !== 7) {
      throw new Error('Invalid improvement data: sevenDayPlan must be an array of exactly 7 days');
    }

    for (let i = 0; i < data.sevenDayPlan.length; i++) {
      const dayPlan = data.sevenDayPlan[i];
      
      if (!dayPlan || typeof dayPlan !== 'object') {
        throw new Error(`Invalid improvement data: day ${i + 1} plan must be an object`);
      }

      if (dayPlan.day !== i + 1) {
        throw new Error(`Invalid improvement data: day ${i + 1} has incorrect day number`);
      }

      if (!Array.isArray(dayPlan.tasks) || dayPlan.tasks.length !== 3) {
        throw new Error(`Invalid improvement data: day ${i + 1} must have exactly 3 tasks`);
      }

      for (let j = 0; j < dayPlan.tasks.length; j++) {
        if (typeof dayPlan.tasks[j] !== 'string' || dayPlan.tasks[j].trim().length === 0) {
          throw new Error(`Invalid improvement data: day ${i + 1} task ${j + 1} must be a non-empty string`);
        }
      }
    }
  }

  /**
   * Test the service with a mock analysis
   */
  async testService(apiKey: string, provider: AIProvider = 'openai'): Promise<boolean> {
    try {
      const mockAnalysis: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: "Test value proposition",
          targetAudience: "Test audience",
          monetization: "Test monetization"
        },
        market: {
          competitors: [],
          swot: {
            strengths: ["Test strength"],
            weaknesses: ["Test weakness"],
            opportunities: ["Test opportunity"],
            threats: ["Test threat"]
          }
        },
        synthesis: {
          summary: "Test summary",
          keyInsights: ["Test insight"],
          nextActions: ["Test action"]
        },
        sources: []
      };

      const result = await this.generateBusinessImprovement(mockAnalysis, {
        provider,
        apiKey,
        timeoutMs: 10000 // Shorter timeout for testing
      });

      return result.twists.length === 3 && result.sevenDayPlan.length === 7;
    } catch (error) {
      console.error('Business improvement service test failed:', error);
      return false;
    }
  }
}

// Export convenience function for direct usage
export async function generateBusinessImprovement(
  analysis: EnhancedStructuredAnalysis,
  options: BusinessImprovementOptions = {}
): Promise<BusinessImprovement> {
  const service = new BusinessImprovementService(options);
  return service.generateBusinessImprovement(analysis, options);
}