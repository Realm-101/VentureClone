import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAiProviderSchema, insertBusinessAnalysisSchema } from "@shared/schema";
import { AIProviderService } from "./services/ai-providers";
import { BusinessAnalyzerService } from "./services/business-analyzer";

export async function registerRoutes(app: Express): Promise<Server> {
  // AI Provider routes
  app.get("/api/ai-providers", async (req, res) => {
    try {
      // For demo purposes, using a default user ID
      const userId = "default-user";
      const providers = await storage.getAiProviders(userId);
      res.json(providers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI providers" });
    }
  });

  app.get("/api/ai-providers/active", async (req, res) => {
    try {
      const userId = "default-user";
      const provider = await storage.getActiveAiProvider(userId);
      res.json(provider);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active AI provider" });
    }
  });

  app.post("/api/ai-providers", async (req, res) => {
    try {
      const userId = "default-user";
      const validatedData = insertAiProviderSchema.parse({ ...req.body, userId });
      const provider = await storage.createAiProvider(validatedData);
      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: "Invalid AI provider data" });
    }
  });

  app.put("/api/ai-providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const provider = await storage.updateAiProvider(id, updates);
      if (!provider) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      res.json(provider);
    } catch (error) {
      res.status(400).json({ message: "Failed to update AI provider" });
    }
  });

  app.delete("/api/ai-providers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAiProvider(id);
      if (!success) {
        return res.status(404).json({ message: "AI provider not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete AI provider" });
    }
  });

  app.post("/api/ai-providers/test", async (req, res) => {
    try {
      const { provider, apiKey } = req.body;
      const aiService = new AIProviderService(apiKey, provider);
      const isConnected = await aiService.testConnection();
      res.json({ connected: isConnected });
    } catch (error) {
      res.status(400).json({ connected: false, message: "Connection test failed" });
    }
  });

  // Business Analysis routes
  app.get("/api/business-analyses", async (req, res) => {
    try {
      const userId = "default-user";
      const analyses = await storage.getBusinessAnalyses(userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business analyses" });
    }
  });

  app.get("/api/business-analyses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getBusinessAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ message: "Business analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business analysis" });
    }
  });

  app.post("/api/business-analyses/analyze", async (req, res) => {
    try {
      const { url } = req.body;
      const userId = "default-user";

      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Get active AI provider
      const activeProvider = await storage.getActiveAiProvider(userId);
      if (!activeProvider) {
        return res.status(400).json({ message: "No active AI provider configured" });
      }

      // Initialize AI service
      const aiService = new AIProviderService(activeProvider.apiKey, activeProvider.provider as any);
      const analyzer = new BusinessAnalyzerService(aiService);

      // Perform analysis
      const analysisResult = await analyzer.analyzeURL(url);

      // Save analysis
      const analysisData = insertBusinessAnalysisSchema.parse({
        userId,
        url: analysisResult.url,
        businessModel: analysisResult.businessModel,
        revenueStream: analysisResult.revenueStream,
        targetMarket: analysisResult.targetMarket,
        overallScore: analysisResult.overallScore,
        scoreDetails: analysisResult.scoreDetails,
        aiInsights: analysisResult.aiInsights,
        currentStage: 1,
        stageData: {}
      });

      const savedAnalysis = await storage.createBusinessAnalysis(analysisData);
      res.json(savedAnalysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Failed to analyze business URL" });
    }
  });

  app.post("/api/business-analyses/search", async (req, res) => {
    try {
      const { query } = req.body;
      const userId = "default-user";

      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      // Get active AI provider
      const activeProvider = await storage.getActiveAiProvider(userId);
      if (!activeProvider) {
        return res.status(400).json({ message: "No active AI provider configured" });
      }

      // Initialize AI service
      const aiService = new AIProviderService(activeProvider.apiKey, activeProvider.provider as any);
      const analyzer = new BusinessAnalyzerService(aiService);

      // Perform search
      const searchResults = await analyzer.searchBusinesses(query);
      res.json(searchResults);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Failed to search businesses" });
    }
  });

  app.put("/api/business-analyses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const analysis = await storage.updateBusinessAnalysis(id, updates);
      if (!analysis) {
        return res.status(404).json({ message: "Business analysis not found" });
      }
      res.json(analysis);
    } catch (error) {
      res.status(400).json({ message: "Failed to update business analysis" });
    }
  });

  // Workflow Stage routes
  app.get("/api/workflow-stages/:analysisId", async (req, res) => {
    try {
      const { analysisId } = req.params;
      const stages = await storage.getWorkflowStages(analysisId);
      res.json(stages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow stages" });
    }
  });

  app.post("/api/workflow-stages/:analysisId/generate/:stageNumber", async (req, res) => {
    try {
      const { analysisId, stageNumber } = req.params;
      const userId = "default-user";
      const stage = parseInt(stageNumber);

      // Get analysis data
      const analysis = await storage.getBusinessAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({ message: "Business analysis not found" });
      }

      // Get active AI provider
      const activeProvider = await storage.getActiveAiProvider(userId);
      if (!activeProvider) {
        return res.status(400).json({ message: "No active AI provider configured" });
      }

      // Initialize AI service
      const aiService = new AIProviderService(activeProvider.apiKey, activeProvider.provider as any);
      const analyzer = new BusinessAnalyzerService(aiService);

      // Get previous stage data if needed
      const stages = await storage.getWorkflowStages(analysisId);
      const previousStage = stages.find(s => s.stageNumber === stage - 1);

      // Generate stage content
      const stageContent = await analyzer.generateStageContent(
        stage,
        analysis,
        previousStage?.data
      );

      // Save or update stage
      let workflowStage = stages.find(s => s.stageNumber === stage);
      if (workflowStage) {
        workflowStage = await storage.updateWorkflowStage(workflowStage.id, {
          data: stageContent,
          status: 'completed'
        });
      } else {
        const stageNames = [
          '', 'Discovery & Selection', 'Lazy-Entrepreneur Filter', 'MVP Launch Planning',
          'Demand Testing Strategy', 'Scaling & Growth', 'AI Automation Mapping'
        ];
        
        workflowStage = await storage.createWorkflowStage({
          analysisId,
          stageNumber: stage,
          stageName: stageNames[stage] || `Stage ${stage}`,
          status: 'completed',
          data: stageContent,
          aiGeneratedContent: stageContent
        });
      }

      // Update analysis current stage
      await storage.updateBusinessAnalysis(analysisId, { currentStage: stage });

      res.json(workflowStage);
    } catch (error) {
      console.error("Stage generation error:", error);
      res.status(500).json({ message: "Failed to generate stage content" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const userId = "default-user";
      const analyses = await storage.getBusinessAnalyses(userId);
      
      const stats = {
        totalAnalyses: analyses.length,
        strongCandidates: analyses.filter(a => (a.overallScore || 0) >= 7).length,
        inProgress: analyses.filter(a => (a.currentStage || 1) > 1 && (a.currentStage || 1) < 6).length,
        aiQueries: analyses.length * 15 // Rough estimate
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
