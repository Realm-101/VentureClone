import { describe, it, expect } from 'vitest';
import { 
  zSource, 
  enhancedStructuredAnalysisSchema, 
  type Source, 
  type EnhancedStructuredAnalysis,
  type FirstPartyData,
  type BusinessImprovement
} from '../../shared/schema.js';

describe('Enhanced Schema Validation', () => {
  describe('zSource schema', () => {
    it('should validate valid source with URL and excerpt', () => {
      const validSource = {
        url: 'https://example.com',
        excerpt: 'This is a valid excerpt with enough characters to meet the minimum requirement.'
      };

      const result = zSource.parse(validSource);
      expect(result).toEqual(validSource);
    });

    it('should reject source with invalid URL', () => {
      const invalidSource = {
        url: 'not-a-valid-url',
        excerpt: 'Valid excerpt with enough characters'
      };

      expect(() => zSource.parse(invalidSource)).toThrow();
    });

    it('should reject source with excerpt too short', () => {
      const invalidSource = {
        url: 'https://example.com',
        excerpt: 'Too short'
      };

      expect(() => zSource.parse(invalidSource)).toThrow();
    });

    it('should reject source with excerpt too long', () => {
      const invalidSource = {
        url: 'https://example.com',
        excerpt: 'A'.repeat(301) // Exceeds 300 character limit
      };

      expect(() => zSource.parse(invalidSource)).toThrow();
    });

    it('should reject source missing required fields', () => {
      expect(() => zSource.parse({ url: 'https://example.com' })).toThrow();
      expect(() => zSource.parse({ excerpt: 'Valid excerpt' })).toThrow();
      expect(() => zSource.parse({})).toThrow();
    });
  });

  describe('enhancedStructuredAnalysisSchema', () => {
    const baseValidAnalysis = {
      overview: {
        valueProposition: 'AI-powered business analysis',
        targetAudience: 'Entrepreneurs',
        monetization: 'SaaS subscription'
      },
      market: {
        competitors: [
          { name: 'Competitor A', url: 'https://competitor.com', notes: 'Direct competitor' }
        ],
        swot: {
          strengths: ['Strong AI integration'],
          weaknesses: ['Limited market presence'],
          opportunities: ['Growing AI market'],
          threats: ['Big tech competitors']
        }
      },
      synthesis: {
        summary: 'Promising AI platform',
        keyInsights: ['Strong technical foundation'],
        nextActions: ['Improve marketing']
      }
    };

    it('should validate basic analysis without enhanced fields', () => {
      const result = enhancedStructuredAnalysisSchema.parse(baseValidAnalysis);
      
      expect(result.overview).toEqual(baseValidAnalysis.overview);
      expect(result.market).toEqual(baseValidAnalysis.market);
      expect(result.synthesis).toEqual(baseValidAnalysis.synthesis);
      expect(result.sources).toEqual([]); // Default empty array
    });

    it('should validate analysis with confidence scoring', () => {
      const analysisWithConfidence = {
        ...baseValidAnalysis,
        technical: {
          techStack: ['React', 'Node.js'],
          confidence: 0.8,
          uiColors: ['#3B82F6'],
          keyPages: ['/dashboard']
        }
      };

      const result = enhancedStructuredAnalysisSchema.parse(analysisWithConfidence);
      
      expect(result.technical?.confidence).toBe(0.8);
      expect(result.technical?.techStack).toEqual(['React', 'Node.js']);
    });

    it('should validate analysis with source attribution', () => {
      const analysisWithSources = {
        ...baseValidAnalysis,
        data: {
          trafficEstimates: {
            value: '10,000 monthly visitors',
            source: 'https://similarweb.com'
          },
          keyMetrics: [
            {
              name: 'Monthly Active Users',
              value: '5,000',
              source: 'https://analytics.com',
              asOf: '2024-01-01'
            }
          ]
        },
        sources: [
          {
            url: 'https://example.com',
            excerpt: 'AI-powered analysis platform for entrepreneurs and business analysts.'
          }
        ]
      };

      const result = enhancedStructuredAnalysisSchema.parse(analysisWithSources);
      
      expect(result.data?.trafficEstimates?.source).toBe('https://similarweb.com');
      expect(result.data?.keyMetrics?.[0]?.source).toBe('https://analytics.com');
      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].url).toBe('https://example.com');
    });

    it('should reject analysis with invalid confidence score', () => {
      const invalidAnalysis = {
        ...baseValidAnalysis,
        technical: {
          confidence: 1.5 // Invalid: > 1
        }
      };

      expect(() => enhancedStructuredAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('should reject analysis with invalid confidence score (negative)', () => {
      const invalidAnalysis = {
        ...baseValidAnalysis,
        technical: {
          confidence: -0.1 // Invalid: < 0
        }
      };

      expect(() => enhancedStructuredAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('should reject analysis with invalid source URLs', () => {
      const invalidAnalysis = {
        ...baseValidAnalysis,
        data: {
          trafficEstimates: {
            value: '10,000',
            source: 'not-a-valid-url'
          }
        }
      };

      expect(() => enhancedStructuredAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('should reject analysis with invalid sources array', () => {
      const invalidAnalysis = {
        ...baseValidAnalysis,
        sources: [
          {
            url: 'https://example.com',
            excerpt: 'Too short' // Invalid: < 10 characters
          }
        ]
      };

      expect(() => enhancedStructuredAnalysisSchema.parse(invalidAnalysis)).toThrow();
    });

    it('should handle optional fields gracefully', () => {
      const minimalAnalysis = {
        overview: {
          valueProposition: 'Test value prop',
          targetAudience: 'Test audience',
          monetization: 'Test monetization'
        },
        market: {
          competitors: [],
          swot: {
            strengths: [],
            weaknesses: [],
            opportunities: [],
            threats: []
          }
        },
        synthesis: {
          summary: 'Test summary',
          keyInsights: [],
          nextActions: []
        }
      };

      const result = enhancedStructuredAnalysisSchema.parse(minimalAnalysis);
      
      expect(result.technical).toBeUndefined();
      expect(result.data).toBeUndefined();
      expect(result.sources).toEqual([]);
    });

    it('should validate complex analysis with all enhanced features', () => {
      const complexAnalysis = {
        overview: {
          valueProposition: 'Comprehensive AI business analysis platform',
          targetAudience: 'Entrepreneurs, business analysts, and consultants',
          monetization: 'Tiered SaaS subscription with enterprise features'
        },
        market: {
          competitors: [
            { name: 'Competitor A', url: 'https://competitor-a.com', notes: 'Direct competitor with similar features' },
            { name: 'Competitor B', url: 'https://competitor-b.com', notes: 'Larger player with broader scope' }
          ],
          swot: {
            strengths: ['Advanced AI integration', 'User-friendly interface', 'Comprehensive analysis'],
            weaknesses: ['Limited market presence', 'High competition', 'Resource constraints'],
            opportunities: ['Growing AI market', 'Enterprise adoption', 'International expansion'],
            threats: ['Big tech competitors', 'Market saturation', 'Economic downturn']
          }
        },
        technical: {
          techStack: ['React', 'Node.js', 'PostgreSQL', 'OpenAI API'],
          confidence: 0.85,
          uiColors: ['#3B82F6', '#10B981', '#F59E0B'],
          keyPages: ['/dashboard', '/analysis', '/settings', '/billing']
        },
        data: {
          trafficEstimates: {
            value: '50,000 monthly visitors',
            source: 'https://similarweb.com/website/example.com'
          },
          keyMetrics: [
            {
              name: 'Monthly Active Users',
              value: '25,000',
              source: 'https://analytics.google.com',
              asOf: '2024-01-15'
            },
            {
              name: 'Conversion Rate',
              value: '3.2%',
              source: 'https://internal-analytics.com',
              asOf: '2024-01-15'
            }
          ]
        },
        synthesis: {
          summary: 'Promising AI business analysis platform with strong technical foundation and clear growth potential',
          keyInsights: [
            'Strong technical architecture with modern stack',
            'Clear market opportunity in growing AI sector',
            'Need for improved marketing and user acquisition',
            'Potential for enterprise market expansion'
          ],
          nextActions: [
            'Implement comprehensive SEO strategy',
            'Develop enterprise-focused features',
            'Expand AI capabilities and integrations',
            'Build strategic partnerships'
          ]
        },
        sources: [
          {
            url: 'https://example.com',
            excerpt: 'AI-powered business analysis platform that helps entrepreneurs identify and evaluate cloning opportunities.'
          },
          {
            url: 'https://techcrunch.com/ai-business-analysis',
            excerpt: 'The AI business analysis market is expected to grow by 40% annually as more entrepreneurs seek data-driven insights.'
          }
        ]
      };

      const result = enhancedStructuredAnalysisSchema.parse(complexAnalysis);
      
      expect(result.technical?.confidence).toBe(0.85);
      expect(result.technical?.techStack).toHaveLength(4);
      expect(result.data?.keyMetrics).toHaveLength(2);
      expect(result.sources).toHaveLength(2);
      expect(result.sources[0].excerpt).toContain('AI-powered business analysis');
    });
  });

  describe('Type inference and interfaces', () => {
    it('should properly infer Source type', () => {
      const source: Source = {
        url: 'https://example.com',
        excerpt: 'This is a valid excerpt for testing type inference.'
      };

      expect(source.url).toBe('https://example.com');
      expect(source.excerpt).toContain('valid excerpt');
    });

    it('should properly define FirstPartyData interface', () => {
      const firstPartyData: FirstPartyData = {
        title: 'Example Website',
        description: 'This is an example website for testing',
        h1: 'Welcome to Example',
        textSnippet: 'This is the main content of the example website.',
        url: 'https://example.com'
      };

      expect(firstPartyData.title).toBe('Example Website');
      expect(firstPartyData.url).toBe('https://example.com');
    });

    it('should properly define BusinessImprovement interface', () => {
      const improvement: BusinessImprovement = {
        twists: [
          'Add AI-powered competitor tracking',
          'Implement collaborative analysis features',
          'Create industry-specific templates'
        ],
        sevenDayPlan: [
          { day: 1, tasks: ['Research APIs', 'Define metrics', 'Setup project'] },
          { day: 2, tasks: ['Build collection', 'Create alerts', 'Test accuracy'] },
          { day: 3, tasks: ['Implement notifications', 'Add preferences', 'Test delivery'] },
          { day: 4, tasks: ['Create dashboard', 'Add charts', 'Optimize performance'] },
          { day: 5, tasks: ['Polish UI', 'Add export', 'Implement feedback'] },
          { day: 6, tasks: ['User testing', 'Fix bugs', 'Prepare docs'] },
          { day: 7, tasks: ['Launch beta', 'Monitor metrics', 'Gather feedback'] }
        ],
        generatedAt: '2024-01-01T12:00:00.000Z'
      };

      expect(improvement.twists).toHaveLength(3);
      expect(improvement.sevenDayPlan).toHaveLength(7);
      expect(improvement.sevenDayPlan[0].day).toBe(1);
      expect(improvement.sevenDayPlan[0].tasks).toHaveLength(3);
    });

    it('should properly infer EnhancedStructuredAnalysis type', () => {
      const analysis: EnhancedStructuredAnalysis = {
        overview: {
          valueProposition: 'Test value proposition',
          targetAudience: 'Test audience',
          monetization: 'Test monetization'
        },
        market: {
          competitors: [{ name: 'Test Competitor' }],
          swot: {
            strengths: ['Test strength'],
            weaknesses: ['Test weakness'],
            opportunities: ['Test opportunity'],
            threats: ['Test threat']
          }
        },
        technical: {
          techStack: ['React', 'Node.js'],
          confidence: 0.75
        },
        synthesis: {
          summary: 'Test summary',
          keyInsights: ['Test insight'],
          nextActions: ['Test action']
        },
        sources: [
          {
            url: 'https://example.com',
            excerpt: 'Test excerpt with sufficient length for validation requirements.'
          }
        ]
      };

      expect(analysis.technical?.confidence).toBe(0.75);
      expect(analysis.sources).toHaveLength(1);
    });
  });

  describe('Backward compatibility', () => {
    it('should handle legacy analysis without enhanced fields', () => {
      const legacyAnalysis = {
        overview: {
          valueProposition: 'Legacy value prop',
          targetAudience: 'Legacy audience',
          monetization: 'Legacy monetization'
        },
        market: {
          competitors: [{ name: 'Legacy Competitor' }],
          swot: {
            strengths: ['Legacy strength'],
            weaknesses: ['Legacy weakness'],
            opportunities: ['Legacy opportunity'],
            threats: ['Legacy threat']
          }
        },
        technical: {
          techStack: ['Legacy Tech'],
          uiColors: ['#000000'],
          keyPages: ['/legacy']
          // No confidence field
        },
        data: {
          trafficEstimates: {
            value: '1,000 visitors'
            // No source field
          },
          keyMetrics: [
            {
              name: 'Legacy Metric',
              value: '100'
              // No source field
            }
          ]
        },
        synthesis: {
          summary: 'Legacy summary',
          keyInsights: ['Legacy insight'],
          nextActions: ['Legacy action']
        }
        // No sources field - should default to empty array
      };

      const result = enhancedStructuredAnalysisSchema.parse(legacyAnalysis);
      
      expect(result.technical?.confidence).toBeUndefined();
      expect(result.data?.trafficEstimates?.source).toBeUndefined();
      expect(result.data?.keyMetrics?.[0]?.source).toBeUndefined();
      expect(result.sources).toEqual([]);
    });
  });
});