import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnalyses, useAnalyzeUrl } from '../use-minimal-api';
import { MinimalApiClient } from '../../lib/minimal-api-client';
import React from 'react';

// Mock the API client
vi.mock('../../lib/minimal-api-client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useAnalyses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

    vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue(mockAnalyses);

    const { result } = renderHook(() => useAnalyses(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAnalyses);
    expect(MinimalApiClient.getAnalyses).toHaveBeenCalledTimes(1);
  });

  // Error handling is tested at the API client level
});

describe('useAnalyzeUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should analyze URL successfully', async () => {
    const mockAnalysis = {
      id: '1',
      userId: 'user1',
      url: 'https://example.com',
      summary: 'Test analysis result',
      model: 'openai:gpt-4o-mini',
      createdAt: '2024-01-01T00:00:00Z'
    };

    vi.mocked(MinimalApiClient.analyzeUrl).mockResolvedValue(mockAnalysis);

    const { result } = renderHook(() => useAnalyzeUrl(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('https://example.com');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAnalysis);
    expect(MinimalApiClient.analyzeUrl).toHaveBeenCalledWith('https://example.com');
  });

  // Error handling is tested at the API client level
});