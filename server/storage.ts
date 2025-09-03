import { type User, type InsertUser, type AiProvider, type InsertAiProvider, type BusinessAnalysis, type InsertBusinessAnalysis, type WorkflowStage, type InsertWorkflowStage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // AI Provider methods
  getAiProviders(userId: string): Promise<AiProvider[]>;
  getActiveAiProvider(userId: string): Promise<AiProvider | undefined>;
  createAiProvider(provider: InsertAiProvider): Promise<AiProvider>;
  updateAiProvider(id: string, updates: Partial<AiProvider>): Promise<AiProvider | undefined>;
  deleteAiProvider(id: string): Promise<boolean>;

  // Business Analysis methods
  getBusinessAnalyses(userId: string): Promise<BusinessAnalysis[]>;
  getBusinessAnalysis(id: string): Promise<BusinessAnalysis | undefined>;
  createBusinessAnalysis(analysis: InsertBusinessAnalysis): Promise<BusinessAnalysis>;
  updateBusinessAnalysis(id: string, updates: Partial<BusinessAnalysis>): Promise<BusinessAnalysis | undefined>;

  // Workflow Stage methods
  getWorkflowStages(analysisId: string): Promise<WorkflowStage[]>;
  createWorkflowStage(stage: InsertWorkflowStage): Promise<WorkflowStage>;
  updateWorkflowStage(id: string, updates: Partial<WorkflowStage>): Promise<WorkflowStage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private aiProviders: Map<string, AiProvider>;
  private businessAnalyses: Map<string, BusinessAnalysis>;
  private workflowStages: Map<string, WorkflowStage>;

  constructor() {
    this.users = new Map();
    this.aiProviders = new Map();
    this.businessAnalyses = new Map();
    this.workflowStages = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAiProviders(userId: string): Promise<AiProvider[]> {
    return Array.from(this.aiProviders.values()).filter(
      (provider) => provider.userId === userId
    );
  }

  async getActiveAiProvider(userId: string): Promise<AiProvider | undefined> {
    return Array.from(this.aiProviders.values()).find(
      (provider) => provider.userId === userId && provider.isActive
    );
  }

  async createAiProvider(insertProvider: InsertAiProvider): Promise<AiProvider> {
    const id = randomUUID();
    const provider: AiProvider = {
      ...insertProvider,
      id,
      isActive: insertProvider.isActive ?? false,
      createdAt: new Date(),
    };

    // If this provider is being set as active, deactivate others for this user
    if (provider.isActive) {
      Array.from(this.aiProviders.values())
        .filter(p => p.userId === provider.userId && p.isActive)
        .forEach(p => {
          p.isActive = false;
          this.aiProviders.set(p.id, p);
        });
    }

    this.aiProviders.set(id, provider);
    return provider;
  }

  async updateAiProvider(id: string, updates: Partial<AiProvider>): Promise<AiProvider | undefined> {
    const provider = this.aiProviders.get(id);
    if (!provider) return undefined;

    const updatedProvider = { ...provider, ...updates };

    // If setting as active, deactivate others for this user
    if (updates.isActive && provider.userId) {
      Array.from(this.aiProviders.values())
        .filter(p => p.userId === provider.userId && p.id !== id && p.isActive)
        .forEach(p => {
          p.isActive = false;
          this.aiProviders.set(p.id, p);
        });
    }

    this.aiProviders.set(id, updatedProvider);
    return updatedProvider;
  }

  async deleteAiProvider(id: string): Promise<boolean> {
    return this.aiProviders.delete(id);
  }

  async getBusinessAnalyses(userId: string): Promise<BusinessAnalysis[]> {
    return Array.from(this.businessAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getBusinessAnalysis(id: string): Promise<BusinessAnalysis | undefined> {
    return this.businessAnalyses.get(id);
  }

  async createBusinessAnalysis(insertAnalysis: InsertBusinessAnalysis): Promise<BusinessAnalysis> {
    const id = randomUUID();
    const analysis: BusinessAnalysis = {
      id,
      userId: insertAnalysis.userId,
      url: insertAnalysis.url,
      businessModel: insertAnalysis.businessModel ?? null,
      revenueStream: insertAnalysis.revenueStream ?? null,
      targetMarket: insertAnalysis.targetMarket ?? null,
      overallScore: insertAnalysis.overallScore ?? null,
      scoreDetails: insertAnalysis.scoreDetails ?? null,
      aiInsights: insertAnalysis.aiInsights ?? null,
      currentStage: insertAnalysis.currentStage ?? 1,
      stageData: insertAnalysis.stageData ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.businessAnalyses.set(id, analysis);
    return analysis;
  }

  async updateBusinessAnalysis(id: string, updates: Partial<BusinessAnalysis>): Promise<BusinessAnalysis | undefined> {
    const analysis = this.businessAnalyses.get(id);
    if (!analysis) return undefined;

    const updatedAnalysis = { ...analysis, ...updates, updatedAt: new Date() };
    this.businessAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }

  async getWorkflowStages(analysisId: string): Promise<WorkflowStage[]> {
    return Array.from(this.workflowStages.values())
      .filter(stage => stage.analysisId === analysisId)
      .sort((a, b) => a.stageNumber - b.stageNumber);
  }

  async createWorkflowStage(insertStage: InsertWorkflowStage): Promise<WorkflowStage> {
    const id = randomUUID();
    const stage: WorkflowStage = {
      id,
      analysisId: insertStage.analysisId,
      stageNumber: insertStage.stageNumber,
      stageName: insertStage.stageName,
      status: insertStage.status ?? 'pending',
      data: insertStage.data ?? null,
      aiGeneratedContent: insertStage.aiGeneratedContent ?? null,
      completedAt: null,
      createdAt: new Date(),
    };
    this.workflowStages.set(id, stage);
    return stage;
  }

  async updateWorkflowStage(id: string, updates: Partial<WorkflowStage>): Promise<WorkflowStage | undefined> {
    const stage = this.workflowStages.get(id);
    if (!stage) return undefined;

    const updatedStage = { ...stage, ...updates };
    if (updates.status === 'completed') {
      updatedStage.completedAt = new Date();
    }
    this.workflowStages.set(id, updatedStage);
    return updatedStage;
  }
}

export const storage = new MemStorage();
