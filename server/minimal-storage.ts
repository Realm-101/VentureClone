import { randomUUID } from "crypto";
import { type StructuredAnalysis, type EnhancedStructuredAnalysis, type FirstPartyData, type BusinessImprovement } from "@shared/schema";

// Data types for minimal venture analysis
export interface AnalysisRecord {
  id: string;
  userId: string;
  url: string;
  summary: string;
  model: string;
  createdAt: string;
  structured?: StructuredAnalysis | EnhancedStructuredAnalysis;
  firstPartyData?: FirstPartyData;
  improvements?: BusinessImprovement;
  // Workflow stage data
  stages?: Record<number, any>;
  currentStage?: number;
  completedStages?: number[];
  // Legacy fields for UI compatibility
  overallScore?: number;
  scoreDetails?: any;
  aiInsights?: any;
  businessModel?: string;
  revenueStream?: string;
  targetMarket?: string;
}

export interface CreateAnalysisInput {
  url: string;
  summary: string;
  model: string;
  structured?: StructuredAnalysis | EnhancedStructuredAnalysis;
  firstPartyData?: FirstPartyData;
  improvements?: BusinessImprovement;
}

// Storage interface defining the contract for all storage implementations
export interface IStorage {
  listAnalyses(userId: string): Promise<AnalysisRecord[]>;
  getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null>;
  createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord>;
  deleteAnalysis(userId: string, id: string): Promise<void>;
  updateAnalysisImprovements(userId: string, id: string, improvements: BusinessImprovement): Promise<AnalysisRecord | null>;
  getAnalysisImprovements(userId: string, id: string): Promise<BusinessImprovement | null>;
  updateAnalysisStageData(userId: string, id: string, stageNumber: number, stageData: any): Promise<AnalysisRecord | null>;
  getAnalysisStages(userId: string, id: string): Promise<Record<number, any> | null>;
}

// In-memory storage implementation using Map for immediate deployment
export class MemStorage implements IStorage {
  private analyses: Map<string, AnalysisRecord[]> = new Map();

  async listAnalyses(userId: string): Promise<AnalysisRecord[]> {
    const userAnalyses = this.analyses.get(userId) || [];
    // Return sorted copy in reverse chronological order (newest first) without mutating original
    return [...userAnalyses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null> {
    const userAnalyses = this.analyses.get(userId) || [];
    return userAnalyses.find(analysis => analysis.id === id) || null;
  }

  async createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord> {
    // Calculate score and legacy fields if structured data exists
    let overallScore: number | undefined;
    let businessModel: string | undefined;
    let revenueStream: string | undefined;
    let targetMarket: string | undefined;
    let aiInsights: any | undefined;
    let scoreDetails: any | undefined;
    
    if (record.structured) {
      // Calculate a simple score based on available data
      overallScore = this.calculateScore(record.structured);
      
      // Extract business model info
      businessModel = record.structured.overview?.valueProposition || 'Business Analysis';
      revenueStream = record.structured.overview?.monetization || 'Unknown';
      targetMarket = record.structured.overview?.targetAudience || 'Unknown';
      
      // Create AI insights from structured data
      aiInsights = {
        keyInsights: record.structured.synthesis?.keyInsights || [],
        risks: record.structured.market?.swot?.threats || [],
        opportunities: record.structured.market?.swot?.opportunities || []
      };
      
      // Get confidence score safely
      const confidence = 'confidence' in record.structured.technical! ? (record.structured.technical as any).confidence : undefined;
      
      // Create score details
      scoreDetails = {
        technicalComplexity: {
          score: confidence ? Math.round(confidence * 10) : 7,
          reasoning: record.structured.technical?.techStack?.join(', ') || 'Standard web technologies'
        },
        marketOpportunity: {
          score: 7,
          reasoning: record.structured.market?.swot?.opportunities?.[0] || 'Market opportunity exists'
        },
        competitiveLandscape: {
          score: 6,
          reasoning: `${record.structured.market?.competitors?.length || 0} competitors identified`
        },
        resourceRequirements: {
          score: 7,
          reasoning: 'Moderate resource requirements'
        },
        timeToMarket: {
          score: 7,
          reasoning: 'Estimated 3-6 months to MVP'
        }
      };
    }
    
    const analysis: AnalysisRecord = {
      id: randomUUID(),
      userId,
      url: record.url,
      summary: record.summary,
      model: record.model,
      createdAt: new Date().toISOString(),
    };
    
    // Add optional fields
    if (record.structured) analysis.structured = record.structured;
    if (record.firstPartyData) analysis.firstPartyData = record.firstPartyData;
    if (record.improvements) analysis.improvements = record.improvements;
    if (overallScore) analysis.overallScore = overallScore;
    if (businessModel) analysis.businessModel = businessModel;
    if (revenueStream) analysis.revenueStream = revenueStream;
    if (targetMarket) analysis.targetMarket = targetMarket;
    if (aiInsights) analysis.aiInsights = aiInsights;
    if (scoreDetails) analysis.scoreDetails = scoreDetails;

    const userAnalyses = this.analyses.get(userId) || [];
    userAnalyses.push(analysis);
    this.analyses.set(userId, userAnalyses);

    return analysis;
  }

  private calculateScore(structured: StructuredAnalysis | EnhancedStructuredAnalysis): number {
    // Simple scoring algorithm based on available data
    let score = 5; // Base score
    
    // Add points for having comprehensive data
    if (structured.overview) score += 1;
    if (structured.market?.competitors && structured.market.competitors.length > 0) score += 1;
    if (structured.market?.swot) score += 1;
    if (structured.technical?.techStack && structured.technical.techStack.length > 0) score += 1;
    if (structured.synthesis?.keyInsights && structured.synthesis.keyInsights.length >= 3) score += 1;
    
    // Cap at 10
    return Math.min(10, Math.max(1, score));
  }

  async deleteAnalysis(userId: string, id: string): Promise<void> {
    const userAnalyses = this.analyses.get(userId) || [];
    const filteredAnalyses = userAnalyses.filter(analysis => analysis.id !== id);
    this.analyses.set(userId, filteredAnalyses);
  }

  async updateAnalysisImprovements(userId: string, id: string, improvements: BusinessImprovement): Promise<AnalysisRecord | null> {
    const userAnalyses = this.analyses.get(userId) || [];
    const analysisIndex = userAnalyses.findIndex(analysis => analysis.id === id);
    
    if (analysisIndex === -1) {
      return null;
    }

    const analysis = userAnalyses[analysisIndex];
    if (!analysis) {
      return null;
    }

    // Update the analysis with improvements
    analysis.improvements = improvements;
    this.analyses.set(userId, userAnalyses);
    return analysis;
  }

  async getAnalysisImprovements(userId: string, id: string): Promise<BusinessImprovement | null> {
    const analysis = await this.getAnalysis(userId, id);
    return analysis?.improvements || null;
  }

  async updateAnalysisStageData(userId: string, id: string, stageNumber: number, stageData: any): Promise<AnalysisRecord | null> {
    const userAnalyses = this.analyses.get(userId) || [];
    const analysisIndex = userAnalyses.findIndex(analysis => analysis.id === id);
    
    if (analysisIndex === -1) {
      return null;
    }

    const analysis = userAnalyses[analysisIndex];
    if (!analysis) {
      return null;
    }

    // Initialize stages object if it doesn't exist
    if (!analysis.stages) {
      analysis.stages = {};
    }

    // Update the stage data
    analysis.stages[stageNumber] = stageData;

    // Update completedStages array
    if (stageData.status === 'completed') {
      if (!analysis.completedStages) {
        analysis.completedStages = [];
      }
      if (!analysis.completedStages.includes(stageNumber)) {
        analysis.completedStages.push(stageNumber);
        analysis.completedStages.sort((a, b) => a - b);
      }
    }

    // Update currentStage to the next stage
    const maxCompleted = analysis.completedStages ? Math.max(...analysis.completedStages) : 0;
    analysis.currentStage = Math.min(maxCompleted + 1, 6);

    this.analyses.set(userId, userAnalyses);
    return analysis;
  }

  async getAnalysisStages(userId: string, id: string): Promise<Record<number, any> | null> {
    const analysis = await this.getAnalysis(userId, id);
    return analysis?.stages || null;
  }
}

// Database storage stub class maintaining same interface for future database integration
export class DbStorage implements IStorage {
  async listAnalyses(userId: string): Promise<AnalysisRecord[]> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async deleteAnalysis(userId: string, id: string): Promise<void> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async updateAnalysisImprovements(userId: string, id: string, improvements: BusinessImprovement): Promise<AnalysisRecord | null> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async getAnalysisImprovements(userId: string, id: string): Promise<BusinessImprovement | null> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async updateAnalysisStageData(userId: string, id: string, stageNumber: number, stageData: any): Promise<AnalysisRecord | null> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }

  async getAnalysisStages(userId: string, id: string): Promise<Record<number, any> | null> {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
}

// Storage factory logic to select implementation based on STORAGE environment variable
export function createStorage(): IStorage {
  const storageType = process.env.STORAGE || "mem";
  
  switch (storageType) {
    case "mem":
      return new MemStorage();
    case "db":
      return new DbStorage();
    default:
      console.warn(`Unknown storage type: ${storageType}, defaulting to memory storage`);
      return new MemStorage();
  }
}

// Export singleton instance
export const minimalStorage = createStorage();