/**
 * Retry utility for handling transient failures
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  maxDelayMs?: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTimeMs: number;
}

/**
 * Checks if an error is retryable based on error message patterns
 */
export function isRetryableError(error: Error, retryablePatterns?: string[]): boolean {
  const defaultRetryablePatterns = [
    'timeout',
    'ETIMEDOUT',
    'ECONNRESET',
    'ECONNREFUSED',
    'ENOTFOUND',
    'network',
    'fetch failed',
    'rate limit',
    'quota',
    'RESOURCE_EXHAUSTED',
    'DEADLINE_EXCEEDED',
    '429',
    '502',
    '503',
    '504',
  ];

  const patterns = retryablePatterns || defaultRetryablePatterns;
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();

  return patterns.some(pattern => 
    errorMessage.includes(pattern.toLowerCase()) || 
    errorName.includes(pattern.toLowerCase())
  );
}

/**
 * Executes a function with retry logic for transient failures
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns RetryResult with success status, data, and metadata
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    maxDelayMs = 10000,
    retryableErrors,
    onRetry,
  } = options;

  const startTime = Date.now();
  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn();
      const totalTimeMs = Date.now() - startTime;
      
      return {
        success: true,
        data,
        attempts: attempt,
        totalTimeMs,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Check if this is the last attempt
      if (attempt === maxAttempts) {
        break;
      }

      // Check if error is retryable
      if (!isRetryableError(lastError, retryableErrors)) {
        console.log(`Non-retryable error on attempt ${attempt}:`, lastError.message);
        break;
      }

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(lastError, attempt);
      }

      console.log(`Retryable error on attempt ${attempt}/${maxAttempts}:`, lastError.message);
      console.log(`Waiting ${currentDelay}ms before retry...`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, currentDelay));

      // Increase delay for next attempt (exponential backoff)
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }

  // All attempts failed
  const totalTimeMs = Date.now() - startTime;
  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: maxAttempts,
    totalTimeMs,
  };
}

/**
 * Saves partial results to prevent data loss on failure
 */
export interface PartialResultHandler<T> {
  save: (partialData: Partial<T>) => Promise<void>;
  load: () => Promise<Partial<T> | null>;
  clear: () => Promise<void>;
}

/**
 * Creates a partial result handler for stage generation
 */
export function createPartialResultHandler<T>(
  storageKey: string
): PartialResultHandler<T> {
  const cache = new Map<string, Partial<T>>();

  return {
    async save(partialData: Partial<T>): Promise<void> {
      cache.set(storageKey, partialData);
      console.log(`Saved partial result for ${storageKey}`);
    },

    async load(): Promise<Partial<T> | null> {
      const data = cache.get(storageKey);
      if (data) {
        console.log(`Loaded partial result for ${storageKey}`);
      }
      return data || null;
    },

    async clear(): Promise<void> {
      cache.delete(storageKey);
      console.log(`Cleared partial result for ${storageKey}`);
    },
  };
}

/**
 * Provides clear next steps on error
 */
export interface ErrorGuidance {
  error: Error;
  userMessage: string;
  nextSteps: string[];
  retryable: boolean;
  estimatedWaitTime?: string;
}

/**
 * Generates user-friendly error guidance with next steps
 */
export function generateErrorGuidance(error: Error, context?: string): ErrorGuidance {
  const errorMessage = error.message.toLowerCase();
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('etimedout')) {
    return {
      error,
      userMessage: 'The AI service took too long to respond. This usually happens during high traffic periods.',
      nextSteps: [
        'Wait 1-2 minutes and try again',
        'The system will automatically retry with a longer timeout',
        'If the problem persists, try a different time of day',
      ],
      retryable: true,
      estimatedWaitTime: '1-2 minutes',
    };
  }

  // Rate limit errors
  if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('429')) {
    return {
      error,
      userMessage: 'The AI service rate limit has been reached. This is temporary.',
      nextSteps: [
        'Wait 5-10 minutes before trying again',
        'Rate limits reset automatically',
        'Consider upgrading your AI provider plan for higher limits',
      ],
      retryable: true,
      estimatedWaitTime: '5-10 minutes',
    };
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('econnrefused') || errorMessage.includes('econnreset')) {
    return {
      error,
      userMessage: 'A network error occurred while connecting to the AI service.',
      nextSteps: [
        'Check your internet connection',
        'Try again in a few moments',
        'The system will automatically retry',
      ],
      retryable: true,
      estimatedWaitTime: '30 seconds',
    };
  }

  // API key errors
  if (errorMessage.includes('api key') || errorMessage.includes('unauthorized') || errorMessage.includes('401')) {
    return {
      error,
      userMessage: 'There is an issue with the AI service configuration.',
      nextSteps: [
        'Contact support to verify API key configuration',
        'This is not a temporary issue and requires administrator action',
      ],
      retryable: false,
    };
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('schema') || errorMessage.includes('invalid')) {
    return {
      error,
      userMessage: 'The AI service returned invalid data. This is usually temporary.',
      nextSteps: [
        'Try again - the AI will generate a new response',
        'If this persists, the prompt may need adjustment',
        'Contact support if you see this repeatedly',
      ],
      retryable: true,
      estimatedWaitTime: '30 seconds',
    };
  }

  // Generic error
  return {
    error,
    userMessage: `An unexpected error occurred${context ? ` while ${context}` : ''}.`,
    nextSteps: [
      'Try again in a few moments',
      'If the problem persists, contact support',
      'Include the error message when reporting issues',
    ],
    retryable: true,
    estimatedWaitTime: '1 minute',
  };
}
