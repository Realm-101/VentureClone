import { describe, it, expect } from 'vitest';
import { structuredAnalysisSchema } from '@shared/schema';

// Helper function to parse structured analysis with graceful fallback
function parseStructuredAnalysis(content: string): { structured?: any; summary: string } {
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

describe('Structured Analysis Parsing', () => {
  it('should parse valid JSON structured analysis', () => {
    const validJson = JSON.stringify({
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
    });

    const result = parseStructuredAnalysis(validJson);
    
    expect(result.structured).toBeDefined();
    expect(result.structured.overview.valueProposition).toBe("AI-powered business analysis platform");
    expect(result.summary).toContain("AI-powered business analysis platform");
    expect(result.summary).toContain("Entrepreneurs and business analysts");
    expect(result.summary).toContain("Subscription-based SaaS model");
  });

  it('should fallback to plain text for invalid JSON', () => {
    const invalidJson = "This is just plain text analysis without JSON structure.";
    
    const result = parseStructuredAnalysis(invalidJson);
    
    expect(result.structured).toBeUndefined();
    expect(result.summary).toBe("This is just plain text analysis without JSON structure.");
  });

  it('should fallback to plain text for malformed JSON', () => {
    const malformedJson = '{"overview": {"valueProposition": "Test"'; // Missing closing braces
    
    const result = parseStructuredAnalysis(malformedJson);
    
    expect(result.structured).toBeUndefined();
    expect(result.summary).toBe(malformedJson);
  });

  it('should fallback to plain text for JSON that fails schema validation', () => {
    const invalidStructure = JSON.stringify({
      overview: {
        valueProposition: "Test"
        // Missing required fields
      }
      // Missing required sections
    });
    
    const result = parseStructuredAnalysis(invalidStructure);
    
    expect(result.structured).toBeUndefined();
    expect(result.summary).toBe(invalidStructure);
  });
});