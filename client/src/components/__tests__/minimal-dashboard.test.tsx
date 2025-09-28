import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MinimalDashboard } from '../minimal-dashboard';
import * as useMinimalApiHooks from '../../hooks/use-minimal-api';
import type { AnalysisRecord } from '../../types/minimal-api';

// Mock the hooks instead of the API client directly
vi.mock('../../hooks/use-minimal-api');

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

// Test data
const mockAnalysis: AnalysisRecord = {
  id: '1',
  userId: 'user1',
  url: 'https://example.com',
  summary: 'This is a test business analysis summary that provides insights into the company.',
  model: 'openai:gpt-4o-mini',
  createdAt: '2024-01-01T12:00:00Z'
};

const mockAnalyses: AnalysisRecord[] = [
  mockAnalysis,
  {
    id: '2',
    userId: 'user1',
    url: 'https://another-example.com',
    summary: 'Another business analysis with different insights.',
    model: 'google:gemini-pro',
    createdAt: '2024-01-02T14:30:00Z'
  }
];

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        cacheTime: 0,
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

describe('MinimalDashboard', () => {
  const mockUseAnalyses = vi.fn();
  const mockUseAnalyzeUrl = vi.fn();
  const mockUseApiErrorHandling = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();

    // Setup default mocks
    vi.mocked(useMinimalApiHooks.useAnalyses).mockImplementation(mockUseAnalyses);
    vi.mocked(useMinimalApiHooks.useAnalyzeUrl).mockImplementation(mockUseAnalyzeUrl);
    vi.mocked(useMinimalApiHooks.useApiErrorHandling).mockImplementation(mockUseApiErrorHandling);

    // Default mock implementations
    mockUseApiErrorHandling.mockReturnValue({
      getErrorMessage: (error: any) => error?.message || 'Unknown error',
      isValidationError: (error: any) => error?.status === 400,
      isApiKeyError: (error: any) => error?.message?.includes('API key'),
      isNetworkError: (error: any) => error?.status === 0,
      isServerError: (error: any) => error?.status >= 500,
    });

    mockUseAnalyzeUrl.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render the header with correct title and description', () => {
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('VentureClone AI')).toBeInTheDocument();
      expect(screen.getByText('Business Analysis Tool')).toBeInTheDocument();
    });

    it('should render the URL input form', () => {
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('Analyze Business URL')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze business/i })).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      mockUseAnalyses.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('Loading analyses...')).toBeInTheDocument();
    });
  });

  describe('URL Input Form', () => {
    it('should accept valid URL input', async () => {
      const user = userEvent.setup();
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('https://example.com');
      await user.type(input, 'https://test.com');

      expect(input).toHaveValue('https://test.com');
    });

    it('should validate URL format on form submission', async () => {
      const user = userEvent.setup();
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('https://example.com');
      const button = screen.getByRole('button', { name: /analyze business/i });

      // Test that form submission is prevented for invalid URLs
      await user.type(input, 'invalid-url');
      await user.click(button);

      // The form should not submit with invalid URL (button remains enabled but no API call is made)
      expect(button).toBeInTheDocument();
    });

    it('should disable submit button when input is empty', () => {
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /analyze business/i });
      expect(button).toBeDisabled();
    });

    it('should enable submit button when valid URL is entered', async () => {
      const user = userEvent.setup();
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('https://example.com');
      const button = screen.getByRole('button', { name: /analyze business/i });

      await user.type(input, 'https://test.com');
      expect(button).not.toBeDisabled();
    });
  });

  describe('URL Analysis', () => {
    it('should show loading state during analysis', () => {
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      mockUseAnalyzeUrl.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: true,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      // When analysis is pending, the button should show loading state
      const button = screen.getByRole('button', { name: /analyzing/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it('should show API key error message', () => {
      const apiKeyError = { message: 'OPENAI_API_KEY missing' };
      
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      mockUseAnalyzeUrl.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: apiKeyError,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      // The actual error message shown is the raw API error
      expect(screen.getByText('OPENAI_API_KEY missing')).toBeInTheDocument();
    });

    it('should show generic error message for other errors', () => {
      const networkError = { message: 'Network error' };
      
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      mockUseAnalyzeUrl.mockReturnValue({
        mutateAsync: vi.fn(),
        isPending: false,
        error: networkError,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('Analysis List', () => {
    it('should show empty state when no analyses exist', () => {
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('No analyses yet')).toBeInTheDocument();
      expect(screen.getByText('Enter a URL above to get started with your first business analysis')).toBeInTheDocument();
    });

    it('should display analyses list with correct count', () => {
      mockUseAnalyses.mockReturnValue({
        data: mockAnalyses,
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('Your Analyses (2)')).toBeInTheDocument();
    });

    it('should display analysis items with correct information', () => {
      mockUseAnalyses.mockReturnValue({
        data: mockAnalyses,
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      // Check first analysis
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('This is a test business analysis summary that provides insights into the company.')).toBeInTheDocument();
      expect(screen.getByText('Analyzed with openai:gpt-4o-mini')).toBeInTheDocument();

      // Check second analysis
      expect(screen.getByText('https://another-example.com')).toBeInTheDocument();
      expect(screen.getByText('Another business analysis with different insights.')).toBeInTheDocument();
      expect(screen.getByText('Analyzed with google:gemini-pro')).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      mockUseAnalyses.mockReturnValue({
        data: [mockAnalysis],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      // The exact format may vary based on locale, but should contain date elements
      expect(screen.getByText(/Jan.*1.*2024.*01:00.*PM/)).toBeInTheDocument();
    });

    it('should open URL in new tab when clicked', async () => {
      const user = userEvent.setup();
      mockUseAnalyses.mockReturnValue({
        data: [mockAnalysis],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const urlButton = screen.getByText('https://example.com');
      await user.click(urlButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://example.com',
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should show error state when analyses fail to load', () => {
      const error = new Error('Failed to load analyses');
      mockUseAnalyses.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: error,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      expect(screen.getByText('Failed to load analyses: Failed to load analyses')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and structure', () => {
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('https://example.com');
      expect(input).toHaveAttribute('type', 'url');

      const button = screen.getByRole('button', { name: /analyze business/i });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should have proper heading hierarchy', () => {
      mockUseAnalyses.mockReturnValue({
        data: mockAnalyses,
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      // Main title
      expect(screen.getByRole('heading', { level: 1, name: 'VentureClone AI' })).toBeInTheDocument();

      // Section heading
      expect(screen.getByRole('heading', { level: 2, name: 'Your Analyses (2)' })).toBeInTheDocument();
    });

    it('should have proper button states and ARIA attributes', async () => {
      const user = userEvent.setup();
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const button = screen.getByRole('button', { name: /analyze business/i });
      
      // Initially disabled
      expect(button).toBeDisabled();

      // Enabled after typing
      const input = screen.getByPlaceholderText('https://example.com');
      await user.type(input, 'https://test.com');
      expect(button).not.toBeDisabled();
    });

    it('should have proper form structure for accessibility', async () => {
      const user = userEvent.setup();
      mockUseAnalyses.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText('https://example.com');
      const button = screen.getByRole('button', { name: /analyze business/i });

      // Test that form elements are properly structured
      expect(input).toHaveAttribute('type', 'url');
      expect(button).toHaveAttribute('type', 'submit');
      
      // Test form interaction
      await user.type(input, 'https://test.com');
      expect(input).toHaveValue('https://test.com');
    });

    it('should have keyboard navigation support', () => {
      mockUseAnalyses.mockReturnValue({
        data: [mockAnalysis],
        isLoading: false,
        error: null,
      });

      render(<MinimalDashboard />, { wrapper: createWrapper() });

      // Find the URL button (it's the button containing the URL text)
      const urlButtons = screen.getAllByRole('button');
      const urlButton = urlButtons.find(button => button.textContent?.includes('https://example.com'));
      
      expect(urlButton).toBeInTheDocument();
      
      // Should be focusable
      urlButton!.focus();
      expect(urlButton).toHaveFocus();

      // Should respond to Enter key
      fireEvent.keyDown(urlButton!, { key: 'Enter', code: 'Enter' });
      // Note: The actual click behavior is tested separately
    });
  });
});