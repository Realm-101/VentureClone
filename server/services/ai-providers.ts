import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type AIProvider = 'openai' | 'gemini' | 'grok';

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface FirstPartyData {
  title: string;
  description: string;
  h1: string;
  textSnippet: string;
  url: string;
}

export class AIProviderService {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private grokClient: OpenAI | null = null;
  private readonly timeoutMs: number;

  constructor(private apiKey: string, private provider: AIProvider, timeoutMs: number = 15000) {
    this.timeoutMs = timeoutMs;
    this.initializeClient();
  }

  private initializeClient() {
    // Enhanced timeout configuration for all AI providers (requirement 2.1)
    const clientOptions = {
      timeout: this.timeoutMs,
      maxRetries: 1, // Reduce retries to fail faster
    };

    switch (this.provider) {
      case 'openai':
        this.openaiClient = new OpenAI({ 
          apiKey: this.apiKey,
          ...clientOptions
        });
        break;
      case 'gemini':
        this.geminiClient = new GoogleGenerativeAI(this.apiKey);
        break;
      case 'grok':
        this.grokClient = new OpenAI({ 
          baseURL: "https://api.x.ai/v1", 
          apiKey: this.apiKey,
          ...clientOptions
        });
        break;
    }
  }

  async generateContent(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    try {
      // Add timeout wrapper for additional protection (requirement 2.1, 2.2)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI provider ${this.provider} timeout after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });

      const contentPromise = (async () => {
        switch (this.provider) {
          case 'openai':
            return await this.generateOpenAIContent(prompt, systemPrompt);
          case 'gemini':
            return await this.generateGeminiContent(prompt, systemPrompt);
          case 'grok':
            return await this.generateGrokContent(prompt, systemPrompt);
          default:
            throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
      })();

      return await Promise.race([contentPromise, timeoutPromise]);
    } catch (error) {
      // Enhanced error handling with timeout detection
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error(`AI provider ${this.provider} request timeout after ${this.timeoutMs}ms`);
      }
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStructuredContent(prompt: string, schema: any, systemPrompt?: string): Promise<any> {
    try {
      // Add timeout wrapper for structured content generation
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI provider ${this.provider} structured content timeout after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });

      const contentPromise = (async () => {
        switch (this.provider) {
          case 'openai':
            return await this.generateOpenAIStructuredContent(prompt, schema, systemPrompt);
          case 'gemini':
            return await this.generateGeminiStructuredContent(prompt, schema, systemPrompt);
          case 'grok':
            return await this.generateGrokStructuredContent(prompt, schema, systemPrompt);
          default:
            throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
      })();

      return await Promise.race([contentPromise, timeoutPromise]);
    } catch (error) {
      // Enhanced error handling with timeout detection
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new Error(`AI provider ${this.provider} structured content timeout after ${this.timeoutMs}ms`);
      }
      throw new Error(`Structured AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateOpenAIContent(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  private async generateOpenAIStructuredContent(prompt: string, schema: any, systemPrompt?: string): Promise<any> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  }

  private async generateGeminiContent(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!this.geminiClient) throw new Error('Gemini client not initialized');

    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      return {
        content: response.text() || '',
        usage: {
          prompt_tokens: 0, // Gemini doesn't provide token counts in the same way
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
    } catch (error) {
      throw new Error(`Gemini API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateGeminiStructuredContent(prompt: string, schema: any, systemPrompt?: string): Promise<any> {
    if (!this.geminiClient) throw new Error('Gemini client not initialized');

    try {
      const model = this.geminiClient.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      
      const content = response.text();
      return content ? JSON.parse(content) : null;
    } catch (error) {
      throw new Error(`Gemini structured content error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateGrokContent(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!this.grokClient) throw new Error('Grok client not initialized');

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.grokClient.chat.completions.create({
      model: "grok-2-1212",
      messages,
    });

    return {
      content: response.choices[0].message.content || '',
      usage: response.usage ? {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  private async generateGrokStructuredContent(prompt: string, schema: any, systemPrompt?: string): Promise<any> {
    if (!this.grokClient) throw new Error('Grok client not initialized');

    const messages: any[] = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const response = await this.grokClient.chat.completions.create({
      model: "grok-2-1212",
      messages,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateContent("Test connection. Respond with 'OK'.");
      return response.content.includes('OK');
    } catch (error) {
      return false;
    }
  }

  /**
   * Creates an enhanced system prompt that eliminates hedging language and requires evidence-based analysis
   */
  createEvidenceBasedSystemPrompt(): string {
    return `You are a business analyst who provides evidence-based analysis without hedging language.

CRITICAL REQUIREMENTS:
- Make definitive statements only when you have concrete evidence
- Use "unknown" instead of guessing or speculating
- Include confidence scores (0-1) for technical claims
- Provide source URLs and excerpts for all factual claims
- Never use hedging language like "could", "possibly", "appears to", "seems like"
- If you cannot find evidence for a claim, do not include that claim

CONFIDENCE SCORING:
- Only provide confidence scores for technical stack claims
- 0.8-1.0: Direct evidence (visible in code, explicit mentions)
- 0.6-0.79: Strong indicators (job postings, documentation patterns)
- 0.4-0.59: Moderate indicators (common patterns, indirect evidence)
- 0.0-0.39: Weak indicators (speculation based on limited evidence)

SOURCE ATTRIBUTION:
- Every factual claim must include a source URL and 10-300 character excerpt
- Sources must be real, accessible URLs
- Excerpts must be direct quotes from the source
- If no source exists, state "unknown" instead of making the claim

Respond only with valid JSON in the exact format requested.`;
  }

  /**
   * Creates an enhanced analysis prompt with first-party context integration
   */
  createEnhancedAnalysisPrompt(url: string, firstPartyData?: FirstPartyData): string {
    const contextSection = firstPartyData ? `
FIRST-PARTY WEBSITE CONTEXT:
- Title: ${firstPartyData.title}
- Description: ${firstPartyData.description}
- Main Heading: ${firstPartyData.h1}
- Content Sample: ${firstPartyData.textSnippet}
- Source URL: ${firstPartyData.url}

Use this actual website content as the primary source for your analysis. Anchor all insights to what is actually present on the site.` : `
FIRST-PARTY CONTEXT: SITE CONTEXT unavailable - analysis will be limited to general knowledge.`;

    return `Analyze this business URL and provide a structured JSON response with evidence-based analysis.

${contextSection}

TARGET URL: ${url}

Provide analysis in this exact JSON format:

{
  "overview": {
    "valueProposition": "Definitive statement based on actual site content",
    "targetAudience": "Specific audience based on site evidence",
    "monetization": "Concrete monetization model or 'unknown' if not evident"
  },
  "market": {
    "competitors": [
      {"name": "Competitor name", "url": "competitor URL", "notes": "relationship notes"}
    ],
    "swot": {
      "strengths": ["evidence-based strength 1", "evidence-based strength 2"],
      "weaknesses": ["observable weakness 1", "observable weakness 2"],
      "opportunities": ["market opportunity 1", "market opportunity 2"],
      "threats": ["competitive threat 1", "competitive threat 2"]
    }
  },
  "technical": {
    "techStack": ["technology 1", "technology 2"],
    "confidence": 0.85,
    "uiColors": ["#color1", "#color2"],
    "keyPages": ["/page1", "/page2"]
  },
  "data": {
    "trafficEstimates": {
      "value": "specific estimate or 'unknown'",
      "source": "https://source-url.com"
    },
    "keyMetrics": [
      {
        "name": "metric name",
        "value": "specific value or 'unknown'",
        "source": "https://source-url.com",
        "asOf": "date if available"
      }
    ]
  },
  "synthesis": {
    "summary": "Evidence-based 100-150 word summary without hedging language",
    "keyInsights": ["definitive insight 1", "definitive insight 2", "definitive insight 3"],
    "nextActions": ["specific action 1", "specific action 2", "specific action 3"]
  },
  "sources": [
    {
      "url": "https://source-url.com",
      "excerpt": "Direct quote from source (10-300 characters)"
    }
  ]
}

REQUIREMENTS:
- Include confidence score only for technical stack claims (0-1 range)
- All data claims must include source URLs
- Use "unknown" for any information not directly observable
- Include the target site as a source for claims made about it
- No hedging language - make definitive statements or use "unknown"
- Sources array must contain real URLs with actual excerpts

Respond ONLY with valid JSON. Do not include any text before or after the JSON.`;
  }

  /**
   * Creates a business improvement generation prompt
   */
  createImprovementPrompt(analysis: any, goal?: string): string {
    const goalSection = goal ? `
IMPROVEMENT GOAL: ${goal}` : '';

    return `Based on this business analysis, generate 3 distinct improvement angles and a 7-day shipping plan.

BUSINESS ANALYSIS:
${JSON.stringify(analysis, null, 2)}${goalSection}

Generate improvements focused on:
- Lean scope and quick validation
- measurable KPIs
- Competitive differentiation
- User experience enhancements

Provide response in this exact JSON format:

{
  "twists": [
    "Improvement angle 1: Specific, actionable business twist",
    "Improvement angle 2: Different approach or market angle", 
    "Improvement angle 3: Technical or operational improvement"
  ],
  "sevenDayPlan": [
    {
      "day": 1,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 2,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 3,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 4,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 5,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 6,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 7,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}

REQUIREMENTS:
- Each day must have exactly 3 tasks maximum
- Tasks should be specific and actionable
- Focus on shipping a working prototype quickly
- Include validation and measurement tasks
- Build incrementally from day 1 to day 7

Respond ONLY with valid JSON.`;
  }
}
