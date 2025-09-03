import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'openai' | 'gemini' | 'grok';

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIProviderService {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenAI | null = null;
  private grokClient: OpenAI | null = null;

  constructor(private apiKey: string, private provider: AIProvider) {
    this.initializeClient();
  }

  private initializeClient() {
    switch (this.provider) {
      case 'openai':
        this.openaiClient = new OpenAI({ apiKey: this.apiKey });
        break;
      case 'gemini':
        this.geminiClient = new GoogleGenAI({ apiKey: this.apiKey });
        break;
      case 'grok':
        this.grokClient = new OpenAI({ 
          baseURL: "https://api.x.ai/v1", 
          apiKey: this.apiKey 
        });
        break;
    }
  }

  async generateContent(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    try {
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
    } catch (error) {
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateStructuredContent(prompt: string, schema: any, systemPrompt?: string): Promise<any> {
    try {
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
    } catch (error) {
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

    // Temporary fallback implementation - will be updated when proper API is configured
    return {
      content: "Gemini integration temporarily disabled. Please use OpenAI or Grok for now.",
    };
  }

  private async generateGeminiStructuredContent(prompt: string, schema: any, systemPrompt?: string): Promise<any> {
    if (!this.geminiClient) throw new Error('Gemini client not initialized');

    // Temporary fallback implementation - will be updated when proper API is configured
    throw new Error('Gemini integration temporarily disabled. Please use OpenAI or Grok for structured content generation.');
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
}
