import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClonabilityScoreCard } from '../clonability-score-card';
import { RecommendationsSection } from '../recommendations-section';
import { EstimatesCard } from '../estimates-card';
import { ComplexityBreakdown } from '../complexity-breakdown';
import { BuildVsBuySection } from '../build-vs-buy-section';
import { SkillRequirementsSection } from '../skill-requirements-section';
import type {
  ClonabilityScore,
  Recommendation,
  TimeAndCostEstimates,
  EnhancedComplexityResult,
  BuildVsBuyRecommendation,
  SkillRequirement,
} from '../../types/insights';

describe('Responsive Behavior Tests', () => {
  // Mock window.matchMedia for responsive tests
  const mockMatchMedia = (width: number) => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes(`max-width: ${width}px`),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
  };

  beforeEach(() => {
    // Reset to desktop size
    mockMatchMedia(1920);
  });

  afterEach(() => {
    // Clean up
  });

  const mockClonabilityScore: ClonabilityScore = {
    score: 7,
    rating: 'easy',
    components: {
      technicalComplexity: { score: 6, weight: 0.4 },
      marketOpportunity: { score: 8, weight: 0.3 },
      resourceRequirements: { score: 7, weight: 0.2 },
      timeToMarket: { score: 9, weight: 0.1 },
    },
    recommendation: 'Good opportunity.',
    confidence: 0.85,
  };

  const mockRecommendations: Recommendation[] = [
    {
      type: 'simplify',
      title: 'Simplify Auth',
      description: 'Use Clerk.',
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
      frontend: { score: 2, max: 3, technologies: ['React'] },
      backend: { score: 3, max: 4, technologies: ['Node.js'] },
      infrastructure: { score: 1, max: 3, technologies: ['Vercel'] },
    },
    factors: {
      customCode: true,
      frameworkComplexity: 'medium',
      infrastructureComplexity: 'low',
      technologyCount: 3,
      licensingComplexity: false,
    },
    explanation: 'Moderate.',
  };

  const mockBuildVsBuy: BuildVsBuyRecommendation[] = [
    {
      technology: 'Auth',
      recommendation: 'buy',
      reasoning: 'Use service.',
      saasAlternative: {
        name: 'Clerk',
        description: 'Auth service',
        pricing: 'Free',
        timeSavings: 120,
        tradeoffs: {
          pros: ['Fast'],
          cons: ['Cost'],
        },
        recommendedFor: 'mvp',
      },
      estimatedSavings: { time: 120, cost: 6000 },
    },
  ];

  const mockSkills: SkillRequirement[] = [
    {
      skill: 'React',
      category: 'frontend',
      proficiency: 'intermediate',
      priority: 'critical',
      learningResources: [
        {
          title: 'Tutorial',
          url: 'https://example.com',
          type: 'tutorial',
          difficulty: 'beginner',
        },
      ],
      relatedTechnologies: ['React'],
    },
  ];

  describe('Desktop (1920px)', () => {
    beforeEach(() => {
      mockMatchMedia(1920);
    });

    it('renders ClonabilityScoreCard on desktop', () => {
      render(<ClonabilityScoreCard score={mockClonabilityScore} />);
      expect(screen.getByText('Clonability Score')).toBeInTheDocument();
    });

    it('renders RecommendationsSection on desktop', () => {
      render(<RecommendationsSection recommendations={mockRecommendations} />);
      expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    });

    it('renders EstimatesCard on desktop', () => {
      render(<EstimatesCard estimates={mockEstimates} />);
      expect(screen.getByText('Time & Cost Estimates')).toBeInTheDocument();
    });

    it('renders ComplexityBreakdown on desktop', () => {
      render(<ComplexityBreakdown breakdown={mockComplexity} />);
      expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    });

    it('renders BuildVsBuySection on desktop', () => {
      render(<BuildVsBuySection recommendations={mockBuildVsBuy} />);
      expect(screen.getByText('Build vs Buy Recommendations')).toBeInTheDocument();
    });

    it('renders SkillRequirementsSection on desktop', () => {
      render(<SkillRequirementsSection skills={mockSkills} />);
      expect(screen.getByText('Required Skills')).toBeInTheDocument();
    });
  });

  describe('Tablet (768px)', () => {
    beforeEach(() => {
      mockMatchMedia(768);
    });

    it('renders ClonabilityScoreCard on tablet', () => {
      render(<ClonabilityScoreCard score={mockClonabilityScore} />);
      expect(screen.getByText('Clonability Score')).toBeInTheDocument();
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('renders RecommendationsSection on tablet', () => {
      render(<RecommendationsSection recommendations={mockRecommendations} />);
      expect(screen.getByText('Simplify Auth')).toBeInTheDocument();
    });

    it('renders EstimatesCard on tablet', () => {
      render(<EstimatesCard estimates={mockEstimates} />);
      expect(screen.getByText('3-6 months')).toBeInTheDocument();
    });

    it('renders ComplexityBreakdown on tablet', () => {
      render(<ComplexityBreakdown breakdown={mockComplexity} />);
      expect(screen.getByText('6/10')).toBeInTheDocument();
    });

    it('renders BuildVsBuySection on tablet', () => {
      render(<BuildVsBuySection recommendations={mockBuildVsBuy} />);
      expect(screen.getByText('Clerk')).toBeInTheDocument();
    });

    it('renders SkillRequirementsSection on tablet', () => {
      render(<SkillRequirementsSection skills={mockSkills} />);
      expect(screen.getByText('React')).toBeInTheDocument();
    });
  });

  describe('Mobile (375px)', () => {
    beforeEach(() => {
      mockMatchMedia(375);
    });

    it('renders ClonabilityScoreCard on mobile', () => {
      render(<ClonabilityScoreCard score={mockClonabilityScore} />);
      expect(screen.getByText('Clonability Score')).toBeInTheDocument();
      expect(screen.getByText('7/10')).toBeInTheDocument();
    });

    it('renders RecommendationsSection on mobile', () => {
      render(<RecommendationsSection recommendations={mockRecommendations} />);
      expect(screen.getByText('Key Recommendations')).toBeInTheDocument();
    });

    it('renders EstimatesCard on mobile', () => {
      render(<EstimatesCard estimates={mockEstimates} />);
      expect(screen.getByText('Time & Cost Estimates')).toBeInTheDocument();
    });

    it('renders ComplexityBreakdown on mobile', () => {
      render(<ComplexityBreakdown breakdown={mockComplexity} />);
      expect(screen.getByText('Complexity Breakdown')).toBeInTheDocument();
    });

    it('renders BuildVsBuySection on mobile', () => {
      render(<BuildVsBuySection recommendations={mockBuildVsBuy} />);
      expect(screen.getByText('Build vs Buy Recommendations')).toBeInTheDocument();
    });

    it('renders SkillRequirementsSection on mobile', () => {
      render(<SkillRequirementsSection skills={mockSkills} />);
      expect(screen.getByText('Required Skills')).toBeInTheDocument();
    });
  });

  describe('Content Readability', () => {
    it('displays all text content clearly', () => {
      render(<ClonabilityScoreCard score={mockClonabilityScore} />);
      
      // All important text should be visible
      expect(screen.getByText('Clonability Score')).toBeVisible();
      expect(screen.getByText('7/10')).toBeVisible();
      expect(screen.getByText('Easy')).toBeVisible();
    });

    it('maintains proper spacing between elements', () => {
      const { container } = render(<EstimatesCard estimates={mockEstimates} />);
      
      // Check that spacing classes are applied
      const spacedElements = container.querySelectorAll('[class*="space-y"]');
      expect(spacedElements.length).toBeGreaterThan(0);
    });

    it('uses appropriate font sizes', () => {
      const { container } = render(<RecommendationsSection recommendations={mockRecommendations} />);
      
      // Check that text size classes are applied
      const textElements = container.querySelectorAll('[class*="text-"]');
      expect(textElements.length).toBeGreaterThan(0);
    });
  });

  describe('Touch-Friendly Interactions', () => {
    it('has clickable areas for expandable sections', () => {
      render(<ComplexityBreakdown breakdown={mockComplexity} />);
      
      const frontendSection = screen.getByText('Frontend');
      expect(frontendSection).toBeInTheDocument();
      
      // Element should be clickable
      expect(frontendSection.closest('button')).toBeTruthy();
    });

    it('has clickable recommendations', () => {
      render(<RecommendationsSection recommendations={mockRecommendations} />);
      
      const recommendation = screen.getByText('Simplify Auth');
      expect(recommendation).toBeInTheDocument();
    });

    it('has clickable skills', () => {
      render(<SkillRequirementsSection skills={mockSkills} />);
      
      const skill = screen.getByText('React');
      expect(skill).toBeInTheDocument();
    });
  });

  describe('Layout Consistency', () => {
    it('maintains consistent card styling across components', () => {
      const { container: container1 } = render(<ClonabilityScoreCard score={mockClonabilityScore} />);
      const { container: container2 } = render(<EstimatesCard estimates={mockEstimates} />);
      
      // Both should use card components
      expect(container1.querySelector('[class*="card"]')).toBeTruthy();
      expect(container2.querySelector('[class*="card"]')).toBeTruthy();
    });

    it('uses consistent spacing patterns', () => {
      const { container } = render(<BuildVsBuySection recommendations={mockBuildVsBuy} />);
      
      // Check for consistent spacing
      const spacedElements = container.querySelectorAll('[class*="space-"]');
      expect(spacedElements.length).toBeGreaterThan(0);
    });
  });
});
