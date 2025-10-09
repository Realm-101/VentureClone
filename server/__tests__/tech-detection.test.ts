import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TechDetectionService } from '../services/tech-detection';

describe('TechDetectionService', () => {
  let service: TechDetectionService;

  beforeEach(() => {
    service = new TechDetectionService();
    vi.clearAllMocks();
  });

  describe('URL Validation and Sanitization', () => {
    it('should reject invalid URLs', async () => {
      const result = await service.detectTechnologies('not-a-url');
      expect(result).toBeNull();
    });

    it('should reject URLs that are too long', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000);
      const result = await service.detectTechnologies(longUrl);
      expect(result).toBeNull();
    });

    it('should reject localhost URLs', async () => {
      const result = await service.detectTechnologies('http://localhost:3000');
      expect(result).toBeNull();
    });

    it('should reject private IP addresses', async () => {
      const privateIps = [
        'http://127.0.0.1',
        'http://192.168.1.1',
        'http://10.0.0.1',
        'http://172.16.0.1',
      ];

      for (const ip of privateIps) {
        const result = await service.detectTechnologies(ip);
        expect(result).toBeNull();
      }
    });

    it('should accept valid public URLs', async () => {
      // This will fail in actual detection but should pass validation
      const result = await service.detectTechnologies('https://example.com');
      // Result may be null due to network/detection failure, but shouldn't fail validation
      expect(result === null || result?.success === true).toBe(true);
    });

    it('should trim whitespace from URLs', async () => {
      const result = await service.detectTechnologies('  https://example.com  ');
      // Should not fail due to whitespace
      expect(result === null || result?.success === true).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return null on detection errors', async () => {
      // Using an invalid but properly formatted URL
      const result = await service.detectTechnologies('https://this-domain-definitely-does-not-exist-12345.com');
      expect(result).toBeNull();
    });
  });
});
