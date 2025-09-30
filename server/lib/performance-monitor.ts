/**
 * Performance monitoring utilities for the enhanced analysis system
 * Tracks key metrics and provides insights into system performance
 */

export interface PerformanceMetrics {
  firstPartyExtractionTime: number;
  aiAnalysisTime: number;
  improvementGenerationTime: number;
  totalRequestTime: number;
  concurrentRequests: number;
  errorRate: number;
}

export interface PerformanceThresholds {
  firstPartyExtractionMax: number; // 8 seconds
  aiAnalysisMax: number; // 15 seconds
  improvementGenerationMax: number; // 30 seconds
  totalRequestMax: number; // 45 seconds
  maxConcurrentRequests: number; // 5
  maxErrorRate: number; // 0.1 (10%)
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetricsHistory = 1000;
  private readonly thresholds: PerformanceThresholds = {
    firstPartyExtractionMax: 8000,
    aiAnalysisMax: 15000,
    improvementGenerationMax: 30000,
    totalRequestMax: 45000,
    maxConcurrentRequests: 5,
    maxErrorRate: 0.1
  };

  /**
   * Record performance metrics for a request
   */
  recordMetrics(metrics: PerformanceMetrics): void {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    } as any);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Log warnings for threshold violations
    this.checkThresholds(metrics);
  }

  /**
   * Check if metrics exceed performance thresholds
   */
  private checkThresholds(metrics: PerformanceMetrics): void {
    if (metrics.firstPartyExtractionTime > this.thresholds.firstPartyExtractionMax) {
      console.warn(`First-party extraction slow: ${metrics.firstPartyExtractionTime}ms (threshold: ${this.thresholds.firstPartyExtractionMax}ms)`);
    }

    if (metrics.aiAnalysisTime > this.thresholds.aiAnalysisMax) {
      console.warn(`AI analysis slow: ${metrics.aiAnalysisTime}ms (threshold: ${this.thresholds.aiAnalysisMax}ms)`);
    }

    if (metrics.improvementGenerationTime > this.thresholds.improvementGenerationMax) {
      console.warn(`Improvement generation slow: ${metrics.improvementGenerationTime}ms (threshold: ${this.thresholds.improvementGenerationMax}ms)`);
    }

    if (metrics.totalRequestTime > this.thresholds.totalRequestMax) {
      console.warn(`Total request slow: ${metrics.totalRequestTime}ms (threshold: ${this.thresholds.totalRequestMax}ms)`);
    }

    if (metrics.concurrentRequests > this.thresholds.maxConcurrentRequests) {
      console.warn(`High concurrent requests: ${metrics.concurrentRequests} (threshold: ${this.thresholds.maxConcurrentRequests})`);
    }

    if (metrics.errorRate > this.thresholds.maxErrorRate) {
      console.warn(`High error rate: ${(metrics.errorRate * 100).toFixed(1)}% (threshold: ${(this.thresholds.maxErrorRate * 100).toFixed(1)}%)`);
    }
  }

  /**
   * Get performance statistics for the last N requests
   */
  getStats(lastN: number = 100): {
    avgFirstPartyTime: number;
    avgAiAnalysisTime: number;
    avgImprovementTime: number;
    avgTotalTime: number;
    avgConcurrentRequests: number;
    errorRate: number;
    p95TotalTime: number;
    p99TotalTime: number;
  } {
    const recentMetrics = this.metrics.slice(-lastN);
    
    if (recentMetrics.length === 0) {
      return {
        avgFirstPartyTime: 0,
        avgAiAnalysisTime: 0,
        avgImprovementTime: 0,
        avgTotalTime: 0,
        avgConcurrentRequests: 0,
        errorRate: 0,
        p95TotalTime: 0,
        p99TotalTime: 0
      };
    }

    const totalTimes = recentMetrics.map(m => m.totalRequestTime).sort((a, b) => a - b);
    const p95Index = Math.floor(totalTimes.length * 0.95);
    const p99Index = Math.floor(totalTimes.length * 0.99);

    return {
      avgFirstPartyTime: recentMetrics.reduce((sum, m) => sum + m.firstPartyExtractionTime, 0) / recentMetrics.length,
      avgAiAnalysisTime: recentMetrics.reduce((sum, m) => sum + m.aiAnalysisTime, 0) / recentMetrics.length,
      avgImprovementTime: recentMetrics.reduce((sum, m) => sum + m.improvementGenerationTime, 0) / recentMetrics.length,
      avgTotalTime: recentMetrics.reduce((sum, m) => sum + m.totalRequestTime, 0) / recentMetrics.length,
      avgConcurrentRequests: recentMetrics.reduce((sum, m) => sum + m.concurrentRequests, 0) / recentMetrics.length,
      errorRate: recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length,
      p95TotalTime: totalTimes[p95Index] || 0,
      p99TotalTime: totalTimes[p99Index] || 0
    };
  }

  /**
   * Check if system is performing within acceptable limits
   */
  isPerformanceHealthy(lastN: number = 50): boolean {
    const stats = this.getStats(lastN);
    
    return (
      stats.avgFirstPartyTime <= this.thresholds.firstPartyExtractionMax &&
      stats.avgAiAnalysisTime <= this.thresholds.aiAnalysisMax &&
      stats.avgImprovementTime <= this.thresholds.improvementGenerationMax &&
      stats.p95TotalTime <= this.thresholds.totalRequestMax &&
      stats.avgConcurrentRequests <= this.thresholds.maxConcurrentRequests &&
      stats.errorRate <= this.thresholds.maxErrorRate
    );
  }

  /**
   * Get performance health report
   */
  getHealthReport(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    stats: ReturnType<typeof this.getStats>;
  } {
    const stats = this.getStats();
    const issues: string[] = [];

    if (stats.avgFirstPartyTime > this.thresholds.firstPartyExtractionMax) {
      issues.push(`First-party extraction averaging ${Math.round(stats.avgFirstPartyTime)}ms (threshold: ${this.thresholds.firstPartyExtractionMax}ms)`);
    }

    if (stats.avgAiAnalysisTime > this.thresholds.aiAnalysisMax) {
      issues.push(`AI analysis averaging ${Math.round(stats.avgAiAnalysisTime)}ms (threshold: ${this.thresholds.aiAnalysisMax}ms)`);
    }

    if (stats.avgImprovementTime > this.thresholds.improvementGenerationMax) {
      issues.push(`Improvement generation averaging ${Math.round(stats.avgImprovementTime)}ms (threshold: ${this.thresholds.improvementGenerationMax}ms)`);
    }

    if (stats.p95TotalTime > this.thresholds.totalRequestMax) {
      issues.push(`95th percentile total time ${Math.round(stats.p95TotalTime)}ms (threshold: ${this.thresholds.totalRequestMax}ms)`);
    }

    if (stats.errorRate > this.thresholds.maxErrorRate) {
      issues.push(`Error rate ${(stats.errorRate * 100).toFixed(1)}% (threshold: ${(this.thresholds.maxErrorRate * 100).toFixed(1)}%)`);
    }

    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (issues.length === 0) {
      status = 'healthy';
    } else if (issues.length <= 2) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return { status, issues, stats };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Utility function to measure execution time
 */
export function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  return fn().then(result => ({
    result,
    duration: Date.now() - start
  }));
}

/**
 * Decorator for measuring function execution time
 */
export function timed(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = Date.now();
    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - start;
      console.log(`${propertyName} completed in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`${propertyName} failed after ${duration}ms`);
      throw error;
    }
  };
}