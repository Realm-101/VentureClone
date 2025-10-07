import { z } from "zod";
import { zSource, type Source, type EnhancedStructuredAnalysis, type FirstPartyData } from "@shared/schema";

/**
 * Validation service for confidence scoring and source attribution
 * Implements requirements 1.1, 1.3, 1.6, 4.2
 */
export class ValidationService {
  /**
   * Validates confidence score is within 0-1 range
   * Requirement 1.1: Confidence score between 0 and 1
   */
  static validateConfidenceScore(confidence: unknown): number | undefined {
    if (confidence === undefined || confidence === null) {
      return undefined;
    }

    if (typeof confidence !== 'number') {
      throw new Error(`Invalid confidence score type: expected number, got ${typeof confidence}`);
    }

    if (isNaN(confidence)) {
      throw new Error('Confidence score cannot be NaN');
    }

    if (confidence < 0 || confidence > 1) {
      throw new Error(`Confidence score must be between 0 and 1, got ${confidence}`);
    }

    return confidence;
  }

  /**
   * Validates source URL and excerpt according to schema requirements
   * Requirement 1.6: Sources include URL and 10-300 character excerpt
   */
  static validateSource(source: unknown): Source {
    try {
      return zSource.parse(source);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
        throw new Error(`Invalid source format: ${issues}`);
      }
      throw new Error(`Source validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates array of sources
   * Requirement 1.3: Source URLs and excerpts for claims
   */
  static validateSources(sources: unknown): Source[] {
    if (!Array.isArray(sources)) {
      throw new Error(`Sources must be an array, got ${typeof sources}`);
    }

    return sources.map((source, index) => {
      try {
        return this.validateSource(source);
      } catch (error) {
        throw new Error(`Source at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  }

  /**
   * Automatically adds target site as first-party source if not already present
   * Requirement 1.6: Target site included as source for claims
   */
  static addTargetSiteAsSource(
    sources: Source[], 
    targetUrl: string, 
    firstPartyData?: { title: string; description: string; h1: string; textSnippet: string }
  ): Source[] {
    // Check if target site is already in sources
    const targetDomain = new URL(targetUrl).origin;
    const hasTargetSource = sources.some(source => {
      try {
        const sourceDomain = new URL(source.url).origin;
        return sourceDomain === targetDomain;
      } catch {
        return false;
      }
    });

    // If target site not in sources and we have first-party data, add it
    if (!hasTargetSource && firstPartyData) {
      const excerpt = this.createFirstPartyExcerpt(firstPartyData);
      if (excerpt.length >= 10 && excerpt.length <= 300) {
        sources.unshift({
          url: targetUrl,
          excerpt: excerpt
        });
      }
    }

    return sources;
  }

  /**
   * Creates an excerpt from first-party data for source attribution
   */
  private static createFirstPartyExcerpt(firstPartyData: { title: string; description: string; h1: string; textSnippet: string }): string {
    // Prioritize description, then h1, then title, then text snippet
    const candidates = [
      firstPartyData.description,
      firstPartyData.h1,
      firstPartyData.title,
      firstPartyData.textSnippet
    ].filter(text => text && text.trim().length > 0);

    for (const candidate of candidates) {
      const trimmed = candidate.trim();
      if (trimmed.length >= 10 && trimmed.length <= 300) {
        return trimmed;
      }
      if (trimmed.length > 300) {
        return trimmed.substring(0, 297) + '...';
      }
    }

    // If no suitable excerpt found, return empty string
    return '';
  }

  /**
   * Validates and sanitizes enhanced structured analysis response
   * Implements comprehensive validation for confidence scores and sources
   */
  static validateEnhancedAnalysis(
    rawAnalysis: unknown, 
    targetUrl: string, 
    firstPartyData?: { title: string; description: string; h1: string; textSnippet: string }
  ): EnhancedStructuredAnalysis {
    if (!rawAnalysis || typeof rawAnalysis !== 'object') {
      throw new Error('Analysis must be an object');
    }

    const analysis = rawAnalysis as any;

    // Validate confidence score in technical section
    if (analysis.technical?.confidence !== undefined) {
      try {
        analysis.technical.confidence = this.validateConfidenceScore(analysis.technical.confidence);
      } catch (error) {
        console.warn(`Confidence score validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Remove invalid confidence score rather than failing the entire analysis
        delete analysis.technical.confidence;
      }
    }

    // Validate source URLs in data section
    if (analysis.data?.trafficEstimates?.source) {
      try {
        new URL(analysis.data.trafficEstimates.source);
      } catch (error) {
        console.warn(`Invalid traffic estimates source URL: ${analysis.data.trafficEstimates.source}`);
        delete analysis.data.trafficEstimates.source;
      }
    }

    if (analysis.data?.keyMetrics) {
      analysis.data.keyMetrics = analysis.data.keyMetrics.map((metric: any, index: number) => {
        if (metric.source) {
          try {
            new URL(metric.source);
          } catch (error) {
            console.warn(`Invalid key metric source URL at index ${index}: ${metric.source}`);
            delete metric.source;
          }
        }
        return metric;
      });
    }

    // Validate sources array
    if (analysis.sources) {
      try {
        analysis.sources = this.validateSources(analysis.sources);
      } catch (error) {
        console.warn(`Sources validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Set to empty array if validation fails
        analysis.sources = [];
      }
    } else {
      analysis.sources = [];
    }

    // Add target site as first-party source
    analysis.sources = this.addTargetSiteAsSource(analysis.sources, targetUrl, firstPartyData);

    return analysis as EnhancedStructuredAnalysis;
  }

  /**
   * Checks if confidence score indicates speculative analysis
   * Requirement 1.2: Display "Speculative" badge when confidence < 0.6
   */
  static isSpeculative(confidence?: number): boolean {
    return confidence !== undefined && confidence < 0.6;
  }

  /**
   * Normalizes URL by auto-prepending https:// if no protocol is present
   * Requirement 9.1, 9.2, 9.3: Accept URLs with or without protocol
   */
  static normalizeUrl(url: string): string {
    const trimmed = url.trim();
    
    // Already has protocol
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    
    // Prepend https://
    return `https://${trimmed}`;
  }

  /**
   * Sanitizes URL to prevent XSS attacks
   */
  static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error(`Unsupported protocol: ${parsed.protocol}`);
      }
      return parsed.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sanitizes excerpt text to prevent injection attacks
   */
  static sanitizeExcerpt(excerpt: string): string {
    if (typeof excerpt !== 'string') {
      throw new Error('Excerpt must be a string');
    }

    // Remove potentially dangerous characters and limit length
    return excerpt
      .replace(/[<>'"&]/g, '') // Remove HTML/script injection characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 300); // Enforce max length
  }

  /**
   * Validates API input parameters for analysis requests
   * Requirements 9.4, 9.5: Use normalized URL and provide clear error messages
   */
  static validateAnalysisRequest(body: any): { url: string; goal?: string } {
    if (!body || typeof body !== 'object') {
      throw new Error('Request body must be an object');
    }

    // Validate URL
    if (body.url === undefined || body.url === null) {
      throw new Error('URL is required');
    }

    if (typeof body.url !== 'string') {
      throw new Error('URL must be a string');
    }

    const trimmedUrl = body.url.trim();
    if (trimmedUrl.length === 0) {
      throw new Error('URL cannot be empty');
    }

    // Normalize URL (auto-prepend https:// if needed)
    const normalizedUrl = this.normalizeUrl(trimmedUrl);

    // Validate URL format and sanitize
    let sanitizedUrl: string;
    try {
      sanitizedUrl = this.sanitizeUrl(normalizedUrl);
    } catch (error) {
      // Provide clear error message for invalid URLs
      throw new Error(
        `Invalid URL format. Please enter a valid website URL (e.g., example.com or https://example.com). ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }

    // Validate goal if provided
    if (body.goal !== undefined) {
      if (typeof body.goal !== 'string') {
        throw new Error('Goal must be a string if provided');
      }

      const trimmedGoal = body.goal.trim();
      if (trimmedGoal.length === 0) {
        throw new Error('Goal cannot be empty if provided');
      }

      if (trimmedGoal.length > 500) {
        throw new Error('Goal cannot exceed 500 characters');
      }

      return { url: sanitizedUrl, goal: trimmedGoal };
    }

    return { url: sanitizedUrl };
  }

  /**
   * Validates improvement request parameters
   */
  static validateImprovementRequest(body: any): { goal?: string } {
    if (!body || typeof body !== 'object') {
      return {}; // Goal is optional, so empty body is valid
    }

    if (body.goal !== undefined) {
      if (typeof body.goal !== 'string') {
        throw new Error('Goal must be a string if provided');
      }

      const trimmedGoal = body.goal.trim();
      if (trimmedGoal.length === 0) {
        throw new Error('Goal cannot be empty if provided');
      }

      if (trimmedGoal.length > 500) {
        throw new Error('Goal cannot exceed 500 characters');
      }

      // Check for potentially harmful content
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /eval\s*\(/i
      ];

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmedGoal)) {
          throw new Error('Goal contains potentially harmful content');
        }
      }

      return { goal: trimmedGoal };
    }

    return {};
  }

  /**
   * Validates analysis ID parameter
   */
  static validateAnalysisId(id: string): string {
    if (id === null || id === undefined) {
      throw new Error('Analysis ID is required');
    }

    if (typeof id !== 'string') {
      throw new Error('Analysis ID must be a string');
    }

    const trimmedId = id.trim();
    if (trimmedId.length === 0) {
      throw new Error('Analysis ID cannot be empty');
    }

    // Basic UUID format validation (UUIDs are used as IDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      throw new Error('Analysis ID must be a valid UUID');
    }

    return trimmedId;
  }

  /**
   * Validates timeout values
   */
  static validateTimeout(timeoutMs: number, min: number = 1000, max: number = 60000): number {
    if (typeof timeoutMs !== 'number' || isNaN(timeoutMs)) {
      throw new Error('Timeout must be a valid number');
    }

    if (timeoutMs < min) {
      throw new Error(`Timeout must be at least ${min}ms`);
    }

    if (timeoutMs > max) {
      throw new Error(`Timeout cannot exceed ${max}ms`);
    }

    return Math.floor(timeoutMs);
  }

  /**
   * Validates and sanitizes first-party data
   */
  static validateFirstPartyData(data: any): FirstPartyData | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    try {
      const validated: FirstPartyData = {
        title: this.sanitizeText(data.title, 200, 'Untitled'),
        description: this.sanitizeText(data.description, 300, ''),
        h1: this.sanitizeText(data.h1, 200, ''),
        textSnippet: this.sanitizeText(data.textSnippet, 500, ''),
        url: this.sanitizeUrl(data.url)
      };

      return validated;
    } catch (error) {
      console.warn('First-party data validation failed:', error);
      return null;
    }
  }

  /**
   * Sanitizes text fields with length limits and fallbacks
   */
  private static sanitizeText(text: any, maxLength: number, fallback: string = ''): string {
    if (typeof text !== 'string') {
      return fallback;
    }

    return text
      .replace(/[<>'"&]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, maxLength) || fallback;
  }

  /**
   * Creates a comprehensive validation error with details
   */
  static createValidationError(field: string, message: string, value?: any): Error {
    const error = new Error(`Validation failed for ${field}: ${message}`);
    error.name = 'ValidationError';
    (error as any).field = field;
    (error as any).value = value;
    return error;
  }
}