/**
 * Fetch timeout utility that wraps native fetch with AbortController
 * - Configurable timeout duration with 15-second default (per requirement 2.1)
 * - Proper cleanup of timeout handlers and AbortController
 * - Compatible with existing fetch usage patterns
 * - Enhanced error handling for timeout scenarios
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string | URL | Request, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 15000, ...fetchOptions } = options;
  
  // Create AbortController for timeout handling
  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    // Set up timeout with proper cleanup
    timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    // Merge abort signal with existing signal if provided
    const signal = fetchOptions.signal 
      ? AbortSignal.any([fetchOptions.signal, controller.signal])
      : controller.signal;
    
    const response = await fetch(url, {
      ...fetchOptions,
      signal
    });
    
    return response;
  } catch (error) {
    // Convert abort errors to timeout errors for better error handling (requirement 2.2)
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`);
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  } finally {
    // Always clear the timeout to prevent memory leaks
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}