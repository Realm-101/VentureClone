import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the feature flags module
const mockIsExperimentalEnabled = vi.hoisted(() => vi.fn());
vi.mock('@/lib/feature-flags', () => ({
  isExperimentalEnabled: mockIsExperimentalEnabled
}));

import { ExperimentalWrapper } from '../experimental-wrapper';

describe('ExperimentalWrapper', () => {
  it('should render children when experimental features are enabled', () => {
    mockIsExperimentalEnabled.mockReturnValue(true);
    
    render(
      <ExperimentalWrapper>
        <div>Experimental Content</div>
      </ExperimentalWrapper>
    );
    
    expect(screen.getByText('Experimental Content')).toBeInTheDocument();
  });

  it('should render fallback when experimental features are disabled', () => {
    mockIsExperimentalEnabled.mockReturnValue(false);
    
    render(
      <ExperimentalWrapper fallback={<div>Fallback Content</div>}>
        <div>Experimental Content</div>
      </ExperimentalWrapper>
    );
    
    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
    expect(screen.queryByText('Experimental Content')).not.toBeInTheDocument();
  });

  it('should render null when experimental features are disabled and no fallback provided', () => {
    mockIsExperimentalEnabled.mockReturnValue(false);
    
    const { container } = render(
      <ExperimentalWrapper>
        <div>Experimental Content</div>
      </ExperimentalWrapper>
    );
    
    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Experimental Content')).not.toBeInTheDocument();
  });
});