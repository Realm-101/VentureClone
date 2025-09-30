import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnhancedAnalysisDisplay } from '@/components/enhanced-analysis-display';
import type { BusinessAnalysis } from '@/types';
import type { EnhancedAnalysisRecord, BusinessImprovement } from '@shared/schema';

// Mock the StructuredReport component
vi.mock('@/components/StructuredReport', () => ({
  StructuredReport: ({ data, url }: any) => (
    <div data-testid="structured-report">
      Structured Report for {url}
    </div>
  ),
}));

// Mock the ImprovementPanel component
vi.mock('@/components/ui/improvement-panel', () => ({
  ImprovementPanel: ({ improvement }: any) => (
    <div data-testid="improvement-panel">
      Improvement Panel with {improvement.twists.length} twists
    </div>
  ),
}));

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock fetch
global.fetch = vi.fn();

const mockAnalysis: BusinessAnalysis = {
  id: 'test-analysis-1',
  userId: 'user-1',
  url: 'https://example.com',
  businessModel: 'SaaS',
  revenueStream: 'Subscription',
  targetMarket: 'Small businesses',
  overallScore: 8.5,
  currentStage: 1,
  structured: {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test audience',
      monetization: 'Test monetization',
    },
    market: {
      competitors: [],
      swot: {
        strengths: ['Strong brand'],
        weaknesses: ['Limited features'],
        opportunities: ['Market expansion'],
        threats: ['Competition'],
      },
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Insight 1', 'Insight 2'],
      nextActions: ['Action 1', 'Action 2'],
    },
  },
  createdAt: new Date('2024-01-15T10:00:00Z'),
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

const mockImprovement: BusinessImprovement = {
  twists: [
    'Improvement 1',
    'Improvement 2',
    'Improvement 3',
  ],
  sevenDayPlan: [
    { day: 1, tasks: ['Task 1', 'Task 2'] },
    { day: 2, tasks: ['Task 3'] },
  ],
  generatedAt: '2024-01-15T10:30:00Z',
};

const mockEnhancedAnalysis: EnhancedAnalysisRecord = {
  ...mockAnalysis,
  improvements: mockImprovement,
};

function renderWithQueryClient(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
}

describe('EnhancedAnalysisDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders structured report when analysis has structured data', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    expect(screen.getByTestId('structured-report')).toBeInTheDocument();
    expect(screen.getByText('Structured Report for https://example.com')).toBeInTheDocument();
  });

  it('does not render structured report when analysis has no structured data', () => {
    const analysisWithoutStructured = { ...mockAnalysis, structured: undefined };
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={analysisWithoutStructured} />);
    
    expect(screen.queryByTestId('structured-report')).not.toBeInTheDocument();
  });

  it('renders improvement opportunity card', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    expect(screen.getByText('Business Improvement Opportunity')).toBeInTheDocument();
    expect(screen.getByText(/Get actionable suggestions to build a better version/)).toBeInTheDocument();
  });

  it('shows "Improve This Business" button when no improvements exist', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    expect(screen.getByText('Improve This Business')).toBeInTheDocument();
  });

  it('shows "Show Improvements" button when improvements already exist', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockEnhancedAnalysis} />);
    
    expect(screen.getByText('Show Improvements')).toBeInTheDocument();
  });

  it('generates improvements when button is clicked and no improvements exist', async () => {
    const mockFetch = vi.mocked(fetch);
    // Create a promise that we can control
    let resolvePromise: (value: any) => void;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    
    mockFetch.mockReturnValueOnce(fetchPromise as any);

    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    const improveButton = screen.getByText('Improve This Business');
    fireEvent.click(improveButton);
    
    // Should show loading state immediately
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
    
    // Resolve the promise
    resolvePromise!({
      ok: true,
      json: () => Promise.resolve(mockImprovement),
    });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/business-analyses/test-analysis-1/improve',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  it('shows improvements panel when improvements exist and show button is clicked', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockEnhancedAnalysis} />);
    
    const showButton = screen.getByText('Show Improvements');
    fireEvent.click(showButton);
    
    expect(screen.getByTestId('improvement-panel')).toBeInTheDocument();
    expect(screen.getByText('Improvement Panel with 3 twists')).toBeInTheDocument();
  });

  it('shows hide button when improvements are displayed', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockEnhancedAnalysis} />);
    
    const showButton = screen.getByText('Show Improvements');
    fireEvent.click(showButton);
    
    expect(screen.getByText('Hide Improvements')).toBeInTheDocument();
  });

  it('hides improvements panel when hide button is clicked', () => {
    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockEnhancedAnalysis} />);
    
    // Show improvements first
    const showButton = screen.getByText('Show Improvements');
    fireEvent.click(showButton);
    
    expect(screen.getByTestId('improvement-panel')).toBeInTheDocument();
    
    // Hide improvements
    const hideButton = screen.getByText('Hide Improvements');
    fireEvent.click(hideButton);
    
    expect(screen.queryByTestId('improvement-panel')).not.toBeInTheDocument();
  });

  it('shows success toast when improvements are generated successfully', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockImprovement),
    } as Response);

    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    const improveButton = screen.getByText('Improve This Business');
    fireEvent.click(improveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Improvement Suggestions Generated',
        description: 'Business improvement plan has been created successfully',
      });
    });
  });

  it('shows error toast when improvement generation fails', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Generation failed' }),
    } as Response);

    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    const improveButton = screen.getByText('Improve This Business');
    fireEvent.click(improveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Generation Failed',
        description: 'Generation failed',
        variant: 'destructive',
      });
    });
  });

  it('disables button while generating improvements', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    const improveButton = screen.getByText('Improve This Business');
    fireEvent.click(improveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
    
    expect(screen.getByRole('button', { name: /Generating/ })).toBeDisabled();
  });

  it('applies custom className when provided', () => {
    const { container } = renderWithQueryClient(
      <EnhancedAnalysisDisplay analysis={mockAnalysis} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles network error gracefully', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithQueryClient(<EnhancedAnalysisDisplay analysis={mockAnalysis} />);
    
    const improveButton = screen.getByText('Improve This Business');
    fireEvent.click(improveButton);
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Generation Failed',
        description: 'Network error',
        variant: 'destructive',
      });
    });
  });
});