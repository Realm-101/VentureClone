import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MinimalApiClient, ApiClientError, getErrorMessage, isNetworkError, isValidationError, isServerError } from '../minimal-api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock import.meta.env
vi.stubGlobal('import.meta', {
  env: {
    VITE_API_BASE: ''
  }
});

describe('MinimalApiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getAnalyses', () => {
    it('should fetch analyses successfully', async () => {
      const mockAnalyses = [
        {
          id: '1',
          userId: 'user1',
          url: 'https://example.com',
          summary: 'Test analysis',
          model: 'openai:gpt-4o-mini',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAnalyses),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await MinimalApiClient.getAnalyses();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/business-analyses',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockAnalyses);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockResolvedValue({ error: 'Database connection failed' }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(MinimalApiClient.getAnalyses()).rejects.toThrow(ApiClientError);
      await expect(MinimalApiClient.getAnalyses()).rejects.toThrow('Database connection failed');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(MinimalApiClient.getAnalyses()).rejects.toThrow(ApiClientError);
      await expect(MinimalApiClient.getAnalyses()).rejects.toThrow('Network error');
    });
  });

  describe('analyzeUrl', () => {
    it('should analyze URL successfully', async () => {
      const mockAnalysis = {
        id: '1',
        userId: 'user1',
        url: 'https://example.com',
        summary: 'Test analysis result',
        model: 'openai:gpt-4o-mini',
        createdAt: '2024-01-01T00:00:00Z'
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockAnalysis),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const result = await MinimalApiClient.analyzeUrl('https://example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/business-analyses/analyze',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ url: 'https://example.com' }),
        })
      );
      expect(result).toEqual(mockAnalysis);
    });

    it('should validate URL format', async () => {
      await expect(MinimalApiClient.analyzeUrl('invalid-url')).rejects.toThrow(ApiClientError);
      await expect(MinimalApiClient.analyzeUrl('invalid-url')).rejects.toThrow('Invalid URL format');
    });

    it('should validate URL is provided', async () => {
      await expect(MinimalApiClient.analyzeUrl('')).rejects.toThrow(ApiClientError);
      await expect(MinimalApiClient.analyzeUrl('')).rejects.toThrow('URL is required');
    });

    it('should handle API key errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: vi.fn().mockResolvedValue({ error: 'OPENAI_API_KEY missing' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await expect(MinimalApiClient.analyzeUrl('https://example.com')).rejects.toThrow('OPENAI_API_KEY missing');
    });
  });
});

describe('Error handling utilities', () => {
  it('should get error message from ApiClientError', () => {
    const error = new ApiClientError('Test error', 400);
    expect(getErrorMessage(error)).toBe('Test error');
  });

  it('should get error message from regular Error', () => {
    const error = new Error('Regular error');
    expect(getErrorMessage(error)).toBe('Regular error');
  });

  it('should get default message for unknown errors', () => {
    expect(getErrorMessage('string error')).toBe('An unexpected error occurred');
  });

  it('should identify network errors', () => {
    const networkError = new ApiClientError('Network error', 0);
    const serverError = new ApiClientError('Server error', 500);
    
    expect(isNetworkError(networkError)).toBe(true);
    expect(isNetworkError(serverError)).toBe(false);
  });

  it('should identify validation errors', () => {
    const validationError = new ApiClientError('Validation error', 400);
    const serverError = new ApiClientError('Server error', 500);
    
    expect(isValidationError(validationError)).toBe(true);
    expect(isValidationError(serverError)).toBe(false);
  });

  it('should identify server errors', () => {
    const serverError = new ApiClientError('Server error', 500);
    const validationError = new ApiClientError('Validation error', 400);
    
    expect(isServerError(serverError)).toBe(true);
    expect(isServerError(validationError)).toBe(false);
  });
});