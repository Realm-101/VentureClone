import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MinimalApiClient, ApiClientError, getErrorMessage } from '../lib/minimal-api-client';
import type { AnalysisRecord, AnalysisListResponse } from '../types/minimal-api';

/**
 * Query key factory for consistent cache management
 */
export const minimalApiKeys = {
  all: ['minimal-api'] as const,
  analyses: () => [...minimalApiKeys.all, 'analyses'] as const,
  analysesList: () => [...minimalApiKeys.analyses(), 'list'] as const,
};

/**
 * Hook to fetch all analyses for the current user
 */
export function useAnalyses() {
  return useQuery({
    queryKey: minimalApiKeys.analysesList(),
    queryFn: () => MinimalApiClient.getAnalyses(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error instanceof ApiClientError && error.status && error.status >= 400 && error.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
  });
}

/**
 * Hook to analyze a URL
 */
export function useAnalyzeUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (url: string) => MinimalApiClient.analyzeUrl(url),
    onSuccess: (newAnalysis: AnalysisRecord) => {
      // Update the analyses list cache with the new analysis
      queryClient.setQueryData<AnalysisListResponse>(
        minimalApiKeys.analysesList(),
        (oldData) => {
          if (!oldData) return [newAnalysis];
          // Add new analysis to the beginning (newest first)
          return [newAnalysis, ...oldData];
        }
      );
    },
    onError: (error) => {
      console.error('URL analysis failed:', error);
    },
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx) or specific server errors
      if (error instanceof ApiClientError && error.status) {
        if (error.status >= 400 && error.status < 500) {
          return false; // Client errors shouldn't be retried
        }
        if (error.status === 500 && error.message.includes('API key')) {
          return false; // API key errors shouldn't be retried
        }
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
}

/**
 * Hook to get error handling utilities
 */
export function useApiErrorHandling() {
  return {
    getErrorMessage,
    isNetworkError: (error: unknown) => 
      error instanceof ApiClientError && error.status === 0,
    isValidationError: (error: unknown) => 
      error instanceof ApiClientError && error.status === 400,
    isServerError: (error: unknown) => 
      error instanceof ApiClientError && 
      error.status !== undefined && 
      error.status >= 500,
    isApiKeyError: (error: unknown) =>
      error instanceof ApiClientError && 
      error.message.toLowerCase().includes('api key'),
  };
}

/**
 * Hook to refresh analyses data
 */
export function useRefreshAnalyses() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({
      queryKey: minimalApiKeys.analysesList(),
    });
  };
}