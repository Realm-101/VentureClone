import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs?: number;  // Default: 5 minutes (300000ms)
  max?: number;       // Default: 10 requests
}

// In-memory storage for rate limiting
const hits = new Map<string, number[]>();

// Cleanup interval to remove expired entries
let cleanupInterval: NodeJS.Timeout | null = null;

export function createRateLimit(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'); // 5 minutes default
  const max = options.max || parseInt(process.env.RATE_LIMIT_MAX || '10'); // 10 requests default

  // Start cleanup interval if not already running
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, timestamps] of Array.from(hits.entries())) {
        // Remove timestamps older than the window
        const validTimestamps = timestamps.filter((timestamp: number) => now - timestamp < windowMs);
        if (validTimestamps.length === 0) {
          hits.delete(key);
        } else {
          hits.set(key, validTimestamps);
        }
      }
    }, windowMs / 2); // Run cleanup every half window
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    const key = `${ip}:${userId}`;
    
    const now = Date.now();
    const userHits = hits.get(key) || [];
    
    // Filter out timestamps outside the current window
    const validHits = userHits.filter(timestamp => now - timestamp < windowMs);
    
    if (validHits.length >= max) {
      // Rate limit exceeded
      const requestId = req.requestId || 'unknown';
      return res.status(429).json({
        error: `Too many requests. Maximum ${max} requests allowed per ${Math.floor(windowMs / 1000 / 60)} minutes.`,
        code: 'RATE_LIMITED',
        requestId
      });
    }
    
    // Add current timestamp and update the map
    validHits.push(now);
    hits.set(key, validHits);
    
    next();
  };
}

// Export a default rate limiter with environment-configured settings
export const rateLimit = createRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '10')
});

// Cleanup function for graceful shutdown
export function cleanupRateLimit() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  hits.clear();
}