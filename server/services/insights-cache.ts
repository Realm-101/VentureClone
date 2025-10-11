/**
 * Insights Cache Service
 * 
 * Provides in-memory caching for technology insights with TTL management.
 * Implements cache warming for common technologies and performance monitoring.
 */

import type { TechnologyInsights } from './technology-insights';

interface CachedInsights {
  insights: TechnologyInsights;
  timestamp: number;
  analysisId: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
}

export class InsightsCache {
  private static instance: InsightsCache;
  private cache = new Map<string, CachedInsights>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  };

  // Common technology combinations for cache warming
  private readonly COMMON_TECH_PATTERNS = [
    ['React', 'Node.js', 'PostgreSQL'],
    ['Next.js', 'Vercel', 'Supabase'],
    ['Vue.js', 'Express', 'MongoDB'],
    ['Angular', 'NestJS', 'MySQL'],
    ['Svelte', 'Firebase', 'Firestore']
  ];

  private constructor() {
    // Start cleanup interval
    this.startCleanupInterval();
  }

  static getInstance(): InsightsCache {
    if (!this.instance) {
      this.instance = new InsightsCache();
    }
    return this.instance;
  }

  /**
   * Generate cache key from technology names
   */
  private generateKey(technologies: string[]): string {
    return technologies
      .map(t => t.toLowerCase().trim())
      .sort()
      .join('|');
  }

  /**
   * Get cached insights for a set of technologies
   */
  get(technologies: string[]): TechnologyInsights | null {
    const key = this.generateKey(technologies);
    const cached = this.cache.get(key);

    if (!cached) {
      this.stats.misses++;
      this.logCacheEvent('miss', key);
      return null;
    }

    // Check if cache entry has expired
    const age = Date.now() - cached.timestamp;
    if (age > this.TTL) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.logCacheEvent('expired', key, age);
      return null;
    }

    this.stats.hits++;
    this.logCacheEvent('hit', key, age);
    return cached.insights;
  }

  /**
   * Store insights in cache
   */
  set(technologies: string[], insights: TechnologyInsights, analysisId: string): void {
    const key = this.generateKey(technologies);
    
    this.cache.set(key, {
      insights,
      timestamp: Date.now(),
      analysisId
    });

    this.stats.size = this.cache.size;
    this.logCacheEvent('set', key);
  }

  /**
   * Warm cache with common technology patterns
   */
  async warmCache(insightsGenerator: (techs: string[]) => Promise<TechnologyInsights>): Promise<void> {
    console.log('[InsightsCache] Starting cache warming...');
    const startTime = Date.now();

    for (const techPattern of this.COMMON_TECH_PATTERNS) {
      try {
        // Check if already cached
        if (this.get(techPattern)) {
          continue;
        }

        // Generate and cache insights
        const insights = await insightsGenerator(techPattern);
        this.set(techPattern, insights, 'cache-warming');
        
        console.log(`[InsightsCache] Warmed cache for: ${techPattern.join(', ')}`);
      } catch (error) {
        console.error(`[InsightsCache] Failed to warm cache for ${techPattern.join(', ')}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[InsightsCache] Cache warming completed in ${duration}ms`);
  }

  /**
   * Clear all cached entries
   */
  clear(): void {
    const previousSize = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    console.log(`[InsightsCache] Cleared ${previousSize} cache entries`);
  }

  /**
   * Clear expired entries
   */
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, cached] of entries) {
      const age = now - cached.timestamp;
      if (age > this.TTL) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      this.stats.evictions += cleared;
      this.stats.size = this.cache.size;
      console.log(`[InsightsCache] Cleared ${cleared} expired entries`);
    }

    return cleared;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: this.cache.size
    };
  }

  /**
   * Log cache events with structured format
   */
  private logCacheEvent(event: 'hit' | 'miss' | 'set' | 'expired', key: string, age?: number): void {
    const logData = {
      service: 'insights-cache',
      event,
      key: key.substring(0, 50), // Truncate long keys
      age: age ? Math.round(age / 1000) : undefined, // Convert to seconds
      stats: this.getStats(),
      timestamp: new Date().toISOString()
    };

    // Only log misses and expired entries to reduce noise
    if (event === 'miss' || event === 'expired') {
      console.log(JSON.stringify(logData));
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanupInterval(): void {
    // Run cleanup every hour
    setInterval(() => {
      this.clearExpired();
    }, 60 * 60 * 1000);
  }

  /**
   * Get cache entry age in milliseconds
   */
  getEntryAge(technologies: string[]): number | null {
    const key = this.generateKey(technologies);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    return Date.now() - cached.timestamp;
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(technologies: string[]): boolean {
    const key = this.generateKey(technologies);
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }

    const age = Date.now() - cached.timestamp;
    return age <= this.TTL;
  }
}

// Export singleton instance
export const insightsCache = InsightsCache.getInstance();
