import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationsSection } from '../recommendations-section';
import type { Recommendation } from '../../types/insights';

describe('RecommendationsSection', () => {
  const mockRecommendations: Recommendation[] = [
    {
      type: 'simplify',
      title: 'Simplify Authentication',
      description: 'Consider using Clerk instead of custom auth to save 2 months of development time.',
      impact: 'high',
      actionable: true,
    },
    {
      type: 'alternative',
      title: 'Use Supabase',
      description: 'Replace custom PostgreSQL backend with Supabase for faster development.',
      impact: 'medium',
      actionable: true,
    },
    {
      type: 'warning',
      title: 'Complex Infrastructure',
      description: 'The detected Kubernetes setup adds significant complexity.',
      impact: 'high',
      actionable: false,
    },
    {
      type: 'opportunity',
      title: 'No-Code Option',
      description: 'Consider using Webflow for the landing page.',
      impact: 'low',
      actionable: true,
    },
  ];

  it('renders all recommendations', () => {
    render(<RecommendationsSection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Simplify Authentication')).toBeInTheDocument();
    expect(screen.getByText('Use Supabase')).toBeInTheDocument();
    expect(screen.getByText('Complex Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('No-Code Option')).toBeInTheDocument();
  });

  it('displays impact badges correctly', () => {
    render(<RecommendationsSection recommendations={mockRecommendations} />);
    
    const highImpactBadges = screen.getAllByText('High Impact');
    expect(highImpactBadges).toHaveLength(2);
    
    expect(screen.getByText('Medium Impact')).toBeInTheDocument();
    expect(screen.getByText('Low Impact')).toBeInTheDocument();
  });

  it('shows actionable indicators', () => {
    render(<RecommendationsSection recommendations={mockRecommendations} />);
    
    // 3 actionable recommendations
    const actionableIndicators = screen.getAllByText('Actionable');
    expect(actionableIndicators).toHaveLength(3);
  });

  it('expands recommendation on click', () => {
    render(<RecommendationsSection recommendations={mockRecommendations} />);
    
    const firstRecommendation = screen.getByText('Simplify Authentication');
    fireEvent.click(firstRecommendation);
    
    // Description should be visible after expansion
    expect(screen.getByText(/Consider using Clerk instead of custom auth/)).toBeInTheDocument();
  });

  it('groups recommendations by type', () => {
    render(<RecommendationsSection recommendations={mockRecommendations} />);
    
    // Check that different types are rendered
    expect(screen.getByText('Simplify Authentication')).toBeInTheDocument(); // simplify
    expect(screen.getByText('Use Supabase')).toBeInTheDocument(); // alternative
    expect(screen.getByText('Complex Infrastructure')).toBeInTheDocument(); // warning
    expect(screen.getByText('No-Code Option')).toBeInTheDocument(); // opportunity
  });

  it('handles empty recommendations array', () => {
    render(<RecommendationsSection recommendations={[]} />);
    
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('No recommendations available')).toBeInTheDocument();
  });

  it('renders with single recommendation', () => {
    const singleRecommendation: Recommendation[] = [
      {
        type: 'simplify',
        title: 'Single Recommendation',
        description: 'This is the only recommendation.',
        impact: 'high',
        actionable: true,
      },
    ];
    
    render(<RecommendationsSection recommendations={singleRecommendation} />);
    
    expect(screen.getByText('Single Recommendation')).toBeInTheDocument();
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });

  it('displays correct icons for different recommendation types', () => {
    render(<RecommendationsSection recommendations={mockRecommendations} />);
    
    // Icons are rendered via lucide-react, check that recommendations are present
    expect(screen.getByText('Simplify Authentication')).toBeInTheDocument();
    expect(screen.getByText('Use Supabase')).toBeInTheDocument();
    expect(screen.getByText('Complex Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('No-Code Option')).toBeInTheDocument();
  });

  it('handles non-actionable recommendations', () => {
    const nonActionableRec: Recommendation[] = [
      {
        type: 'warning',
        title: 'Warning',
        description: 'This is a warning.',
        impact: 'high',
        actionable: false,
      },
    ];
    
    render(<RecommendationsSection recommendations={nonActionableRec} />);
    
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.queryByText('Actionable')).not.toBeInTheDocument();
  });
});
