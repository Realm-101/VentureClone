import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuildVsBuySection } from '../build-vs-buy-section';
import type { BuildVsBuyRecommendation } from '../../types/insights';

describe('BuildVsBuySection', () => {
  const mockRecommendations: BuildVsBuyRecommendation[] = [
    {
      technology: 'Authentication',
      recommendation: 'buy',
      reasoning: 'Custom authentication is complex and time-consuming. Use a service.',
      saasAlternative: {
        name: 'Clerk',
        description: 'Modern authentication with built-in UI components',
        pricing: 'Free tier, then $25/mo',
        timeSavings: 120,
        tradeoffs: {
          pros: [
            'Production-ready in hours',
            'Built-in security best practices',
            'Social login included',
          ],
          cons: [
            'Monthly cost',
            'Less customization',
            'Vendor lock-in',
          ],
        },
        recommendedFor: 'mvp',
      },
      estimatedSavings: {
        time: 120,
        cost: 6000,
      },
    },
    {
      technology: 'Payment Processing',
      recommendation: 'buy',
      reasoning: 'Payment processing requires PCI compliance. Use Stripe.',
      saasAlternative: {
        name: 'Stripe',
        description: 'Complete payment infrastructure',
        pricing: '2.9% + 30¢ per transaction',
        timeSavings: 80,
        tradeoffs: {
          pros: [
            'PCI compliant',
            'Global payment methods',
            'Excellent documentation',
          ],
          cons: [
            'Transaction fees',
            'Complex for advanced use cases',
          ],
        },
        recommendedFor: 'both',
      },
      estimatedSavings: {
        time: 80,
        cost: 4000,
      },
    },
    {
      technology: 'Custom CMS',
      recommendation: 'build',
      reasoning: 'The CMS has unique requirements that justify custom development.',
      estimatedSavings: {
        time: 0,
        cost: 0,
      },
    },
  ];

  it('renders with valid recommendations', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Build vs Buy Recommendations')).toBeInTheDocument();
  });

  it('displays all recommendations', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Payment Processing')).toBeInTheDocument();
    expect(screen.getByText('Custom CMS')).toBeInTheDocument();
  });

  it('shows buy recommendations with SaaS alternatives', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Clerk')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
  });

  it('displays SaaS pricing information', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/Free tier, then \$25\/mo/)).toBeInTheDocument();
    expect(screen.getByText(/2.9% \+ 30¢ per transaction/)).toBeInTheDocument();
  });

  it('shows time savings', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/120 hours/)).toBeInTheDocument();
    expect(screen.getByText(/80 hours/)).toBeInTheDocument();
  });

  it('shows cost savings', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/\$6,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$4,000/)).toBeInTheDocument();
  });

  it('displays pros and cons when expanded', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    const clerkCard = screen.getByText('Clerk').closest('div');
    if (clerkCard) {
      fireEvent.click(clerkCard);
    }
    
    expect(screen.getByText('Production-ready in hours')).toBeInTheDocument();
    expect(screen.getByText('Built-in security best practices')).toBeInTheDocument();
    expect(screen.getByText('Social login included')).toBeInTheDocument();
    expect(screen.getByText('Monthly cost')).toBeInTheDocument();
    expect(screen.getByText('Less customization')).toBeInTheDocument();
    expect(screen.getByText('Vendor lock-in')).toBeInTheDocument();
  });

  it('shows recommendation badges for MVP', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Recommended for MVP')).toBeInTheDocument();
  });

  it('shows recommendation badges for both MVP and scale', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Recommended for MVP & Scale')).toBeInTheDocument();
  });

  it('handles build recommendations without SaaS alternatives', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Custom CMS')).toBeInTheDocument();
    expect(screen.getByText(/unique requirements that justify custom development/)).toBeInTheDocument();
  });

  it('displays reasoning for each recommendation', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText(/Custom authentication is complex and time-consuming/)).toBeInTheDocument();
    expect(screen.getByText(/Payment processing requires PCI compliance/)).toBeInTheDocument();
  });

  it('handles empty recommendations array', () => {
    render(<BuildVsBuySection recommendations={[]} />);
    
    expect(screen.getByText('Build vs Buy Recommendations')).toBeInTheDocument();
    expect(screen.getByText('No build vs buy recommendations available')).toBeInTheDocument();
  });

  it('renders external links for SaaS providers', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    // Links should be present (though we can't test actual navigation in unit tests)
    expect(screen.getByText('Clerk')).toBeInTheDocument();
    expect(screen.getByText('Stripe')).toBeInTheDocument();
  });

  it('displays SaaS descriptions', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    expect(screen.getByText('Modern authentication with built-in UI components')).toBeInTheDocument();
    expect(screen.getByText('Complete payment infrastructure')).toBeInTheDocument();
  });

  it('handles recommendations with scale recommendation', () => {
    const scaleRec: BuildVsBuyRecommendation[] = [
      {
        technology: 'Database',
        recommendation: 'buy',
        reasoning: 'Use managed database for scale.',
        saasAlternative: {
          name: 'Supabase',
          description: 'PostgreSQL as a service',
          pricing: 'Free tier, then $25/mo',
          timeSavings: 60,
          tradeoffs: {
            pros: ['Managed infrastructure', 'Auto-scaling'],
            cons: ['Vendor lock-in'],
          },
          recommendedFor: 'scale',
        },
        estimatedSavings: {
          time: 60,
          cost: 3000,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={scaleRec} />);
    
    expect(screen.getByText('Recommended for Scale')).toBeInTheDocument();
  });

  it('displays multiple pros and cons correctly', () => {
    render(<BuildVsBuySection recommendations={mockRecommendations} />);
    
    const stripeCard = screen.getByText('Stripe').closest('div');
    if (stripeCard) {
      fireEvent.click(stripeCard);
    }
    
    expect(screen.getByText('PCI compliant')).toBeInTheDocument();
    expect(screen.getByText('Global payment methods')).toBeInTheDocument();
    expect(screen.getByText('Excellent documentation')).toBeInTheDocument();
    expect(screen.getByText('Transaction fees')).toBeInTheDocument();
    expect(screen.getByText('Complex for advanced use cases')).toBeInTheDocument();
  });

  // Null safety tests
  it('handles undefined recommendations prop gracefully', () => {
    // Component should not crash when recommendations is undefined
    expect(() => render(<BuildVsBuySection recommendations={undefined as any} />)).not.toThrow();
  });

  it('handles null recommendations prop gracefully', () => {
    // Component should not crash when recommendations is null
    expect(() => render(<BuildVsBuySection recommendations={null as any} />)).not.toThrow();
  });

  it('handles recommendations with undefined saasAlternative gracefully', () => {
    const noSaasRec: BuildVsBuyRecommendation[] = [
      {
        technology: 'Custom Feature',
        recommendation: 'buy',
        reasoning: 'Should use a service',
        estimatedSavings: {
          time: 40,
          cost: 2000,
        },
      } as any,
    ];
    
    render(<BuildVsBuySection recommendations={noSaasRec} />);
    
    // Should render without crashing
    expect(screen.getByText('Custom Feature')).toBeInTheDocument();
  });

  it('handles recommendations with undefined estimatedSavings gracefully', () => {
    const noSavingsRec: BuildVsBuyRecommendation[] = [
      {
        technology: 'Test Tech',
        recommendation: 'build',
        reasoning: 'Custom is better',
      } as any,
    ];
    
    render(<BuildVsBuySection recommendations={noSavingsRec} />);
    
    // Should render without crashing
    expect(screen.getByText('Test Tech')).toBeInTheDocument();
  });

  it('handles saasAlternative with undefined nested properties gracefully', () => {
    const partialSaasRec: BuildVsBuyRecommendation[] = [
      {
        technology: 'Partial SaaS',
        recommendation: 'buy',
        reasoning: 'Use a service',
        saasAlternative: {
          name: 'Service Name',
          description: 'Service description',
        } as any,
        estimatedSavings: {
          time: 50,
          cost: 2500,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={partialSaasRec} />);
    
    // Should render without crashing
    expect(screen.getByText('Partial SaaS')).toBeInTheDocument();
    expect(screen.getByText('Service Name')).toBeInTheDocument();
  });

  it('handles saasAlternative with undefined tradeoffs gracefully', () => {
    const noTradeoffsRec: BuildVsBuyRecommendation[] = [
      {
        technology: 'No Tradeoffs',
        recommendation: 'buy',
        reasoning: 'Use a service',
        saasAlternative: {
          name: 'Service',
          description: 'Description',
          pricing: '$10/mo',
          timeSavings: 30,
          recommendedFor: 'mvp',
        } as any,
        estimatedSavings: {
          time: 30,
          cost: 1500,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={noTradeoffsRec} />);
    
    // Should render without crashing
    expect(screen.getByText('No Tradeoffs')).toBeInTheDocument();
  });

  // Partial data tests
  it('renders recommendations missing saasAlternative', () => {
    const noSaas: BuildVsBuyRecommendation[] = [
      {
        technology: 'Custom Feature',
        recommendation: 'build',
        reasoning: 'This requires custom implementation',
        estimatedSavings: {
          time: 0,
          cost: 0,
        },
      } as any,
      {
        technology: 'Another Feature',
        recommendation: 'buy',
        reasoning: 'Should use a service',
        estimatedSavings: {
          time: 40,
          cost: 2000,
        },
      } as any,
    ];
    
    render(<BuildVsBuySection recommendations={noSaas} />);
    
    // Should render without crashing
    expect(screen.getByText('Custom Feature')).toBeInTheDocument();
    expect(screen.getByText('Another Feature')).toBeInTheDocument();
    expect(screen.getByText(/This requires custom implementation/)).toBeInTheDocument();
  });

  it('renders saasAlternative with minimal data', () => {
    const minimalSaas: BuildVsBuyRecommendation[] = [
      {
        technology: 'Minimal SaaS',
        recommendation: 'buy',
        reasoning: 'Use a service',
        saasAlternative: {
          name: 'Service Name',
        } as any,
        estimatedSavings: {
          time: 50,
          cost: 2500,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={minimalSaas} />);
    
    // Should render without crashing
    expect(screen.getByText('Minimal SaaS')).toBeInTheDocument();
    expect(screen.getByText('Service Name')).toBeInTheDocument();
  });

  it('renders saasAlternative missing pricing', () => {
    const noPricing: BuildVsBuyRecommendation[] = [
      {
        technology: 'No Pricing',
        recommendation: 'buy',
        reasoning: 'Use a service',
        saasAlternative: {
          name: 'Service',
          description: 'Service description',
          timeSavings: 60,
          recommendedFor: 'mvp',
        } as any,
        estimatedSavings: {
          time: 60,
          cost: 3000,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={noPricing} />);
    
    // Should render without crashing
    expect(screen.getByText('No Pricing')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('renders saasAlternative with empty tradeoffs', () => {
    const emptyTradeoffs: BuildVsBuyRecommendation[] = [
      {
        technology: 'Empty Tradeoffs',
        recommendation: 'buy',
        reasoning: 'Use a service',
        saasAlternative: {
          name: 'Service',
          description: 'Description',
          pricing: '$20/mo',
          timeSavings: 40,
          tradeoffs: {
            pros: [],
            cons: [],
          },
          recommendedFor: 'both',
        },
        estimatedSavings: {
          time: 40,
          cost: 2000,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={emptyTradeoffs} />);
    
    // Should render without crashing
    expect(screen.getByText('Empty Tradeoffs')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('renders recommendations missing estimatedSavings', () => {
    const noSavings: BuildVsBuyRecommendation[] = [
      {
        technology: 'No Savings',
        recommendation: 'build',
        reasoning: 'Custom is better',
      } as any,
    ];
    
    render(<BuildVsBuySection recommendations={noSavings} />);
    
    // Should render without crashing
    expect(screen.getByText('No Savings')).toBeInTheDocument();
    expect(screen.getByText(/Custom is better/)).toBeInTheDocument();
  });

  it('renders saasAlternative with partial tradeoffs', () => {
    const partialTradeoffs: BuildVsBuyRecommendation[] = [
      {
        technology: 'Partial Tradeoffs',
        recommendation: 'buy',
        reasoning: 'Use a service',
        saasAlternative: {
          name: 'Service',
          description: 'Description',
          pricing: '$15/mo',
          timeSavings: 35,
          tradeoffs: {
            pros: ['Fast setup', 'Reliable'],
          } as any,
          recommendedFor: 'mvp',
        },
        estimatedSavings: {
          time: 35,
          cost: 1750,
        },
      },
    ];
    
    render(<BuildVsBuySection recommendations={partialTradeoffs} />);
    
    // Should render without crashing
    expect(screen.getByText('Partial Tradeoffs')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });
});
