import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MinimalDashboard } from './minimal-dashboard';

// Simple example component to test the MinimalDashboard
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export function MinimalDashboardExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <MinimalDashboard />
    </QueryClientProvider>
  );
}

export default MinimalDashboardExample;