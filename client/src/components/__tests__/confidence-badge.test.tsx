import { render, screen } from '@testing-library/react';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';

describe('ConfidenceBadge', () => {
  it('renders "Speculative" badge when confidence is below 0.6', () => {
    render(<ConfidenceBadge confidence={0.5} />);
    expect(screen.getByText('Speculative')).toBeInTheDocument();
  });

  it('renders "Speculative" badge when confidence is exactly 0.5', () => {
    render(<ConfidenceBadge confidence={0.5} />);
    expect(screen.getByText('Speculative')).toBeInTheDocument();
  });

  it('does not render when confidence is 0.6 or higher', () => {
    render(<ConfidenceBadge confidence={0.6} />);
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
  });

  it('does not render when confidence is 0.8', () => {
    render(<ConfidenceBadge confidence={0.8} />);
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
  });

  it('does not render when confidence is undefined', () => {
    render(<ConfidenceBadge />);
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
  });

  it('handles missing confidence data gracefully', () => {
    render(<ConfidenceBadge confidence={undefined} />);
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
  });
});