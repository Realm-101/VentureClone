import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TechDetectionService } from '../services/tech-detection';
import Wappalyzer from 'simple-wappalyzer';

// Mock simple-wappalyzer
vi.mock('simple-wappalyzer');

describe('TechDetectionService', () => {
  let service: TechDetectionService;
  let mockWappalyzer: any;

  beforeEach(() => {
    service = new TechDetectionService();
    
    // Create mock Wappalyzer instance
    mockWappalyzer = {
      analyze: vi.fn(),
    };
    
    // Mock the Wappalyzer constructor
    vi.mocked(Wappalyzer).mockImplementation(() => mockWappalyzer);
    
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Successful Detection', () => {
    it('should successfully detect technologies with mock responses', async () => {
      const mockTechnologies = [
        {
          name: 'React',
          categories: ['JavaScript frameworks'],
          confidence: 100,
          version: '18.2.0',
          website: 'https://react.dev',
          icon: 'React.svg',
        },
        {
          name: 'Next.js',
          categories: ['Web frameworks'],
          confidence: 95,
          version: '13.4.1',
          website: 'https://nextjs.org',
          icon: 'Next.js.svg',
        },
      ];

      mockWappalyzer.analyze.mockResolvedValue(mockTechnologies);

      const result = await service.detectTechnologies('https://example.com');

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.technologies).toHaveLength(2);
      expect(result?.technologies[0].name).toBe('React');
      expect(result?.technologies[0].version).toBe('18.2.0');
      expect(result?.technologies[1].name).toBe('Next.js');
      expect(result?.contentType).toBe('text/html');
      expect(result?.detectedAt).toBeDefined();
    });

    it('should handle technologies without versions', async () => {
      const mockTechnologies = [
        {
          name: 'Google Analytics',
          categories: ['Analytics'],
          confidence: 100,
          website: 'https://analytics.google.com',
        },
      ];

      mockWappalyzer.analyze.mockResolvedValue(mockTechnologies);

      const result = await service.detectTechnologies('https://example.com');

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.technologies[0].version).toBeUndefined();
    });

    it('should handle empty technology list', async () => {
      mockWappalyzer.analyze.mockResolvedValue([]);

      const result = await service.detectTechnologies('https://example.com');

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(result?.technologies).toHaveLength(0);
    });

    it('should log warning for slow detection (>10 seconds)', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Mock a detection that takes 11 seconds (slow but not timeout)
      mockWappalyzer.analyze.mockImplementation(() => {
        return new Promise((resolve) => {
          // Simulate slow response
          setTimeout(() => resolve([{ name: 'React', categories: [], confidence: 100 }]), 11000);
        });
      });

      const result = await service.detectTechnologies('https://example.com');

      expect(result).not.toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    }, 15000); // Increase timeout for this test
  });

  describe('Timeout Scenarios', () => {
    it('should timeout and return null', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a detection that never resolves (simulates timeout)
      mockWappalyzer.analyze.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves - will trigger timeout
        });
      });

      const result = await service.detectTechnologies('https://example.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      const errorLog = consoleErrorSpy.mock.calls[0][1];
      expect(errorLog).toContain('timeout');
      
      consoleErrorSpy.mockRestore();
    }, 35000); // Increase timeout to allow for retry logic (15s + 1s + 15s + buffer)

    it('should log error on timeout', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a detection that never resolves
      mockWappalyzer.analyze.mockImplementation(() => {
        return new Promise(() => {
          // Never resolves - will trigger timeout
        });
      });

      const result = await service.detectTechnologies('https://slow-website.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      const errorLog = consoleErrorSpy.mock.calls[0][1];
      expect(errorLog).toContain('Detection timeout');
      
      consoleErrorSpy.mockRestore();
    }, 35000); // Increase timeout to allow for retry logic
  });

  describe('Network Error Handling', () => {
    it('should handle network errors and return null', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWappalyzer.analyze.mockRejectedValue(new Error('Network error: ECONNREFUSED'));

      const result = await service.detectTechnologies('https://example.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should retry once on network failure', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // First call fails, second succeeds
      mockWappalyzer.analyze
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce([{ name: 'React', categories: [], confidence: 100 }]);

      const result = await service.detectTechnologies('https://example.com');

      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
      expect(mockWappalyzer.analyze).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });

    it('should return null after retry fails', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Both attempts fail
      mockWappalyzer.analyze.mockRejectedValue(new Error('Network error'));

      const result = await service.detectTechnologies('https://example.com');

      expect(result).toBeNull();
      expect(mockWappalyzer.analyze).toHaveBeenCalledTimes(2);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle DNS resolution errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWappalyzer.analyze.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

      const result = await service.detectTechnologies('https://nonexistent-domain-12345.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle connection timeout errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWappalyzer.analyze.mockRejectedValue(new Error('ETIMEDOUT'));

      const result = await service.detectTechnologies('https://example.com');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Invalid URL Handling', () => {
    it('should reject invalid URLs', async () => {
      const result = await service.detectTechnologies('not-a-url');
      expect(result).toBeNull();
    });

    it('should reject empty URLs', async () => {
      const result = await service.detectTechnologies('');
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
        'http://172.31.255.255',
      ];

      for (const ip of privateIps) {
        const result = await service.detectTechnologies(ip);
        expect(result).toBeNull();
      }
    });

    it('should reject non-http(s) protocols', async () => {
      const invalidProtocols = [
        'ftp://example.com',
        'file:///etc/passwd',
        'javascript:alert(1)',
      ];

      for (const url of invalidProtocols) {
        const result = await service.detectTechnologies(url);
        expect(result).toBeNull();
      }
    });

    it('should accept valid public URLs', async () => {
      mockWappalyzer.analyze.mockResolvedValue([]);
      
      const result = await service.detectTechnologies('https://example.com');
      
      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
    });

    it('should trim whitespace from URLs', async () => {
      mockWappalyzer.analyze.mockResolvedValue([]);
      
      const result = await service.detectTechnologies('  https://example.com  ');
      
      expect(result).not.toBeNull();
      expect(result?.success).toBe(true);
    });

    it('should not retry on validation errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = await service.detectTechnologies('not-a-url');

      expect(result).toBeNull();
      // Should not call Wappalyzer at all for invalid URLs
      expect(mockWappalyzer.analyze).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Logging', () => {
    it('should log successful detection with metrics', async () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      mockWappalyzer.analyze.mockResolvedValue([
        { name: 'React', categories: [], confidence: 100 },
      ]);

      await service.detectTechnologies('https://example.com');

      expect(consoleLogSpy).toHaveBeenCalled();
      const logMessage = consoleLogSpy.mock.calls[0][1];
      expect(logMessage).toContain('tech-detection');
      expect(logMessage).toContain('success');
      expect(logMessage).toContain('technologiesDetected');
      
      consoleLogSpy.mockRestore();
    });

    it('should log errors with request ID', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockWappalyzer.analyze.mockRejectedValue(new Error('Test error'));

      await service.detectTechnologies('https://example.com');

      expect(consoleErrorSpy).toHaveBeenCalled();
      const errorLog = consoleErrorSpy.mock.calls[0][1];
      expect(errorLog).toContain('requestId');
      expect(errorLog).toContain('error');
      
      consoleErrorSpy.mockRestore();
    });
  });
});
