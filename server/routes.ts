import type { Express } from "express";
import { createServer, type Server } from "http";
import { minimalStorage, type CreateAnalysisInput } from "./minimal-storage";
import { rateLimit } from "./middleware/rateLimit";
import { AppError } from "./middleware/errorHandler";
import { healthzHandler } from "./routes/healthz";
import { structuredAnalysisSchema, enhancedStructuredAnalysisSchema, type StructuredAnalysis, type EnhancedStructuredAnalysis, type FirstPartyData, type BusinessImprovement } from "@shared/schema";
import { AIProviderService, type AIProvider } from "./services/ai-providers";
import { fetchFirstParty, fetchFirstPartyWithRetry } from "./lib/fetchFirstParty";
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



// Performance optimization: Request queue for concurrent handling
const analysisQueue = new Map<string, Promise<any>>();
const MAX_CONCURRENT_ANALYSES = 5;
let activeAnalyses = 0;

// Enhanced AI provider integration for evidence-based business analysis
async function analyzeUrlWithProvider(url: string, provider: AIProvider, firstPartyData?: FirstPartyData): Promise<{ content: string; model: string; structured?: StructuredAnalysis }> {
  const apiKey = provider === 'gemini' ? process.env.GEMINI_API_KEY : 
                 provider === 'openai' ? process.env.OPENAI_API_KEY :
                 process.env.GROK_API_KEY;
  
  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()}_API_KEY missing`);
  }

  // Increase timeout to 30 seconds for more complex analysis
  const aiService = new AIProviderService(apiKey, provider, 30000);

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
    console.log(`Calling ${provider} generateStructuredContent...`);
    const result = await aiService.generateStructuredContent(structuredPrompt, schema, systemPrompt);
    console.log(`${provider} generateStructuredContent returned successfully`);
    
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
    
    const modelName = provider === 'gemini' ? 'gemini:gemini-2.5-flash' :
                     provider === 'openai' ? 'openai:gpt-4o' :
                     'grok:grok-2-1212';
    
    return { content: summary, model: modelName, structured: validated };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error(`${provider} structured analysis failed:`, errorMessage);
    console.error(`Error details:`, { errorMessage, errorStack });
    
    // Enhanced error handling for validation failures
    if (error instanceof Error) {
      if (error.message.includes('Confidence score')) {
        throw new AppError(`Invalid confidence score in AI response: ${error.message}`, 502, 'AI_VALIDATION_ERROR');
      }
      if (error.message.includes('source') || error.message.includes('Source')) {
        throw new AppError(`Invalid source attribution in AI response: ${error.message}`, 502, 'AI_VALIDATION_ERROR');
      }
      if (error.message.includes('schema')) {
        throw new AppError(`Schema validation error: ${error.message}`, 502, 'AI_VALIDATION_ERROR');
      }
    }
    
    throw new AppError(`${provider} analysis failed: ${errorMessage}`, 502, 'AI_PROVIDER_DOWN');
  }
}



// Performance optimization: Concurrent request management
async function manageConcurrentAnalysis<T>(
  key: string, 
  analysisFunction: () => Promise<T>
): Promise<T> {
  // Check if this analysis is already in progress
  if (analysisQueue.has(key)) {
    console.log(`Reusing existing analysis for ${key}`);
    return analysisQueue.get(key)!;
  }

  // Check concurrent limit
  if (activeAnalyses >= MAX_CONCURRENT_ANALYSES) {
    throw new AppError("System is currently processing maximum concurrent analyses. Please try again in a moment.", 429, 'RATE_LIMITED');
  }

  // Create and track the analysis promise
  const analysisPromise = (async () => {
    activeAnalyses++;
    try {
      return await analysisFunction();
    } finally {
      activeAnalyses--;
      analysisQueue.delete(key);
    }
  })();

  analysisQueue.set(key, analysisPromise);
  return analysisPromise;
}

// Multi-provider analysis with enhanced evidence-based prompts and concurrency management
async function analyzeUrlWithAI(url: string, firstPartyData?: FirstPartyData): Promise<{ content: string; model: string; structured?: StructuredAnalysis | EnhancedStructuredAnalysis }> {
  const analysisKey = `${url}-${firstPartyData ? 'with-fp' : 'no-fp'}`;
  
  return manageConcurrentAnalysis(analysisKey, async () => {
    // Try Grok first (temporary workaround while debugging Gemini)
    try {
      console.log("Attempting enhanced analysis with Grok...");
      return await analyzeUrlWithProvider(url, 'grok', firstPartyData);
    } catch (grokError) {
      console.warn("Grok analysis failed, falling back to Gemini:", grokError);
      
      // Fallback to Gemini
      try {
        console.log("Attempting enhanced analysis with Gemini (gemini-2.5-flash)...");
        return await analyzeUrlWithProvider(url, 'gemini', firstPartyData);
      } catch (geminiError) {
        console.error("Both Grok and Gemini failed:", { grokError, geminiError });
        
        // Handle timeout errors specifically
        if (geminiError instanceof Error && geminiError.message.includes('timeout')) {
          throw new AppError("AI provider request timeout. The analysis is taking longer than expected. Please try again.", 504, 'GATEWAY_TIMEOUT');
        }
        
        // Provide detailed error information
        const grokErrorMsg = grokError instanceof Error ? grokError.message : 'Unknown error';
        const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : 'Unknown error';
        
        console.error("Detailed errors:", {
          grok: grokErrorMsg,
          gemini: geminiErrorMsg
        });
        
        throw new AppError(
          `Both AI providers failed. Grok: ${grokErrorMsg}. Gemini: ${geminiErrorMsg}`, 
          502, 
          'AI_PROVIDER_DOWN'
        );
      }
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("=== REGISTERING MINIMAL ROUTES ===");
  
  // GET /api/healthz - Health check endpoint
  app.get("/api/healthz", healthzHandler);
  
  // GET /api/ai-providers - List available AI providers based on environment
  app.get("/api/ai-providers", async (req, res, next) => {
    try {
      const providers = [];
      
      if (process.env.GEMINI_API_KEY) {
        providers.push({
          id: 'gemini',
          provider: 'gemini',
          apiKey: '***',
          isActive: true,
          userId: req.userId
        });
      }
      
      if (process.env.OPENAI_API_KEY) {
        providers.push({
          id: 'openai',
          provider: 'openai',
          apiKey: '***',
          isActive: !process.env.GEMINI_API_KEY,
          userId: req.userId
        });
      }
      
      if (process.env.GROK_API_KEY) {
        providers.push({
          id: 'grok',
          provider: 'grok',
          apiKey: '***',
          isActive: !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY,
          userId: req.userId
        });
      }
      
      res.json(providers);
    } catch (error) {
      console.error("Failed to fetch AI providers:", error);
      next(new AppError("Failed to fetch AI providers", 500, 'INTERNAL'));
    }
  });
  
  // GET /api/ai-providers/active - Get the active AI provider
  app.get("/api/ai-providers/active", async (req, res, next) => {
    try {
      // Temporarily default to Grok while debugging Gemini issues
      if (process.env.GROK_API_KEY) {
        res.json({
          id: 'grok',
          provider: 'grok',
          apiKey: '***',
          isActive: true,
          userId: req.userId
        });
      } else if (process.env.GEMINI_API_KEY) {
        res.json({
          id: 'gemini',
          provider: 'gemini',
          apiKey: '***',
          isActive: true,
          userId: req.userId
        });
      } else if (process.env.OPENAI_API_KEY) {
        res.json({
          id: 'openai',
          provider: 'openai',
          apiKey: '***',
          isActive: true,
          userId: req.userId
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Failed to fetch active AI provider:", error);
      next(new AppError("Failed to fetch active AI provider", 500, 'INTERNAL'));
    }
  });
  
  // POST /api/ai-providers - Save AI provider configuration (no-op for env-based config)
  app.post("/api/ai-providers", async (req, res, next) => {
    try {
      // Since we're using environment variables, this is a no-op
      // Just return success to keep the UI happy
      res.json({
        id: req.body.provider,
        provider: req.body.provider,
        apiKey: '***',
        isActive: true,
        userId: req.userId
      });
    } catch (error) {
      console.error("Failed to save AI provider:", error);
      next(new AppError("Failed to save AI provider", 500, 'INTERNAL'));
    }
  });
  
  // PATCH /api/ai-providers/:id - Update AI provider (no-op for env-based config)
  app.patch("/api/ai-providers/:id", async (req, res, next) => {
    try {
      // Since we're using environment variables, this is a no-op
      // Just return success to keep the UI happy
      res.json({
        id: req.params.id,
        provider: req.params.id,
        apiKey: '***',
        isActive: true,
        userId: req.userId
      });
    } catch (error) {
      console.error("Failed to update AI provider:", error);
      next(new AppError("Failed to update AI provider", 500, 'INTERNAL'));
    }
  });
  
  // POST /api/ai-providers/test - Test AI provider connection
  app.post("/api/ai-providers/test", async (req, res, next) => {
    try {
      const { provider, apiKey } = req.body;
      
      // Use the environment API key if no key is provided
      const keyToTest = apiKey || (
        provider === 'gemini' ? process.env.GEMINI_API_KEY :
        provider === 'openai' ? process.env.OPENAI_API_KEY :
        process.env.GROK_API_KEY
      );
      
      if (!keyToTest) {
        res.json({ success: false });
        return;
      }
      
      const aiService = new AIProviderService(keyToTest, provider as AIProvider, 10000);
      const isConnected = await aiService.testConnection();
      
      res.json({ success: isConnected });
    } catch (error) {
      console.error("Failed to test AI provider connection:", error);
      res.json({ success: false });
    }
  });
  
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
      // Enhanced input validation
      let validatedInput: { url: string; goal?: string };
      try {
        validatedInput = ValidationService.validateAnalysisRequest(req.body);
      } catch (validationError) {
        console.log("Analysis request validation failed:", validationError);
        throw AppError.validation(
          validationError instanceof Error ? validationError.message : 'Invalid request data',
          validationError instanceof Error ? validationError.message : 'Invalid request data'
        );
      }

      const { url } = validatedInput;

      // Check for at least one AI provider API key
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError(
          "At least one AI provider API key is required", 
          500, 
          'CONFIG_MISSING',
          'AI service is not configured. Please contact support.',
          undefined,
          { missingKeys: ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'GROK_API_KEY'] }
        );
      }

      // Performance optimization: Parallel first-party data extraction
      let firstPartyData: FirstPartyData | null = null;
      const firstPartyPromise = (async () => {
        try {
          console.log("Attempting to fetch first-party data from:", url);
          
          // Performance optimization: Use faster extraction with reduced timeout
          const extractionResult = await fetchFirstPartyWithRetry(url, {
            timeoutMs: 8000, // Reduced from 10s to 8s for better performance
            validateFirst: false,
            retryCount: 0, // No retries for better performance
            retryDelayMs: 0
          });

          if (extractionResult.success && extractionResult.data) {
            firstPartyData = extractionResult.data;
            console.log("Successfully extracted first-party data:", {
              title: firstPartyData.title,
              hasDescription: !!firstPartyData.description,
              hasH1: !!firstPartyData.h1,
              textSnippetLength: firstPartyData.textSnippet.length,
              elapsedMs: extractionResult.metadata.elapsedMs,
              attempts: extractionResult.metadata.attempts
            });
            return firstPartyData;
          } else {
            console.log("First-party data extraction failed:", {
              error: extractionResult.error,
              metadata: extractionResult.metadata
            });
            
            // Log specific error types for monitoring
            if (extractionResult.error?.type === 'TIMEOUT') {
              console.warn(`First-party extraction timeout for ${url}: ${extractionResult.error.message}`);
            } else if (extractionResult.error?.type === 'NETWORK') {
              console.warn(`First-party extraction network error for ${url}: ${extractionResult.error.message}`);
            }
            return null;
          }
        } catch (firstPartyError) {
          console.warn("First-party data extraction failed with exception:", firstPartyError);
          return null;
        }
      })();

      // Performance optimization: Don't wait for first-party data if it takes too long
      const firstPartyTimeout = new Promise<null>((resolve) => {
        setTimeout(() => {
          console.log("First-party extraction taking too long, proceeding without it");
          resolve(null);
        }, 6000); // 6 second timeout for first-party data
      });

      firstPartyData = await Promise.race([firstPartyPromise, firstPartyTimeout]);

      // Perform AI analysis with multi-provider support, including first-party context
      const analysisResult = await analyzeUrlWithAI(url, firstPartyData || undefined);

      // Save analysis to storage with structured data and first-party data
      try {
        const analysisInput: CreateAnalysisInput = {
          url,
          summary: analysisResult.content,
          model: analysisResult.model,
        };
        
        if (analysisResult.structured) {
          analysisInput.structured = analysisResult.structured;
        }
        
        if (firstPartyData) {
          analysisInput.firstPartyData = firstPartyData;
        }
        
        const analysis = await minimalStorage.createAnalysis(req.userId, analysisInput);

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
      // Enhanced input validation
      let validatedId: string;
      let validatedInput: { goal?: string };
      
      try {
        if (!req.params.id) {
          throw new Error("Analysis ID is required");
        }
        validatedId = ValidationService.validateAnalysisId(req.params.id);
        validatedInput = ValidationService.validateImprovementRequest(req.body);
      } catch (validationError) {
        console.log("Improvement request validation failed:", validationError);
        throw AppError.validation(
          validationError instanceof Error ? validationError.message : 'Invalid request data',
          validationError instanceof Error ? validationError.message : 'Invalid request data'
        );
      }

      const { goal } = validatedInput;

      // Retrieve the analysis record first (before checking API keys)
      const analysis = await minimalStorage.getAnalysis(req.userId, validatedId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found", 
          404, 
          'NOT_FOUND',
          'The requested analysis could not be found. It may have been deleted or you may not have permission to access it.'
        );
      }

      // Validate that the analysis has structured data
      if (!analysis.structured) {
        throw new AppError(
          "Analysis does not have structured data required for improvement generation", 
          400, 
          'BAD_REQUEST',
          'This analysis does not contain the structured data needed to generate improvements. Please run a new analysis.'
        );
      }

      // Check for at least one AI provider API key (after validating request)
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError(
          "At least one AI provider API key is required", 
          500, 
          'CONFIG_MISSING',
          'AI service is not configured. Please contact support.',
          undefined,
          { missingKeys: ['GEMINI_API_KEY', 'OPENAI_API_KEY', 'GROK_API_KEY'] }
        );
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

      // Generate business improvement suggestions with comprehensive error handling
      let improvement: BusinessImprovement;
      try {
        improvement = await improvementService.generateImprovement(
          enhancedAnalysis,
          goal ?? undefined
        );
      } catch (improvementError) {
        console.error("Business improvement generation failed:", improvementError);
        
        // Handle specific error types with user-friendly messages
        if (improvementError instanceof Error) {
          if (improvementError.message.includes('timeout')) {
            throw AppError.timeout(
              improvementError.message,
              'Business improvement generation timed out. Please try again.',
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes('validation')) {
            throw AppError.validation(
              improvementError.message,
              'The generated improvement data is invalid. Please try again.',
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes('AI generation')) {
            throw AppError.aiProvider(
              improvementError.message,
              'AI service failed to generate improvements. Please try again.',
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes('network') || improvementError.message.includes('fetch')) {
            throw AppError.aiProvider(
              improvementError.message,
              'Network error while generating improvements. Please check your connection and try again.',
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes('rate limit')) {
            throw new AppError(
              improvementError.message,
              429,
              'RATE_LIMITED',
              'AI service rate limit exceeded. Please wait a few minutes before trying again.',
              undefined,
              { analysisId: validatedId, goal },
              true
            );
          }
        }
        
        throw AppError.improvementGeneration(
          improvementError instanceof Error ? improvementError.message : 'Unknown error',
          'Failed to generate business improvements. Please try again.',
          { analysisId: validatedId, goal }
        );
      }

      // Store the improvement data in the analysis record with error handling
      try {
        const updatedAnalysis = await minimalStorage.updateAnalysisImprovements(req.userId, validatedId, improvement);
        
        if (!updatedAnalysis) {
          console.warn("Failed to store improvement data for analysis:", validatedId);
          // Still return the improvement even if storage fails
        }
      } catch (storageError) {
        console.error("Storage error while saving improvements:", storageError);
        // Continue and return the improvement even if storage fails
      }

      // Return the improvement suggestions
      res.json({
        analysisId: validatedId,
        improvement,
        generatedAt: improvement.generatedAt
      });

    } catch (error) {
      console.error("Business improvement generation failed:", error);
      next(error);
    }
  });

  // POST /api/business-analyses/:id/stages/:stageNumber - Unified stage generation endpoint
  // Requirements: 8.1, 8.2, 8.3, 8.4
  app.post("/api/business-analyses/:id/stages/:stageNumber", rateLimit, async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/stages/:stageNumber hit", { 
      id: req.params.id, 
      stageNumber: req.params.stageNumber,
      regenerate: req.body.regenerate 
    });
    
    try {
      const analysisId = req.params.id;
      const stageNumber = parseInt(req.params.stageNumber || '0', 10);
      const regenerate = req.body.regenerate === true;

      // Validate stage number (2-6, stage 1 is auto-completed)
      if (isNaN(stageNumber) || stageNumber < 2 || stageNumber > 6) {
        throw new AppError(
          "Invalid stage number. Must be between 2 and 6.", 
          400, 
          'BAD_REQUEST',
          'Stage number must be between 2 and 6. Stage 1 is auto-completed after analysis.'
        );
      }

      // Validate analysis ID
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, 'BAD_REQUEST');
      }

      // Get the analysis
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found", 
          404, 
          'NOT_FOUND',
          'The requested analysis could not be found. It may have been deleted or you may not have permission to access it.'
        );
      }

      // Validate that analysis has required data
      if (!analysis.structured) {
        throw new AppError(
          "Analysis does not have structured data required for stage generation", 
          400, 
          'BAD_REQUEST',
          'This analysis does not contain the structured data needed to generate stages.'
        );
      }

      // Import WorkflowService
      const { WorkflowService } = await import('./services/workflow');
      const workflowService = new WorkflowService(minimalStorage);

      // Validate stage progression (unless regenerating)
      if (!regenerate) {
        const progressionCheck = await workflowService.validateStageProgression(
          req.userId,
          analysisId,
          stageNumber
        );

        if (!progressionCheck.valid) {
          throw new AppError(
            progressionCheck.reason || 'Cannot progress to this stage',
            400,
            'BAD_REQUEST',
            progressionCheck.reason || 'You must complete previous stages first.'
          );
        }
      }

      // Check for at least one AI provider API key
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError(
          "At least one AI provider API key is required", 
          500, 
          'CONFIG_MISSING',
          'AI service is not configured. Please contact support.'
        );
      }

      // Create AI provider service
      let aiProvider: AIProviderService;
      if (process.env.GROK_API_KEY) {
        aiProvider = new AIProviderService(process.env.GROK_API_KEY, 'grok', 30000);
      } else if (process.env.GEMINI_API_KEY) {
        aiProvider = new AIProviderService(process.env.GEMINI_API_KEY, 'gemini', 30000);
      } else if (process.env.OPENAI_API_KEY) {
        aiProvider = new AIProviderService(process.env.OPENAI_API_KEY, 'openai', 30000);
      } else {
        throw new AppError("No AI provider API key available", 500, 'CONFIG_MISSING');
      }

      // Get stage-specific prompt and schema
      let prompt: string;
      let systemPrompt: string;
      let schema: any;
      let zodSchema: any;
      let stageName: string;

      // Import all stage schemas
      const { 
        stage2ContentSchema, 
        stage3ContentSchema, 
        stage4ContentSchema, 
        stage5ContentSchema, 
        stage6ContentSchema 
      } = await import('@shared/schema');

      // Route to appropriate stage generator
      switch (stageNumber) {
        case 2:
          ({ prompt, systemPrompt } = workflowService.getStage2Prompt(analysis));
          zodSchema = stage2ContentSchema;
          stageName = 'Lazy-Entrepreneur Filter';
          schema = {
            type: "object",
            properties: {
              effortScore: { type: "number", minimum: 1, maximum: 10 },
              rewardScore: { type: "number", minimum: 1, maximum: 10 },
              recommendation: { type: "string", enum: ["go", "no-go", "maybe"] },
              reasoning: { type: "string" },
              automationPotential: {
                type: "object",
                properties: {
                  score: { type: "number", minimum: 0, maximum: 1 },
                  opportunities: { type: "array", items: { type: "string" } }
                },
                required: ["score", "opportunities"]
              },
              resourceRequirements: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  money: { type: "string" },
                  skills: { type: "array", items: { type: "string" } }
                },
                required: ["time", "money", "skills"]
              },
              nextSteps: { type: "array", items: { type: "string" } }
            },
            required: ["effortScore", "rewardScore", "recommendation", "reasoning", "automationPotential", "resourceRequirements", "nextSteps"]
          };
          break;

        case 3:
          ({ prompt, systemPrompt } = workflowService.getStage3Prompt(analysis));
          zodSchema = stage3ContentSchema;
          stageName = 'MVP Launch Planning';
          schema = {
            type: "object",
            properties: {
              coreFeatures: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              niceToHaves: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              techStack: {
                type: "object",
                properties: {
                  frontend: { type: "array", items: { type: "string" }, minItems: 1 },
                  backend: { type: "array", items: { type: "string" }, minItems: 1 },
                  infrastructure: { type: "array", items: { type: "string" }, minItems: 1 }
                },
                required: ["frontend", "backend", "infrastructure"]
              },
              timeline: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    duration: { type: "string" },
                    deliverables: { type: "array", items: { type: "string" }, minItems: 3 }
                  },
                  required: ["phase", "duration", "deliverables"]
                },
                minItems: 3,
                maxItems: 4
              },
              estimatedCost: { type: "string" }
            },
            required: ["coreFeatures", "niceToHaves", "techStack", "timeline", "estimatedCost"]
          };
          break;

        case 4:
          ({ prompt, systemPrompt } = workflowService.getStage4Prompt(analysis));
          zodSchema = stage4ContentSchema;
          stageName = 'Demand Testing Strategy';
          schema = {
            type: "object",
            properties: {
              testingMethods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    method: { type: "string" },
                    description: { type: "string" },
                    cost: { type: "string" },
                    timeline: { type: "string" }
                  },
                  required: ["method", "description", "cost", "timeline"]
                },
                minItems: 3,
                maxItems: 5
              },
              successMetrics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    metric: { type: "string" },
                    target: { type: "string" },
                    measurement: { type: "string" }
                  },
                  required: ["metric", "target", "measurement"]
                },
                minItems: 3,
                maxItems: 5
              },
              budget: {
                type: "object",
                properties: {
                  total: { type: "string" },
                  breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        cost: { type: "string" }
                      },
                      required: ["item", "cost"]
                    }
                  }
                },
                required: ["total", "breakdown"]
              },
              timeline: { type: "string" }
            },
            required: ["testingMethods", "successMetrics", "budget", "timeline"]
          };
          break;

        case 5:
          ({ prompt, systemPrompt } = workflowService.getStage5Prompt(analysis));
          zodSchema = stage5ContentSchema;
          stageName = 'Scaling & Growth';
          schema = {
            type: "object",
            properties: {
              growthChannels: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    channel: { type: "string" },
                    strategy: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] }
                  },
                  required: ["channel", "strategy", "priority"]
                },
                minItems: 3,
                maxItems: 5
              },
              milestones: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    milestone: { type: "string" },
                    timeline: { type: "string" },
                    metrics: { type: "array", items: { type: "string" }, minItems: 3 }
                  },
                  required: ["milestone", "timeline", "metrics"]
                },
                minItems: 3,
                maxItems: 4
              },
              resourceScaling: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    team: { type: "array", items: { type: "string" } },
                    infrastructure: { type: "string" }
                  },
                  required: ["phase", "team", "infrastructure"]
                },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ["growthChannels", "milestones", "resourceScaling"]
          };
          break;

        case 6:
          ({ prompt, systemPrompt } = workflowService.getStage6Prompt(analysis));
          zodSchema = stage6ContentSchema;
          stageName = 'AI Automation Mapping';
          schema = {
            type: "object",
            properties: {
              automationOpportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    process: { type: "string" },
                    tool: { type: "string" },
                    roi: { type: "string" },
                    priority: { type: "number", minimum: 1, maximum: 10 }
                  },
                  required: ["process", "tool", "roi", "priority"]
                },
                minItems: 4,
                maxItems: 6
              },
              implementationPlan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    automations: { type: "array", items: { type: "string" }, minItems: 3 },
                    timeline: { type: "string" }
                  },
                  required: ["phase", "automations", "timeline"]
                },
                minItems: 3,
                maxItems: 3
              },
              estimatedSavings: { type: "string" }
            },
            required: ["automationOpportunities", "implementationPlan", "estimatedSavings"]
          };
          break;

        default:
          throw new AppError("Invalid stage number", 400, 'BAD_REQUEST');
      }

      // Generate stage content with retry logic (Requirements: 9.1, 9.2, 9.3, 9.4)
      const { retryWithBackoff, generateErrorGuidance, createPartialResultHandler } = await import('./lib/retry');
      
      // Create partial result handler for saving progress
      const partialHandler = createPartialResultHandler<any>(`stage-${analysisId}-${stageNumber}`);
      
      let stageContent: any;
      console.log(`Generating Stage ${stageNumber} content with retry logic...`);
      
      const retryResult = await retryWithBackoff(
        async () => {
          const content = await aiProvider.generateStructuredContent(prompt, schema, systemPrompt);
          
          // Save partial result in case of later failure
          await partialHandler.save(content);
          
          return content;
        },
        {
          maxAttempts: 3,
          delayMs: 2000,
          backoffMultiplier: 2,
          maxDelayMs: 10000,
          onRetry: (error, attempt) => {
            console.log(`Retry attempt ${attempt} for Stage ${stageNumber} after error:`, error.message);
          },
        }
      );

      if (!retryResult.success) {
        console.error(`AI generation failed for Stage ${stageNumber} after ${retryResult.attempts} attempts:`, retryResult.error);
        
        // Generate user-friendly error guidance
        const guidance = generateErrorGuidance(
          retryResult.error!,
          `generating ${stageName}`
        );
        
        // Try to load partial result if available
        const partialResult = await partialHandler.load();
        if (partialResult && Object.keys(partialResult).length > 0) {
          console.log(`Partial result available for Stage ${stageNumber}, but incomplete`);
        }
        
        // Determine appropriate error code
        let statusCode = 502;
        let errorCode = 'AI_PROVIDER_DOWN';
        
        if (guidance.error.message.includes('timeout')) {
          statusCode = 504;
          errorCode = 'GATEWAY_TIMEOUT';
        } else if (guidance.error.message.includes('rate limit') || guidance.error.message.includes('quota')) {
          statusCode = 429;
          errorCode = 'RATE_LIMITED';
        }
        
        throw new AppError(
          `Failed to generate Stage ${stageNumber} content after ${retryResult.attempts} attempts`,
          statusCode,
          errorCode,
          guidance.userMessage,
          undefined,
          {
            stageNumber,
            analysisId,
            attempts: retryResult.attempts,
            totalTimeMs: retryResult.totalTimeMs,
            nextSteps: guidance.nextSteps,
            retryable: guidance.retryable,
            estimatedWaitTime: guidance.estimatedWaitTime,
            error: guidance.error.message,
          },
          guidance.retryable
        );
      }

      stageContent = retryResult.data;
      console.log(`Stage ${stageNumber} content generated successfully after ${retryResult.attempts} attempt(s) in ${retryResult.totalTimeMs}ms`);
      
      // Clear partial result on success
      await partialHandler.clear();

      // Validate stage content with Zod
      try {
        stageContent = zodSchema.parse(stageContent);
        console.log(`Stage ${stageNumber} content validated successfully`);
      } catch (validationError) {
        console.error(`Stage ${stageNumber} content validation failed:`, validationError);
        throw new AppError(
          `Generated Stage ${stageNumber} content is invalid`,
          502,
          'AI_VALIDATION_ERROR',
          'The AI generated invalid data. Please try again.',
          undefined,
          { stageNumber, analysisId, validationError: validationError instanceof Error ? validationError.message : 'Unknown' }
        );
      }

      // Additional validation and quality checks (Requirements: 10.1, 10.2, 10.3, 10.4)
      const { ValidationService } = await import('./services/validation');
      const validationService = new ValidationService();
      
      const businessContext = {
        url: analysis.url,
        ...(analysis.businessModel && { businessModel: analysis.businessModel })
      };
      
      const validationResult = validationService.validateStageContent(
        stageNumber,
        stageContent,
        businessContext
      );

      // Log validation results
      console.log(`Stage ${stageNumber} validation score: ${(validationResult.overallScore * 100).toFixed(1)}%`);
      
      if (validationResult.structureValidation.warnings.length > 0) {
        console.warn(`Stage ${stageNumber} structure warnings:`, validationResult.structureValidation.warnings);
      }
      
      if (validationResult.specificityValidation.warnings.length > 0) {
        console.warn(`Stage ${stageNumber} specificity warnings:`, validationResult.specificityValidation.warnings);
      }
      
      if (!validationResult.actionableCheck.passed) {
        console.warn(`Stage ${stageNumber} actionable check issues:`, validationResult.actionableCheck.issues);
      }
      
      if (!validationResult.placeholderCheck.passed) {
        console.warn(`Stage ${stageNumber} placeholder check issues:`, validationResult.placeholderCheck.issues);
      }
      
      if (!validationResult.estimatesCheck.passed) {
        console.warn(`Stage ${stageNumber} estimates check issues:`, validationResult.estimatesCheck.issues);
      }

      // If validation fails critically, throw error
      if (!validationResult.valid) {
        const allErrors = [
          ...validationResult.structureValidation.errors,
          ...validationResult.fieldsValidation.errors,
          ...validationResult.specificityValidation.errors
        ];
        
        console.error(`Stage ${stageNumber} quality validation failed:`, allErrors);
        throw new AppError(
          `Generated Stage ${stageNumber} content failed quality checks`,
          502,
          'AI_QUALITY_ERROR',
          'The AI generated content that did not meet quality standards. Please try again.',
          undefined,
          { 
            stageNumber, 
            analysisId, 
            validationScore: validationResult.overallScore,
            errors: allErrors.slice(0, 3) // Include first 3 errors
          }
        );
      }

      // Create stage data object
      const stageData = workflowService.createStageData(stageNumber, stageContent, 'completed');

      // Save stage data to analysis
      const updatedAnalysis = await minimalStorage.updateAnalysisStageData(
        req.userId,
        analysisId,
        stageNumber,
        stageData
      );

      if (!updatedAnalysis) {
        throw new AppError(
          "Failed to save stage data", 
          500, 
          'INTERNAL',
          'Could not save the generated stage data. Please try again.'
        );
      }

      // Determine next stage
      const nextStage = stageNumber < 6 ? stageNumber + 1 : null;

      // Return the stage data
      res.json({
        stageNumber,
        stageName,
        content: stageContent,
        generatedAt: stageData.generatedAt,
        nextStage
      });

    } catch (error) {
      console.error(`Stage ${req.params.stageNumber || 'unknown'} generation failed:`, error);
      next(error);
    }
  });

  // GET /api/business-analyses/:id/stages - Get all stage data for an analysis
  // Requirement: 8.2
  app.get("/api/business-analyses/:id/stages", async (req, res, next) => {
    console.log("GET /api/business-analyses/:id/stages hit", { id: req.params.id });
    
    try {
      const analysisId = req.params.id;

      // Validate analysis ID
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, 'BAD_REQUEST');
      }

      // Get the analysis
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found", 
          404, 
          'NOT_FOUND',
          'The requested analysis could not be found. It may have been deleted or you may not have permission to access it.'
        );
      }

      // Import WorkflowService
      const { WorkflowService } = await import('./services/workflow');
      const workflowService = new WorkflowService(minimalStorage);

      // Get stages from analysis (includes auto-completed Stage 1)
      const stages = analysis.stages || {};
      
      // Get progress summary
      const progressSummary = workflowService.getProgressSummary(stages);

      // Return all stage data with completion status
      res.json({
        analysisId,
        currentStage: progressSummary.currentStage,
        completedStages: progressSummary.completedStages,
        totalStages: progressSummary.totalStages,
        isComplete: progressSummary.isComplete,
        nextStage: progressSummary.nextStage,
        stages
      });

    } catch (error) {
      console.error("Failed to fetch stages:", error);
      next(error);
    }
  });

  // Old individual stage endpoints removed - now using unified endpoint above

  const httpServer = createServer(app);
  return httpServer;
}
