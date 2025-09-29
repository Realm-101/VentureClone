import { describe, it, expect, beforeEach } from 'vitest';
import { MemStorage } from '../minimal-storage';
import type { StructuredAnalysis } from '@shared/schema';

describe('Structured Analysis Storage', () => {
  let storage: MemStorage;
  const userId = 'test-user-123';

  beforeEach(() => {
    storage = new MemStorage();
  });

  it('should store analysis with structured data', async () => {
    const structuredData: StructuredAnalysis = {
      overview: {
        valueProposition: "AI-powered business analysis platform",
        targetAudience: "Entrepreneurs and business analysts",
        monetization: "Subscription-based SaaS model"
      },
      market: {
        competitors: [
          { name: "Competitor A", url: "https://example.com", notes: "Strong in market research" }
        ],
        swot: {
          strengths: ["AI-powered analysis", "User-friendly interface"],
          weaknesses: ["Limited market presence", "High competition"],
          opportunities: ["Growing AI market", "Remote work trends"],
          threats: ["Economic downturn", "Regulatory changes"]
        }
      },
      synthesis: {
        summary: "Strong potential for AI-powered business analysis with growing market demand.",
        keyInsights: [
          "AI automation reduces analysis time by 80%",
          "Target market shows 25% annual growth",
          "Competitive advantage in user experience"
        ],
        nextActions: [
          "Conduct market validation study",
          "Develop MVP with core features",
          "Establish partnerships with business incubators"
        ]
      }
    };

    const analysis = await storage.createAnalysis(userId, {
      url: 'https://example.com',
      summary: 'Test analysis summary',
      model: 'openai:gpt-4o-mini',
      structured: structuredData
    });

    expect(analysis.structured).toBeDefined();
    expect(analysis.structured?.overview.valueProposition).toBe("AI-powered business analysis platform");
    expect(analysis.structured?.market.competitors).toHaveLength(1);
    expect(analysis.structured?.synthesis.keyInsights).toHaveLength(3);
  });

  it('should store analysis without structured data', async () => {
    const analysis = await storage.createAnalysis(userId, {
      url: 'https://example.com',
      summary: 'Plain text analysis summary',
      model: 'gemini:gemini-2.5-flash-preview-05-20'
    });

    expect(analysis.structured).toBeUndefined();
    expect(analysis.summary).toBe('Plain text analysis summary');
  });

  it('should retrieve analysis with structured data', async () => {
    const structuredData: StructuredAnalysis = {
      overview: {
        valueProposition: "Simple business model",
        targetAudience: "General consumers",
        monetization: "Direct sales"
      },
      market: {
        competitors: [],
        swot: {
          strengths: ["Low cost"],
          weaknesses: ["Limited features"],
          opportunities: ["Market gap"],
          threats: ["Competition"]
        }
      },
      synthesis: {
        summary: "Basic business with potential for growth.",
        keyInsights: ["Cost-effective solution"],
        nextActions: ["Market research"]
      }
    };

    const created = await storage.createAnalysis(userId, {
      url: 'https://test.com',
      summary: 'Test summary',
      model: 'openai:gpt-4o-mini',
      structured: structuredData
    });

    const retrieved = await storage.getAnalysis(userId, created.id);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.structured).toBeDefined();
    expect(retrieved?.structured?.overview.valueProposition).toBe("Simple business model");
    expect(retrieved?.structured?.synthesis.keyInsights).toEqual(["Cost-effective solution"]);
  });

  it('should list analyses with mixed structured and plain text data', async () => {
    // Create analysis with structured data
    await storage.createAnalysis(userId, {
      url: 'https://structured.com',
      summary: 'Structured analysis',
      model: 'openai:gpt-4o-mini',
      structured: {
        overview: {
          valueProposition: "Test value prop",
          targetAudience: "Test audience",
          monetization: "Test monetization"
        },
        market: {
          competitors: [],
          swot: {
            strengths: ["Test strength"],
            weaknesses: ["Test weakness"],
            opportunities: ["Test opportunity"],
            threats: ["Test threat"]
          }
        },
        synthesis: {
          summary: "Test synthesis",
          keyInsights: ["Test insight"],
          nextActions: ["Test action"]
        }
      }
    });

    // Create analysis without structured data
    await storage.createAnalysis(userId, {
      url: 'https://plain.com',
      summary: 'Plain text analysis',
      model: 'gemini:gemini-2.5-flash-preview-05-20'
    });

    const analyses = await storage.listAnalyses(userId);
    
    expect(analyses).toHaveLength(2);
    
    // Find the structured analysis
    const structuredAnalysis = analyses.find(a => a.url === 'https://structured.com');
    expect(structuredAnalysis?.structured).toBeDefined();
    
    // Find the plain text analysis
    const plainAnalysis = analyses.find(a => a.url === 'https://plain.com');
    expect(plainAnalysis?.structured).toBeUndefined();
  });
});