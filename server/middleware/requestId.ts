import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Extend Express Request type to include requestId and timing
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

/**
 * Enhanced request ID middleware for better traceability (requirement 2.4)
 * - Generates UUID for each request for tracking and debugging
 * - Supports external request ID headers (X-Request-ID, Request-ID)
 * - Attaches ID to request object and response headers
 * - Tracks request timing for performance monitoring
 * - Validates request ID format for security
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing request ID from header if provided, otherwise generate new one
  // Support multiple header formats for compatibility
  const existingId = (req.headers['x-request-id'] as string) || 
                    (req.headers['request-id'] as string);
  
  // Validate existing request ID format (UUID v4 pattern)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const requestId = (existingId && uuidPattern.test(existingId)) ? existingId : randomUUID();
  
  // Attach request ID and start time to request object
  req.requestId = requestId;
  req.startTime = Date.now();
  
  // Set response headers for client debugging and traceability
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Request-Start', req.startTime.toString());
  
  // Add request completion handler for timing
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.log(`Slow request detected: ${req.method} ${req.path} took ${duration}ms [${requestId}]`);
    }
  });
  
  next();
}