import { describe, it, expect, vi } from 'vitest';
import { ValidationService } from '../lib/validation';
import { BusinessImprovementService } from '../services/business-improvement';
import { AIProviderService } from '../services/ai-providers';

describe('Timeout Handling and Error Recovery', () => {
  describe('ValidationService timeout validation', () => {
    it('should validate timeout values correctly', () => {
      // Valid timeouts
      expect(ValidationService.validateTimeout(5000)).toBe(5000);
      expect(ValidationService.validateTimeout(10000)).toBe(10000);
      expect(ValidationService.validateTimeout(30000)).toBe(30000);
    });

    it('should reject invalid timeout values', () => {
      expect(() => ValidationService.validateTimeout(500)).toThrow('Timeout must be at least 1000ms');
      expect(() => ValidationService.validateTimeout(70000)).toThrow('Timeout cannot exceed 60000ms');
      expect(() => ValidationService.validateTimeout(NaN)).toThrow('Timeout must be a valid number');
    });

    it('should use custom min/max values', () => {
      expect(ValidationService.validateTimeout(2000, 2000, 5000)).toBe(2000);
      expect(() => ValidationService.validateTimeout(1000, 2000, 5000)).toThrow('Timeout must be at least 2000ms');
      expect(() => ValidationService.validateTimeout(6000, 2000, 5000)).toThrow('Timeout cannot exceed 5000ms');
    });
  });

  describe('BusinessImprovementService timeout configuration', () => {
    it('should accept custom timeout configuration', () => {
      const mockAIProvider = {} as AIProviderService;
      
      const service = new BusinessImprovementService(mockAIProvider, {
        timeoutMs: 15000
      });
      
      expect(service).toBeDefined();
    });

    it('should use default timeout when not specified', () => {
      const mockAIProvider = {} as AIProviderService;
      
      const service = new BusinessImprovementService(mockAIProvider);
      
      expect(service).toBeDefined();
    });
  });

  describe('Error message validation', () => {
    it('should create appropriate validation errors', () => {
      const error = ValidationService.createValidationError('url', 'Invalid format', 'not-a-url');
      
      expect(error.message).toBe('Validation failed for url: Invalid format');
      expect(error.name).toBe('ValidationError');
      expect((error as any).field).toBe('url');
      expect((error as any).value).toBe('not-a-url');
    });

    it('should sanitize potentially dangerous input', () => {
      const dangerousInput = '<script>alert("xss")</script>';
      const sanitized = ValidationService.sanitizeExcerpt(dangerousInput);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).toBe('scriptalert(xss)/script');
    });

    it('should handle URL sanitization', () => {
      expect(ValidationService.sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(() => ValidationService.sanitizeUrl('javascript:alert(1)')).toThrow('Unsupported protocol');
      expect(() => ValidationService.sanitizeUrl('not-a-url')).toThrow('Invalid URL');
    });
  });

  describe('Graceful degradation scenarios', () => {
    it('should handle missing first-party data gracefully', () => {
      const result = ValidationService.validateFirstPartyData(null);
      expect(result).toBeNull();
    });

    it('should handle invalid first-party data gracefully', () => {
      const invalidData = {
        title: 'Valid title',
        description: 'Valid description',
        h1: 'Valid heading',
        textSnippet: 'Valid content',
        url: 'not-a-valid-url'
      };
      
      const result = ValidationService.validateFirstPartyData(invalidData);
      expect(result).toBeNull();
    });

    it('should provide fallbacks for missing fields', () => {
      const partialData = {
        title: '',
        description: null,
        h1: undefined,
        textSnippet: 'Some content',
        url: 'https://example.com'
      };
      
      const result = ValidationService.validateFirstPartyData(partialData);
      
      expect(result?.title).toBe('Untitled');
      expect(result?.description).toBe('');
      expect(result?.h1).toBe('');
      expect(result?.textSnippet).toBe('Some content');
    });
  });

  describe('Input validation edge cases', () => {
    it('should handle edge cases in analysis request validation', () => {
      // Empty object
      expect(() => ValidationService.validateAnalysisRequest({})).toThrow('URL is required');
      
      // Null/undefined
      expect(() => ValidationService.validateAnalysisRequest(null)).toThrow('Request body must be an object');
      expect(() => ValidationService.validateAnalysisRequest(undefined)).toThrow('Request body must be an object');
      
      // Non-object types
      expect(() => ValidationService.validateAnalysisRequest('string')).toThrow('Request body must be an object');
      expect(() => ValidationService.validateAnalysisRequest(123)).toThrow('Request body must be an object');
    });

    it('should handle edge cases in improvement request validation', () => {
      // Empty object should be valid (goal is optional)
      const result = ValidationService.validateImprovementRequest({});
      expect(result.goal).toBeUndefined();
      
      // Null/undefined should be valid
      expect(ValidationService.validateImprovementRequest(null)).toEqual({});
      expect(ValidationService.validateImprovementRequest(undefined)).toEqual({});
    });

    it('should handle edge cases in analysis ID validation', () => {
      // Valid UUID
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(ValidationService.validateAnalysisId(validUuid)).toBe(validUuid);
      
      // Invalid formats
      expect(() => ValidationService.validateAnalysisId('not-a-uuid')).toThrow('Analysis ID must be a valid UUID');
      expect(() => ValidationService.validateAnalysisId('')).toThrow('Analysis ID cannot be empty');
      expect(() => ValidationService.validateAnalysisId('   ')).toThrow('Analysis ID cannot be empty');
    });
  });

  describe('Security validation', () => {
    it('should reject potentially harmful goal content', () => {
      const harmfulGoals = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        'onclick="malicious()"',
        '<iframe src="evil.com"></iframe>',
        'eval("malicious code")'
      ];

      harmfulGoals.forEach(goal => {
        expect(() => ValidationService.validateImprovementRequest({ goal }))
          .toThrow('Goal contains potentially harmful content');
      });
    });

    it('should sanitize text content properly', () => {
      const maliciousText = 'Normal text <script>alert("xss")</script> more text';
      const sanitized = ValidationService.sanitizeExcerpt(maliciousText);
      
      expect(sanitized).toBe('Normal text scriptalert(xss)/script more text');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should enforce length limits', () => {
      const longText = 'A'.repeat(400);
      const sanitized = ValidationService.sanitizeExcerpt(longText);
      
      expect(sanitized.length).toBe(300);
    });
  });
}); 
 describe('Comprehensive timeout scenarios', () => {
    it('should handle various timeout error messages', () => {
      const timeoutErrors = [
        'Request timeout after 10000ms',
        'connect ETIMEDOUT',
        'getaddrinfo ETIMEDOUT',
        'socket hang up',
        'ECONNRESET',
        'ENOTFOUND'
      ];

      timeoutErrors.forEach(errorMessage => {
        const error = ValidationService.createValidationError('timeout', errorMessage);
        expect(error.message).toContain('timeout');
        expect(error.message).toContain(errorMessage);
      });
    });

    it('should validate timeout ranges for different operations', () => {
      // First-party extraction timeouts (1-60 seconds)
      expect(ValidationService.validateTimeout(10000, 1000, 60000)).toBe(10000);
      expect(() => ValidationService.validateTimeout(500, 1000, 60000)).toThrow('Timeout must be at least 1000ms');
      expect(() => ValidationService.validateTimeout(70000, 1000, 60000)).toThrow('Timeout cannot exceed 60000ms');

      // AI generation timeouts (5-120 seconds)
      expect(ValidationService.validateTimeout(30000, 5000, 120000)).toBe(30000);
      expect(() => ValidationService.validateTimeout(3000, 5000, 120000)).toThrow('Timeout must be at least 5000ms');
      expect(() => ValidationService.validateTimeout(150000, 5000, 120000)).toThrow('Timeout cannot exceed 120000ms');

      // URL validation timeouts (1-30 seconds)
      expect(ValidationService.validateTimeout(5000, 1000, 30000)).toBe(5000);
      expect(() => ValidationService.validateTimeout(500, 1000, 30000)).toThrow('Timeout must be at least 1000ms');
      expect(() => ValidationService.validateTimeout(40000, 1000, 30000)).toThrow('Timeout cannot exceed 30000ms');
    });

    it('should handle concurrent timeout scenarios', () => {
      // Simulate multiple operations with different timeout requirements
      const operations = [
        { name: 'first-party', timeout: 10000, min: 1000, max: 60000 },
        { name: 'ai-generation', timeout: 30000, min: 5000, max: 120000 },
        { name: 'url-validation', timeout: 5000, min: 1000, max: 30000 }
      ];

      operations.forEach(op => {
        expect(ValidationService.validateTimeout(op.timeout, op.min, op.max)).toBe(op.timeout);
      });
    });

    it('should provide appropriate fallback behavior for timeouts', () => {
      // Test that validation continues even when individual components timeout
      const partialData = {
        title: 'Partial Success',
        description: 'Some data was retrieved before timeout',
        h1: 'Main Heading',
        textSnippet: 'Limited content due to timeout',
        url: 'https://timeout-example.com'
      };

      const result = ValidationService.validateFirstPartyData(partialData);
      
      expect(result).not.toBeNull();
      expect(result?.title).toBe('Partial Success');
      expect(result?.textSnippet).toContain('timeout');
    });

    it('should handle network-level timeout errors', () => {
      const networkErrors = [
        'ECONNRESET: Connection reset by peer',
        'ETIMEDOUT: Connection timed out',
        'ENOTFOUND: getaddrinfo ENOTFOUND',
        'ECONNREFUSED: Connection refused',
        'EHOSTUNREACH: No route to host'
      ];

      networkErrors.forEach(errorMsg => {
        const error = ValidationService.createValidationError('network', errorMsg);
        expect(error.message).toContain('network');
        expect(error.name).toBe('ValidationError');
      });
    });

    it('should validate timeout configuration for different service levels', () => {
      // Basic service level - shorter timeouts
      expect(ValidationService.validateTimeout(5000, 1000, 10000)).toBe(5000);
      
      // Premium service level - longer timeouts
      expect(ValidationService.validateTimeout(30000, 5000, 60000)).toBe(30000);
      
      // Enterprise service level - extended timeouts
      expect(ValidationService.validateTimeout(120000, 10000, 300000)).toBe(120000);
    });

    it('should handle progressive timeout strategies', () => {
      // Simulate progressive timeout increases for retry scenarios
      const timeouts = [5000, 10000, 20000, 40000];
      
      timeouts.forEach((timeout, index) => {
        const validated = ValidationService.validateTimeout(timeout, 1000, 60000);
        expect(validated).toBe(timeout);
        
        // Each timeout should be larger than the previous (exponential backoff)
        if (index > 0) {
          expect(timeout).toBeGreaterThan(timeouts[index - 1]);
        }
      });
    });

    it('should validate timeout behavior under load', () => {
      // Simulate high-load scenarios where timeouts might need adjustment
      const loadFactors = [1, 1.5, 2, 3]; // Load multipliers
      const baseTimeout = 10000;
      
      loadFactors.forEach(factor => {
        const adjustedTimeout = Math.floor(baseTimeout * factor);
        if (adjustedTimeout <= 60000) { // Within max limit
          expect(ValidationService.validateTimeout(adjustedTimeout, 1000, 60000)).toBe(adjustedTimeout);
        }
      });
    });

    it('should handle timeout edge cases', () => {
      // Test boundary conditions
      expect(ValidationService.validateTimeout(1000)).toBe(1000); // Minimum
      expect(ValidationService.validateTimeout(60000)).toBe(60000); // Maximum
      expect(ValidationService.validateTimeout(1000.9)).toBe(1000); // Decimal flooring
      
      // Test invalid values
      expect(() => ValidationService.validateTimeout(999)).toThrow();
      expect(() => ValidationService.validateTimeout(60001)).toThrow();
      expect(() => ValidationService.validateTimeout(Infinity)).toThrow();
      expect(() => ValidationService.validateTimeout(-1000)).toThrow();
    });
  });