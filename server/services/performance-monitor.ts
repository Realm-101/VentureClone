/**
 * Performance monitoring service for tech detection
 * Tracks metrics like success rate, average detection time, and fallback rate
 */

interface DetectionMetric {
  timestamp: string;
  duration: number;
  success: boolean;
  technologiesDetected: number;
  isFallback: boolean;
}

interface InsightsMetric {
  timestamp: string;
  duration: number;
  cacheHit: boolean;
}

interface PerformanceStats {
  totalDetections: number;
  successfulDetections: number;
  failedDetections: number;
  fallbackCount: number;
  successRate: number;
  fallbackRate: number;
  averageDetectionTime: number;
  slowDetections: number; // >10 seconds
}

interface InsightsStats {
  totalGenerations: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  averageGenerationTime: number;
  slowGenerations: number; // >500ms
}

/**
 * Singleton service for monitoring tech detection performance
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: DetectionMetric[] = [];
  private insightsMetrics: InsightsMetric[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics in memory
  private readonly slowThreshold = 10000; // 10 seconds
  private readonly insightsSlowThreshold = 500; // 500ms
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Records a detection attempt
   */
  recordDetection(
    duration: number,
    success: boolean,
    technologiesDetected: number = 0,
    isFallback: boolean = false
  ): void {
    const metric: DetectionMetric = {
      timestamp: new Date().toISOString(),
      duration,
      success,
      technologiesDetected,
      isFallback,
    };

    this.metrics.push(metric);

    // Keep only the last N metrics to prevent memory issues
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log warning if detection was slow
    if (duration > this.slowThreshold) {
      console.warn('[PerformanceMonitor] Slow detection detected', {
        duration,
        threshold: this.slowThreshold,
        success,
        timestamp: metric.timestamp,
      });
    }

    // Log periodic stats every 50 detections
    if (this.metrics.length % 50 === 0) {
      this.logStats();
    }
  }

  /**
   * Gets current performance statistics
   */
  getStats(): PerformanceStats {
    if (this.metrics.length === 0) {
      return {
        totalDetections: 0,
        successfulDetections: 0,
        failedDetections: 0,
        fallbackCount: 0,
        successRate: 0,
        fallbackRate: 0,
        averageDetectionTime: 0,
        slowDetections: 0,
      };
    }

    const totalDetections = this.metrics.length;
    const successfulDetections = this.metrics.filter(m => m.success).length;
    const failedDetections = totalDetections - successfulDetections;
    const fallbackCount = this.metrics.filter(m => m.isFallback).length;
    const slowDetections = this.metrics.filter(m => m.duration > this.slowThreshold).length;

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDetectionTime = totalDuration / totalDetections;

    const successRate = (successfulDetections / totalDetections) * 100;
    const fallbackRate = (fallbackCount / totalDetections) * 100;

    return {
      totalDetections,
      successfulDetections,
      failedDetections,
      fallbackCount,
      successRate: Math.round(successRate * 100) / 100,
      fallbackRate: Math.round(fallbackRate * 100) / 100,
      averageDetectionTime: Math.round(averageDetectionTime),
      slowDetections,
    };
  }

  /**
   * Logs current performance statistics
   */
  private logStats(): void {
    const stats = this.getStats();
    console.log('[PerformanceMonitor] Tech Detection Stats', {
      ...stats,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Gets recent metrics (last N)
   */
  getRecentMetrics(count: number = 10): DetectionMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Records an insights generation attempt
   */
  recordInsightsGeneration(duration: number, cacheHit: boolean): void {
    const metric: InsightsMetric = {
      timestamp: new Date().toISOString(),
      duration,
      cacheHit,
    };

    this.insightsMetrics.push(metric);

    // Keep only the last N metrics
    if (this.insightsMetrics.length > this.maxMetrics) {
      this.insightsMetrics.shift();
    }

    // Log warning if generation was slow
    if (!cacheHit && duration > this.insightsSlowThreshold) {
      console.warn('[PerformanceMonitor] Slow insights generation detected', {
        duration,
        threshold: this.insightsSlowThreshold,
        timestamp: metric.timestamp,
      });
    }
  }

  /**
   * Gets insights generation statistics
   */
  getInsightsStats(): InsightsStats {
    if (this.insightsMetrics.length === 0) {
      return {
        totalGenerations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
        averageGenerationTime: 0,
        slowGenerations: 0,
      };
    }

    const totalGenerations = this.insightsMetrics.length;
    const cacheHits = this.insightsMetrics.filter(m => m.cacheHit).length;
    const cacheMisses = totalGenerations - cacheHits;
    const slowGenerations = this.insightsMetrics.filter(
      m => !m.cacheHit && m.duration > this.insightsSlowThreshold
    ).length;

    const totalDuration = this.insightsMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageGenerationTime = totalDuration / totalGenerations;

    const cacheHitRate = (cacheHits / totalGenerations) * 100;

    return {
      totalGenerations,
      cacheHits,
      cacheMisses,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageGenerationTime: Math.round(averageGenerationTime),
      slowGenerations,
    };
  }

  /**
   * Start periodic monitoring and logging
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    // Log stats every 5 minutes
    this.monitoringInterval = setInterval(() => {
      const detectionStats = this.getStats();
      const insightsStats = this.getInsightsStats();

      if (detectionStats.totalDetections > 0 || insightsStats.totalGenerations > 0) {
        console.log('[PerformanceMonitor] Periodic Stats Report', {
          detection: detectionStats,
          insights: insightsStats,
          timestamp: new Date().toISOString(),
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Stop periodic monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Resets all metrics (useful for testing)
   */
  reset(): void {
    this.metrics = [];
    this.insightsMetrics = [];
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();
