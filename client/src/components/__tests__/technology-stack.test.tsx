import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TechnologyStack } from '../technology-stack';
import type {
  ClonabilityScore,
  TechnologyInsights,
  EnhancedComplexityResult,
  Recommendation,
  BuildVsBuyRecommendation,
  SkillRequirement,
  TimeAndCostEstimates,
} from '@/types/insights';

describe('TechnologyStack Integration', () => {
  const mockClonabilityScore: ClonabilityScore = {
    score: 7,
    rating: 'easy',
    components: {
      technicalComplexity: { score: 6, weight: 0.4 },
      marketOpportunity: { score: 8, weight: 0.3 },
      resourceRequirements: { score: 7, weight: 0.2 },
      timeToMarket: { score: 9, weight: 0.1 },
    },
    recommendation: 'This is a good opportunity for cloning.',
    confidence: 0.85,
  };

  const mockRecommendations: Recommendation[] = [
    {
      type: 'simplify',
      title: 'Simplify Authentication',
      description: 'Use Clerk instead of custom auth.',
      impact: 'high',
      actionable: true,
    },
  ];

  const mockEstimates: TimeAndCostEstimates = {
    developmentTime: { min: 3, max: 6 },
    oneTimeCost: { min: 5000, max: 15000 },
    monthlyCost: { min: 50, max: 200 },
  };

  const mockComplexity: EnhancedComplexityResult = {
    score: 6,
    breakdown: {
      frontend: { score: 2, max: 3, technologies: ['React', 'TypeScript'] },
      backend: { score: 3, max: 4, technologies: ['Node.js', 'Express'] },
      infrastructure: { score: 1, max: 3, technologies: ['Vercel'] },
    },
    factors: {
      customCode: true,
      frameworkComplexity: 'medium',
      infrastructureComplexity: 'low',
      technologyCount: 5,
      licensingComplexity: false,
    },
    explanation: 'Moderate complexity.',
  };

  const mockBuildVsBuy: BuildVsBuyRecommendation[] = [
    {
      technology: 'Authentication',
      recommendation: 'buy',
      reasoning: 'Use a service.',
      saasAlternative: {
        name: 'Clerk',
        description: 'Modern authentication',
        pricing: 'Free tier',
        timeSavings: 120,
        tradeoffs: {
          pros: ['Fast setup'],
          cons: ['Monthly cost'],
        },
        recommendedFor: 'mvp',
      },
      estimatedSavings: {
        time: 120,
        cost: 6000,
      },
    },
  ];

  const mockSkills: SkillRequirement[] = [
    {
      skill: 'React Development',
      category: 'frontend',
      proficiency: 'intermediate',
      priority: 'critical',
      learningResources: [
        {
          title: 'React Tutorial',
          url: 'https://react.dev',
          type: 'documentation',
          difficulty: 'beginner',
        },
      ],
      relatedTechnologies: ['React', 'TypeScript'],
    },
  ];

  const mockInsights: TechnologyInsights = {
    alternatives: new Map(),
    buildVsBuy: mockBuildVsBuy,
    skills: mockSkills,
    estimates: mockEstimates,
    recommendations: mockRecommendations,
  };

  it('renders all components when full data is provided', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
        enhancedComplexity={mockComplexity}
      />
    );

    // Check that all major sections are rendered
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Time & Cost Estimates')).toBeInTheDocument();
    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Build vs Buy Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Required Skills')).toBeInTheDocument();
  });

  it('renders without clonability score', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        enhancedComplexity={mockComplexity}
      />
    );

    expect(screen.queryByText('Clonability Score')).not.toBeInTheDocument();
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
  });

  it('renders without insights', () => {
    render(
      <TechnologyStack
        clonabilityScore={mockClonabilityScore}
        enhancedComplexity={mockComplexity}
      />
    );

    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.queryByText('Key Recommendations')).not.toBeInTheDocument();
  });

  it('renders without enhanced complexity', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.queryByText('Complexity Breakdown')).not.toBeInTheDocument();
  });

  it('renders with only AI inferred tech (legacy mode)', () => {
    render(
      <TechnologyStack
        aiInferredTech={['React', 'Node.js', 'PostgreSQL']}
      />
    );

    // Should show basic tech list
    expect(screen.getByText(/Technology Stack/i)).toBeInTheDocument();
  });

  it('prioritizes insights over basic tech display', () => {
    render(
      <TechnologyStack
        aiInferredTech={['React', 'Node.js']}
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
        enhancedComplexity={mockComplexity}
      />
    );

    // Insights should be shown prominently
    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
  });

  it('displays components in correct order', () => {
    const { container } = render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
        enhancedComplexity={mockComplexity}
      />
    );

    const sections = container.querySelectorAll('[class*="space-y"]');
    expect(sections.length).toBeGreaterThan(0);

    // Clonability should be first
    const firstCard = container.querySelector('div');
    expect(firstCard?.textContent).toContain('Clonability Score');
  });

  it('handles partial insights data', () => {
    const partialInsights: TechnologyInsights = {
      alternatives: new Map(),
      buildVsBuy: [],
      skills: [],
      estimates: mockEstimates,
      recommendations: mockRecommendations,
    };

    render(
      <TechnologyStack
        insights={partialInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    expect(screen.getByText('Time & Cost Estimates')).toBeInTheDocument();
    // Empty arrays should show "no data" messages
    expect(screen.getByText('No build vs buy recommendations available')).toBeInTheDocument();
    expect(screen.getByText('No skill requirements available')).toBeInTheDocument();
  });

  it('renders with detected tech data', () => {
    const detectedTech = {
      technologies: [
        { name: 'React', category: 'frontend', confidence: 0.9 },
        { name: 'Node.js', category: 'backend', confidence: 0.85 },
      ],
      detectedAt: new Date().toISOString(),
    };

    render(
      <TechnologyStack
        detectedTech={detectedTech}
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('Clonability Score')).toBeInTheDocument();
  });

  it('handles empty state gracefully', () => {
    render(<TechnologyStack />);

    // Should render without crashing
    expect(screen.getByText(/Technology Stack/i)).toBeInTheDocument();
  });

  it('displays complexity score when provided', () => {
    render(
      <TechnologyStack
        complexityScore={6}
        enhancedComplexity={mockComplexity}
      />
    );

    expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    expect(screen.getByText('6/10')).toBeInTheDocument();
  });

  it('integrates all components with consistent styling', () => {
    const { container } = render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
        enhancedComplexity={mockComplexity}
      />
    );

    // Check that cards are rendered with consistent spacing
    const cards = container.querySelectorAll('[class*="card"]');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders recommendations section with data from insights', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('Simplify Authentication')).toBeInTheDocument();
    expect(screen.getByText('High Impact')).toBeInTheDocument();
  });

  it('renders estimates section with data from insights', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('3-6 months')).toBeInTheDocument();
    expect(screen.getByText('$5,000 - $15,000')).toBeInTheDocument();
  });

  it('renders build vs buy section with data from insights', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Clerk')).toBeInTheDocument();
  });

  it('renders skills section with data from insights', () => {
    render(
      <TechnologyStack
        insights={mockInsights}
        clonabilityScore={mockClonabilityScore}
      />
    );

    expect(screen.getByText('React Development')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('handles technology without categories gracefully', () => {
    const detectedTechWithoutCategories = {
      technologies: [
        { name: 'React', categories: ['frontend'], confidence: 90 },
        { name: 'Unknown Tool', confidence: 50 }, // Missing categories
        { name: 'Node.js', categories: null as any, confidence: 85 }, // Null categories
      ],
      detectedAt: new Date().toISOString(),
    };

    // Should render without crashing
    render(
      <TechnologyStack
        detectedTech={detectedTechWithoutCategories}
      />
    );

    // Component should render successfully
    expect(screen.getByText(/Technology Stack/i)).toBeInTheDocument();
    
    // Technologies with valid categories should still be grouped
    expect(screen.getByText('Detailed Technology List')).toBeInTheDocument();
  });
});
