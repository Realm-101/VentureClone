import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MinimalDashboard } from '../minimal-dashboard';
import { MinimalApiClient } from '../../lib/minimal-api-client';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API client
vi.mock('../../lib/minimal-api-client');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('MinimalDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard with header and form', () => {
    vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);
    
    renderWithQueryClient(<MinimalDashboard />);
    
    expect(screen.getByText('VentureClone AI')).toBeInTheDocument();
    expect(screen.getByText('Business Analysis Tool')).toBeInTheDocument();
    expect(screen.getByText('Analyze Business URL')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('Analyze Business')).toBeInTheDocument();
  });

  it('shows validation error for invalid URL', async () => {
    vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);
    
    renderWithQueryClient(<MinimalDashboard />);
    
    const input = screen.getByPlaceholderText('https://example.com');
    const button = screen.getByText('Analyze Business');
    
    fireEvent.change(input, { target: { value: 'invalid-url' } });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL (e.g., https://example.com)')).toBeInTheDocument();
    });
  });

  it('shows empty state when no analyses exist', async () => {
    vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);
    
    renderWithQueryClient(<MinimalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No analyses yet')).toBeInTheDocument();
    });
    expect(screen.getByText('Enter a URL above to get started with your first business analysis')).toBeInTheDocument();
  });

  it('displays analyses in chronological order', async () => {
    const mockAnalyses = [
      {
        id: '1',
        userId: 'user1',
        url: 'https://example.com',
        summary: 'Test analysis 1',
        model: 'openai:gpt-4o-mini',
        createdAt: '2024-01-02T00:00:00Z',
      },
      {
        id: '2',
        userId: 'user1',
        url: 'https://test.com',
        summary: 'Test analysis 2',
        model: 'openai:gpt-4o-mini',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];
    
    vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue(mockAnalyses);
    
    renderWithQueryClient(<MinimalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Your Analyses (2)')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('https://test.com')).toBeInTheDocument();
      expect(screen.getByText('Test analysis 1')).toBeInTheDocument();
      expect(screen.getByText('Test analysis 2')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(MinimalApiClient.getAnalyses).mockRejectedValue(new Error('API Error'));
    
    renderWithQueryClient(<MinimalDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load analyses/)).toBeInTheDocument();
    });
  });
});