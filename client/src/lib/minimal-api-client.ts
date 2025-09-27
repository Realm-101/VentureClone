import type { 
  AnalysisRecord, 
  CreateAnalysisInput, 
  AnalysisListResponse, 
  AnalysisResponse,
  ApiError 
} from '../types/minimal-api';

// Get API base URL from environment variable or default to empty string for relative URLs
const API_BASE_URL = import.meta.env.VITE_API_BASE || '';

/**
 * Custom error class for API-related errors
 */
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/**
 * Generic API request function with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: any = null;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
          errorDetails = errorData.details;
        }
      } catch {
        // If we can't parse the error response, use the status text
      }

      throw new ApiClientError(errorMessage, response.status, errorDetails);
    }

    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    // Handle network errors and other fetch failures
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or other fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiClientError(
        'Network error: Unable to connect to the server. Please check your internet connection.',
        0
      );
    }

    // Other unexpected errors
    throw new ApiClientError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      0
    );
  }
}

/**
 * Minimal API client for business analysis operations
 */
export class MinimalApiClient {
  /**
   * Fetch all analyses for the current user in reverse chronological order
   */
  static async getAnalyses(): Promise<AnalysisListResponse> {
    try {
      return await apiRequest<AnalysisListResponse>('/api/business-analyses', {
        method: 'GET',
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError('Failed to fetch analyses');
    }
  }

  /**
   * Submit a URL for AI analysis
   */
  static async analyzeUrl(url: string): Promise<AnalysisResponse> {
    if (!url || typeof url !== 'string') {
      throw new ApiClientError('URL is required and must be a string', 400);
    }

    // Basic URL validation on client side
    try {
      new URL(url);
    } catch {
      throw new ApiClientError('Invalid URL format', 400);
    }

    try {
      return await apiRequest<AnalysisResponse>('/api/business-analyses/analyze', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      throw new ApiClientError('Failed to analyze URL');
    }
  }
}

/**
 * Helper function to get user-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Helper function to check if an error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 0;
}

/**
 * Helper function to check if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiClientError && error.status === 400;
}

/**
 * Helper function to check if an error is a server error
 */
export function isServerError(error: unknown): boolean {
  return error instanceof ApiClientError && 
         error.status !== undefined && 
         error.status >= 500;
}