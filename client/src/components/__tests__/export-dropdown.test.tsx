import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportDropdown } from '../export-dropdown';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('ExportDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be closed by default', () => {
    render(
      <ExportDropdown
        analysisId="test-id"
        stageNumber={1}
        stageName="Test Stage"
        businessName="Test Business"
      />
    );

    expect(screen.queryByText('Export as HTML')).not.toBeInTheDocument();
  });

  it('should open when Export button is clicked', () => {
    render(
      <ExportDropdown
        analysisId="test-id"
        stageNumber={1}
        stageName="Test Stage"
        businessName="Test Business"
      />
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(screen.getByText('Export as HTML')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as PDF')).toBeInTheDocument();
  });

  it('should close when Export button is clicked again', () => {
    render(
      <ExportDropdown
        analysisId="test-id"
        stageNumber={1}
        stageName="Test Stage"
        businessName="Test Business"
      />
    );

    const exportButton = screen.getByText('Export');
    
    // Open
    fireEvent.click(exportButton);
    expect(screen.getByText('Export as HTML')).toBeInTheDocument();

    // Close
    fireEvent.click(exportButton);
    expect(screen.queryByText('Export as HTML')).not.toBeInTheDocument();
  });

  it('should close after selecting a format', async () => {
    const mockBlob = new Blob(['test'], { type: 'text/html' });
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    });

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();

    render(
      <ExportDropdown
        analysisId="test-id"
        stageNumber={1}
        stageName="Test Stage"
        businessName="Test Business"
      />
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const htmlOption = screen.getByText('Export as HTML');
    fireEvent.click(htmlOption);

    // Wait for the dropdown to close
    await waitFor(() => {
      expect(screen.queryByText('Export as HTML')).not.toBeInTheDocument();
    });
  });

  it('should close when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <ExportDropdown
          analysisId="test-id"
          stageNumber={1}
          stageName="Test Stage"
          businessName="Test Business"
        />
      </div>
    );

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);
    expect(screen.getByText('Export as HTML')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    expect(screen.queryByText('Export as HTML')).not.toBeInTheDocument();
  });
});
