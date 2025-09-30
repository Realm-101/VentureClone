import { describe, it, expect } from 'vitest';
import { ValidationService } from '../lib/validation';

describe('Enhanced Validation Service', () => {
  describe('validateAnalysisRequest', () => {
    it('should validate valid analysis request', () => {
      const body = {
        url: 'https://example.com',
        goal: 'Improve user engagement'
      };
      
      const result = ValidationService.validateAnalysisRequest(body);
      
      expect(result.url).toBe('https://example.com/');
      expect(result.goal).toBe('Improve user engagement');
    });

    it('should validate request without goal', () => {
      const body = { url: 'https://example.com' };
      
      const result = ValidationService.validateAnalysisRequest(body);
      
      expect(result.url).toBe('https://example.com/');
      expect(result.goal).toBeUndefined();
    });

    it('should reject request without URL', () => {
      const body = { goal: 'Test goal' };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('URL is required');
    });

    it('should reject request with empty URL', () => {
      const body = { url: '   ' };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('URL cannot be empty');
    });

    it('should reject request with non-string URL', () => {
      const body = { url: 123 };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('URL must be a string');
    });

    it('should reject request with invalid URL format', () => {
      const body = { url: 'not-a-url' };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('Invalid URL');
    });

    it('should reject request with non-string goal', () => {
      const body = { url: 'https://example.com', goal: 123 };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('Goal must be a string if provided');
    });

    it('should reject request with empty goal', () => {
      const body = { url: 'https://example.com', goal: '   ' };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('Goal cannot be empty if provided');
    });

    it('should reject request with goal too long', () => {
      const body = { url: 'https://example.com', goal: 'A'.repeat(501) };
      
      expect(() => ValidationService.validateAnalysisRequest(body)).toThrow('Goal cannot exceed 500 characters');
    });

    it('should reject non-object body', () => {
      expect(() => ValidationService.validateAnalysisRequest('not-an-object')).toThrow('Request body must be an object');
      expect(() => ValidationService.validateAnalysisRequest(null)).toThrow('Request body must be an object');
    });
  });

  describe('validateImprovementRequest', () => {
    it('should validate empty request', () => {
      const result = ValidationService.validateImprovementRequest({});
      expect(result.goal).toBeUndefined();
    });

    it('should validate request with valid goal', () => {
      const body = { goal: 'Improve conversion rate' };
      
      const result = ValidationService.validateImprovementRequest(body);
      expect(result.goal).toBe('Improve conversion rate');
    });

    it('should reject non-string goal', () => {
      const body = { goal: 123 };
      
      expect(() => ValidationService.validateImprovementRequest(body)).toThrow('Goal must be a string if provided');
    });

    it('should reject empty goal', () => {
      const body = { goal: '   ' };
      
      expect(() => ValidationService.validateImprovementRequest(body)).toThrow('Goal cannot be empty if provided');
    });

    it('should reject goal that is too long', () => {
      const body = { goal: 'A'.repeat(501) };
      
      expect(() => ValidationService.validateImprovementRequest(body)).toThrow('Goal cannot exceed 500 characters');
    });

    it('should reject goal with suspicious content', () => {
      const suspiciousGoals = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        'onclick="malicious()"',
        '<iframe src="evil.com"></iframe>',
        'eval("malicious code")'
      ];

      suspiciousGoals.forEach(goal => {
        const body = { goal };
        expect(() => ValidationService.validateImprovementRequest(body)).toThrow('Goal contains potentially harmful content');
      });
    });

    it('should handle null/undefined body gracefully', () => {
      expect(ValidationService.validateImprovementRequest(null)).toEqual({});
      expect(ValidationService.validateImprovementRequest(undefined)).toEqual({});
    });
  });

  describe('validateAnalysisId', () => {
    it('should validate valid UUID', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const result = ValidationService.validateAnalysisId(validUuid);
      expect(result).toBe(validUuid);
    });

    it('should reject empty ID', () => {
      expect(() => ValidationService.validateAnalysisId('')).toThrow('Analysis ID cannot be empty');
      expect(() => ValidationService.validateAnalysisId('   ')).toThrow('Analysis ID cannot be empty');
    });

    it('should reject non-string ID', () => {
      expect(() => ValidationService.validateAnalysisId(123 as any)).toThrow('Analysis ID must be a string');
    });

    it('should reject invalid UUID format', () => {
      const invalidUuids = [
        'not-a-uuid',
        '123-456-789',
        '123e4567-e89b-12d3-a456-42661417400', // too short
        '123e4567-e89b-12d3-a456-4266141740000', // too long
        'ggge4567-e89b-12d3-a456-426614174000', // invalid characters
      ];

      invalidUuids.forEach(id => {
        expect(() => ValidationService.validateAnalysisId(id)).toThrow('Analysis ID must be a valid UUID');
      });
    });

    it('should reject missing ID', () => {
      expect(() => ValidationService.validateAnalysisId(null as any)).toThrow('Analysis ID is required');
      expect(() => ValidationService.validateAnalysisId(undefined as any)).toThrow('Analysis ID is required');
    });
  });

  describe('validateTimeout', () => {
    it('should validate valid timeout values', () => {
      expect(ValidationService.validateTimeout(5000)).toBe(5000);
      expect(ValidationService.validateTimeout(10000)).toBe(10000);
      expect(ValidationService.validateTimeout(30000)).toBe(30000);
    });

    it('should floor decimal values', () => {
      expect(ValidationService.validateTimeout(5000.7)).toBe(5000);
      expect(ValidationService.validateTimeout(10000.9)).toBe(10000);
    });

    it('should reject timeout below minimum', () => {
      expect(() => ValidationService.validateTimeout(500)).toThrow('Timeout must be at least 1000ms');
      expect(() => ValidationService.validateTimeout(999)).toThrow('Timeout must be at least 1000ms');
    });

    it('should reject timeout above maximum', () => {
      expect(() => ValidationService.validateTimeout(70000)).toThrow('Timeout cannot exceed 60000ms');
      expect(() => ValidationService.validateTimeout(100000)).toThrow('Timeout cannot exceed 60000ms');
    });

    it('should reject non-numeric timeout', () => {
      expect(() => ValidationService.validateTimeout('5000' as any)).toThrow('Timeout must be a valid number');
      expect(() => ValidationService.validateTimeout(NaN)).toThrow('Timeout must be a valid number');
    });

    it('should use custom min/max values', () => {
      expect(ValidationService.validateTimeout(2000, 2000, 5000)).toBe(2000);
      expect(() => ValidationService.validateTimeout(1000, 2000, 5000)).toThrow('Timeout must be at least 2000ms');
      expect(() => ValidationService.validateTimeout(6000, 2000, 5000)).toThrow('Timeout cannot exceed 5000ms');
    });
  });

  describe('validateFirstPartyData', () => {
    it('should validate valid first-party data', () => {
      const data = {
        title: 'Test Site',
        description: 'A test website description',
        h1: 'Main Heading',
        textSnippet: 'Some content from the site',
        url: 'https://example.com'
      };

      const result = ValidationService.validateFirstPartyData(data);
      
      expect(result).toEqual({
        title: 'Test Site',
        description: 'A test website description',
        h1: 'Main Heading',
        textSnippet: 'Some content from the site',
        url: 'https://example.com/'
      });
    });

    it('should handle missing fields with fallbacks', () => {
      const data = {
        title: '',
        description: null,
        h1: undefined,
        textSnippet: 'Some content',
        url: 'https://example.com'
      };

      const result = ValidationService.validateFirstPartyData(data);
      
      expect(result?.title).toBe('Untitled');
      expect(result?.description).toBe('');
      expect(result?.h1).toBe('');
      expect(result?.textSnippet).toBe('Some content');
    });

    it('should sanitize dangerous content', () => {
      const data = {
        title: 'Test <script>alert("xss")</script> Site',
        description: 'Description with <iframe src="evil.com"></iframe>',
        h1: 'Heading with "quotes" and \'apostrophes\'',
        textSnippet: 'Content with & ampersands',
        url: 'https://example.com'
      };

      const result = ValidationService.validateFirstPartyData(data);
      
      expect(result?.title).toBe('Test scriptalert(xss)/script Site');
      expect(result?.description).toBe('Description with iframe src=evil.com/iframe');
      expect(result?.h1).toBe('Heading with quotes and apostrophes');
      expect(result?.textSnippet).toBe('Content with ampersands');
    });

    it('should enforce length limits', () => {
      const data = {
        title: 'A'.repeat(250),
        description: 'B'.repeat(350),
        h1: 'C'.repeat(250),
        textSnippet: 'D'.repeat(600),
        url: 'https://example.com'
      };

      const result = ValidationService.validateFirstPartyData(data);
      
      expect(result?.title).toHaveLength(200);
      expect(result?.description).toHaveLength(300);
      expect(result?.h1).toHaveLength(200);
      expect(result?.textSnippet).toHaveLength(500);
    });

    it('should return null for invalid data', () => {
      expect(ValidationService.validateFirstPartyData(null)).toBeNull();
      expect(ValidationService.validateFirstPartyData(undefined)).toBeNull();
      expect(ValidationService.validateFirstPartyData('not-an-object')).toBeNull();
    });

    it('should return null for invalid URL', () => {
      const data = {
        title: 'Test Site',
        description: 'Description',
        h1: 'Heading',
        textSnippet: 'Content',
        url: 'not-a-valid-url'
      };

      const result = ValidationService.validateFirstPartyData(data);
      expect(result).toBeNull();
    });
  });

  describe('createValidationError', () => {
    it('should create validation error with field information', () => {
      const error = ValidationService.createValidationError('url', 'Invalid format', 'not-a-url');
      
      expect(error.message).toBe('Validation failed for url: Invalid format');
      expect(error.name).toBe('ValidationError');
      expect((error as any).field).toBe('url');
      expect((error as any).value).toBe('not-a-url');
    });

    it('should create validation error without value', () => {
      const error = ValidationService.createValidationError('goal', 'Required field missing');
      
      expect(error.message).toBe('Validation failed for goal: Required field missing');
      expect(error.name).toBe('ValidationError');
      expect((error as any).field).toBe('goal');
      expect((error as any).value).toBeUndefined();
    });
  });

  describe('Enhanced confidence scoring validation', () => {
    it('should validate confidence scores within valid range', () => {
      expect(ValidationService.validateConfidenceScore(0)).toBe(0);
      expect(ValidationService.validateConfidenceScore(0.5)).toBe(0.5);
      expect(ValidationService.validateConfidenceScore(1)).toBe(1);
      expect(ValidationService.validateConfidenceScore(0.75)).toBe(0.75);
    });

    it('should return undefined for null/undefined confidence', () => {
      expect(ValidationService.validateConfidenceScore(null)).toBeUndefined();
      expect(ValidationService.validateConfidenceScore(undefined)).toBeUndefined();
    });

    it('should reject confidence scores outside valid range', () => {
      expect(() => ValidationService.validateConfidenceScore(-0.1)).toThrow('Confidence score must be between 0 and 1');
      expect(() => ValidationService.validateConfidenceScore(1.1)).toThrow('Confidence score must be between 0 and 1');
      expect(() => ValidationService.validateConfidenceScore(2)).toThrow('Confidence score must be between 0 and 1');
    });

    it('should reject non-numeric confidence scores', () => {
      expect(() => ValidationService.validateConfidenceScore('0.5')).toThrow('Invalid confidence score type');
      expect(() => ValidationService.validateConfidenceScore(true)).toThrow('Invalid confidence score type');
      expect(() => ValidationService.validateConfidenceScore({})).toThrow('Invalid confidence score type');
      expect(() => ValidationService.validateConfidenceScore([])).toThrow('Invalid confidence score type');
    });

    it('should reject NaN confidence scores', () => {
      expect(() => ValidationService.validateConfidenceScore(NaN)).toThrow('Confidence score cannot be NaN');
    });

    it('should correctly identify speculative analysis', () => {
      expect(ValidationService.isSpeculative(0.5)).toBe(true);
      expect(ValidationService.isSpeculative(0.3)).toBe(true);
      expect(ValidationService.isSpeculative(0.59)).toBe(true);
      expect(ValidationService.isSpeculative(0.6)).toBe(false);
      expect(ValidationService.isSpeculative(0.8)).toBe(false);
      expect(ValidationService.isSpeculative(undefined)).toBe(false);
    });
  });

  describe('Source validation and attribution', () => {
    it('should validate valid sources', () => {
      const validSource = {
        url: 'https://example.com',
        excerpt: 'This is a valid excerpt with sufficient length for testing purposes.'
      };

      const result = ValidationService.validateSource(validSource);
      expect(result).toEqual(validSource);
    });

    it('should reject sources with invalid URLs', () => {
      const invalidSource = {
        url: 'not-a-valid-url',
        excerpt: 'Valid excerpt with enough characters'
      };

      expect(() => ValidationService.validateSource(invalidSource)).toThrow('Invalid source format');
    });

    it('should reject sources with excerpts too short', () => {
      const invalidSource = {
        url: 'https://example.com',
        excerpt: 'Too short'
      };

      expect(() => ValidationService.validateSource(invalidSource)).toThrow('Invalid source format');
    });

    it('should reject sources with excerpts too long', () => {
      const invalidSource = {
        url: 'https://example.com',
        excerpt: 'A'.repeat(301)
      };

      expect(() => ValidationService.validateSource(invalidSource)).toThrow('Invalid source format');
    });

    it('should validate arrays of sources', () => {
      const validSources = [
        {
          url: 'https://example1.com',
          excerpt: 'First valid excerpt with sufficient length for testing.'
        },
        {
          url: 'https://example2.com',
          excerpt: 'Second valid excerpt with enough characters for validation.'
        }
      ];

      const result = ValidationService.validateSources(validSources);
      expect(result).toEqual(validSources);
    });

    it('should reject non-array sources', () => {
      expect(() => ValidationService.validateSources('not-an-array')).toThrow('Sources must be an array');
      expect(() => ValidationService.validateSources({})).toThrow('Sources must be an array');
      expect(() => ValidationService.validateSources(null)).toThrow('Sources must be an array');
    });

    it('should provide detailed error messages for invalid sources in array', () => {
      const invalidSources = [
        {
          url: 'https://valid.com',
          excerpt: 'Valid excerpt with sufficient length'
        },
        {
          url: 'invalid-url',
          excerpt: 'Valid excerpt but invalid URL'
        }
      ];

      expect(() => ValidationService.validateSources(invalidSources)).toThrow('Source at index 1');
    });

    it('should add target site as first-party source', () => {
      const existingSources = [
        {
          url: 'https://external.com',
          excerpt: 'External source with valid excerpt length'
        }
      ];

      const firstPartyData = {
        title: 'Target Site',
        description: 'This is the target site description with enough length',
        h1: 'Main Heading',
        textSnippet: 'Content from the target site'
      };

      const result = ValidationService.addTargetSiteAsSource(
        existingSources,
        'https://target.com',
        firstPartyData
      );

      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('https://target.com');
      expect(result[0].excerpt).toContain('target site description');
    });

    it('should not duplicate target site source', () => {
      const existingSources = [
        {
          url: 'https://target.com/page',
          excerpt: 'Already has target site as source'
        }
      ];

      const firstPartyData = {
        title: 'Target Site',
        description: 'Description',
        h1: 'Heading',
        textSnippet: 'Content'
      };

      const result = ValidationService.addTargetSiteAsSource(
        existingSources,
        'https://target.com',
        firstPartyData
      );

      expect(result).toHaveLength(1); // Should not add duplicate
    });

    it('should handle missing first-party data gracefully', () => {
      const existingSources = [
        {
          url: 'https://external.com',
          excerpt: 'External source with valid excerpt'
        }
      ];

      const result = ValidationService.addTargetSiteAsSource(
        existingSources,
        'https://target.com'
      );

      expect(result).toEqual(existingSources); // Should remain unchanged
    });
  });

  describe('Enhanced analysis validation', () => {
    const mockAnalysis = {
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
        confidence: 0.8
      },
      synthesis: {
        summary: 'Test summary',
        keyInsights: ['Test insight'],
        nextActions: ['Test action']
      },
      sources: [
        {
          url: 'https://example.com',
          excerpt: 'Valid excerpt with sufficient length for testing'
        }
      ]
    };

    it('should validate enhanced analysis with all fields', () => {
      const firstPartyData = {
        title: 'Test Site',
        description: 'Test description with enough length',
        h1: 'Test Heading',
        textSnippet: 'Test content'
      };

      const result = ValidationService.validateEnhancedAnalysis(
        mockAnalysis,
        'https://test.com',
        firstPartyData
      );

      expect(result.technical?.confidence).toBe(0.8);
      expect(result.sources).toHaveLength(2); // Original + target site
    });

    it('should handle invalid confidence scores gracefully', () => {
      const analysisWithInvalidConfidence = {
        ...mockAnalysis,
        technical: {
          ...mockAnalysis.technical,
          confidence: 1.5 // Invalid
        }
      };

      const result = ValidationService.validateEnhancedAnalysis(
        analysisWithInvalidConfidence,
        'https://test.com'
      );

      expect(result.technical?.confidence).toBeUndefined(); // Should be removed
    });

    it('should handle invalid source URLs gracefully', () => {
      const analysisWithInvalidSources = {
        ...mockAnalysis,
        data: {
          trafficEstimates: {
            value: '10,000',
            source: 'invalid-url'
          }
        }
      };

      const result = ValidationService.validateEnhancedAnalysis(
        analysisWithInvalidSources,
        'https://test.com'
      );

      expect(result.data?.trafficEstimates?.source).toBeUndefined();
    });

    it('should handle missing sources array', () => {
      const analysisWithoutSources = {
        ...mockAnalysis
      };
      delete analysisWithoutSources.sources;

      const result = ValidationService.validateEnhancedAnalysis(
        analysisWithoutSources,
        'https://test.com'
      );

      expect(result.sources).toEqual([]);
    });

    it('should reject non-object analysis', () => {
      expect(() => ValidationService.validateEnhancedAnalysis(
        null,
        'https://test.com'
      )).toThrow('Analysis must be an object');

      expect(() => ValidationService.validateEnhancedAnalysis(
        'not-an-object',
        'https://test.com'
      )).toThrow('Analysis must be an object');
    });
  });

  describe('Text sanitization and security', () => {
    it('should sanitize URLs properly', () => {
      expect(ValidationService.sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(ValidationService.sanitizeUrl('http://test.com/path')).toBe('http://test.com/path');
    });

    it('should reject dangerous URL protocols', () => {
      expect(() => ValidationService.sanitizeUrl('javascript:alert(1)')).toThrow('Unsupported protocol');
      expect(() => ValidationService.sanitizeUrl('data:text/html,<script>')).toThrow('Unsupported protocol');
      expect(() => ValidationService.sanitizeUrl('ftp://example.com')).toThrow('Unsupported protocol');
    });

    it('should sanitize excerpts properly', () => {
      const maliciousExcerpt = 'Normal text <script>alert("xss")</script> more text';
      const sanitized = ValidationService.sanitizeExcerpt(maliciousExcerpt);
      
      expect(sanitized).toBe('Normal text scriptalert(xss)/script more text');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain('&');
    });

    it('should normalize whitespace in excerpts', () => {
      const messyExcerpt = 'Text   with    multiple     spaces\n\nand\t\ttabs';
      const sanitized = ValidationService.sanitizeExcerpt(messyExcerpt);
      
      expect(sanitized).toBe('Text with multiple spaces and tabs');
    });

    it('should enforce excerpt length limits', () => {
      const longExcerpt = 'A'.repeat(400);
      const sanitized = ValidationService.sanitizeExcerpt(longExcerpt);
      
      expect(sanitized.length).toBe(300);
    });

    it('should reject non-string excerpts', () => {
      expect(() => ValidationService.sanitizeExcerpt(123)).toThrow('Excerpt must be a string');
      expect(() => ValidationService.sanitizeExcerpt(null)).toThrow('Excerpt must be a string');
      expect(() => ValidationService.sanitizeExcerpt({})).toThrow('Excerpt must be a string');
    });
  });
});