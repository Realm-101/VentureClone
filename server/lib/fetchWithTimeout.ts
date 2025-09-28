/**
 * Fetch timeout utility that wraps native fetch with AbortController
 * - Configurable timeout duration with 8-second default
 * - Proper cleanup of timeout handlers
 * - Compatible with existing fetch usage patterns
 */

export interface FetchWithTimeoutOptions extends RequestInit {
  timeoutMs?: number;
}

export async function fetchWithTimeout(
  url: string | URL | Request, 
  options: FetchWithTimeoutOptions = {}
): Promise<Response> {
  const { timeoutMs = 8000, ...fetchOptions } = options;
  
  // Create AbortController for timeout handling
  const controller = new AbortController();
  
  // Set up timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
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
    // Convert abort errors to timeout errors for better error handling
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error(`Request timeout after ${timeoutMs}ms`);
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    throw error;
  } finally {
    // Always clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);
  }
}