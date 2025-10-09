import Wappalyzer from 'simple-wappalyzer';
import { nanoid } from 'nanoid';
import { PerformanceMonitor } from './performance-monitor.js';

/**
 * Represents a detected technology from Wappalyzer
 */
export interface DetectedTechnology {
  name: string;
  categories: string[];
  confidence: number;
  version?: string;
  website?: string;
  icon?: string;
}

/**
 * Result of technology detection
 */
export interface TechDetectionResult {
  technologies: DetectedTechnology[];
  contentType: string;
  detectedAt: string;
  success: boolean;
  error?: string;
}

/**
 * Structured log entry for tech detection
 */
interface TechDetectionLog {
  requestId: string;
  url: string;
  service: 'tech-detection';
  duration?: number;
  success: boolean;
  technologiesDetected?: number;
  error?: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
}

/**
 * Service for detecting technologies used by websites using Wappalyzer
 */
export class TechDetectionService {
  private readonly timeout: number = 15000; // 15 seconds
  private readonly maxRetries: number = 1; // Single retry on failure
  private readonly performanceMonitor = PerformanceMonitor.getInstance();

  /**
   * Detects technologies used by a website with retry logic
   * @param url - The URL to analyze
   * @returns Detection result or null if detection fails
   */
  async detectTechnologies(url: string): Promise<TechDetectionResult | null> {
    const requestId = nanoid(10);
    const startTime = Date.now();

    try {
      // Validate and sanitize URL
      const sanitizedUrl = this.sanitizeUrl(url);
      if (!sanitizedUrl) {
        this.logError(requestId, url, 'Invalid URL format', 0);
        return null;
      }

      // Attempt detection with retry
      const result = await this.detectWithRetry(sanitizedUrl, requestId, startTime);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logError(requestId, url, (error as Error).message, duration);
      return null;
    }
  }

  /**
   * Attempts detection with retry logic
   */
  private async detectWithRetry(
    url: string,
    requestId: string,
    startTime: number
  ): Promise<TechDetectionResult | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Detection timeout')), this.timeout);
        });

        // Run detection with timeout
        const detectionPromise = this.runDetection(url);
        const technologies = await Promise.race([detectionPromise, timeoutPromise]);

        const duration = Date.now() - startTime;
        this.logSuccess(requestId, url, technologies.length, duration);
        
        // Record performance metrics
        this.performanceMonitor.recordDetection(duration, true, technologies.length, false);

        return {
          technologies,
          contentType: 'text/html',
          detectedAt: new Date().toISOString(),
          success: true,
        };
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on validation errors or if this is the last attempt
        if (this.isValidationError(lastError) || attempt === this.maxRetries) {
          break;
        }

        // Log retry attempt
        this.logRetry(requestId, url, attempt + 1, lastError.message);
        
        // Wait before retry (exponential backoff: 1s, 2s)
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }

    // All attempts failed
    const duration = Date.now() - startTime;
    this.logError(requestId, url, lastError?.message || 'Unknown error', duration);
    
    // Record performance metrics for failure
    this.performanceMonitor.recordDetection(duration, false, 0, false);
    
    return null;
  }

  /**
   * Runs the actual Wappalyzer detection
   */
  private async runDetection(url: string): Promise<DetectedTechnology[]> {
    const wappalyzer = new Wappalyzer();
    const results = await wappalyzer.analyze(url);

    return results.map((tech: any) => ({
      name: tech.name,
      categories: tech.categories || [],
      confidence: tech.confidence || 100,
      version: tech.version,
      website: tech.website,
      icon: tech.icon,
    }));
  }

  /**
   * Validates and sanitizes URL
   */
  private sanitizeUrl(url: string): string | null {
    try {
      // Trim whitespace
      const trimmed = url.trim();
      
      // Check length
      if (trimmed.length === 0 || trimmed.length > 2048) {
        return null;
      }

      // Parse and validate URL
      const parsed = new URL(trimmed);
      
      // Only allow http and https protocols
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return null;
      }

      // Block internal/private IP ranges (basic check)
      const hostname = parsed.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname.startsWith('127.') ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.')
      ) {
        return null;
      }

      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Checks if error is a validation error (should not retry)
   */
  private isValidationError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('invalid url') || message.includes('validation');
  }

  /**
   * Logs successful detection
   */
  private logSuccess(
    requestId: string,
    url: string,
    technologiesDetected: number,
    duration: number
  ): void {
    const log: TechDetectionLog = {
      requestId,
      url,
      service: 'tech-detection',
      duration,
      success: true,
      technologiesDetected,
      timestamp: new Date().toISOString(),
      level: 'INFO',
    };

    // Log warning if detection took longer than 10 seconds
    if (duration > 10000) {
      log.level = 'WARN';
      console.warn('[TechDetection]', JSON.stringify(log));
    } else {
      console.log('[TechDetection]', JSON.stringify(log));
    }
  }

  /**
   * Logs detection error
   */
  private logError(
    requestId: string,
    url: string,
    error: string,
    duration: number
  ): void {
    const log: TechDetectionLog = {
      requestId,
      url,
      service: 'tech-detection',
      duration,
      success: false,
      error,
      timestamp: new Date().toISOString(),
      level: 'ERROR',
    };

    console.error('[TechDetection]', JSON.stringify(log));
  }

  /**
   * Logs retry attempt
   */
  private logRetry(
    requestId: string,
    url: string,
    attempt: number,
    error: string
  ): void {
    const log = {
      requestId,
      url,
      service: 'tech-detection',
      retryAttempt: attempt,
      error,
      timestamp: new Date().toISOString(),
      level: 'WARN',
    };

    console.warn('[TechDetection] Retry attempt', JSON.stringify(log));
  }
}
