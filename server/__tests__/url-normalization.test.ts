import { describe, it, expect } from 'vitest';
import { ValidationService } from '../lib/validation';

describe('URL Normalization', () => {
  describe('normalizeUrl', () => {
    it('should prepend https:// to URLs without protocol', () => {
      expect(ValidationService.normalizeUrl('example.com')).toBe('https://example.com');
      expect(ValidationService.normalizeUrl('www.example.com')).toBe('https://www.example.com');
    });

    it('should preserve URLs with http://', () => {
      expect(ValidationService.normalizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should preserve URLs with https://', () => {
      expect(ValidationService.normalizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('should handle URLs with paths', () => {
      expect(ValidationService.normalizeUrl('example.com/path')).toBe('https://example.com/path');
      expect(ValidationService.normalizeUrl('https://example.com/path')).toBe('https://example.com/path');
    });

    it('should trim whitespace', () => {
      expect(ValidationService.normalizeUrl('  example.com  ')).toBe('https://example.com');
      expect(ValidationService.normalizeUrl('  https://example.com  ')).toBe('https://example.com');
    });
  });

  describe('validateAnalysisRequest', () => {
    it('should accept URLs without protocol', () => {
      const result = ValidationService.validateAnalysisRequest({ url: 'example.com' });
      expect(result.url).toBe('https://example.com/');
    });

    it('should accept URLs with https://', () => {
      const result = ValidationService.validateAnalysisRequest({ url: 'https://example.com' });
      expect(result.url).toBe('https://example.com/');
    });

    it('should accept URLs with http://', () => {
      const result = ValidationService.validateAnalysisRequest({ url: 'http://example.com' });
      expect(result.url).toBe('http://example.com/');
    });

    it('should provide clear error message for invalid URLs', () => {
      expect(() => {
        ValidationService.validateAnalysisRequest({ url: 'not a valid url!!!' });
      }).toThrow(/Invalid URL format/);
    });

    it('should handle URLs with subdomains', () => {
      const result = ValidationService.validateAnalysisRequest({ url: 'subdomain.example.com' });
      expect(result.url).toBe('https://subdomain.example.com/');
    });

    it('should handle URLs with ports', () => {
      const result = ValidationService.validateAnalysisRequest({ url: 'example.com:8080' });
      expect(result.url).toBe('https://example.com:8080/');
    });

    it('should reject empty URLs', () => {
      expect(() => {
        ValidationService.validateAnalysisRequest({ url: '' });
      }).toThrow('URL cannot be empty');
    });

    it('should reject missing URLs', () => {
      expect(() => {
        ValidationService.validateAnalysisRequest({});
      }).toThrow('URL is required');
    });
  });
});
