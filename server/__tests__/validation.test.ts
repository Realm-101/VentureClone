import { describe, it, expect } from 'vitest';
import { ValidationService } from '../lib/validation';
import type { Source, EnhancedStructuredAnalysis } from '@shared/schema';

describe('ValidationService', () => {
  describe('validateConfidenceScore', () => {
    it('should accept valid confidence scores', () => {
      expect(ValidationService.validateConfidenceScore(0)).toBe(0);
      expect(ValidationService.validateConfidenceScore(0.5)).toBe(0.5);
      expect(ValidationService.validateConfidenceScore(1)).toBe(1);
      expect(ValidationService.validateConfidenceScore(0.85)).toBe(0.85);
    });

    it('should return undefined for null/undefined values', () => {
      expect(ValidationService.validateConfidenceScore(undefined)).toBeUndefined();
      expect(ValidationService.validateConfidenceScore(null)).toBeUndefined();
    });

    it('should reject confidence scores outside 0-1 range', () => {
      expect(() => ValidationService.validateConfidenceScore(-0.1)).toThrow('Confidence score must be between 0 and 1');
      expect(() => ValidationService.validateConfidenceScore(1.1)).toThrow('Confidence score must be between 0 and 1');
      expect(() => ValidationService.validateConfidenceScore(2)).toThrow('Confidence score must be between 0 and 1');
    });

    it('should reject non-numeric confidence scores', () => {
      expect(() => ValidationService.validateConfidenceScore('0.5')).toThrow('Invalid confidence score type');
      expect(() => ValidationService.validateConfidenceScore(true)).toThrow('Invalid confidence score type');
      expect(() => ValidationService.validateConfidenceScore({})).toThrow('Invalid confidence score type');
    });

    it('should reject NaN confidence scores', () => {
      expect(() => ValidationService.validateConfidenceScore(NaN)).toThrow('Confidence score cannot be NaN');
    });
  });

  describe('validateSource', () => {
    it('should accept valid sources', () => {
      const validSource = {
        url: 'https://example.com',
        excerpt: 'This is a valid excerpt with enough characters'
      };
      
      const result = ValidationService.validateSource(validSource);
      expect(result).toEqual(validSource);
    });

    it('should reject sources with invalid URLs', () => {
      const invalidSource = {
        url: 'not-a-url',
        excerpt: 'Valid excerpt text'
      };
      
      expect(() => ValidationService.validateSource(invalidSource)).toThrow('Invalid source format');
    });

    it('should reject sources with excerpts that are too short', () => {
      const invalidSource = {
        url: 'https://example.com',
        excerpt: 'Short'
      };
      
      expect(() => ValidationService.validateSource(invalidSource)).toThrow('Invalid source format');
    });

    it('should reject sources with excerpts that are too long', () => {
      const invalidSource = {
        url: 'https://example.com',
        excerpt: 'A'.repeat(301) // 301 characters
      };
      
      expect(() => ValidationService.validateSource(invalidSource)).toThrow('Invalid source format');
    });

    it('should reject sources missing required fields', () => {
      expect(() => ValidationService.validateSource({ url: 'https://example.com' })).toThrow('Invalid source format');
      expect(() => ValidationService.validateSource({ excerpt: 'Valid excerpt text' })).toThrow('Invalid source format');
      expect(() => ValidationService.validateSource({})).toThrow('Invalid source format');
    });
  });

  describe('validateSources', () => {
    it('should validate array of valid sources', () => {
      const sources = [
        { url: 'https://example.com', excerpt: 'First valid excerpt' },
        { url: 'https://test.com', excerpt: 'Second valid excerpt' }
      ];
      
      const result = ValidationService.validateSources(sources);
      expect(result).toEqual(sources);
    });

    it('should reject non-array input', () => {
      expect(() => ValidationService.validateSources('not-an-array')).toThrow('Sources must be an array');
      expect(() => ValidationService.validateSources({})).toThrow('Sources must be an array');
    });

    it('should provide index information for invalid sources', () => {
      const sources = [
        { url: 'https://example.com', excerpt: 'Valid excerpt' },
        { url: 'invalid-url', excerpt: 'Valid excerpt' }
      ];
      
      expect(() => ValidationService.validateSources(sources)).toThrow('Source at index 1');
    });
  });

  describe('addTargetSiteAsSource', () => {
    it('should add target site as source when not present', () => {
      const sources: Source[] = [
        { url: 'https://other.com', excerpt: 'Other source excerpt' }
      ];
      const targetUrl = 'https://example.com';
      const firstPartyData = {
        title: 'Example Site',
        description: 'This is a valid description for the example site',
        h1: 'Main Heading',
        textSnippet: 'Some text content'
      };
      
      const result = ValidationService.addTargetSiteAsSource(sources, targetUrl, firstPartyData);
      
      expect(result).toHaveLength(2);
      expect(result[0].url).toBe(targetUrl);
      expect(result[0].excerpt).toBe('This is a valid description for the example site');
    });

    it('should not add target site if already present', () => {
      const sources: Source[] = [
        { url: 'https://example.com/page', excerpt: 'Existing source from target site' }
      ];
      const targetUrl = 'https://example.com';
      const firstPartyData = {
        title: 'Example Site',
        description: 'Description',
        h1: 'Heading',
        textSnippet: 'Text'
      };
      
      const result = ValidationService.addTargetSiteAsSource(sources, targetUrl, firstPartyData);
      
      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://example.com/page');
    });

    it('should not add target site if no first-party data', () => {
      const sources: Source[] = [];
      const targetUrl = 'https://example.com';
      
      const result = ValidationService.addTargetSiteAsSource(sources, targetUrl);
      
      expect(result).toHaveLength(0);
    });

    it('should use h1 if description is too short', () => {
      const sources: Source[] = [];
      const targetUrl = 'https://example.com';
      const firstPartyData = {
        title: 'Short',
        description: 'Short',
        h1: 'This is a longer h1 heading that meets the minimum length requirement',
        textSnippet: 'Text'
      };
      
      const result = ValidationService.addTargetSiteAsSource(sources, targetUrl, firstPartyData);
      
      expect(result).toHaveLength(1);
      expect(result[0].excerpt).toBe('This is a longer h1 heading that meets the minimum length requirement');
    });

    it('should truncate long excerpts', () => {
      const sources: Source[] = [];
      const targetUrl = 'https://example.com';
      const longDescription = 'A'.repeat(350); // 350 characters
      const firstPartyData = {
        title: 'Title',
        description: longDescription,
        h1: 'Heading',
        textSnippet: 'Text'
      };
      
      const result = ValidationService.addTargetSiteAsSource(sources, targetUrl, firstPartyData);
      
      expect(result).toHaveLength(1);
      expect(result[0].excerpt).toHaveLength(300);
      expect(result[0].excerpt.endsWith('...')).toBe(true);
    });
  });

  describe('validateEnhancedAnalysis', () => {
    const mockFirstPartyData = {
      title: 'Test Site',
      description: 'This is a test site description',
      h1: 'Main Heading',
      textSnippet: 'Some content'
    };

    it('should validate and enhance analysis with valid data', () => {
      const rawAnalysis = {
        overview: {
          valueProposition: 'Test value prop',
          targetAudience: 'Test audience',
          monetization: 'Test monetization'
        },
        market: {
          competitors: [],
          swot: {
            strengths: ['strength1'],
            weaknesses: ['weakness1'],
            opportunities: ['opportunity1'],
            threats: ['threat1']
          }
        },
        technical: {
          techStack: ['React'],
          confidence: 0.8
        },
        synthesis: {
          summary: 'Test summary',
          keyInsights: ['insight1'],
          nextActions: ['action1']
        },
        sources: [
          { url: 'https://other.com', excerpt: 'Other source excerpt' }
        ]
      };

      const result = ValidationService.validateEnhancedAnalysis(
        rawAnalysis,
        'https://example.com',
        mockFirstPartyData
      );

      expect(result.technical?.confidence).toBe(0.8);
      expect(result.sources).toHaveLength(2); // Original + target site
      expect(result.sources[0].url).toBe('https://example.com');
    });

    it('should handle invalid confidence scores gracefully', () => {
      const rawAnalysis = {
        overview: {
          valueProposition: 'Test value prop',
          targetAudience: 'Test audience',
          monetization: 'Test monetization'
        },
        market: {
          competitors: [],
          swot: {
            strengths: ['strength1'],
            weaknesses: ['weakness1'],
            opportunities: ['opportunity1'],
            threats: ['threat1']
          }
        },
        technical: {
          techStack: ['React'],
          confidence: 1.5 // Invalid confidence score
        },
        synthesis: {
          summary: 'Test summary',
          keyInsights: ['insight1'],
          nextActions: ['action1']
        },
        sources: []
      };

      const result = ValidationService.validateEnhancedAnalysis(
        rawAnalysis,
        'https://example.com',
        mockFirstPartyData
      );

      expect(result.technical?.confidence).toBeUndefined(); // Should be removed
    });

    it('should handle invalid source URLs gracefully', () => {
      const rawAnalysis = {
        overview: {
          valueProposition: 'Test value prop',
          targetAudience: 'Test audience',
          monetization: 'Test monetization'
        },
        market: {
          competitors: [],
          swot: {
            strengths: ['strength1'],
            weaknesses: ['weakness1'],
            opportunities: ['opportunity1'],
            threats: ['threat1']
          }
        },
        data: {
          trafficEstimates: {
            value: '1000 visits',
            source: 'invalid-url'
          }
        },
        synthesis: {
          summary: 'Test summary',
          keyInsights: ['insight1'],
          nextActions: ['action1']
        },
        sources: []
      };

      const result = ValidationService.validateEnhancedAnalysis(
        rawAnalysis,
        'https://example.com',
        mockFirstPartyData
      );

      expect(result.data?.trafficEstimates?.source).toBeUndefined(); // Should be removed
    });
  });

  describe('isSpeculative', () => {
    it('should return true for confidence < 0.6', () => {
      expect(ValidationService.isSpeculative(0.5)).toBe(true);
      expect(ValidationService.isSpeculative(0.0)).toBe(true);
      expect(ValidationService.isSpeculative(0.59)).toBe(true);
    });

    it('should return false for confidence >= 0.6', () => {
      expect(ValidationService.isSpeculative(0.6)).toBe(false);
      expect(ValidationService.isSpeculative(0.8)).toBe(false);
      expect(ValidationService.isSpeculative(1.0)).toBe(false);
    });

    it('should return false for undefined confidence', () => {
      expect(ValidationService.isSpeculative(undefined)).toBe(false);
    });
  });

  describe('sanitizeUrl', () => {
    it('should accept valid HTTP/HTTPS URLs', () => {
      expect(ValidationService.sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(ValidationService.sanitizeUrl('http://example.com')).toBe('http://example.com/');
    });

    it('should reject non-HTTP protocols', () => {
      expect(() => ValidationService.sanitizeUrl('ftp://example.com')).toThrow('Unsupported protocol');
      expect(() => ValidationService.sanitizeUrl('javascript:alert(1)')).toThrow('Unsupported protocol');
    });

    it('should reject invalid URLs', () => {
      expect(() => ValidationService.sanitizeUrl('not-a-url')).toThrow('Invalid URL');
    });
  });

  describe('sanitizeExcerpt', () => {
    it('should remove dangerous characters', () => {
      const input = 'Test <script>alert("xss")</script> content';
      const result = ValidationService.sanitizeExcerpt(input);
      expect(result).toBe('Test scriptalert(xss)/script content');
    });

    it('should normalize whitespace', () => {
      const input = 'Test   content\n\twith   spaces';
      const result = ValidationService.sanitizeExcerpt(input);
      expect(result).toBe('Test content with spaces');
    });

    it('should enforce maximum length', () => {
      const input = 'A'.repeat(350);
      const result = ValidationService.sanitizeExcerpt(input);
      expect(result).toHaveLength(300);
    });
  });
});