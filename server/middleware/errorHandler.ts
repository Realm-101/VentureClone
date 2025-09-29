import { Request, Response, NextFunction } from 'express';

interface RequestWithId extends Request {
  requestId: string;
}

interface ErrorResponse {
  error: string;
  code: string;
  requestId: string;
}

// Map HTTP status codes to standardized error codes
const getErrorCode = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 429:
      return 'RATE_LIMITED';
    case 500:
      return 'INTERNAL';
    case 502:
      return 'AI_PROVIDER_DOWN';
    case 504:
      return 'GATEWAY_TIMEOUT';
    default:
      return 'UNKNOWN';
  }
};

// Custom error class for structured errors
export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || getErrorCode(statusCode);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: RequestWithId,
  res: Response,
  next: NextFunction
): void => {
  // Default to 500 server error
  let statusCode = 500;
  let errorCode = 'INTERNAL';
  let message = 'Internal server error';

  // Handle custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code || getErrorCode(statusCode);
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
    // Handle timeout errors
    statusCode = 504;
    errorCode = 'GATEWAY_TIMEOUT';
    message = 'Request timeout';
  } else if (err.message.includes('rate limit') || err.message.includes('RATE_LIMITED')) {
    // Handle rate limit errors
    statusCode = 429;
    errorCode = 'RATE_LIMITED';
    message = 'Rate limit exceeded';
  } else {
    // Handle generic errors - don't expose internal details
    console.error('Unhandled error:', err);
    message = 'Internal server error';
  }

  // Ensure we have a request ID
  const requestId = req.requestId || 'unknown';

  // Create consistent error response
  const errorResponse: ErrorResponse = {
    error: message,
    code: errorCode,
    requestId
  };

  // Send error response
  res.status(statusCode).json(errorResponse);
};