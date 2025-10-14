import { randomUUID } from "crypto";
import { 
  type StructuredAnalysis, 
  type EnhancedStructuredAnalysis, 
  type FirstPartyData, 
  type BusinessImprovement,
  type Stage2Content,
  type Stage3Content,
  type Stage4Content,
  type Stage5Content,
  type Stage6Content,
  type TechnologyInsights,
  type ClonabilityScore,
  type EnhancedComplexityResult
} from "@shared/schema";

// Stage data interface with proper typing
export interface StageData {
  stageNumber: number;
  stageName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  content: Stage2Content | Stage3Content | Stage4Content | Stage5Content | Stage6Content | null;
  generatedAt: string;
  completedAt?: string;
}

// Stages record type for type-safe stage storage
export type StagesRecord = {
  1?: StageData;
  2?: StageData;
  3?: StageData;
  4?: StageData;
  5?: StageData;
  6?: StageData;
};

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
  // Technology insights fields
  technologyInsights?: TechnologyInsights;
  clonabilityScore?: ClonabilityScore;
  enhancedComplexity?: EnhancedComplexityResult;
  insightsGeneratedAt?: Date;
  // Workflow stage data with proper typing
  stages?: StagesRecord;
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
  // Technology insights fields
  technologyInsights?: TechnologyInsights;
  clonabilityScore?: ClonabilityScore;
  enhancedComplexity?: EnhancedComplexityResult;
  insightsGeneratedAt?: Date;
}

// Storage interface defining the contract for all storage implementations
export interface IStorage {
  listAnalyses(userId: string): Promise<AnalysisRecord[]>;
  getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null>;
  createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord>;
  deleteAnalysis(userId: string, id: string): Promise<void>;
  updateAnalysisImprovements(userId: string, id: string, improvements: BusinessImprovement): Promise<AnalysisRecord | null>;
  getAnalysisImprovements(userId: string, id: string): Promise<BusinessImprovement | null>;
  updateAnalysisStageData(userId: string, id: string, stageNumber: number, stageData: StageData): Promise<AnalysisRecord | null>;
  getAnalysisStages(userId: string, id: string): Promise<StagesRecord | null>;
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
    if (record.technologyInsights) analysis.technologyInsights = record.technologyInsights;
    if (record.clonabilityScore) analysis.clonabilityScore = record.clonabilityScore;
    if (record.enhancedComplexity) analysis.enhancedComplexity = record.enhancedComplexity;
    if (record.insightsGeneratedAt) analysis.insightsGeneratedAt = record.insightsGeneratedAt;
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

  async updateAnalysisStageData(userId: string, id: string, stageNumber: number, stageData: StageData): Promise<AnalysisRecord | null> {
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

    // Preserve existing stage data if updating
    const existingStage = analysis.stages[stageNumber as keyof StagesRecord];
    
    // Build updated stage data with proper typing
    const updatedStageData: StageData = {
      stageNumber: stageData.stageNumber,
      stageName: stageData.stageName,
      status: stageData.status,
      content: stageData.content,
      // Preserve original generatedAt timestamp if it exists
      generatedAt: existingStage?.generatedAt || stageData.generatedAt,
    };

    // Add completedAt only if status is completed
    if (stageData.status === 'completed') {
      updatedStageData.completedAt = stageData.completedAt || new Date().toISOString();
    } else if (existingStage?.completedAt) {
      updatedStageData.completedAt = existingStage.completedAt;
    }

    // Update the stage data
    analysis.stages[stageNumber as keyof StagesRecord] = updatedStageData;

    // Update completedStages array
    if (!analysis.completedStages) {
      analysis.completedStages = [];
    }

    if (stageData.status === 'completed') {
      if (!analysis.completedStages.includes(stageNumber)) {
        analysis.completedStages.push(stageNumber);
        analysis.completedStages.sort((a, b) => a - b);
      }
    } else if (stageData.status === 'failed' || stageData.status === 'pending') {
      // Remove from completedStages if status changed to failed or pending
      analysis.completedStages = analysis.completedStages.filter(s => s !== stageNumber);
    }

    // Update currentStage to the next incomplete stage
    const maxCompleted = analysis.completedStages.length > 0 
      ? Math.max(...analysis.completedStages) 
      : 0;
    analysis.currentStage = Math.min(maxCompleted + 1, 6);

    this.analyses.set(userId, userAnalyses);
    return analysis;
  }

  async getAnalysisStages(userId: string, id: string): Promise<StagesRecord | null> {
    const analysis = await this.getAnalysis(userId, id);
    if (!analysis) {
      return null;
    }

    // Return stages with proper typing, or empty object if no stages exist
    return analysis.stages || {};
  }
}

// Database storage implementation using Drizzle ORM with PostgreSQL
export class DbStorage implements IStorage {
  private db: any;

  constructor() {
    // Lazy load database connection
    this.initializeDb();
  }

  private async initializeDb() {
    try {
      const { drizzle } = await import('drizzle-orm/neon-http');
      const { neon } = await import('@neondatabase/serverless');
      
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set');
      }

      const sql = neon(databaseUrl);
      this.db = drizzle(sql);
      
      console.log('[DbStorage] Database connection initialized');
    } catch (error) {
      console.error('[DbStorage] Failed to initialize database:', error);
      throw new Error('Failed to initialize database connection');
    }
  }

  private async ensureDb() {
    if (!this.db) {
      await this.initializeDb();
    }
  }

  async listAnalyses(userId: string): Promise<AnalysisRecord[]> {
    await this.ensureDb();
    
    try {
      const { businessAnalyses } = await import('@shared/schema');
      const { eq, desc } = await import('drizzle-orm');
      
      const results = await this.db
        .select()
        .from(businessAnalyses)
        .where(eq(businessAnalyses.userId, userId))
        .orderBy(desc(businessAnalyses.createdAt));

      return results.map((row: any) => this.mapDbRowToAnalysisRecord(row));
    } catch (error) {
      console.error('[DbStorage] Failed to list analyses:', error);
      throw new Error('Failed to fetch analyses from database');
    }
  }

  async getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null> {
    await this.ensureDb();
    
    try {
      const { businessAnalyses } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      const results = await this.db
        .select()
        .from(businessAnalyses)
        .where(and(
          eq(businessAnalyses.userId, userId),
          eq(businessAnalyses.id, id)
        ))
        .limit(1);

      if (results.length === 0) {
        return null;
      }

      return this.mapDbRowToAnalysisRecord(results[0]);
    } catch (error) {
      console.error('[DbStorage] Failed to get analysis:', error);
      throw new Error('Failed to fetch analysis from database');
    }
  }

  async createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord> {
    await this.ensureDb();
    
    try {
      const { businessAnalyses } = await import('@shared/schema');
      const { randomUUID } = await import('crypto');
      
      // Calculate score and legacy fields if structured data exists
      let overallScore: number | undefined;
      let businessModel: string | undefined;
      let revenueStream: string | undefined;
      let targetMarket: string | undefined;
      let aiInsights: any | undefined;
      let scoreDetails: any | undefined;
      
      if (record.structured) {
        overallScore = this.calculateScore(record.structured);
        businessModel = record.structured.overview?.valueProposition;
        revenueStream = record.structured.overview?.monetization;
        targetMarket = record.structured.overview?.targetAudience;
        
        aiInsights = {
          keyInsights: record.structured.synthesis?.keyInsights || [],
          opportunities: record.structured.market?.swot?.opportunities || [],
          risks: record.structured.market?.swot?.threats || [],
        };
        
        scoreDetails = {
          technical: record.structured.technical?.complexityScore || 5,
          market: 5,
          execution: 5,
        };
      }

      const id = randomUUID();
      const now = new Date();

      const insertData = {
        id,
        userId,
        url: record.url,
        businessModel,
        revenueStream,
        targetMarket,
        overallScore,
        scoreDetails: scoreDetails ? JSON.stringify(scoreDetails) : null,
        aiInsights: aiInsights ? JSON.stringify(aiInsights) : null,
        currentStage: 1,
        stageData: record.structured ? JSON.stringify({ 1: record.structured }) : null,
        technologyInsights: record.technologyInsights ? JSON.stringify(record.technologyInsights) : null,
        clonabilityScore: record.clonabilityScore ? JSON.stringify(record.clonabilityScore) : null,
        enhancedComplexity: record.enhancedComplexity ? JSON.stringify(record.enhancedComplexity) : null,
        insightsGeneratedAt: record.insightsGeneratedAt || null,
        createdAt: now,
        updatedAt: now,
      };

      const results = await this.db
        .insert(businessAnalyses)
        .values(insertData)
        .returning();

      return this.mapDbRowToAnalysisRecord(results[0]);
    } catch (error) {
      console.error('[DbStorage] Failed to create analysis:', error);
      throw new Error('Failed to create analysis in database');
    }
  }

  async deleteAnalysis(userId: string, id: string): Promise<void> {
    await this.ensureDb();
    
    try {
      const { businessAnalyses } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      await this.db
        .delete(businessAnalyses)
        .where(and(
          eq(businessAnalyses.userId, userId),
          eq(businessAnalyses.id, id)
        ));
    } catch (error) {
      console.error('[DbStorage] Failed to delete analysis:', error);
      throw new Error('Failed to delete analysis from database');
    }
  }

  async updateAnalysisImprovements(userId: string, id: string, improvements: BusinessImprovement): Promise<AnalysisRecord | null> {
    await this.ensureDb();
    
    try {
      const { businessAnalyses } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      // First get the existing analysis to merge improvements
      const existing = await this.getAnalysis(userId, id);
      if (!existing) {
        return null;
      }

      const updatedStageData = {
        ...(existing.stages || {}),
        improvements,
      };

      const results = await this.db
        .update(businessAnalyses)
        .set({
          stageData: JSON.stringify(updatedStageData),
          updatedAt: new Date(),
        })
        .where(and(
          eq(businessAnalyses.userId, userId),
          eq(businessAnalyses.id, id)
        ))
        .returning();

      if (results.length === 0) {
        return null;
      }

      return this.mapDbRowToAnalysisRecord(results[0]);
    } catch (error) {
      console.error('[DbStorage] Failed to update improvements:', error);
      throw new Error('Failed to update improvements in database');
    }
  }

  async getAnalysisImprovements(userId: string, id: string): Promise<BusinessImprovement | null> {
    const analysis = await this.getAnalysis(userId, id);
    return analysis?.improvements || null;
  }

  async updateAnalysisStageData(userId: string, id: string, stageNumber: number, stageData: StageData): Promise<AnalysisRecord | null> {
    await this.ensureDb();
    
    try {
      const { businessAnalyses } = await import('@shared/schema');
      const { eq, and } = await import('drizzle-orm');
      
      // Get existing analysis
      const existing = await this.getAnalysis(userId, id);
      if (!existing) {
        return null;
      }

      // Merge stage data
      const updatedStages: StagesRecord = {
        ...(existing.stages || {}),
        [stageNumber]: stageData,
      };

      // Update completed stages list
      const completedStages = existing.completedStages || [];
      if (stageData.status === 'completed' && !completedStages.includes(stageNumber)) {
        completedStages.push(stageNumber);
      }

      const results = await this.db
        .update(businessAnalyses)
        .set({
          stageData: JSON.stringify(updatedStages),
          currentStage: Math.max(existing.currentStage || 1, stageNumber),
          updatedAt: new Date(),
        })
        .where(and(
          eq(businessAnalyses.userId, userId),
          eq(businessAnalyses.id, id)
        ))
        .returning();

      if (results.length === 0) {
        return null;
      }

      return this.mapDbRowToAnalysisRecord(results[0]);
    } catch (error) {
      console.error('[DbStorage] Failed to update stage data:', error);
      throw new Error('Failed to update stage data in database');
    }
  }

  async getAnalysisStages(userId: string, id: string): Promise<StagesRecord | null> {
    const analysis = await this.getAnalysis(userId, id);
    return analysis?.stages || null;
  }

  // Helper method to map database row to AnalysisRecord
  private mapDbRowToAnalysisRecord(row: any): AnalysisRecord {
    const stageData = row.stageData ? (typeof row.stageData === 'string' ? JSON.parse(row.stageData) : row.stageData) : {};
    
    return {
      id: row.id,
      userId: row.userId,
      url: row.url,
      summary: row.businessModel || '',
      model: 'multi-provider',
      createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
      structured: stageData[1] || undefined,
      improvements: stageData.improvements || undefined,
      technologyInsights: row.technologyInsights ? (typeof row.technologyInsights === 'string' ? JSON.parse(row.technologyInsights) : row.technologyInsights) : undefined,
      clonabilityScore: row.clonabilityScore ? (typeof row.clonabilityScore === 'string' ? JSON.parse(row.clonabilityScore) : row.clonabilityScore) : undefined,
      enhancedComplexity: row.enhancedComplexity ? (typeof row.enhancedComplexity === 'string' ? JSON.parse(row.enhancedComplexity) : row.enhancedComplexity) : undefined,
      insightsGeneratedAt: row.insightsGeneratedAt || undefined,
      stages: stageData,
      currentStage: row.currentStage || 1,
      completedStages: this.extractCompletedStages(stageData),
      overallScore: row.overallScore || undefined,
      scoreDetails: row.scoreDetails ? (typeof row.scoreDetails === 'string' ? JSON.parse(row.scoreDetails) : row.scoreDetails) : undefined,
      aiInsights: row.aiInsights ? (typeof row.aiInsights === 'string' ? JSON.parse(row.aiInsights) : row.aiInsights) : undefined,
      businessModel: row.businessModel || undefined,
      revenueStream: row.revenueStream || undefined,
      targetMarket: row.targetMarket || undefined,
    };
  }

  // Helper to extract completed stages from stage data
  private extractCompletedStages(stageData: any): number[] {
    const completed: number[] = [];
    for (let i = 1; i <= 6; i++) {
      if (stageData[i]?.status === 'completed') {
        completed.push(i);
      }
    }
    return completed;
  }

  // Helper to calculate score from structured data
  private calculateScore(structured: StructuredAnalysis | EnhancedStructuredAnalysis): number {
    let score = 50; // Base score
    
    // Add points for completeness
    if (structured.overview) score += 10;
    if (structured.market?.competitors?.length > 0) score += 10;
    if (structured.market?.swot) score += 10;
    if (structured.technical?.techStack?.length) score += 10;
    if (structured.synthesis?.keyInsights?.length) score += 10;
    
    return Math.min(100, score);
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