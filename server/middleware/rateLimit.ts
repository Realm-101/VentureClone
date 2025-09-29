import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs?: number;  // Default: 5 minutes (300000ms)
  max?: number;       // Default: 20 requests (per requirement 2.5)
  keyGenerator?: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// In-memory storage for rate limiting
const hits = new Map<string, number[]>();

// Cleanup interval to remove expired entries
let cleanupInterval: NodeJS.Timeout | null = null;

export function createRateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'); // 5 minutes default
  const max = options.max || parseInt(process.env.RATE_LIMIT_MAX || '20'); // 20 requests default (requirement 2.5)
  const keyGenerator = options.keyGenerator || ((req: Request) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `${ip}:${userId}`;
  });

  // Start cleanup interval if not already running (enhanced cleanup)
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, timestamps] of Array.from(hits.entries())) {
        // Remove timestamps older than the window
        const validTimestamps = timestamps.filter((timestamp: number) => now - timestamp < windowMs);
        if (validTimestamps.length === 0) {
          hits.delete(key);
          cleanedCount++;
        } else if (validTimestamps.length < timestamps.length) {
          hits.set(key, validTimestamps);
        }
      }
      
      // Log cleanup activity in development
      if (process.env.NODE_ENV === 'development' && cleanedCount > 0) {
        console.log(`Rate limit cleanup: removed ${cleanedCount} expired entries`);
      }
    }, Math.min(windowMs / 4, 60000)); // Run cleanup more frequently, max every minute
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const userHits = hits.get(key) || [];
    
    // Filter out timestamps outside the current window
    const validHits = userHits.filter(timestamp => now - timestamp < windowMs);
    
    if (validHits.length >= max) {
      // Rate limit exceeded (requirement 2.3)
      const requestId = req.requestId || 'unknown';
      return res.status(429).json({
        error: `Too many requests. Maximum ${max} requests allowed per ${Math.floor(windowMs / 1000 / 60)} minutes.`,
        code: 'RATE_LIMITED',
        requestId,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current timestamp and update the map immediately
    validHits.push(now);
    hits.set(key, validHits);
    
    // Track the request completion for optional counting adjustments
    if (options.skipSuccessfulRequests || options.skipFailedRequests) {
      const originalSend = res.send;
      res.send = function(body) {
        const shouldRemove = (
          (options.skipSuccessfulRequests && res.statusCode < 400) ||
          (options.skipFailedRequests && res.statusCode >= 400)
        );
        
        if (shouldRemove) {
          // Remove the timestamp we added earlier
          const currentHits = hits.get(key) || [];
          const updatedHits = currentHits.filter(timestamp => timestamp !== now);
          hits.set(key, updatedHits);
        }
        
        return originalSend.call(this, body);
      };
    }
    
    next();
  };
}

// Export a default rate limiter with environment-configured settings (requirement 2.5)
export const rateLimit = createRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'), // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '20'), // 20 requests per 5 minutes
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// Enhanced cleanup function for graceful shutdown
export function cleanupRateLimit() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  hits.clear();
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Rate limit cleanup completed');
  }
}

// Export function to get current rate limit stats (for monitoring)
export function getRateLimitStats() {
  return {
    activeKeys: hits.size,
    totalRequests: Array.from(hits.values()).reduce((sum, timestamps) => sum + timestamps.length, 0)
  };
}