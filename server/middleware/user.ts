import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const USER_COOKIE_NAME = "venture_user_id";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

/**
 * User middleware that handles cookie-based user identification
 * - Generates persistent user IDs for new visitors with 1-year expiration
 * - Parses existing user ID cookies and attaches to request object
 * - Sets httpOnly cookies with appropriate security settings
 */
export function userMiddleware(req: Request, res: Response, next: NextFunction) {
  let userId = req.cookies?.[USER_COOKIE_NAME];

  // If no user ID cookie exists, generate a new one
  if (!userId) {
    userId = randomUUID();
    
    // Set httpOnly cookie with appropriate security settings
    res.cookie(USER_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection while allowing normal navigation
      maxAge: COOKIE_MAX_AGE,
      path: "/" // Available across the entire application
    });
  }

  // Attach user ID to request object for use in routes
  req.userId = userId;
  
  next();
}