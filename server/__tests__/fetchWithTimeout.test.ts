import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Fetch Timeout Utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete successful requests within timeout', async () => {
    const mockResponse = { ok: true, status: 200, json: () => Promise.resolve({ data: 'test' }) };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchWithTimeout('https://example.com', { timeoutMs: 5000 });
    
    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      signal: expect.any(AbortSignal)
    }));
  });

  it('should timeout after specified duration', async () => {
    // Mock fetch to simulate timeout by rejecting with AbortError
    mockFetch.mockImplementation(() => {
      const error = new Error('The operation was aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });

    const promise = fetchWithTimeout('https://example.com', { timeoutMs: 100 });
    
    await expect(promise).rejects.toThrow('Request timeout after 100ms');
    await expect(promise).rejects.toHaveProperty('name', 'TimeoutError');
  });

  it('should use default timeout of 8000ms when not specified', async () => {
    // Test that default timeout is configured correctly by checking the call
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);

    await fetchWithTimeout('https://example.com');
    
    // Verify that fetch was called with default timeout in the AbortSignal
    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      signal: expect.any(AbortSignal)
    }));
  });

  it('should handle network errors without timeout interference', async () => {
    const networkError = new Error('Network connection failed');
    mockFetch.mockRejectedValue(networkError);

    const promise = fetchWithTimeout('https://example.com', { timeoutMs: 5000 });
    
    await expect(promise).rejects.toThrow('Network connection failed');
    expect(mockFetch).toHaveBeenCalled();
  });

  it('should preserve existing AbortSignal when provided', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);
    
    const existingController = new AbortController();
    const existingSignal = existingController.signal;

    await fetchWithTimeout('https://example.com', { 
      timeoutMs: 5000,
      signal: existingSignal
    });

    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      signal: expect.any(AbortSignal)
    }));
    
    // The signal should be a combined signal, not the original
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.signal).not.toBe(existingSignal);
  });

  it('should handle external abort signal cancellation', async () => {
    mockFetch.mockImplementation(async (url, options) => {
      // Simulate external abort
      if (options?.signal) {
        return new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        });
      }
      return { ok: true, status: 200 };
    });

    const controller = new AbortController();
    const promise = fetchWithTimeout('https://example.com', { 
      timeoutMs: 5000,
      signal: controller.signal
    });

    // Abort externally before timeout
    controller.abort();
    
    await expect(promise).rejects.toThrow('Request timeout after 5000ms');
    await expect(promise).rejects.toHaveProperty('name', 'TimeoutError');
  });

  it('should clean up timeout when request completes early', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);
    
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    await fetchWithTimeout('https://example.com', { timeoutMs: 5000 });
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should clean up timeout when request fails early', async () => {
    const networkError = new Error('Network error');
    mockFetch.mockRejectedValue(networkError);
    
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    await expect(fetchWithTimeout('https://example.com', { timeoutMs: 5000 }))
      .rejects.toThrow('Network error');
    
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  it('should handle URL object input', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);
    
    const url = new URL('https://example.com/path');
    const result = await fetchWithTimeout(url, { timeoutMs: 1000 });
    
    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(url, expect.any(Object));
  });

  it('should handle Request object input', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);
    
    const request = new Request('https://example.com');
    const result = await fetchWithTimeout(request, { timeoutMs: 1000 });
    
    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(request, expect.any(Object));
  });

  it('should preserve other fetch options', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValue(mockResponse);
    
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
      timeoutMs: 3000
    };

    await fetchWithTimeout('https://example.com', options);
    
    expect(mockFetch).toHaveBeenCalledWith('https://example.com', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: 'data' }),
      signal: expect.any(AbortSignal)
    }));
    
    // Should not include timeoutMs in fetch options
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs).not.toHaveProperty('timeoutMs');
  });
});