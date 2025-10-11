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
    
    // Use getAllByText since "Warning" appears as both type heading and title
    const warningElements = screen.getAllByText('Warning');
    expect(warningElements.length).toBeGreaterThan(0);
    expect(screen.queryByText('Actionable')).not.toBeInTheDocument();
  });

  // Null safety tests
  it('handles undefined recommendations prop gracefully', () => {
    render(<RecommendationsSection recommendations={undefined as any} />);
    
    // Should render empty state
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('No recommendations available')).toBeInTheDocument();
  });

  it('handles null recommendations prop gracefully', () => {
    render(<RecommendationsSection recommendations={null as any} />);
    
    // Should render empty state
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('No recommendations available')).toBeInTheDocument();
  });

  it('handles recommendations with undefined properties gracefully', () => {
    const partialRec: Recommendation[] = [
      {
        type: 'simplify',
        title: 'Partial Recommendation',
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={partialRec} />);
    
    // Should render without crashing
    expect(screen.getByText('Partial Recommendation')).toBeInTheDocument();
  });

  it('handles recommendations with null description gracefully', () => {
    const nullDescRec: Recommendation[] = [
      {
        type: 'alternative',
        title: 'No Description',
        description: null as any,
        impact: 'medium',
        actionable: true,
      },
    ];
    
    render(<RecommendationsSection recommendations={nullDescRec} />);
    
    // Should render without crashing
    expect(screen.getByText('No Description')).toBeInTheDocument();
  });

  it('handles recommendations with undefined impact gracefully', () => {
    const noImpactRec: Recommendation[] = [
      {
        type: 'opportunity',
        title: 'No Impact',
        description: 'Test description',
        actionable: true,
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={noImpactRec} />);
    
    // Should render without crashing
    expect(screen.getByText('No Impact')).toBeInTheDocument();
  });

  it('handles recommendations with undefined actionable gracefully', () => {
    const noActionableRec: Recommendation[] = [
      {
        type: 'warning',
        title: 'No Actionable',
        description: 'Test description',
        impact: 'high',
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={noActionableRec} />);
    
    // Should render without crashing
    expect(screen.getByText('No Actionable')).toBeInTheDocument();
  });

  // Partial data tests
  it('renders recommendations with minimal data', () => {
    const minimalRecs: Recommendation[] = [
      {
        type: 'simplify',
        title: 'Minimal Recommendation 1',
      } as any,
      {
        type: 'alternative',
        title: 'Minimal Recommendation 2',
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={minimalRecs} />);
    
    // Should render without crashing
    expect(screen.getByText('Minimal Recommendation 1')).toBeInTheDocument();
    expect(screen.getByText('Minimal Recommendation 2')).toBeInTheDocument();
  });

  it('renders recommendations missing description', () => {
    const noDesc: Recommendation[] = [
      {
        type: 'opportunity',
        title: 'No Description',
        impact: 'medium',
        actionable: true,
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={noDesc} />);
    
    // Should render without crashing
    expect(screen.getByText('No Description')).toBeInTheDocument();
    expect(screen.getByText('Medium Impact')).toBeInTheDocument();
  });

  it('renders recommendations missing impact', () => {
    const noImpact: Recommendation[] = [
      {
        type: 'warning',
        title: 'No Impact',
        description: 'This is a warning without impact level',
        actionable: false,
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={noImpact} />);
    
    // Should render without crashing
    expect(screen.getByText('No Impact')).toBeInTheDocument();
    expect(screen.getByText(/This is a warning without impact level/)).toBeInTheDocument();
  });

  it('renders recommendations missing actionable flag', () => {
    const noActionable: Recommendation[] = [
      {
        type: 'simplify',
        title: 'No Actionable Flag',
        description: 'Description here',
        impact: 'high',
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={noActionable} />);
    
    // Should render without crashing
    expect(screen.getByText('No Actionable Flag')).toBeInTheDocument();
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });

  it('renders recommendations with only title and type', () => {
    const titleOnly: Recommendation[] = [
      {
        type: 'alternative',
        title: 'Title Only',
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={titleOnly} />);
    
    // Should render without crashing
    expect(screen.getByText('Title Only')).toBeInTheDocument();
  });

  it('renders mixed complete and partial recommendations', () => {
    const mixedRecs: Recommendation[] = [
      {
        type: 'simplify',
        title: 'Complete Recommendation',
        description: 'Full description',
        impact: 'high',
        actionable: true,
      },
      {
        type: 'warning',
        title: 'Partial Recommendation',
        description: 'Only description and title',
      } as any,
      {
        type: 'opportunity',
        title: 'Another Partial',
        impact: 'low',
      } as any,
    ];
    
    render(<RecommendationsSection recommendations={mixedRecs} />);
    
    // Should render all recommendations without crashing
    expect(screen.getByText('Complete Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Partial Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Another Partial')).toBeInTheDocument();
  });
});
