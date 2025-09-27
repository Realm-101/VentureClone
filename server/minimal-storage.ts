import { randomUUID } from "crypto";

// Data types for minimal venture analysis
export interface AnalysisRecord {
  id: string;
  userId: string;
  url: string;
  summary: string;
  model: string;
  createdAt: string;
}

export interface CreateAnalysisInput {
  url: string;
  summary: string;
  model: string;
}

// Storage interface defining the contract for all storage implementations
export interface IStorage {
  listAnalyses(userId: string): Promise<AnalysisRecord[]>;
  getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null>;
  createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord>;
  deleteAnalysis(userId: string, id: string): Promise<void>;
}

// In-memory storage implementation using Map for immediate deployment
export class MemStorage implements IStorage {
  private analyses: Map<string, AnalysisRecord[]> = new Map();

  async listAnalyses(userId: string): Promise<AnalysisRecord[]> {
    const userAnalyses = this.analyses.get(userId) || [];
    // Return in reverse chronological order (newest first)
    return userAnalyses.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAnalysis(userId: string, id: string): Promise<AnalysisRecord | null> {
    const userAnalyses = this.analyses.get(userId) || [];
    return userAnalyses.find(analysis => analysis.id === id) || null;
  }

  async createAnalysis(userId: string, record: CreateAnalysisInput): Promise<AnalysisRecord> {
    const analysis: AnalysisRecord = {
      id: randomUUID(),
      userId,
      url: record.url,
      summary: record.summary,
      model: record.model,
      createdAt: new Date().toISOString(),
    };

    const userAnalyses = this.analyses.get(userId) || [];
    userAnalyses.push(analysis);
    this.analyses.set(userId, userAnalyses);

    return analysis;
  }

  async deleteAnalysis(userId: string, id: string): Promise<void> {
    const userAnalyses = this.analyses.get(userId) || [];
    const filteredAnalyses = userAnalyses.filter(analysis => analysis.id !== id);
    this.analyses.set(userId, filteredAnalyses);
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