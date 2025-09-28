import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

/**
 * Request ID middleware that assigns unique identifiers to all requests
 * - Generates UUID for each request for tracking and debugging
 * - Supports external request ID headers (X-Request-ID)
 * - Attaches ID to request object and response headers
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing request ID from header if provided, otherwise generate new one
  // Express normalizes header names to lowercase
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  
  // Attach request ID to request object for use in routes and other middleware
  req.requestId = requestId;
  
  // Set response header for client debugging
  res.setHeader('X-Request-ID', requestId);
  
  next();
}