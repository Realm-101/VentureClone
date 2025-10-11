import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClonabilityScoreCard } from '../clonability-score-card';
import type { ClonabilityScore } from '../../types/insights';

describe('ClonabilityScoreCard', () => {
  const mockScore: ClonabilityScore = {
    score: 7,
    rating: 'easy',
    components: {
      technicalComplexity: { score: 6, weight: 0.4 },
      marketOpportunity: { score: 8, weight: 0.3 },
      resourceRequirements: { score: 7, weight: 0.2 },
      timeToMarket: { score: 9, weight: 0.1 },
    },
    recommendation: 'This is a good opportunity for cloning with moderate complexity.',
    confidence: 0.85,
  };

  it('renders with valid score data', () => {
    render(<ClonabilityScoreCard score={mockScore} />);
    
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('displays recommendation text', () => {
    render(<ClonabilityScoreCard score={mockScore} />);
    
    expect(screen.getByText(/This is a good opportunity for cloning/)).toBeInTheDocument();
  });

  it('shows component breakdown with correct values', () => {
    render(<ClonabilityScoreCard score={mockScore} />);
    
    expect(screen.getByText('Technical Complexity')).toBeInTheDocument();
    expect(screen.getByText('Market Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Resource Requirements')).toBeInTheDocument();
    expect(screen.getByText('Time to Market')).toBeInTheDocument();
    
    // Check scores
    expect(screen.getByText('6/10')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('9/10')).toBeInTheDocument();
  });

  it('displays confidence level', () => {
    render(<ClonabilityScoreCard score={mockScore} />);
    
    expect(screen.getByText(/85% confidence/i)).toBeInTheDocument();
  });

  it('renders very-easy rating correctly', () => {
    const veryEasyScore: ClonabilityScore = {
      ...mockScore,
      score: 9,
      rating: 'very-easy',
    };
    
    render(<ClonabilityScoreCard score={veryEasyScore} />);
    
    expect(screen.getByText('9/10')).toBeInTheDocument();
    expect(screen.getByText('Very Easy')).toBeInTheDocument();
  });

  it('renders difficult rating correctly', () => {
    const difficultScore: ClonabilityScore = {
      ...mockScore,
      score: 3,
      rating: 'difficult',
    };
    
    render(<ClonabilityScoreCard score={difficultScore} />);
    
    expect(screen.getByText('3/10')).toBeInTheDocument();
    expect(screen.getByText('Difficult')).toBeInTheDocument();
  });

  it('renders very-difficult rating correctly', () => {
    const veryDifficultScore: ClonabilityScore = {
      ...mockScore,
      score: 1,
      rating: 'very-difficult',
    };
    
    render(<ClonabilityScoreCard score={veryDifficultScore} />);
    
    expect(screen.getByText('1/10')).toBeInTheDocument();
    expect(screen.getByText('Very Difficult')).toBeInTheDocument();
  });

  it('renders moderate rating correctly', () => {
    const moderateScore: ClonabilityScore = {
      ...mockScore,
      score: 5,
      rating: 'moderate',
    };
    
    render(<ClonabilityScoreCard score={moderateScore} />);
    
    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('handles low confidence scores', () => {
    const lowConfidenceScore: ClonabilityScore = {
      ...mockScore,
      confidence: 0.45,
    };
    
    render(<ClonabilityScoreCard score={lowConfidenceScore} />);
    
    expect(screen.getByText(/45% confidence/i)).toBeInTheDocument();
  });

  it('displays all component weights correctly', () => {
    render(<ClonabilityScoreCard score={mockScore} />);
    
    // Check that weights are displayed (40%, 30%, 20%, 10%)
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByText(/30%/)).toBeInTheDocument();
    expect(screen.getByText(/20%/)).toBeInTheDocument();
    expect(screen.getByText(/10%/)).toBeInTheDocument();
  });

  // Null safety tests
  it('handles undefined score prop gracefully', () => {
    // Component should not crash when score is undefined
    expect(() => render(<ClonabilityScoreCard score={undefined as any} />)).not.toThrow();
  });

  it('handles null score prop gracefully', () => {
    // Component should not crash when score is null
    expect(() => render(<ClonabilityScoreCard score={null as any} />)).not.toThrow();
  });

  it('handles undefined components gracefully', () => {
    const noComponents: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      recommendation: 'Test recommendation',
      confidence: 0.85,
    } as any;
    
    render(<ClonabilityScoreCard score={noComponents} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
  });

  it('handles undefined recommendation gracefully', () => {
    const noRecommendation: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: mockScore.components,
      confidence: 0.85,
    } as any;
    
    render(<ClonabilityScoreCard score={noRecommendation} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
  });

  it('handles undefined confidence gracefully', () => {
    const noConfidence: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: mockScore.components,
      recommendation: 'Test recommendation',
    } as any;
    
    render(<ClonabilityScoreCard score={noConfidence} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
  });

  it('handles partial components gracefully', () => {
    const partialComponents: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: {
        technicalComplexity: { score: 6, weight: 0.4 },
      } as any,
      recommendation: 'Test recommendation',
      confidence: 0.85,
    };
    
    render(<ClonabilityScoreCard score={partialComponents} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
  });

  it('handles components with undefined nested properties gracefully', () => {
    const incompleteComponents: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: {
        technicalComplexity: { score: 6, weight: 0.4 },
        marketOpportunity: { score: 0, weight: 0.3 } as any, // score is 0 instead of undefined
      } as any,
      recommendation: 'Test recommendation',
      confidence: 0.85,
    };
    
    // Component should not crash with incomplete nested properties
    expect(() => render(<ClonabilityScoreCard score={incompleteComponents} />)).not.toThrow();
  });

  // Partial data tests
  it('renders with missing components', () => {
    const noComponents: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      recommendation: 'Good opportunity for cloning',
      confidence: 0.85,
    } as any;
    
    render(<ClonabilityScoreCard score={noComponents} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('renders with partial components (only technicalComplexity)', () => {
    const partialComponents: ClonabilityScore = {
      score: 6,
      rating: 'easy',
      components: {
        technicalComplexity: { score: 6, weight: 0.4 },
      } as any,
      recommendation: 'Test recommendation',
      confidence: 0.80,
    };
    
    render(<ClonabilityScoreCard score={partialComponents} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
    expect(screen.getByText('Technical Complexity')).toBeInTheDocument();
  });

  it('renders with partial components (two components)', () => {
    const twoComponents: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: {
        technicalComplexity: { score: 6, weight: 0.5 },
        marketOpportunity: { score: 8, weight: 0.5 },
      } as any,
      recommendation: 'Test recommendation',
      confidence: 0.75,
    };
    
    render(<ClonabilityScoreCard score={twoComponents} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('Technical Complexity')).toBeInTheDocument();
    expect(screen.getByText('Market Opportunity')).toBeInTheDocument();
  });

  it('renders with missing recommendation', () => {
    const noRec: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: mockScore.components,
      confidence: 0.85,
    } as any;
    
    render(<ClonabilityScoreCard score={noRec} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('renders with missing confidence', () => {
    const noConfidence: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: mockScore.components,
      recommendation: 'Test recommendation',
    } as any;
    
    render(<ClonabilityScoreCard score={noConfidence} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('7/10')).toBeInTheDocument();
  });

  it('renders with minimal data (only score and rating)', () => {
    const minimal: ClonabilityScore = {
      score: 5,
      rating: 'moderate',
    } as any;
    
    render(<ClonabilityScoreCard score={minimal} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('5/10')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('renders with components missing weights', () => {
    const noWeights: ClonabilityScore = {
      score: 7,
      rating: 'easy',
      components: {
        technicalComplexity: { score: 6 } as any,
        marketOpportunity: { score: 8 } as any,
      } as any,
      recommendation: 'Test recommendation',
      confidence: 0.85,
    };
    
    render(<ClonabilityScoreCard score={noWeights} />);
    
    // Should render without crashing
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('Technical Complexity')).toBeInTheDocument();
  });
});
