import { Request, Response, NextFunction } from 'express';

interface ErrorResponse {
  error: string;
  code: string;
  requestId: string;
  details?: string;
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
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMITED';
    case 500:
      return 'INTERNAL';
    case 502:
      return 'AI_PROVIDER_DOWN';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    case 504:
      return 'GATEWAY_TIMEOUT';
    default:
      return 'UNKNOWN';
  }
};

// Enhanced error types for better error categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  AI_PROVIDER = 'AI_PROVIDER_ERROR',
  FIRST_PARTY_EXTRACTION = 'FIRST_PARTY_EXTRACTION_ERROR',
  IMPROVEMENT_GENERATION = 'IMPROVEMENT_GENERATION_ERROR',
  CONFIDENCE_VALIDATION = 'CONFIDENCE_VALIDATION_ERROR',
  SOURCE_VALIDATION = 'SOURCE_VALIDATION_ERROR',
  NETWORK = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  CONFIG = 'CONFIG_ERROR'
}

// User-friendly error messages for common scenarios
const getUserFriendlyMessage = (error: Error | AppError, errorType?: ErrorType): string => {
  if (error instanceof AppError && error.userMessage) {
    return error.userMessage;
  }

  const message = error.message.toLowerCase();

  // Timeout errors
  if (message.includes('timeout') || errorType === ErrorType.TIMEOUT) {
    if (message.includes('first-party') || message.includes('extraction')) {
      return 'Website content extraction timed out. Analysis will continue with available data.';
    }
    if (message.includes('improvement') || message.includes('business improvement')) {
      return 'Business improvement generation timed out. Please try again.';
    }
    return 'Request timed out. Please try again.';
  }

  // AI Provider errors
  if (message.includes('ai provider') || message.includes('gemini') || message.includes('openai') || message.includes('grok') || errorType === ErrorType.AI_PROVIDER) {
    if (message.includes('api key')) {
      return 'AI service configuration error. Please check your API keys.';
    }
    if (message.includes('rate limit')) {
      return 'AI service rate limit exceeded. Please try again in a few minutes.';
    }
    return 'AI service is temporarily unavailable. Please try again.';
  }

  // Validation errors
  if (message.includes('confidence') || errorType === ErrorType.CONFIDENCE_VALIDATION) {
    return 'Analysis confidence data is invalid. Results may be less accurate.';
  }
  if (message.includes('source') || errorType === ErrorType.SOURCE_VALIDATION) {
    return 'Source attribution data is invalid. Analysis will continue without source links.';
  }
  if (message.includes('validation') || errorType === ErrorType.VALIDATION) {
    return 'Invalid input data. Please check your request and try again.';
  }

  // First-party extraction errors
  if (message.includes('first-party') || message.includes('extraction') || errorType === ErrorType.FIRST_PARTY_EXTRACTION) {
    return 'Unable to extract content from the target website. Analysis will continue with available data.';
  }

  // Improvement generation errors
  if (message.includes('improvement') || errorType === ErrorType.IMPROVEMENT_GENERATION) {
    return 'Unable to generate business improvements. Please try again.';
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection') || errorType === ErrorType.NETWORK) {
    return 'Network connection error. Please check your internet connection and try again.';
  }

  // Rate limit errors
  if (message.includes('rate limit') || errorType === ErrorType.RATE_LIMIT) {
    return 'Too many requests. Please wait a moment before trying again.';
  }

  // Configuration errors
  if (message.includes('config') || message.includes('api key') || errorType === ErrorType.CONFIG) {
    return 'Service configuration error. Please contact support if this persists.';
  }

  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

// Custom error class for structured errors with enhanced features
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public userMessage?: string;
  public errorType?: ErrorType;
  public details?: any;
  public retryable: boolean;

  constructor(
    message: string, 
    statusCode: number = 500, 
    code?: string, 
    userMessage?: string,
    errorType?: ErrorType,
    details?: any,
    retryable: boolean = false
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || getErrorCode(statusCode);
    this.userMessage = userMessage;
    this.errorType = errorType;
    this.details = details;
    this.retryable = retryable;
    this.name = 'AppError';
  }

  // Static factory methods for common error types
  static timeout(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      504,
      'GATEWAY_TIMEOUT',
      userMessage || 'Request timed out. Please try again.',
      ErrorType.TIMEOUT,
      details,
      true
    );
  }

  static validation(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      422,
      'VALIDATION_ERROR',
      userMessage || 'Invalid input data. Please check your request and try again.',
      ErrorType.VALIDATION,
      details,
      false
    );
  }

  static aiProvider(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      502,
      'AI_PROVIDER_DOWN',
      userMessage || 'AI service is temporarily unavailable. Please try again.',
      ErrorType.AI_PROVIDER,
      details,
      true
    );
  }

  static firstPartyExtraction(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      503,
      'SERVICE_UNAVAILABLE',
      userMessage || 'Unable to extract content from the target website. Analysis will continue with available data.',
      ErrorType.FIRST_PARTY_EXTRACTION,
      details,
      true
    );
  }

  static improvementGeneration(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      503,
      'SERVICE_UNAVAILABLE',
      userMessage || 'Unable to generate business improvements. Please try again.',
      ErrorType.IMPROVEMENT_GENERATION,
      details,
      true
    );
  }

  static confidenceValidation(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      422,
      'VALIDATION_ERROR',
      userMessage || 'Analysis confidence data is invalid. Results may be less accurate.',
      ErrorType.CONFIDENCE_VALIDATION,
      details,
      false
    );
  }

  static sourceValidation(message: string, userMessage?: string, details?: any): AppError {
    return new AppError(
      message,
      422,
      'VALIDATION_ERROR',
      userMessage || 'Source attribution data is invalid. Analysis will continue without source links.',
      ErrorType.SOURCE_VALIDATION,
      details,
      false
    );
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if response was already sent
  if (res.headersSent) {
    return next(err);
  }

  // Default to 500 server error
  let statusCode = 500;
  let errorCode = 'INTERNAL';
  let message = 'Internal server error';
  let userMessage = 'An unexpected error occurred. Please try again.';
  let details: any = undefined;

  // Handle custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code || getErrorCode(statusCode);
    message = err.message;
    userMessage = err.userMessage || getUserFriendlyMessage(err, err.errorType);
    details = err.details;
  } else if (err.name === 'ValidationError' || err.name === 'ZodError') {
    // Handle validation errors (including Zod validation errors)
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
    userMessage = 'Invalid input data. Please check your request and try again.';
  } else if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
    // Handle timeout errors
    statusCode = 504;
    errorCode = 'GATEWAY_TIMEOUT';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.TIMEOUT);
  } else if (err.message.includes('rate limit') || err.message.includes('RATE_LIMITED')) {
    // Handle rate limit errors
    statusCode = 429;
    errorCode = 'RATE_LIMITED';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.RATE_LIMIT);
  } else if (err.message.includes('AI provider') || err.message.includes('gemini') || err.message.includes('openai') || err.message.includes('grok')) {
    // Handle AI provider errors
    statusCode = 502;
    errorCode = 'AI_PROVIDER_DOWN';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.AI_PROVIDER);
  } else if (err.message.includes('first-party') || err.message.includes('extraction')) {
    // Handle first-party extraction errors
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.FIRST_PARTY_EXTRACTION);
  } else if (err.message.includes('improvement') || err.message.includes('business improvement')) {
    // Handle improvement generation errors
    statusCode = 503;
    errorCode = 'SERVICE_UNAVAILABLE';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.IMPROVEMENT_GENERATION);
  } else if (err.message.includes('confidence')) {
    // Handle confidence validation errors
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.CONFIDENCE_VALIDATION);
  } else if (err.message.includes('source')) {
    // Handle source validation errors
    statusCode = 422;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
    userMessage = getUserFriendlyMessage(err, ErrorType.SOURCE_VALIDATION);
  } else {
    // Handle generic errors - don't expose internal details
    console.error('Unhandled error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      url: req.url,
      method: req.method,
      userId: req.userId
    });
    message = 'Internal server error';
    userMessage = 'An unexpected error occurred. Please try again.';
  }

  // Ensure we have a request ID
  const requestId = req.requestId || 'unknown';

  // Create enhanced error response with user-friendly message
  const errorResponse: ErrorResponse = {
    error: userMessage, // Use user-friendly message for client
    code: errorCode,
    requestId,
    ...(process.env.NODE_ENV === 'development' && { details: message }) // Include technical details in development
  };

  // Log error for monitoring (but don't expose to client)
  console.error(`Error ${errorCode} (${statusCode}):`, {
    requestId,
    message,
    userMessage,
    url: req.url,
    method: req.method,
    userId: req.userId,
    stack: err.stack
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};