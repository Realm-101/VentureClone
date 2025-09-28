import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MinimalDashboard } from '@/components/minimal-dashboard';
import { MinimalApiClient } from '@/lib/minimal-api-client';
import type { AnalysisRecord } from '@/types/minimal-api';

// Mock the API client
vi.mock('@/lib/minimal-api-client', () => ({
  MinimalApiClient: {
    getAnalyses: vi.fn(),
    analyzeUrl: vi.fn(),
  },
}));

// Mock feature flags
vi.mock('@/lib/feature-flags', () => ({
  isExperimentalEnabled: vi.fn(() => false),
  isFeatureEnabled: vi.fn(() => false),
}));

describe('Client-Side End-to-End Integration Tests', () => {
  let queryClient: QueryClient;
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe('Complete User Flow: URL Input → Analysis → Display', () => {
    it('should complete full workflow from empty state to analysis display', async () => {
      // Mock empty initial state
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);

      // Mock successful analysis
      const mockAnalysis: AnalysisRecord = {
        id: 'test-analysis-123',
        userId: 'user-456',
        url: 'https://example-business.com',
        summary: 'This is a comprehensive business analysis showing strong potential for cloning.',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(MinimalApiClient.analyzeUrl).mockResolvedValue(mockAnalysis);

      renderWithProviders(<MinimalDashboard />);

      // Verify initial empty state
      expect(screen.getByText('No analyses yet')).toBeInTheDocument();
      expect(screen.getByText('Enter a URL above to get started with your first business analysis')).toBeInTheDocument();

      // Find and fill URL input
      const urlInput = screen.getByPlaceholderText('https://example.com');
      expect(urlInput).toBeInTheDocument();

      await user.type(urlInput, 'https://example-business.com');
      expect(urlInput).toHaveValue('https://example-business.com');

      // Submit analysis
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });
      expect(analyzeButton).toBeEnabled();

      await user.click(analyzeButton);

      // Verify loading state
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
      expect(analyzeButton).toBeDisabled();

      // Wait for analysis to complete
      await waitFor(() => {
        expect(MinimalApiClient.analyzeUrl).toHaveBeenCalledWith('https://example-business.com');
      });

      // Mock updated analyses list after creation
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([mockAnalysis]);

      // Verify analysis appears in list (this would happen via React Query refetch)
      await waitFor(() => {
        expect(screen.queryByText('No analyses yet')).not.toBeInTheDocument();
      });

      // Verify URL input is cleared after successful submission
      expect(urlInput).toHaveValue('');
    });

    it('should display multiple analyses in chronological order', async () => {
      const mockAnalyses: AnalysisRecord[] = [
        {
          id: 'analysis-2',
          userId: 'user-123',
          url: 'https://newer-business.com',
          summary: 'Newer business analysis with advanced features',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-02T12:00:00.000Z'
        },
        {
          id: 'analysis-1',
          userId: 'user-123',
          url: 'https://older-business.com',
          summary: 'Older business analysis with basic features',
          model: 'openai:gpt-4o-mini',
          createdAt: '2024-01-01T12:00:00.000Z'
        }
      ];

      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue(mockAnalyses);

      renderWithProviders(<MinimalDashboard />);

      // Wait for analyses to load
      await waitFor(() => {
        expect(screen.getByText('Your Analyses (2)')).toBeInTheDocument();
      });

      // Verify both analyses are displayed
      expect(screen.getByText('https://newer-business.com')).toBeInTheDocument();
      expect(screen.getByText('https://older-business.com')).toBeInTheDocument();
      expect(screen.getByText('Newer business analysis with advanced features')).toBeInTheDocument();
      expect(screen.getByText('Older business analysis with basic features')).toBeInTheDocument();

      // Verify model information is displayed
      expect(screen.getByText('Analyzed with gemini:gemini-1.5-flash')).toBeInTheDocument();
      expect(screen.getByText('Analyzed with openai:gpt-4o-mini')).toBeInTheDocument();

      // Verify external link buttons are present
      const externalLinks = screen.getAllByRole('button');
      const urlButtons = externalLinks.filter(button => 
        button.textContent?.includes('https://') || button.getAttribute('aria-label')?.includes('external')
      );
      expect(urlButtons.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle URL validation correctly', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);

      renderWithProviders(<MinimalDashboard />);

      const urlInput = screen.getByPlaceholderText('https://example.com');
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });

      // Test empty URL
      await user.click(analyzeButton);
      expect(screen.getByText('URL is required')).toBeInTheDocument();
      expect(MinimalApiClient.analyzeUrl).not.toHaveBeenCalled();

      // Test invalid URL
      await user.type(urlInput, 'not-a-valid-url');
      await user.click(analyzeButton);
      expect(screen.getByText('Please enter a valid URL (e.g., https://example.com)')).toBeInTheDocument();
      expect(MinimalApiClient.analyzeUrl).not.toHaveBeenCalled();

      // Clear input and test valid URL
      await user.clear(urlInput);
      await user.type(urlInput, 'https://valid-url.com');
      
      // Validation error should clear when typing valid URL
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid URL (e.g., https://example.com)')).not.toBeInTheDocument();
      });

      expect(analyzeButton).toBeEnabled();
    });
  }); 
 describe('Error Handling and User Experience', () => {
    it('should display network error messages appropriately', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);
      vi.mocked(MinimalApiClient.analyzeUrl).mockRejectedValue(
        new Error('Network error: Unable to connect to the server. Please check your internet connection.')
      );

      renderWithProviders(<MinimalDashboard />);

      const urlInput = screen.getByPlaceholderText('https://example.com');
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });

      await user.type(urlInput, 'https://example.com');
      await user.click(analyzeButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Network error: Unable to connect to the server/)).toBeInTheDocument();
      });

      // Verify button is re-enabled after error
      expect(analyzeButton).toBeEnabled();
      expect(screen.queryByText('Analyzing...')).not.toBeInTheDocument();
    });

    it('should display API key configuration errors', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);
      vi.mocked(MinimalApiClient.analyzeUrl).mockRejectedValue(
        new Error('At least one AI provider API key (GEMINI_API_KEY or OPENAI_API_KEY) is required')
      );

      renderWithProviders(<MinimalDashboard />);

      const urlInput = screen.getByPlaceholderText('https://example.com');
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });

      await user.type(urlInput, 'https://example.com');
      await user.click(analyzeButton);

      // Wait for API key error message
      await waitFor(() => {
        expect(screen.getByText('AI service is not configured. Please check your API keys.')).toBeInTheDocument();
      });
    });

    it('should handle analysis loading failures gracefully', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockRejectedValue(
        new Error('Failed to fetch analyses')
      );

      renderWithProviders(<MinimalDashboard />);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/Failed to load analyses/)).toBeInTheDocument();
      });

      // Verify error alert is displayed
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show loading states appropriately', async () => {
      // Mock slow API response
      vi.mocked(MinimalApiClient.getAnalyses).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      renderWithProviders(<MinimalDashboard />);

      // Should show loading state initially
      expect(screen.getByText('Loading analyses...')).toBeInTheDocument();

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading analyses...')).not.toBeInTheDocument();
      });

      expect(screen.getByText('No analyses yet')).toBeInTheDocument();
    });

    it('should handle form submission edge cases', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);

      renderWithProviders(<MinimalDashboard />);

      const urlInput = screen.getByPlaceholderText('https://example.com');
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });

      // Test form submission with Enter key
      await user.type(urlInput, 'https://keyboard-submit.com');
      await user.keyboard('{Enter}');

      // Should trigger validation for invalid URL format if needed
      // In this case, the URL is valid so it should attempt analysis
      await waitFor(() => {
        expect(MinimalApiClient.analyzeUrl).toHaveBeenCalledWith('https://keyboard-submit.com');
      });

      // Test disabled state during analysis
      vi.mocked(MinimalApiClient.analyzeUrl).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          id: 'test',
          userId: 'user',
          url: 'https://keyboard-submit.com',
          summary: 'Test',
          model: 'gemini:gemini-1.5-flash',
          createdAt: '2024-01-01T12:00:00.000Z'
        }), 100))
      );

      await user.clear(urlInput);
      await user.type(urlInput, 'https://slow-analysis.com');
      await user.click(analyzeButton);

      // Button should be disabled during analysis
      expect(analyzeButton).toBeDisabled();
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });
  });

  describe('Interactive Features', () => {
    it('should handle external link clicks correctly', async () => {
      const mockAnalysis: AnalysisRecord = {
        id: 'link-test-analysis',
        userId: 'user-123',
        url: 'https://external-link-test.com',
        summary: 'Test analysis for external link functionality',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([mockAnalysis]);

      // Mock window.open
      const mockWindowOpen = vi.fn();
      Object.defineProperty(window, 'open', {
        value: mockWindowOpen,
        writable: true,
      });

      renderWithProviders(<MinimalDashboard />);

      // Wait for analysis to load
      await waitFor(() => {
        expect(screen.getByText('https://external-link-test.com')).toBeInTheDocument();
      });

      // Find and click the external link
      const externalLinkButton = screen.getByRole('button', { 
        name: /https:\/\/external-link-test\.com/i 
      });
      
      await user.click(externalLinkButton);

      // Verify window.open was called with correct parameters
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://external-link-test.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should format dates correctly in analysis list', async () => {
      const mockAnalysis: AnalysisRecord = {
        id: 'date-test-analysis',
        userId: 'user-123',
        url: 'https://date-test.com',
        summary: 'Test analysis for date formatting',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-15T14:30:00.000Z'
      };

      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([mockAnalysis]);

      renderWithProviders(<MinimalDashboard />);

      // Wait for analysis to load
      await waitFor(() => {
        expect(screen.getByText('https://date-test.com')).toBeInTheDocument();
      });

      // Verify date is formatted correctly (format may vary based on locale)
      // Looking for a date pattern that includes month, day, and time
      const dateElement = screen.getByText(/Jan.*15.*2024.*2:30/i);
      expect(dateElement).toBeInTheDocument();
    });

    it('should handle long URLs and summaries appropriately', async () => {
      const longUrl = 'https://very-long-domain-name-for-testing-truncation.com/very/long/path/that/might/need/truncation';
      const longSummary = 'This is a very long analysis summary that contains a lot of detailed information about the business model, technical implementation, market opportunity, competitive landscape, and various other factors that might affect the clonability assessment. '.repeat(3);

      const mockAnalysis: AnalysisRecord = {
        id: 'long-content-analysis',
        userId: 'user-123',
        url: longUrl,
        summary: longSummary,
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([mockAnalysis]);

      renderWithProviders(<MinimalDashboard />);

      // Wait for analysis to load
      await waitFor(() => {
        expect(screen.getByText(longUrl)).toBeInTheDocument();
      });

      // Verify long content is displayed (may be truncated by CSS)
      expect(screen.getByText(longSummary)).toBeInTheDocument();
    });

    it('should maintain form state during user interactions', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);

      renderWithProviders(<MinimalDashboard />);

      const urlInput = screen.getByPlaceholderText('https://example.com');

      // Type partial URL
      await user.type(urlInput, 'https://partial');
      expect(urlInput).toHaveValue('https://partial');

      // Navigate away from input and back
      await user.tab();
      await user.tab({ shift: true });

      // Value should be preserved
      expect(urlInput).toHaveValue('https://partial');

      // Complete the URL
      await user.type(urlInput, '-url.com');
      expect(urlInput).toHaveValue('https://partial-url.com');

      // Clear input using keyboard
      await user.selectAll();
      await user.keyboard('{Delete}');
      expect(urlInput).toHaveValue('');
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper ARIA labels and roles', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);

      renderWithProviders(<MinimalDashboard />);

      // Check for proper form elements
      const urlInput = screen.getByRole('textbox');
      expect(urlInput).toHaveAttribute('type', 'url');
      expect(urlInput).toHaveAttribute('placeholder', 'https://example.com');

      const submitButton = screen.getByRole('button', { name: /analyze business/i });
      expect(submitButton).toHaveAttribute('type', 'submit');

      // Check for proper headings
      expect(screen.getByRole('heading', { name: /VentureClone AI/i })).toBeInTheDocument();
    });

    it('should handle keyboard navigation properly', async () => {
      const mockAnalysis: AnalysisRecord = {
        id: 'keyboard-nav-test',
        userId: 'user-123',
        url: 'https://keyboard-test.com',
        summary: 'Keyboard navigation test analysis',
        model: 'gemini:gemini-1.5-flash',
        createdAt: '2024-01-01T12:00:00.000Z'
      };

      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([mockAnalysis]);

      renderWithProviders(<MinimalDashboard />);

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('https://keyboard-test.com')).toBeInTheDocument();
      });

      // Test tab navigation
      const urlInput = screen.getByRole('textbox');
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });
      const externalLinkButton = screen.getByRole('button', { name: /https:\/\/keyboard-test\.com/i });

      // Start from URL input
      urlInput.focus();
      expect(document.activeElement).toBe(urlInput);

      // Tab to analyze button
      await user.tab();
      expect(document.activeElement).toBe(analyzeButton);

      // Tab to external link button
      await user.tab();
      expect(document.activeElement).toBe(externalLinkButton);
    });

    it('should provide appropriate feedback for screen readers', async () => {
      vi.mocked(MinimalApiClient.getAnalyses).mockResolvedValue([]);
      vi.mocked(MinimalApiClient.analyzeUrl).mockRejectedValue(
        new Error('Test error for screen reader feedback')
      );

      renderWithProviders(<MinimalDashboard />);

      const urlInput = screen.getByPlaceholderText('https://example.com');
      const analyzeButton = screen.getByRole('button', { name: /analyze business/i });

      await user.type(urlInput, 'https://error-test.com');
      await user.click(analyzeButton);

      // Wait for error alert
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent('Test error for screen reader feedback');
      });
    });
  });
});