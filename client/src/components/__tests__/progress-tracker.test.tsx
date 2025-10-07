import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgressTracker } from '../progress-tracker';
import type { BusinessAnalysis } from '@/types';

/**
 * Integration tests for Progress Tracker component
 * Tests state updates, navigation, and UI rendering
 * Requirements: 5.3, 5.5
 */

// Mock fetch
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Progress Tracker Integration Tests (Task 15.3)', () => {
  const mockAnalysis: BusinessAnalysis = {
    id: 'test-analysis-id',
    userId: 'test-user',
    url: 'https://example.com',
    currentStage: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('State Updates on Completion', () => {
    it('should show Stage 1 as completed initially', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const stage1 = screen.getByTestId('progress-stage-1');
        expect(stage1).toBeInTheDocument();
      });

      // Check for completed checkmark
      const checkmark = screen.getByTestId('checkmark-stage-1');
      expect(checkmark).toBeInTheDocument();

      // Check for completed text
      expect(screen.getByText('✓ Completed')).toBeInTheDocument();
    });

    it('should update when Stage 2 is completed', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() },
            2: { stageNumber: 2, stageData: { effortScore: 7 }, completedAt: new Date().toISOString() }
          },
          completedStages: [1, 2],
        }),
      });

      const updatedAnalysis = { ...mockAnalysis, currentStage: 3 };
      render(<ProgressTracker analysis={updatedAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const checkmarks = screen.getAllByTestId(/checkmark-stage-/);
        expect(checkmarks.length).toBe(2); // Stage 1 and 2 completed
      });

      // Both stages should show completed
      const completedTexts = screen.getAllByText('✓ Completed');
      expect(completedTexts.length).toBeGreaterThanOrEqual(2);
    });

    it('should show current stage as in progress', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      const currentAnalysis = { ...mockAnalysis, currentStage: 2 };
      render(<ProgressTracker analysis={currentAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });

      // Stage 2 should be highlighted as in progress
      const stage2 = screen.getByTestId('progress-stage-2');
      expect(stage2).toBeInTheDocument();
    });

    it('should show future stages as pending', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const pendingTexts = screen.getAllByText('Pending');
        expect(pendingTexts.length).toBeGreaterThan(0);
      });

      // Stages 3-6 should be pending
      expect(screen.getByTestId('progress-stage-3')).toBeInTheDocument();
      expect(screen.getByTestId('progress-stage-4')).toBeInTheDocument();
      expect(screen.getByTestId('progress-stage-5')).toBeInTheDocument();
      expect(screen.getByTestId('progress-stage-6')).toBeInTheDocument();
    });
  });

  describe('State Updates on Navigation', () => {
    it('should update when navigating back to completed stage', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() },
            2: { stageNumber: 2, stageData: { effortScore: 7 }, completedAt: new Date().toISOString() }
          },
          completedStages: [1, 2],
        }),
      });

      // Navigate back to Stage 1
      const navAnalysis = { ...mockAnalysis, currentStage: 1 };
      render(<ProgressTracker analysis={navAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Stage 1 should still show as completed
        expect(screen.getByTestId('checkmark-stage-1')).toBeInTheDocument();
      });
    });

    it('should update when navigating forward to next stage', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() },
            2: { stageNumber: 2, stageData: { effortScore: 7 }, completedAt: new Date().toISOString() }
          },
          completedStages: [1, 2],
        }),
      });

      const forwardAnalysis = { ...mockAnalysis, currentStage: 3 };
      render(<ProgressTracker analysis={forwardAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Stage 3 should be in progress
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });
    });

    it('should maintain completed status when navigating', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() },
            2: { stageNumber: 2, stageData: { effortScore: 7 }, completedAt: new Date().toISOString() },
            3: { stageNumber: 3, stageData: { coreFeatures: [] }, completedAt: new Date().toISOString() }
          },
          completedStages: [1, 2, 3],
        }),
      });

      // Navigate to Stage 2 (already completed)
      const navAnalysis = { ...mockAnalysis, currentStage: 2 };
      render(<ProgressTracker analysis={navAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const checkmarks = screen.getAllByTestId(/checkmark-stage-/);
        expect(checkmarks.length).toBe(3); // All three stages completed
      });
    });
  });

  describe('UI Rendering', () => {
    it('should render all 6 stages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {},
          completedStages: [],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('progress-stage-1')).toBeInTheDocument();
        expect(screen.getByTestId('progress-stage-2')).toBeInTheDocument();
        expect(screen.getByTestId('progress-stage-3')).toBeInTheDocument();
        expect(screen.getByTestId('progress-stage-4')).toBeInTheDocument();
        expect(screen.getByTestId('progress-stage-5')).toBeInTheDocument();
        expect(screen.getByTestId('progress-stage-6')).toBeInTheDocument();
      });
    });

    it('should render stage names correctly', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {},
          completedStages: [],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Discovery/i)).toBeInTheDocument();
        expect(screen.getByText(/Lazy-Entrepreneur/i)).toBeInTheDocument();
        expect(screen.getByText(/MVP Launch/i)).toBeInTheDocument();
        expect(screen.getByText(/Marketing/i)).toBeInTheDocument();
        expect(screen.getByText(/Growth/i)).toBeInTheDocument();
        expect(screen.getByText(/AI Automation/i)).toBeInTheDocument();
      });
    });

    it('should apply correct styling for completed stages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const stage1 = screen.getByTestId('progress-stage-1');
        const icon = stage1.querySelector('.bg-green-500');
        expect(icon).toBeInTheDocument();
      });
    });

    it('should apply correct styling for in-progress stage', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      const currentAnalysis = { ...mockAnalysis, currentStage: 2 };
      render(<ProgressTracker analysis={currentAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const stage2 = screen.getByTestId('progress-stage-2');
        const icon = stage2.querySelector('.bg-vc-accent');
        expect(icon).toBeInTheDocument();
      });
    });

    it('should apply correct styling for pending stages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const stage3 = screen.getByTestId('progress-stage-3');
        const icon = stage3.querySelector('.bg-vc-border');
        expect(icon).toBeInTheDocument();
      });
    });

    it('should show correct icons for each status', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      const currentAnalysis = { ...mockAnalysis, currentStage: 2 };
      render(<ProgressTracker analysis={currentAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Completed stage should have CheckCircle
        expect(screen.getByTestId('checkmark-stage-1')).toBeInTheDocument();
        
        // In-progress stage should have Clock (via class check)
        const stage2 = screen.getByTestId('progress-stage-2');
        expect(stage2.querySelector('.animate-pulse')).toBeInTheDocument();
        
        // Pending stages should have Lock
        const stage3 = screen.getByTestId('progress-stage-3');
        expect(stage3).toBeInTheDocument();
      });
    });

    it('should render card with proper structure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {},
          completedStages: [],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        const card = screen.getByTestId('card-progress-tracker');
        expect(card).toBeInTheDocument();
        expect(screen.getByText('Progress Tracker')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      // Component should still render with default state
      await waitFor(() => {
        expect(screen.getByTestId('card-progress-tracker')).toBeInTheDocument();
      });
    });

    it('should handle missing stages data', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: null,
          completedStages: null,
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should render all stages with default state
        expect(screen.getByTestId('progress-stage-1')).toBeInTheDocument();
        expect(screen.getByTestId('progress-stage-6')).toBeInTheDocument();
      });
    });

    it('should handle invalid stage data', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: { invalid: 'data' },
          completedStages: ['invalid'],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should still render properly
        expect(screen.getByTestId('card-progress-tracker')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should reflect stage completion immediately', async () => {
      const { rerender } = render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      // Initial state - Stage 1 completed
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      await waitFor(() => {
        expect(screen.getByTestId('checkmark-stage-1')).toBeInTheDocument();
      });

      // Update - Stage 2 completed
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() },
            2: { stageNumber: 2, stageData: { effortScore: 7 }, completedAt: new Date().toISOString() }
          },
          completedStages: [1, 2],
        }),
      });

      const updatedAnalysis = { ...mockAnalysis, currentStage: 3 };
      rerender(<ProgressTracker analysis={updatedAnalysis} />);

      await waitFor(() => {
        const checkmarks = screen.getAllByTestId(/checkmark-stage-/);
        expect(checkmarks.length).toBe(2);
      });
    });

    it('should update current stage indicator on navigation', async () => {
      const { rerender } = render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      await waitFor(() => {
        expect(screen.getByTestId('progress-stage-1')).toBeInTheDocument();
      });

      // Navigate to Stage 2
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {
            1: { stageNumber: 1, stageData: { structured: {} }, completedAt: new Date().toISOString() }
          },
          completedStages: [1],
        }),
      });

      const navAnalysis = { ...mockAnalysis, currentStage: 2 };
      rerender(<ProgressTracker analysis={navAnalysis} />);

      await waitFor(() => {
        expect(screen.getByText('In Progress')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper test IDs for all stages', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {},
          completedStages: [],
        }),
      });

      render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        for (let i = 1; i <= 6; i++) {
          expect(screen.getByTestId(`progress-stage-${i}`)).toBeInTheDocument();
        }
      });
    });

    it('should have semantic HTML structure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          stages: {},
          completedStages: [],
        }),
      });

      const { container } = render(<ProgressTracker analysis={mockAnalysis} />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check for proper card structure
        const card = container.querySelector('[data-testid="card-progress-tracker"]');
        expect(card).toBeInTheDocument();
      });
    });
  });
});
