import { describe, it, expect } from 'vitest';
import { structuredAnalysisSchema, type StructuredAnalysis } from '@shared/schema';

describe('Structured Analysis', () => {
  it('should validate correct structured analysis data', () => {
    const validData: StructuredAnalysis = {
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
      technical: {
        techStack: ["React", "Node.js", "AI/ML"]
      },
      data: {
        keyMetrics: [
          { name: "Monthly Users", value: "10,000" },
          { name: "Revenue", value: "$50,000/month" }
        ]
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

    const result = structuredAnalysisSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid structured analysis data', () => {
    const invalidData = {
      overview: {
        valueProposition: "Test",
        // Missing required fields
      },
      market: {
        competitors: [],
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      }
      // Missing synthesis section
    };

    const result = structuredAnalysisSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should handle optional fields correctly', () => {
    const minimalData: StructuredAnalysis = {
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

    const result = structuredAnalysisSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
  });
});