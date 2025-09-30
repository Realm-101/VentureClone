import { render, screen } from '@testing-library/react';
import { StructuredReport } from '@/components/StructuredReport';
import type { EnhancedStructuredAnalysis } from '@shared/schema';

describe('StructuredReport - Enhanced Features', () => {
  const mockEnhancedData: EnhancedStructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test audience',
      monetization: 'Test monetization'
    },
    market: {
      competitors: [
        { name: 'Competitor 1', url: 'https://competitor1.com' }
      ],
      swot: {
        strengths: ['Strong brand'],
        weaknesses: ['Limited reach'],
        opportunities: ['Market expansion'],
        threats: ['Competition']
      }
    },
    technical: {
      techStack: ['React', 'Node.js'],
      confidence: 0.4, // Below 0.6 threshold
      uiColors: ['#FF0000', '#00FF00'],
      keyPages: ['/home', '/about']
    },
    data: {
      trafficEstimates: {
        value: '10K monthly visits',
        source: 'https://analytics.com'
      },
      keyMetrics: [
        {
          name: 'Revenue',
          value: '$50K/month',
          source: 'https://source.com'
        }
      ]
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Insight 1', 'Insight 2'],
      nextActions: ['Action 1', 'Action 2']
    },
    sources: [
      {
        url: 'https://example.com/article',
        excerpt: 'This is evidence from the source article that supports our analysis.'
      },
      {
        url: 'https://another-source.com/data',
        excerpt: 'Additional evidence from another reliable source.'
      }
    ]
  };

  it('displays confidence badge when technical confidence is below 0.6', () => {
    render(<StructuredReport data={mockEnhancedData} url="https://test.com" />);
    
    expect(screen.getByText('Speculative')).toBeInTheDocument();
  });

  it('displays source attribution section', () => {
    render(<StructuredReport data={mockEnhancedData} url="https://test.com" />);
    
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('another-source.com')).toBeInTheDocument();
    expect(screen.getByText('"This is evidence from the source article that supports our analysis."')).toBeInTheDocument();
  });

  it('handles enhanced data gracefully when confidence is high', () => {
    const highConfidenceData = {
      ...mockEnhancedData,
      technical: {
        ...mockEnhancedData.technical!,
        confidence: 0.8 // Above 0.6 threshold
      }
    };

    render(<StructuredReport data={highConfidenceData} url="https://test.com" />);
    
    // Should not show speculative badge
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
    // Should still show tech stack
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('handles missing enhanced fields gracefully', () => {
    const basicData = {
      overview: mockEnhancedData.overview,
      market: mockEnhancedData.market,
      synthesis: mockEnhancedData.synthesis
      // No technical section, no sources
    };

    render(<StructuredReport data={basicData} url="https://test.com" />);
    
    // Should not crash and should not show enhanced features
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
    // Should still show basic content
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
  });

  it('handles original StructuredAnalysis format without enhanced fields', () => {
    const originalData = {
      overview: mockEnhancedData.overview,
      market: mockEnhancedData.market,
      technical: {
        techStack: ['React', 'Node.js'],
        uiColors: ['#FF0000'],
        keyPages: ['/home']
        // No confidence field
      },
      synthesis: mockEnhancedData.synthesis
      // No sources field
    };

    render(<StructuredReport data={originalData} url="https://test.com" />);
    
    // Should not show enhanced features
    expect(screen.queryByText('Speculative')).not.toBeInTheDocument();
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
    // Should still show basic content
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
  });
});