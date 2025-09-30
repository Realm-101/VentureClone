import { z } from "zod";
import { zSource, type Source, type EnhancedStructuredAnalysis } from "@shared/schema";

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
    // Remove potentially dangerous characters and limit length
    return excerpt
      .replace(/[<>'"&]/g, '') // Remove HTML/script injection characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 300); // Enforce max length
  }
}