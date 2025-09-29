import type { Express } from "express";
import { createServer, type Server } from "http";
import { minimalStorage } from "./minimal-storage";
import { rateLimit } from "./middleware/rateLimit";
import { fetchWithTimeout } from "./lib/fetchWithTimeout";
import { AppError } from "./middleware/errorHandler";
import { healthzHandler } from "./routes/healthz";
import { structuredAnalysisSchema, type StructuredAnalysis } from "@shared/schema";

// URL validation helper
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Helper function to parse structured analysis with graceful fallback
function parseStructuredAnalysis(content: string): { structured?: StructuredAnalysis; summary: string } {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(content);
    
    // Validate against schema
    const validated = structuredAnalysisSchema.parse(parsed);
    
    // Generate summary from structured data
    const summary = `${validated.overview.valueProposition}\n\nTarget Audience: ${validated.overview.targetAudience}\n\nMonetization: ${validated.overview.monetization}\n\nKey Insights: ${validated.synthesis.keyInsights.join(', ')}`;
    
    return { structured: validated, summary };
  } catch (error) {
    // Graceful fallback to plain text
    console.warn("Failed to parse structured analysis, falling back to plain text:", error);
    return { summary: content };
  }
}

// Google Gemini API integration for business analysis with structured output
async function analyzeUrlWithGemini(url: string): Promise<{ content: string; model: string; structured?: StructuredAnalysis }> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing");
  }

  const structuredPrompt = `Analyze this business URL and provide a structured JSON response with the following format:

{
  "overview": {
    "valueProposition": "Brief description of the core value proposition",
    "targetAudience": "Description of the target audience",
    "monetization": "How the business makes money"
  },
  "market": {
    "competitors": [
      {"name": "Competitor name", "url": "optional URL", "notes": "optional notes"}
    ],
    "swot": {
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "opportunities": ["opportunity 1", "opportunity 2"],
      "threats": ["threat 1", "threat 2"]
    }
  },
  "technical": {
    "techStack": ["technology 1", "technology 2"]
  },
  "data": {
    "keyMetrics": [
      {"name": "metric name", "value": "metric value"}
    ]
  },
  "synthesis": {
    "summary": "Concise 100-150 word business analysis summary",
    "keyInsights": ["insight 1", "insight 2", "insight 3"],
    "nextActions": ["action 1", "action 2", "action 3"]
  }
}

URL: ${url}

Respond ONLY with valid JSON. Do not include any text before or after the JSON.`;

  const response = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: structuredPrompt
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
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
    timeoutMs: 15000  // Enhanced timeout per requirement 2.1
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppError(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`, 502, 'AI_PROVIDER_DOWN');
  }

  const data = await response.json();
  const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis could not be completed.";
  
  // Parse structured analysis with graceful fallback
  const { structured, summary } = parseStructuredAnalysis(rawContent);
  
  return { content: summary, model: "gemini:gemini-2.5-flash-preview-05-20", structured };
}

// OpenAI API integration as fallback with structured output
async function analyzeUrlWithOpenAI(url: string): Promise<{ content: string; model: string; structured?: StructuredAnalysis }> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing");
  }

  const structuredPrompt = `Analyze this business URL and provide a structured JSON response with the following format:

{
  "overview": {
    "valueProposition": "Brief description of the core value proposition",
    "targetAudience": "Description of the target audience",
    "monetization": "How the business makes money"
  },
  "market": {
    "competitors": [
      {"name": "Competitor name", "url": "optional URL", "notes": "optional notes"}
    ],
    "swot": {
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "opportunities": ["opportunity 1", "opportunity 2"],
      "threats": ["threat 1", "threat 2"]
    }
  },
  "technical": {
    "techStack": ["technology 1", "technology 2"]
  },
  "data": {
    "keyMetrics": [
      {"name": "metric name", "value": "metric value"}
    ]
  },
  "synthesis": {
    "summary": "Concise 100-150 word business analysis summary",
    "keyInsights": ["insight 1", "insight 2", "insight 3"],
    "nextActions": ["action 1", "action 2", "action 3"]
  }
}

URL: ${url}`;

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
          role: "system",
          content: "You are a business analyst. Respond only with valid JSON in the exact format requested."
        },
        {
          role: "user",
          content: structuredPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
    timeoutMs: 15000  // Enhanced timeout per requirement 2.1
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new AppError(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`, 502, 'AI_PROVIDER_DOWN');
  }

  const data = await response.json();
  const rawContent = data.choices[0]?.message?.content || "Analysis could not be completed.";
  
  // Parse structured analysis with graceful fallback
  const { structured, summary } = parseStructuredAnalysis(rawContent);
  
  return { content: summary, model: "openai:gpt-4o-mini", structured };
}

// Multi-provider analysis with Gemini as primary and OpenAI as fallback
async function analyzeUrlWithAI(url: string): Promise<{ content: string; model: string; structured?: StructuredAnalysis }> {
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