import type { Express } from "express";
import { createServer, type Server } from "http";
import { minimalStorage } from "./minimal-storage";
import { rateLimit } from "./middleware/rateLimit";
import { AppError } from "./middleware/errorHandler";
import { healthzHandler } from "./routes/healthz";
import { structuredAnalysisSchema, enhancedStructuredAnalysisSchema, type StructuredAnalysis, type EnhancedStructuredAnalysis, type FirstPartyData, type BusinessImprovement } from "@shared/schema";
import { AIProviderService, type AIProvider } from "./services/ai-providers";
import { fetchFirstParty } from "./lib/fetchFirstParty";
import { ValidationService } from "./lib/validation";
import { BusinessImprovementService } from "./services/business-improvement";

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}



// Enhanced AI provider integration for evidence-based business analysis
async function analyzeUrlWithProvider(url: string, provider: AIProvider, firstPartyData?: FirstPartyData): Promise<{ content: string; model: string; structured?: StructuredAnalysis }> {
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
    
    // Validate and sanitize the AI response with confidence scoring and source validation
    let validated: StructuredAnalysis | EnhancedStructuredAnalysis;
    try {
      // First attempt enhanced validation with confidence scoring and source attribution
      validated = ValidationService.validateEnhancedAnalysis(result, url, firstPartyData);
      
      // Parse with enhanced schema to ensure all fields are properly typed
      validated = enhancedStructuredAnalysisSchema.parse(validated);
    } catch (enhancedError) {
      console.warn("Enhanced validation failed, falling back to original schema:", enhancedError);
      
      // Fallback to original schema for backward compatibility
      try {
        validated = structuredAnalysisSchema.parse(result);
      } catch (originalError) {
        console.error("Both enhanced and original schema validation failed:", { enhancedError, originalError });
        throw new Error(`Analysis validation failed: ${originalError instanceof Error ? originalError.message : 'Unknown error'}`);
      }
    }
    
    // Generate summary from structured data
    const summary = `${validated.overview.valueProposition}\n\nTarget Audience: ${validated.overview.targetAudience}\n\nMonetization: ${validated.overview.monetization}\n\nKey Insights: ${validated.synthesis.keyInsights.join(', ')}`;
    
    const modelName = provider === 'gemini' ? 'gemini:gemini-2.0-flash-exp' :
                     provider === 'openai' ? 'openai:gpt-4o' :
                     'grok:grok-2-1212';
    
    return { content: summary, model: modelName, structured: validated };
  } catch (error) {
    console.error(`${provider} structured analysis failed:`, error);
    
    // Enhanced error handling for validation failures
    if (error instanceof Error) {
      if (error.message.includes('Confidence score')) {
        throw new AppError(`Invalid confidence score in AI response: ${error.message}`, 502, 'AI_VALIDATION_ERROR');
      }
      if (error.message.includes('source') || error.message.includes('Source')) {
        throw new AppError(`Invalid source attribution in AI response: ${error.message}`, 502, 'AI_VALIDATION_ERROR');
      }
    }
    
    throw new AppError(`${provider} analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 502, 'AI_PROVIDER_DOWN');
  }
}



// Multi-provider analysis with enhanced evidence-based prompts
async function analyzeUrlWithAI(url: string, firstPartyData?: FirstPartyData): Promise<{ content: string; model: string; structured?: StructuredAnalysis | EnhancedStructuredAnalysis }> {
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

      // Extract first-party data from target website
      let firstPartyData: FirstPartyData | null = null;
      try {
        console.log("Attempting to fetch first-party data from:", url);
        firstPartyData = await fetchFirstParty(url);
        if (firstPartyData) {
          console.log("Successfully extracted first-party data:", {
            title: firstPartyData.title,
            hasDescription: !!firstPartyData.description,
            hasH1: !!firstPartyData.h1,
            textSnippetLength: firstPartyData.textSnippet.length
          });
        } else {
          console.log("First-party data extraction returned null - site may be unreachable or blocked");
        }
      } catch (firstPartyError) {
        console.warn("First-party data extraction failed, continuing with AI-only analysis:", firstPartyError);
        // Continue with analysis even if first-party extraction fails
      }

      // Perform AI analysis with multi-provider support, including first-party context
      const analysisResult = await analyzeUrlWithAI(url, firstPartyData || undefined);

      // Save analysis to storage with structured data and first-party data
      try {
        const analysis = await minimalStorage.createAnalysis(req.userId, {
          url,
          summary: analysisResult.content,
          model: analysisResult.model,
          structured: analysisResult.structured,
          firstPartyData: firstPartyData || undefined
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

  // POST /api/business-analyses/:id/improve - Generate business improvement suggestions
  app.post("/api/business-analyses/:id/improve", rateLimit, async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/improve hit", { id: req.params.id, body: req.body });
    try {
      const { id } = req.params;
      const { goal } = req.body;

      // Validate analysis ID is provided
      if (!id) {
        throw new AppError("Analysis ID is required", 400, 'BAD_REQUEST');
      }

      // Validate goal parameter if provided
      if (goal !== undefined && (typeof goal !== 'string' || goal.trim().length === 0)) {
        throw new AppError("Goal must be a non-empty string if provided", 400, 'BAD_REQUEST');
      }

      // Retrieve the analysis record first (before checking API keys)
      const analysis = await minimalStorage.getAnalysis(req.userId, id);
      if (!analysis) {
        throw new AppError("Analysis not found", 404, 'NOT_FOUND');
      }

      // Validate that the analysis has structured data
      if (!analysis.structured) {
        throw new AppError("Analysis does not have structured data required for improvement generation", 400, 'BAD_REQUEST');
      }

      // Check for at least one AI provider API key (after validating request)
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError("At least one AI provider API key (GEMINI_API_KEY, OPENAI_API_KEY, or GROK_API_KEY) is required", 500, 'CONFIG_MISSING');
      }

      // Ensure we have enhanced structured analysis for improvement generation
      let enhancedAnalysis: EnhancedStructuredAnalysis;
      try {
        enhancedAnalysis = enhancedStructuredAnalysisSchema.parse(analysis.structured);
      } catch (parseError) {
        console.warn("Analysis structured data is not in enhanced format, attempting conversion:", parseError);
        
        // Try to convert original structured analysis to enhanced format
        try {
          const originalAnalysis = structuredAnalysisSchema.parse(analysis.structured);
          enhancedAnalysis = {
            ...originalAnalysis,
            sources: [] // Add empty sources array for compatibility
          };
        } catch (conversionError) {
          console.error("Failed to parse analysis structured data:", conversionError);
          throw new AppError("Analysis structured data is invalid", 400, 'BAD_REQUEST');
        }
      }

      // Create AI provider service for improvement generation
      let aiProvider: AIProviderService;
      try {
        // Try Gemini first, then fallback to Grok
        if (process.env.GEMINI_API_KEY) {
          aiProvider = new AIProviderService(process.env.GEMINI_API_KEY, 'gemini', 30000);
        } else if (process.env.GROK_API_KEY) {
          aiProvider = new AIProviderService(process.env.GROK_API_KEY, 'grok', 30000);
        } else if (process.env.OPENAI_API_KEY) {
          aiProvider = new AIProviderService(process.env.OPENAI_API_KEY, 'openai', 30000);
        } else {
          throw new AppError("No AI provider API key available", 500, 'CONFIG_MISSING');
        }
      } catch (providerError) {
        console.error("Failed to create AI provider service:", providerError);
        throw new AppError("Failed to initialize AI provider", 500, 'INTERNAL');
      }

      // Create business improvement service
      const improvementService = new BusinessImprovementService(aiProvider, {
        timeoutMs: 30000 // 30 second timeout as per requirement 5.3
      });

      // Generate business improvement suggestions
      let improvement: BusinessImprovement;
      try {
        improvement = await improvementService.generateImprovement(
          enhancedAnalysis,
          goal?.trim() || undefined
        );
      } catch (improvementError) {
        console.error("Business improvement generation failed:", improvementError);
        
        // Handle specific error types
        if (improvementError instanceof Error) {
          if (improvementError.message.includes('timeout')) {
            throw new AppError("Business improvement generation timed out. Please try again.", 504, 'GATEWAY_TIMEOUT');
          }
          if (improvementError.message.includes('validation')) {
            throw new AppError("Generated improvement data is invalid. Please try again.", 502, 'AI_VALIDATION_ERROR');
          }
          if (improvementError.message.includes('AI generation')) {
            throw new AppError("AI provider failed to generate improvements. Please try again.", 502, 'AI_PROVIDER_DOWN');
          }
        }
        
        throw new AppError("Failed to generate business improvements", 500, 'INTERNAL');
      }

      // Store the improvement data in the analysis record
      const updatedAnalysis = await minimalStorage.updateAnalysisImprovements(req.userId, id, improvement);
      
      if (!updatedAnalysis) {
        console.error("Failed to store improvement data for analysis:", id);
        // Still return the improvement even if storage fails
      }

      // Return the improvement suggestions
      res.json({
        analysisId: id,
        improvement,
        generatedAt: improvement.generatedAt
      });

    } catch (error) {
      console.error("Business improvement generation failed:", error);
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}