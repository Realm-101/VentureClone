import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComplexityBreakdown } from '../complexity-breakdown';
import type { EnhancedComplexityResult } from '../../types/insights';

describe('ComplexityBreakdown', () => {
  const mockBreakdown: EnhancedComplexityResult = {
    score: 6,
    breakdown: {
      frontend: { score: 2, max: 3, technologies: ['React', 'TypeScript'] },
      backend: { score: 3, max: 4, technologies: ['Node.js', 'Express', 'PostgreSQL'] },
      infrastructure: { score: 1, max: 3, technologies: ['Vercel'] },
    },
    factors: {
      customCode: true,
      frameworkComplexity: 'medium',
      infrastructureComplexity: 'low',
      technologyCount: 6,
      licensingComplexity: false,
    },
    explanation: 'Moderate complexity with modern frameworks and simple infrastructure.',
  };

  it('renders with valid breakdown data', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
  });

  it('displays overall complexity score', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    expect(screen.getByText('Overall Complexity')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
  });

  it('displays component breakdown scores', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
    
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('3/4')).toBeInTheDocument();
    
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('displays explanation text', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    expect(screen.getByText(/Moderate complexity with modern frameworks/)).toBeInTheDocument();
  });

  it('shows contributing factors', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    expect(screen.getByText('Contributing Factors')).toBeInTheDocument();
    expect(screen.getByText(/Custom Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium Framework Complexity/i)).toBeInTheDocument();
    expect(screen.getByText(/Low Infrastructure Complexity/i)).toBeInTheDocument();
    expect(screen.getByText(/6 Technologies/i)).toBeInTheDocument();
  });

  it('expands to show related technologies', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    const frontendSection = screen.getByText('Frontend');
    fireEvent.click(frontendSection);
    
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('shows backend technologies when expanded', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    const backendSection = screen.getByText('Backend');
    fireEvent.click(backendSection);
    
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('Express')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('shows infrastructure technologies when expanded', () => {
    render(<ComplexityBreakdown breakdown={mockBreakdown} />);
    
    const infraSection = screen.getByText('Infrastructure');
    fireEvent.click(infraSection);
    
    expect(screen.getByText('Vercel')).toBeInTheDocument();
  });

  it('handles high complexity score', () => {
    const highComplexity: EnhancedComplexityResult = {
      ...mockBreakdown,
      score: 9,
      breakdown: {
        frontend: { score: 3, max: 3, technologies: ['Angular', 'RxJS', 'NgRx'] },
        backend: { score: 4, max: 4, technologies: ['Microservices', 'Kafka', 'Redis', 'MongoDB'] },
        infrastructure: { score: 3, max: 3, technologies: ['Kubernetes', 'Docker', 'AWS'] },
      },
    };
    
    render(<ComplexityBreakdown breakdown={highComplexity} />);
    
    expect(screen.getByText('9/10')).toBeInTheDocument();
    expect(screen.getByText('3/3')).toBeInTheDocument();
    expect(screen.getByText('4/4')).toBeInTheDocument();
  });

  it('handles low complexity score', () => {
    const lowComplexity: EnhancedComplexityResult = {
      ...mockBreakdown,
      score: 2,
      breakdown: {
        frontend: { score: 1, max: 3, technologies: ['HTML', 'CSS'] },
        backend: { score: 0, max: 4, technologies: [] },
        infrastructure: { score: 0, max: 3, technologies: ['Netlify'] },
      },
      factors: {
        customCode: false,
        frameworkComplexity: 'low',
        infrastructureComplexity: 'low',
        technologyCount: 3,
        licensingComplexity: false,
      },
    };
    
    render(<ComplexityBreakdown breakdown={lowComplexity} />);
    
    expect(screen.getByText('2/10')).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getByText('0/4')).toBeInTheDocument();
    expect(screen.getByText('0/3')).toBeInTheDocument();
  });

  it('displays licensing complexity when present', () => {
    const withLicensing: EnhancedComplexityResult = {
      ...mockBreakdown,
      factors: {
        ...mockBreakdown.factors,
        licensingComplexity: true,
      },
    };
    
    render(<ComplexityBreakdown breakdown={withLicensing} />);
    
    expect(screen.getByText(/Licensing Complexity/i)).toBeInTheDocument();
  });

  it('handles empty technology arrays', () => {
    const emptyTech: EnhancedComplexityResult = {
      ...mockBreakdown,
      breakdown: {
        frontend: { score: 0, max: 3, technologies: [] },
        backend: { score: 0, max: 4, technologies: [] },
        infrastructure: { score: 0, max: 3, technologies: [] },
      },
    };
    
    render(<ComplexityBreakdown breakdown={emptyTech} />);
    
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
  });

  it('displays high framework complexity', () => {
    const highFramework: EnhancedComplexityResult = {
      ...mockBreakdown,
      factors: {
        ...mockBreakdown.factors,
        frameworkComplexity: 'high',
      },
    };
    
    render(<ComplexityBreakdown breakdown={highFramework} />);
    
    expect(screen.getByText(/High Framework Complexity/i)).toBeInTheDocument();
  });

  it('displays high infrastructure complexity', () => {
    const highInfra: EnhancedComplexityResult = {
      ...mockBreakdown,
      factors: {
        ...mockBreakdown.factors,
        infrastructureComplexity: 'high',
      },
    };
    
    render(<ComplexityBreakdown breakdown={highInfra} />);
    
    expect(screen.getByText(/High Infrastructure Complexity/i)).toBeInTheDocument();
  });

  // Null safety tests
  it('handles undefined breakdown prop gracefully', () => {
    // Component should not crash when breakdown is undefined
    expect(() => render(<ComplexityBreakdown breakdown={undefined as any} />)).not.toThrow();
  });

  it('handles null breakdown prop gracefully', () => {
    // Component should not crash when breakdown is null
    expect(() => render(<ComplexityBreakdown breakdown={null as any} />)).not.toThrow();
  });

  it('handles undefined breakdown.breakdown gracefully', () => {
    const partialBreakdown = {
      score: 6,
      factors: mockBreakdown.factors,
      explanation: 'Test explanation',
    } as any;
    
    render(<ComplexityBreakdown breakdown={partialBreakdown} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
  });

  it('handles undefined breakdown.factors gracefully', () => {
    const partialBreakdown = {
      score: 6,
      breakdown: mockBreakdown.breakdown,
      explanation: 'Test explanation',
    } as any;
    
    render(<ComplexityBreakdown breakdown={partialBreakdown} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
  });

  it('handles undefined explanation gracefully', () => {
    const noExplanation: EnhancedComplexityResult = {
      score: 6,
      breakdown: mockBreakdown.breakdown,
      factors: mockBreakdown.factors,
    } as any;
    
    render(<ComplexityBreakdown breakdown={noExplanation} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
  });

  it('handles undefined technologies arrays gracefully', () => {
    const noTechnologies: EnhancedComplexityResult = {
      score: 6,
      breakdown: {
        frontend: { score: 2, max: 3 } as any,
        backend: { score: 3, max: 4 } as any,
        infrastructure: { score: 1, max: 3 } as any,
      },
      factors: mockBreakdown.factors,
      explanation: 'Test explanation',
    };
    
    render(<ComplexityBreakdown breakdown={noTechnologies} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
  });

  // Partial data tests
  it('renders with missing factors', () => {
    const noFactors: EnhancedComplexityResult = {
      score: 6,
      breakdown: mockBreakdown.breakdown,
      explanation: 'Test explanation',
    } as any;
    
    render(<ComplexityBreakdown breakdown={noFactors} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('renders with partial factors', () => {
    const partialFactors: EnhancedComplexityResult = {
      score: 6,
      breakdown: mockBreakdown.breakdown,
      factors: {
        customCode: true,
        frameworkComplexity: 'medium',
      } as any,
      explanation: 'Test explanation',
    };
    
    render(<ComplexityBreakdown breakdown={partialFactors} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Custom Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Medium Framework Complexity/i)).toBeInTheDocument();
  });

  it('renders with only frontend breakdown', () => {
    const onlyFrontend: EnhancedComplexityResult = {
      score: 2,
      breakdown: {
        frontend: { score: 2, max: 3, technologies: ['React'] },
      } as any,
      factors: mockBreakdown.factors,
      explanation: 'Test explanation',
    };
    
    render(<ComplexityBreakdown breakdown={onlyFrontend} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Frontend')).toBeInTheDocument();
  });

  it('renders with missing explanation', () => {
    const noExplanation: EnhancedComplexityResult = {
      score: 6,
      breakdown: mockBreakdown.breakdown,
      factors: mockBreakdown.factors,
    } as any;
    
    render(<ComplexityBreakdown breakdown={noExplanation} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
  });

  it('renders with empty technologies arrays', () => {
    const emptyTech: EnhancedComplexityResult = {
      score: 0,
      breakdown: {
        frontend: { score: 0, max: 3, technologies: [] },
        backend: { score: 0, max: 4, technologies: [] },
        infrastructure: { score: 0, max: 3, technologies: [] },
      },
      factors: {
        customCode: false,
        frameworkComplexity: 'low',
        infrastructureComplexity: 'low',
        technologyCount: 0,
        licensingComplexity: false,
      },
      explanation: 'Minimal complexity',
    };
    
    render(<ComplexityBreakdown breakdown={emptyTech} />);
    
    // Should render without crashing
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });
});
