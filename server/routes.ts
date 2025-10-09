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
import { ExportService } from "./services/export-service";
import { TechDetectionService, type TechDetectionResult } from "./services/tech-detection.js";
import { ComplexityCalculator } from "./services/complexity-calculator.js";
import { PerformanceMonitor } from "./services/performance-monitor.js";

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Store user provider preferences in memory
const userProviderPreferences = new Map<string, AIProvider>();

// Helper function to get the active AI provider based on user preference or environment variables
// Priority: User preference > Gemini > Grok > OpenAI
function getActiveAIProvider(userId?: string): { provider: AIProvider; apiKey: string } | null {
  // Check user preference first
  if (userId && userProviderPreferences.has(userId)) {
    const preferredProvider = userProviderPreferences.get(userId)!;
    const apiKey = getApiKeyForProvider(preferredProvider);
    if (apiKey) {
      return { provider: preferredProvider, apiKey };
    }
  }
  
  // Fall back to environment variable priority
  if (process.env.GEMINI_API_KEY) {
    return { provider: 'gemini', apiKey: process.env.GEMINI_API_KEY };
  } else if (process.env.GROK_API_KEY) {
    return { provider: 'grok', apiKey: process.env.GROK_API_KEY };
  } else if (process.env.OPENAI_API_KEY) {
    return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
  }
  return null;
}

// Helper function to get API key for a specific provider
function getApiKeyForProvider(provider: AIProvider): string | null {
  switch (provider) {
    case 'gemini':
      return process.env.GEMINI_API_KEY || null;
    case 'grok':
      return process.env.GROK_API_KEY || null;
    case 'openai':
      return process.env.OPENAI_API_KEY || null;
    case 'gpt5':
      return process.env.GPT5_API_KEY || null;
    default:
      return null;
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

  // Increase timeout to 120 seconds for complex analysis with Pro models
  const aiService = new AIProviderService(apiKey, provider, 120000);

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
    
    const modelName = provider === 'gemini' ? 'gemini:gemini-2.5-pro' :
                     provider === 'openai' ? 'openai:gpt-4o' :
                     'grok:grok-4-fast-reasoning';
    
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

/**
 * Merges AI analysis results with tech detection results
 * Requirements: 1.5, 2.3, 3.5, 5.6
 * 
 * Combines AI-inferred tech stack with Wappalyzer-detected technologies
 * Calculates complexity score based on detected technologies
 * Preserves both results for comparison and validation
 */
function mergeAnalysisResults(
  aiAnalysis: StructuredAnalysis | EnhancedStructuredAnalysis,
  techDetection: TechDetectionResult | null
): StructuredAnalysis | EnhancedStructuredAnalysis {
  // If no tech detection, return AI analysis as-is
  if (!techDetection || !techDetection.success) {
    console.log("No tech detection results to merge, returning AI-only analysis");
    return aiAnalysis;
  }

  console.log("Merging AI analysis with tech detection results...");
  
  // Calculate complexity score
  const complexityCalculator = new ComplexityCalculator();
  const complexityResult = complexityCalculator.calculateComplexity(techDetection.technologies);
  
  // Extract tech names from detected technologies
  const detectedTechNames = techDetection.technologies.map(t => t.name);
  
  // Combine AI-inferred and detected tech stacks (remove duplicates)
  const aiTechStack = aiAnalysis.technical?.techStack || [];
  const mergedTechStack = Array.from(new Set([...aiTechStack, ...detectedTechNames]));
  
  // Create enhanced technical section
  const enhancedTechnical = {
    ...(aiAnalysis.technical || {}),
    // Preserve AI-inferred tech stack
    techStack: aiTechStack,
    // Add Wappalyzer detection results
    actualDetected: {
      technologies: techDetection.technologies,
      contentType: techDetection.contentType,
      detectedAt: techDetection.detectedAt,
    },
    // Add complexity analysis
    complexityScore: complexityResult.score,
    complexityFactors: complexityResult.factors,
    // Add merged tech stack
    detectedTechStack: mergedTechStack,
  };
  
  console.log("Merge complete:", {
    aiTechCount: aiTechStack.length,
    detectedTechCount: detectedTechNames.length,
    mergedTechCount: mergedTechStack.length,
    complexityScore: complexityResult.score,
  });
  
  // Return merged analysis
  return {
    ...aiAnalysis,
    technical: enhancedTechnical,
  };
}

// Multi-provider analysis with enhanced evidence-based prompts and concurrency management
// Now includes parallel tech detection for improved accuracy
async function analyzeUrlWithAI(url: string, firstPartyData?: FirstPartyData): Promise<{ content: string; model: string; structured?: StructuredAnalysis | EnhancedStructuredAnalysis; techDetection?: TechDetectionResult | null }> {
  const analysisKey = `${url}-${firstPartyData ? 'with-fp' : 'no-fp'}`;
  
  return manageConcurrentAnalysis(analysisKey, async () => {
    const startTime = Date.now();
    
    // Check if tech detection is enabled via feature flag
    const techDetectionEnabled = process.env.ENABLE_TECH_DETECTION !== 'false'; // Enabled by default
    
    // Run AI analysis and tech detection in parallel using Promise.allSettled
    // This ensures one failure doesn't block the other
    const [aiResult, techResult] = await Promise.allSettled([
      // AI Analysis
      (async () => {
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
      })(),
      
      // Tech Detection (only if enabled)
      techDetectionEnabled ? (async () => {
        try {
          console.log("Starting parallel tech detection...");
          const techService = new TechDetectionService();
          const detection = await techService.detectTechnologies(url);
          console.log("Tech detection completed:", detection ? `${detection.technologies.length} technologies detected` : 'failed');
          return detection;
        } catch (techError) {
          console.warn("Tech detection failed with exception:", techError);
          return null;
        }
      })() : Promise.resolve(null)
    ]);
    
    const totalTime = Date.now() - startTime;
    console.log(`Parallel analysis completed in ${totalTime}ms`);
    
    // Handle AI analysis result
    if (aiResult.status === 'rejected') {
      console.error("AI analysis failed:", aiResult.reason);
      throw aiResult.reason;
    }
    
    const aiAnalysis = aiResult.value;
    
    // Handle tech detection result (graceful fallback)
    const performanceMonitor = PerformanceMonitor.getInstance();
    let techDetection: TechDetectionResult | null = null;
    
    if (techResult.status === 'fulfilled') {
      techDetection = techResult.value;
      if (techDetection) {
        console.log("Tech detection succeeded, will merge with AI analysis");
      } else {
        console.warn("Tech detection returned null, using AI-only analysis");
        // Record fallback to AI-only analysis
        performanceMonitor.recordDetection(totalTime, false, 0, true);
      }
    } else {
      console.warn("Tech detection failed:", techResult.reason);
      // Record fallback to AI-only analysis
      performanceMonitor.recordDetection(totalTime, false, 0, true);
    }
    
    // Return combined result
    return {
      ...aiAnalysis,
      techDetection: techDetection
    };
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("=== REGISTERING MINIMAL ROUTES ===");
  
  // GET /api/healthz - Health check endpoint
  app.get("/api/healthz", healthzHandler);
  
  // GET /api/tech-detection/stats - Get tech detection performance statistics
  app.get("/api/tech-detection/stats", async (req, res) => {
    try {
      const performanceMonitor = PerformanceMonitor.getInstance();
      const stats = performanceMonitor.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching tech detection stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });
  
  // GET /docs/SCORING_METHODOLOGY.md - Serve scoring methodology documentation
  app.get("/docs/SCORING_METHODOLOGY.md", async (req, res, next) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'docs', 'SCORING_METHODOLOGY.md');
      const content = await fs.readFile(filePath, 'utf-8');
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.send(content);
    } catch (error) {
      console.error('Error serving documentation:', error);
      next(new AppError('Documentation not found', 404, 'NOT_FOUND'));
    }
  });
  
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
      
      if (process.env.GPT5_API_KEY) {
        providers.push({
          id: 'gpt5',
          provider: 'gpt5',
          apiKey: '***',
          isActive: !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY,
          userId: req.userId
        });
      }
      
      if (process.env.GROK_API_KEY) {
        providers.push({
          id: 'grok',
          provider: 'grok',
          apiKey: '***',
          isActive: !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GPT5_API_KEY,
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
      const activeProvider = getActiveAIProvider(req.userId);
      
      if (activeProvider) {
        res.json({
          id: activeProvider.provider,
          provider: activeProvider.provider,
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
  
  // POST /api/ai-providers - Save AI provider configuration
  app.post("/api/ai-providers", async (req, res, next) => {
    try {
      console.log('POST /api/ai-providers - Request body:', req.body);
      const { provider } = req.body;
      
      if (!req.userId) {
        console.error('POST /api/ai-providers - No userId');
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      console.log('POST /api/ai-providers - Provider:', provider, 'UserId:', req.userId);
      
      // Validate that the provider has an API key configured
      const apiKey = getApiKeyForProvider(provider);
      console.log('POST /api/ai-providers - API key found:', !!apiKey);
      
      if (!apiKey) {
        console.error(`POST /api/ai-providers - No API key for ${provider}`);
        return res.status(400).json({ error: `${provider} API key not configured in environment` });
      }
      
      // Save user's provider preference
      userProviderPreferences.set(req.userId, provider);
      console.log('POST /api/ai-providers - Saved preference for user:', req.userId);
      
      res.json({
        id: provider,
        provider: provider,
        apiKey: '***',
        isActive: true,
        userId: req.userId
      });
    } catch (error) {
      console.error("Failed to save AI provider:", error);
      next(new AppError("Failed to save AI provider", 500, 'INTERNAL'));
    }
  });
  
  // PATCH /api/ai-providers/:id - Update AI provider
  app.patch("/api/ai-providers/:id", async (req, res, next) => {
    try {
      const provider = req.params.id as AIProvider;
      
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // Validate that the provider has an API key configured
      const apiKey = getApiKeyForProvider(provider);
      if (!apiKey) {
        return res.status(400).json({ error: `${provider} API key not configured in environment` });
      }
      
      // Save user's provider preference
      userProviderPreferences.set(req.userId, provider);
      
      res.json({
        id: provider,
        provider: provider,
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
      // Now includes parallel tech detection
      const analysisResult = await analyzeUrlWithAI(url, firstPartyData || undefined);

      // Merge AI analysis with tech detection results and set detection status flag
      let mergedStructured = analysisResult.structured;
      let detectionStatus: 'success' | 'failed' | 'disabled' = 'disabled';
      
      if (analysisResult.structured && analysisResult.techDetection) {
        console.log("Merging tech detection results with AI analysis...");
        mergedStructured = mergeAnalysisResults(analysisResult.structured, analysisResult.techDetection);
        detectionStatus = 'success';
      } else if (process.env.ENABLE_TECH_DETECTION !== 'false') {
        // Tech detection was enabled but failed
        console.warn("Tech detection was enabled but failed, using AI-only analysis");
        detectionStatus = 'failed';
        
        // Add flag to structured data to indicate detection was attempted but failed
        if (mergedStructured && mergedStructured.technical) {
          mergedStructured = {
            ...mergedStructured,
            technical: {
              ...mergedStructured.technical,
              detectionAttempted: true,
              detectionFailed: true,
            }
          };
        }
      } else {
        console.log("Tech detection disabled via feature flag");
      }

      // Save analysis to storage with structured data and first-party data
      try {
        const analysisInput: CreateAnalysisInput = {
          url,
          summary: analysisResult.content,
          model: analysisResult.model,
        };
        
        if (mergedStructured) {
          analysisInput.structured = mergedStructured;
        }
        
        if (firstPartyData) {
          analysisInput.firstPartyData = firstPartyData;
        }
        
        const analysis = await minimalStorage.createAnalysis(req.userId, analysisInput);

        // Log detection status for monitoring
        console.log(`Analysis created with tech detection status: ${detectionStatus}`);

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
      const activeProvider = getActiveAIProvider(req.userId);
      if (!activeProvider) {
        throw new AppError("No AI provider API key available", 500, 'CONFIG_MISSING');
      }

      const aiProvider = new AIProviderService(activeProvider.apiKey, activeProvider.provider, 120000);

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

  // POST /api/business-analyses/:id/improvements/export - Export business improvement plan
  app.post("/api/business-analyses/:id/improvements/export", rateLimit, async (req, res, next) => {
    try {
      const analysisId = req.params.id;
      const { format } = req.body;
      
      if (!req.userId) {
        throw new AppError("User ID is required", 401, 'UNAUTHORIZED');
      }
      const userId: string = req.userId;

      // Validate format
      if (!['pdf', 'html', 'json'].includes(format)) {
        throw new AppError(
          "Invalid export format",
          400,
          'BAD_REQUEST',
          'Export format must be one of: pdf, html, json'
        );
      }

      // Get the analysis with improvements
      const analysis = await minimalStorage.getAnalysis(userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          'NOT_FOUND',
          'The requested analysis could not be found'
        );
      }

      const improvements = await minimalStorage.getAnalysisImprovements(userId, analysisId);
      if (!improvements) {
        throw new AppError(
          "No improvements found",
          404,
          'NOT_FOUND',
          'No improvement plan found for this analysis. Please generate improvements first.'
        );
      }

      // Create export service
      const exportService = new ExportService(minimalStorage);

      // Generate export based on format
      let exportData: Buffer | string = '';
      let contentType: string = 'application/json';
      let filename: string = 'business-improvement-plan.json';

      switch (format) {
        case 'json':
          exportData = JSON.stringify(improvements, null, 2);
          contentType = 'application/json';
          filename = 'business-improvement-plan.json';
          break;
        case 'html':
          exportData = exportService.generateImprovementHTML(improvements, analysis);
          contentType = 'text/html';
          filename = 'business-improvement-plan.html';
          break;
        case 'pdf':
          exportData = await exportService.generateImprovementPDF(improvements, analysis);
          contentType = 'application/pdf';
          filename = 'business-improvement-plan.pdf';
          break;
      }

      // Set response headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Send the export data
      if (Buffer.isBuffer(exportData)) {
        res.send(exportData);
      } else {
        res.send(exportData);
      }

    } catch (error) {
      console.error("Improvement export failed:", error);
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

      // Validate stage progression
      // Pass regenerate flag to allow viewing/regenerating completed stages
      const progressionCheck = await workflowService.validateStageProgression(
        req.userId,
        analysisId,
        stageNumber,
        regenerate
      );

      if (!progressionCheck.valid) {
        throw new AppError(
          progressionCheck.reason || 'Cannot progress to this stage',
          400,
          'BAD_REQUEST',
          progressionCheck.reason || 'You must complete previous stages first.'
        );
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
      const activeProvider = getActiveAIProvider(req.userId);
      if (!activeProvider) {
        throw new AppError("No AI provider API key available", 500, 'CONFIG_MISSING');
      }

      // Use 120 second timeout for all stages with Pro models
      const timeout = 120000;
      const aiProvider = new AIProviderService(activeProvider.apiKey, activeProvider.provider, timeout);

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

  // POST /api/business-analyses/:id/stages/:stageNumber/export - Export individual stage
  // Requirements: 6.3, 6.4, 6.5, 6.6, 6.7
  app.post("/api/business-analyses/:id/stages/:stageNumber/export", async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/stages/:stageNumber/export hit", {
      id: req.params.id,
      stageNumber: req.params.stageNumber,
      format: req.body.format
    });

    try {
      const analysisId = req.params.id;
      const stageNumber = parseInt(req.params.stageNumber, 10);
      const format = req.body.format || 'json'; // Default to JSON

      // Validate analysis ID
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, 'BAD_REQUEST');
      }

      // Validate stage number
      if (isNaN(stageNumber) || stageNumber < 1 || stageNumber > 6) {
        throw new AppError(
          "Invalid stage number. Must be between 1 and 6.",
          400,
          'BAD_REQUEST'
        );
      }

      // Validate format
      if (!['html', 'json', 'pdf'].includes(format)) {
        throw new AppError(
          "Invalid export format. Must be 'html', 'json', or 'pdf'.",
          400,
          'BAD_REQUEST'
        );
      }

      // Get the analysis to verify it exists
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          'NOT_FOUND',
          'The requested analysis could not be found.'
        );
      }

      // Create export service
      const exportService = new ExportService(minimalStorage);

      // Generate export based on format
      const result = await exportService.exportStage(
        req.userId || '',
        analysisId,
        stageNumber,
        format as 'html' | 'json' | 'pdf'
      );

      // Set appropriate headers based on format
      const businessName = analysis.businessModel || 'Business';
      const stageName = exportService['getStageName'](stageNumber).replace(/[^a-z0-9]/gi, '-');
      const filename = `${businessName.replace(/[^a-z0-9]/gi, '-')}-Stage-${stageNumber}-${stageName}.${format}`;

      switch (format) {
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          break;
        case 'html':
          res.setHeader('Content-Type', 'text/html');
          break;
        case 'json':
          res.setHeader('Content-Type', 'application/json');
          break;
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          break;
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(result);
    } catch (error) {
      console.error("Stage export failed:", error);
      next(error);
    }
  });

  // POST /api/business-analyses/:id/export-stage1-csv - Export Stage 1 as CSV
  // Requirements: 8.1, 8.5
  app.post("/api/business-analyses/:id/export-stage1-csv", async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/export-stage1-csv hit", { 
      id: req.params.id
    });
    
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
          'The requested analysis could not be found.'
        );
      }

      // Import CSV utilities
      const { generateCSV } = await import('./lib/export-utils.js');

      // Prepare data for CSV export
      const csvData = {
        url: analysis.url,
        businessModel: analysis.businessModel || '',
        revenueStream: analysis.revenueStream || '',
        targetMarket: analysis.targetMarket || '',
        overallScore: analysis.overallScore || '',
        scoreDetails: analysis.scoreDetails || {},
        aiInsights: analysis.aiInsights || {},
        structured: analysis.structured || {},
        currentStage: analysis.currentStage,
        createdAt: new Date(analysis.createdAt).toLocaleString(),
      };

      // Generate CSV
      const csvContent = generateCSV(csvData);
      const filename = `analysis-${analysisId.slice(0, 8)}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting Stage 1 CSV:", error);
      next(error);
    }
  });

  // POST /api/business-analyses/:id/export-complete - Export complete business plan
  // Requirements: 2.1, 2.3, 2.4, 2.5
  app.post("/api/business-analyses/:id/export-complete", async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/export-complete hit", { 
      id: req.params.id, 
      format: req.body.format 
    });
    
    try {
      const analysisId = req.params.id;
      const format = req.body.format || 'pdf'; // Default to PDF

      // Validate analysis ID
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, 'BAD_REQUEST');
      }

      // Validate format
      if (!['pdf', 'html', 'json'].includes(format)) {
        throw new AppError(
          "Invalid export format. Must be 'pdf', 'html', or 'json'.", 
          400, 
          'BAD_REQUEST'
        );
      }

      // Get the analysis to verify it exists
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found", 
          404, 
          'NOT_FOUND',
          'The requested analysis could not be found.'
        );
      }

      // Create export service
      const exportService = new ExportService(minimalStorage);

      // Generate export based on format
      if (format === 'pdf') {
        const pdfBuffer = await exportService.exportPDF(req.userId, analysisId);
        const businessName = analysis.businessModel || 'Business-Plan';
        const filename = `${businessName.replace(/[^a-z0-9]/gi, '-')}-Complete-Plan.pdf`;
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
      } else if (format === 'html') {
        const htmlContent = await exportService.exportHTML(req.userId, analysisId);
        const businessName = analysis.businessModel || 'Business-Plan';
        const filename = `${businessName.replace(/[^a-z0-9]/gi, '-')}-Complete-Plan.html`;
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(htmlContent);
      } else if (format === 'json') {
        const jsonContent = await exportService.exportJSON(req.userId, analysisId);
        const businessName = analysis.businessModel || 'Business-Plan';
        const filename = `${businessName.replace(/[^a-z0-9]/gi, '-')}-Complete-Plan.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(jsonContent);
      }
    } catch (error) {
      console.error("Export generation failed:", error);
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
