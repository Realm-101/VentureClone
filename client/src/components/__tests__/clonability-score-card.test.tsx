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
});
