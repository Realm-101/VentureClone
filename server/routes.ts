import type { Express } from "express";
import { createServer, type Server } from "http";
import { minimalStorage } from "./minimal-storage";

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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
        maxOutputTokens: 200,
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analysis could not be completed.";
  return { content, model: "gemini:gemini-1.5-flash" };
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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
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
    
    // Fallback to OpenAI
    try {
      console.log("Attempting analysis with OpenAI...");
      return await analyzeUrlWithOpenAI(url);
    } catch (openaiError) {
      console.error("Both Gemini and OpenAI failed:", { geminiError, openaiError });
      throw new Error("Both AI providers failed. Please check your API keys and try again.");
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("=== REGISTERING MINIMAL ROUTES ===");
  
  // GET /api/business-analyses - List user's analyses in reverse chronological order
  app.get("/api/business-analyses", async (req, res) => {
    console.log("GET /api/business-analyses hit");
    try {
      const analyses = await minimalStorage.listAnalyses(req.userId);
      res.json(analyses);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
      res.status(500).json({ error: "Failed to fetch business analyses" });
    }
  });

  // POST /api/business-analyses/analyze - Create new analysis via multi-provider AI integration
  app.post("/api/business-analyses/analyze", async (req, res) => {
    console.log("=== NEW MINIMAL ROUTE HIT ===", req.body);
    try {
      const { url } = req.body;

      // Validate URL is provided
      if (!url) {
        console.log("URL missing");
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      if (!isValidUrl(url)) {
        console.log("Invalid URL format:", url);
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Check for at least one AI provider API key
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "At least one AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is required" });
      }

      // Perform AI analysis with multi-provider support
      let analysisResult: { content: string; model: string };
      try {
        analysisResult = await analyzeUrlWithAI(url);
      } catch (error) {
        console.error("AI analysis failed:", error);
        if (error instanceof Error) {
          return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: "Failed to analyze URL with AI providers" });
      }

      // Save analysis to storage
      const analysis = await minimalStorage.createAnalysis(req.userId, {
        url,
        summary: analysisResult.content,
        model: analysisResult.model
      });

      res.json(analysis);
    } catch (error) {
      console.error("Analysis creation failed:", error);
      res.status(500).json({ error: "Failed to create business analysis" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}