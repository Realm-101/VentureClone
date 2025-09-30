import type { Express } from "express";
import { createServer, type Server } from "http";
import { minimalStorage } from "./minimal-storage";
import { rateLimit } from "./middleware/rateLimit";
import { fetchWithTimeout } from "./lib/fetchWithTimeout";
import { AppError } from "./middleware/errorHandler";
import { healthzHandler } from "./routes/healthz";
import { structuredAnalysisSchema, enhancedStructuredAnalysisSchema, type StructuredAnalysis, type EnhancedStructuredAnalysis } from "@shared/schema";
import { AIProviderService, type AIProvider } from "./services/ai-providers";

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to parse structured analysis with enhanced schema support and graceful fallback
function parseStructuredAnalysis(content: string): { structured?: StructuredAnalysis | EnhancedStructuredAnalysis; summary: string } {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content);
    
    // Try enhanced schema first, fall back to original schema
    let validated: StructuredAnalysis | EnhancedStructuredAnalysis;
    try {
      validated = enhancedStructuredAnalysisSchema.parse(parsed);
    } catch (enhancedError) {
      console.warn("Enhanced schema validation failed, trying original schema:", enhancedError);
      validated = structuredAnalysisSchema.parse(parsed);
    }
    
    // Generate summary from structured data
    const summary = `${validated.overview.valueProposition}\n\nTarget Audience: ${validated.overview.targetAudience}\n\nMonetization: ${validated.overview.monetization}\n\nKey Insights: ${validated.synthesis.keyInsights.join(', ')}`;
    
    return { structured: validated, summary };
  } catch (error) {
    // Graceful fallback to plain text
    console.warn("Failed to parse structured analysis, falling back to plain text:", error);
    return { summary: content };
  }
}

// Enhanced AI provider integration for evidence-based business analysis
async function analyzeUrlWithProvider(url: string, provider: AIProvider, firstPartyData?: any): Promise<{ content: string; model: string; structured?: StructuredAnalysis }> {
  const apiKey = provider === 'gemini' ? process.env.GEMINI_API_KEY : 
                 provider === 'openai' ? process.env.OPENAI_API_KEY :
                 process.env.GROK_API_KEY;
  
  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()}_API_KEY missing`);
  }

  const aiService = new AIProviderService(apiKey, provider, 15000);

  // Use enhanced prompts with evidence-based analysis
  const structuredPrompt = aiService.createEnhancedAnalysisPrompt(url, firstPartyData);
  const systemPrompt = aiService.createEvidenceBasedSystemPrompt();

  // Enhanced schema with confidence scoring and source attribution
  const schema = {
    type: "object",
    properties: {
      overview: {
        type: "object",
        properties: {
          valueProposition: { type: "string" },
          targetAudience: { type: "string" },
          monetization: { type: "string" }
        },
        required: ["valueProposition", "targetAudience", "monetization"]
      },
      market: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                url: { type: "string" },
                notes: { type: "string" }
              },
              required: ["name"]
            }
          },
          swot: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              threats: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      technical: {
        type: "object",
        properties: {
          techStack: { type: "array", items: { type: "string" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          uiColors: { type: "array", items: { type: "string" } },
          keyPages: { type: "array", items: { type: "string" } }
        }
      },
      data: {
        type: "object",
        properties: {
          trafficEstimates: {
            type: "object",
            properties: {
              value: { type: "string" },
              source: { type: "string", format: "uri" }
            }
          },
          keyMetrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "string" },
                source: { type: "string", format: "uri" },
                asOf: { type: "string" }
              },
              required: ["name", "value"]
            }
          }
        }
      },
      synthesis: {
        type: "object",
        properties: {
          summary: { type: "string" },
          keyInsights: { type: "array", items: { type: "string" } },
          nextActions: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "keyInsights", "nextActions"]
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri" },
            excerpt: { type: "string", minLength: 10, maxLength: 300 }
          },
          required: ["url", "excerpt"]
        },
        default: []
      }
    },
    required: ["overview", "synthesis"]
  };

  try {
    const result = await aiService.generateStructuredContent(structuredPrompt, schema, systemPrompt);
    
    // Try to validate against enhanced schema first, fall back to original schema for backward compatibility
    let validated: StructuredAnalysis | EnhancedStructuredAnalysis;
    try {
      validated = enhancedStructuredAnalysisSchema.parse(result);
    } catch (enhancedError) {
      console.warn("Enhanced schema validation failed, falling back to original schema:", enhancedError);
      validated = structuredAnalysisSchema.parse(result);
    }
    
    // Generate summary from structured data
    const summary = `${validated.overview.valueProposition}\n\nTarget Audience: ${validated.overview.targetAudience}\n\nMonetization: ${validated.overview.monetization}\n\nKey Insights: ${validated.synthesis.keyInsights.join(', ')}`;
    
    const modelName = provider === 'gemini' ? 'gemini:gemini-2.0-flash-exp' :
                     provider === 'openai' ? 'openai:gpt-4o' :
                     'grok:grok-2-1212';
    
    return { content: summary, model: modelName, structured: validated };
  } catch (error) {
    console.error(`${provider} structured analysis failed:`, error);
    throw new AppError(`${provider} analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 502, 'AI_PROVIDER_DOWN');
  }
}



// Multi-provider analysis with enhanced evidence-based prompts
async function analyzeUrlWithAI(url: string, firstPartyData?: any): Promise<{ content: string; model: string; structured?: StructuredAnalysis | EnhancedStructuredAnalysis }> {
  // Try Gemini first
  try {
    console.log("Attempting enhanced analysis with Gemini...");
    return await analyzeUrlWithProvider(url, 'gemini', firstPartyData);
  } catch (geminiError) {
    console.warn("Gemini analysis failed, falling back to Grok:", geminiError);
    
    // If Gemini failed due to timeout, don't try Grok
    if (geminiError instanceof Error && geminiError.message.includes('timeout')) {
      throw new AppError("AI provider request timeout", 504, 'GATEWAY_TIMEOUT');
    }
    
    // Fallback to Grok
    try {
      console.log("Attempting enhanced analysis with Grok...");
      return await analyzeUrlWithProvider(url, 'grok', firstPartyData);
    } catch (grokError) {
      console.error("Both Gemini and Grok failed:", { geminiError, grokError });
      
      // Handle timeout errors specifically
      if (grokError instanceof Error && grokError.message.includes('timeout')) {
        throw new AppError("AI provider request timeout", 504, 'GATEWAY_TIMEOUT');
      }
      
      // If both providers failed with non-timeout errors, return 502
      if (geminiError instanceof AppError || grokError instanceof AppError) {
        throw new AppError("Both AI providers failed. Please check your API keys and try again.", 502, 'AI_PROVIDER_DOWN');
      }
      
      throw new AppError("Both AI providers failed. Please check your API keys and try again.", 502, 'AI_PROVIDER_DOWN');
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("=== REGISTERING MINIMAL ROUTES ===");
  
  // GET /api/healthz - Health check endpoint
  app.get("/api/healthz", healthzHandler);
  
  // GET /api/business-analyses - List user's analyses in reverse chronological order
  app.get("/api/business-analyses", async (req, res, next) => {
    console.log("GET /api/business-analyses hit");
    try {
      const analyses = await minimalStorage.listAnalyses(req.userId);
      res.json(analyses);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
      next(new AppError("Failed to fetch business analyses", 500, 'INTERNAL'));
    }
  });

  // POST /api/business-analyses/analyze - Create new analysis via multi-provider AI integration
  app.post("/api/business-analyses/analyze", rateLimit, async (req, res, next) => {
    console.log("=== NEW MINIMAL ROUTE HIT ===", req.body);
    try {
      const { url } = req.body;

      // Validate URL is provided
      if (!url) {
        console.log("URL missing");
        throw new AppError("URL is required", 400, 'BAD_REQUEST');
      }

      // Validate URL format
      if (!isValidUrl(url)) {
        console.log("Invalid URL format:", url);
        throw new AppError("Invalid URL format", 400, 'BAD_REQUEST');
      }

      // Check for at least one AI provider API key
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError("At least one AI provider API key (GEMINI_API_KEY, OPENAI_API_KEY, or GROK_API_KEY) is required", 500, 'CONFIG_MISSING');
      }

      // Perform AI analysis with multi-provider support
      const analysisResult = await analyzeUrlWithAI(url);

      // Save analysis to storage with structured data
      try {
        const analysis = await minimalStorage.createAnalysis(req.userId, {
          url,
          summary: analysisResult.content,
          model: analysisResult.model,
          structured: analysisResult.structured
        });

        res.json(analysis);
      } catch (storageError) {
        console.error("Storage error:", storageError);
        throw new AppError("Failed to create business analysis", 500, 'INTERNAL');
      }
    } catch (error) {
      console.error("Analysis creation failed:", error);
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}