import { apiRequest } from "./queryClient";
import type { AIProvider, SearchResult } from "../types";

export class AIService {
  static async testConnection(provider: string, apiKey: string): Promise<boolean> {
    try {
      const response = await apiRequest("POST", "/api/ai-providers/test", {
        provider,
        apiKey
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    }
  }

  static async getProviders(): Promise<AIProvider[]> {
    try {
      const response = await apiRequest("GET", "/api/ai-providers");
      return await response.json();
    } catch (error) {
      return [];
    }
  }

  static async getActiveProvider(): Promise<AIProvider | null> {
    try {
      const response = await apiRequest("GET", "/api/ai-providers/active");
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  static async saveProvider(providerData: Omit<AIProvider, 'id' | 'userId' | 'createdAt'>): Promise<AIProvider> {
    const response = await apiRequest("POST", "/api/ai-providers", providerData);
    return await response.json();
  }

  static async updateProvider(id: string, updates: Partial<AIProvider>): Promise<AIProvider> {
    const response = await apiRequest("PUT", `/api/ai-providers/${id}`, updates);
    return await response.json();
  }

  static async deleteProvider(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/ai-providers/${id}`);
  }

  static async analyzeURL(url: string) {
    const response = await apiRequest("POST", "/api/business-analyses/analyze", { url });
    return await response.json();
  }

  static async searchBusinesses(query: string): Promise<SearchResult> {
    const response = await apiRequest("POST", "/api/business-analyses/search", { query });
    return await response.json();
  }

  static async generateStageContent(analysisId: string, stageNumber: number) {
    const response = await apiRequest("POST", `/api/workflow-stages/${analysisId}/generate/${stageNumber}`);
    return await response.json();
  }
}
