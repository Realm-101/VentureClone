import type { Express } from "express";
import { createServer, type Server } from "http";
import { minimalStorage } from "./minimal-storage";
import { rateLimit } from "./middleware/rateLimit";
import { fetchWithTimeout } from "./lib/fetchWithTimeout";
import { AppError } from "./middleware/errorHandler";
import { healthzHandler } from "./routes/healthz";

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Google Gemini API integration for business analysis
async function analyzeUrlWithGemini(url: string): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const prompt = `Analyze this business URL and provide a concise business teardown in 100-150 words covering:
1. Value proposition
2. Target audience  
3. Monetization strategy

URL: ${url}

Provide a focused analysis that helps understand the business model and market opportunity.`;

  const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    }),
    timeoutMs: 8000
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppError(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`, 502, 'AI_PROVIDER_DOWN');
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis could not be completed.";
  return { content, model: "gemini:gemini-2.5-flash-preview-05-20" };
}

// OpenAI API integration as fallback
async function analyzeUrlWithOpenAI(url: string): Promise<{ content: string; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const prompt = `Analyze this business URL and provide a concise business teardown in 100-150 words covering:
1. Value proposition
2. Target audience  
3. Monetization strategy

URL: ${url}

Provide a focused analysis that helps understand the business model and market opportunity.`;

  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7,
    }),
    timeoutMs: 8000
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppError(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`, 502, 'AI_PROVIDER_DOWN');
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "Analysis could not be completed.";
  return { content, model: "openai:gpt-4o-mini" };
}

// Multi-provider analysis with Gemini as primary and OpenAI as fallback
async function analyzeUrlWithAI(url: string): Promise<{ content: string; model: string }> {
  // Try Gemini first
  try {
    console.log("Attempting analysis with Gemini...");
    return await analyzeUrlWithGemini(url);
  } catch (geminiError) {
    console.warn("Gemini analysis failed, falling back to OpenAI:", geminiError);
    
    // If Gemini failed due to timeout, don't try OpenAI
    if (geminiError instanceof Error && geminiError.name === 'TimeoutError') {
      throw new AppError("AI provider request timeout", 504, 'GATEWAY_TIMEOUT');
    }
    
    // Fallback to OpenAI
    try {
      console.log("Attempting analysis with OpenAI...");
      return await analyzeUrlWithOpenAI(url);
    } catch (openaiError) {
      console.error("Both Gemini and OpenAI failed:", { geminiError, openaiError });
      
      // Handle timeout errors specifically
      if (openaiError instanceof Error && openaiError.name === 'TimeoutError') {
        throw new AppError("AI provider request timeout", 504, 'GATEWAY_TIMEOUT');
      }
      
      // If both providers failed with non-timeout errors, return 502
      if (geminiError instanceof AppError || openaiError instanceof AppError) {
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
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
        throw new AppError("At least one AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is required", 500, 'CONFIG_MISSING');
      }

      // Perform AI analysis with multi-provider support
      const analysisResult = await analyzeUrlWithAI(url);

      // Save analysis to storage
      try {
        const analysis = await minimalStorage.createAnalysis(req.userId, {
          url,
          summary: analysisResult.content,
          model: analysisResult.model
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