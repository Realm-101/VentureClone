import { describe, it, expect } from 'vitest';
import { WorkflowService } from '../services/workflow';

describe('WorkflowService - Enhanced Prompts with Tech Detection', () => {
  const mockStorage = {} as any;
  const workflowService = new WorkflowService(mockStorage);

  describe('Stage 3 Prompt Enhancement', () => {
    it('should include detected technologies in Stage 3 prompt', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'React', version: '18.2.0', categories: ['JavaScript frameworks'] },
                { name: 'Next.js', version: '13.4.1', categories: ['Web frameworks'] },
                { name: 'Vercel', categories: ['PaaS'] },
              ],
            },
            techStack: ['React', 'TypeScript'],
            complexityScore: 6,
            keyFeatures: ['User auth', 'Dashboard'],
          },
        },
        stages: {
          2: {
            content: {
              effortScore: 5,
              recommendation: 'go',
              automationPotential: { score: 0.7 },
            },
          },
        },
      };

      const { prompt, systemPrompt } = workflowService.getStage3Prompt(analysis);

      // Verify detected technologies are included
      expect(prompt).toContain('Detected Technologies (via Wappalyzer)');
      expect(prompt).toContain('React 18.2.0');
      expect(prompt).toContain('Next.js 13.4.1');
      expect(prompt).toContain('Vercel');
      
      // Verify AI-inferred technologies are also shown
      expect(prompt).toContain('AI-Inferred Technologies');
      expect(prompt).toContain('React, TypeScript');
      
      // Verify complexity score is included
      expect(prompt).toContain('Technical Complexity Score: 6/10');
      
      // Verify instruction to use detected tech
      expect(prompt).toContain('ORIGINAL TECHNOLOGY STACK');
      expect(prompt).toContain('ORIGINAL STACK: What the business currently uses');
      expect(prompt).toContain('RECOMMENDED MVP STACK: Your simplified recommendations');
    });

    it('should include enhanced complexity breakdown when available', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'React', categories: ['JavaScript frameworks'] },
                { name: 'Node.js', categories: ['Web frameworks'] },
                { name: 'PostgreSQL', categories: ['Databases'] },
              ],
            },
            keyFeatures: ['User auth', 'Dashboard'],
          },
        },
        enhancedComplexity: {
          score: 7,
          breakdown: {
            frontend: { score: 2, max: 3, technologies: ['React', 'Tailwind CSS'] },
            backend: { score: 3, max: 4, technologies: ['Node.js', 'Express'] },
            infrastructure: { score: 2, max: 3, technologies: ['PostgreSQL', 'AWS'] },
          },
          factors: {
            customCode: true,
            frameworkComplexity: 'medium',
            infrastructureComplexity: 'medium',
            technologyCount: 8,
            licensingComplexity: false,
          },
          explanation: 'Moderate complexity with custom backend logic',
        },
        stages: {
          2: {
            content: {
              effortScore: 6,
              recommendation: 'go',
              automationPotential: { score: 0.6 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Verify complexity breakdown is included
      expect(prompt).toContain('COMPLEXITY BREAKDOWN');
      expect(prompt).toContain('Overall Complexity: 7/10');
      expect(prompt).toContain('Frontend Complexity: 2/3');
      expect(prompt).toContain('Backend Complexity: 3/4');
      expect(prompt).toContain('Infrastructure Complexity: 2/3');
      expect(prompt).toContain('Custom Code Required: Yes');
      expect(prompt).toContain('Framework Complexity: medium');
      expect(prompt).toContain('Technology Count: 8');
      expect(prompt).toContain('Moderate complexity with custom backend logic');
    });

    it('should include recommended alternatives when available', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'Angular', categories: ['JavaScript frameworks'] },
              ],
            },
            keyFeatures: ['Dashboard'],
          },
        },
        technologyInsights: {
          alternatives: {
            'Angular': ['React', 'Vue.js', 'Svelte'],
            'Custom Auth': ['Clerk', 'Auth0', 'Supabase Auth'],
          },
          buildVsBuy: [],
          skills: [],
          estimates: {
            timeEstimate: { minimum: '2 months', maximum: '4 months', realistic: '3 months' },
            costEstimate: {
              development: '$5,000-$10,000',
              infrastructure: '$100-$300/month',
              maintenance: '$200-$500/month',
              total: '$5,000-$10,000 + $300-$800/month',
            },
            teamSize: { minimum: 1, recommended: 2 },
          },
          recommendations: [],
        },
        stages: {
          2: {
            content: {
              effortScore: 5,
              recommendation: 'go',
              automationPotential: { score: 0.7 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Verify alternatives are included
      expect(prompt).toContain('RECOMMENDED ALTERNATIVES FOR MVP');
      expect(prompt).toContain('Instead of Angular, consider: React, Vue.js, Svelte');
      expect(prompt).toContain('Instead of Custom Auth, consider: Clerk, Auth0, Supabase Auth');
    });

    it('should include build vs buy recommendations when available', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'Custom CMS', categories: ['CMS'] },
              ],
            },
            keyFeatures: ['Content management'],
          },
        },
        technologyInsights: {
          alternatives: {},
          buildVsBuy: [
            {
              technology: 'Custom CMS',
              recommendation: 'buy',
              reasoning: 'Building a custom CMS takes 3-6 months. Use Contentful or Sanity to launch in weeks.',
              alternatives: ['Contentful', 'Sanity', 'Strapi'],
              estimatedCost: {
                build: '$15,000-$30,000',
                buy: '$300-$500/month',
              },
            },
            {
              technology: 'Custom Authentication',
              recommendation: 'buy',
              reasoning: 'Authentication is complex and security-critical. Use Clerk or Auth0.',
              alternatives: ['Clerk', 'Auth0', 'Supabase Auth'],
              estimatedCost: {
                build: '$5,000-$10,000',
                buy: '$25-$100/month',
              },
            },
          ],
          skills: [],
          estimates: {
            timeEstimate: { minimum: '2 months', maximum: '4 months', realistic: '3 months' },
            costEstimate: {
              development: '$5,000-$10,000',
              infrastructure: '$100-$300/month',
              maintenance: '$200-$500/month',
              total: '$5,000-$10,000 + $300-$800/month',
            },
            teamSize: { minimum: 1, recommended: 2 },
          },
          recommendations: [],
        },
        stages: {
          2: {
            content: {
              effortScore: 7,
              recommendation: 'maybe',
              automationPotential: { score: 0.5 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Verify build vs buy recommendations are included
      expect(prompt).toContain('BUILD VS BUY RECOMMENDATIONS');
      expect(prompt).toContain('Custom CMS: BUY');
      expect(prompt).toContain('Building a custom CMS takes 3-6 months');
      expect(prompt).toContain('Alternatives: Contentful, Sanity, Strapi');
      expect(prompt).toContain('Cost Comparison: Build ($15,000-$30,000) vs Buy ($300-$500/month)');
      expect(prompt).toContain('Custom Authentication: BUY');
    });

    it('should include estimated effort when available', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'React', categories: ['JavaScript frameworks'] },
              ],
            },
            keyFeatures: ['Dashboard'],
          },
        },
        technologyInsights: {
          alternatives: {},
          buildVsBuy: [],
          skills: [],
          estimates: {
            timeEstimate: {
              minimum: '2 months',
              maximum: '5 months',
              realistic: '3.5 months',
            },
            costEstimate: {
              development: '$8,000-$15,000',
              infrastructure: '$150-$400/month',
              maintenance: '$300-$600/month',
              total: '$8,000-$15,000 + $450-$1,000/month',
            },
            teamSize: {
              minimum: 1,
              recommended: 3,
            },
          },
          recommendations: [],
        },
        stages: {
          2: {
            content: {
              effortScore: 6,
              recommendation: 'go',
              automationPotential: { score: 0.6 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Verify estimated effort is included
      expect(prompt).toContain('ESTIMATED EFFORT');
      expect(prompt).toContain('Development Time: 2 months to 5 months (Realistic: 3.5 months)');
      expect(prompt).toContain('Development Cost: $8,000-$15,000');
      expect(prompt).toContain('Infrastructure Cost: $150-$400/month');
      expect(prompt).toContain('Maintenance Cost: $300-$600/month');
      expect(prompt).toContain('Total Estimated Cost: $8,000-$15,000 + $450-$1,000/month');
      expect(prompt).toContain('Team Size: 1 minimum, 3 recommended');
    });

    it('should include clonability score when available', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'React', categories: ['JavaScript frameworks'] },
              ],
            },
            keyFeatures: ['Dashboard'],
          },
        },
        clonabilityScore: {
          score: 8,
          rating: 'easy',
          components: {
            technicalComplexity: { score: 7, weight: 0.4 },
            marketOpportunity: { score: 8, weight: 0.3 },
            resourceRequirements: { score: 9, weight: 0.2 },
            timeToMarket: { score: 8, weight: 0.1 },
          },
          recommendation: 'This is a highly clonable business with low technical complexity and strong market opportunity. Recommended for MVP development.',
          confidence: 0.85,
        },
        stages: {
          2: {
            content: {
              effortScore: 4,
              recommendation: 'go',
              automationPotential: { score: 0.8 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Verify clonability score is included
      expect(prompt).toContain('CLONABILITY SCORE: 8/10 (EASY)');
      expect(prompt).toContain('Technical Complexity Component: 7/10 (Weight: 40%)');
      expect(prompt).toContain('Market Opportunity Component: 8/10 (Weight: 30%)');
      expect(prompt).toContain('Resource Requirements Component: 9/10 (Weight: 20%)');
      expect(prompt).toContain('Time to Market Component: 8/10 (Weight: 10%)');
      expect(prompt).toContain('This is a highly clonable business');
      expect(prompt).toContain('Confidence: 85%');
    });

    it('should require originalStackAnalysis and recommendedMvpStack in JSON format', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'React', categories: ['JavaScript frameworks'] },
              ],
            },
            keyFeatures: ['Dashboard'],
          },
        },
        stages: {
          2: {
            content: {
              effortScore: 5,
              recommendation: 'go',
              automationPotential: { score: 0.7 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Verify new JSON structure is required
      expect(prompt).toContain('"originalStackAnalysis"');
      expect(prompt).toContain('"technologies"');
      expect(prompt).toContain('"strengths"');
      expect(prompt).toContain('"complexity"');
      expect(prompt).toContain('"recommendedMvpStack"');
      expect(prompt).toContain('"reasoning"');
    });

    it('should handle analysis with only AI-inferred tech stack', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            techStack: ['WordPress', 'PHP'],
            keyFeatures: ['Blog', 'Comments'],
          },
        },
        stages: {
          2: {
            content: {
              effortScore: 3,
              recommendation: 'go',
              automationPotential: { score: 0.5 },
            },
          },
        },
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Should show AI-inferred only
      expect(prompt).toContain('AI-Inferred Technologies: WordPress, PHP');
      expect(prompt).not.toContain('Detected Technologies (via Wappalyzer)');
    });

    it('should handle analysis with no tech stack information', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            keyFeatures: ['Feature 1'],
          },
        },
        stages: {},
      };

      const { prompt } = workflowService.getStage3Prompt(analysis);

      // Should show Unknown
      expect(prompt).toContain('Unknown');
    });
  });

  describe('Stage 6 Prompt Enhancement', () => {
    it('should include detected technologies in Stage 6 prompt', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            actualDetected: {
              technologies: [
                { name: 'WordPress', categories: ['CMS', 'Blogs'] },
                { name: 'WooCommerce', categories: ['Ecommerce'] },
                { name: 'Google Analytics', categories: ['Analytics'] },
              ],
            },
            techStack: ['WordPress'],
            complexityScore: 4,
          },
        },
        stages: {
          2: {
            content: {
              automationPotential: {
                score: 0.8,
                opportunities: ['Chatbot', 'Email automation'],
              },
            },
          },
          3: {
            content: {
              coreFeatures: ['Product catalog', 'Checkout'],
              techStack: {
                frontend: ['WordPress'],
                backend: ['PHP', 'MySQL'],
              },
            },
          },
          5: {
            content: {
              growthChannels: [{ channel: 'SEO' }],
              resourceScaling: [{ phase: 'Phase 1' }],
            },
          },
        },
      };

      const { prompt } = workflowService.getStage6Prompt(analysis);

      // Verify detected technologies are included
      expect(prompt).toContain('Detected Technologies (via Wappalyzer)');
      expect(prompt).toContain('WordPress');
      expect(prompt).toContain('WooCommerce');
      expect(prompt).toContain('Google Analytics');
      
      // Verify technology categories are included
      expect(prompt).toContain('Technology Categories');
      expect(prompt).toContain('CMS');
      expect(prompt).toContain('Ecommerce');
      expect(prompt).toContain('Analytics');
      
      // Verify complexity score is included
      expect(prompt).toContain('Technical Complexity Score: 4/10');
      
      // Verify platform-specific automation guidance
      expect(prompt).toContain('IMPORTANT: When recommending AI automation tools');
      expect(prompt).toContain('If WordPress is detected, recommend WordPress-specific AI plugins');
      expect(prompt).toContain('If Shopify is detected, recommend Shopify AI apps');
    });

    it('should handle analysis with only AI-inferred tech stack', () => {
      const analysis = {
        url: 'https://example.com',
        businessModel: 'Test Business',
        structured: {
          overview: {
            valueProposition: 'Test value prop',
            monetization: 'Subscription',
            targetAudience: 'Developers',
          },
          technical: {
            techStack: ['React', 'Node.js'],
          },
        },
        stages: {
          2: {
            content: {
              automationPotential: { score: 0.6, opportunities: [] },
            },
          },
          3: {
            content: {
              coreFeatures: [],
              techStack: { frontend: ['React'], backend: ['Node.js'] },
            },
          },
          5: {
            content: {
              growthChannels: [],
              resourceScaling: [],
            },
          },
        },
      };

      const { prompt } = workflowService.getStage6Prompt(analysis);

      // Should show AI-inferred only
      expect(prompt).toContain('AI-Inferred Technologies: React, Node.js');
      expect(prompt).not.toContain('Detected Technologies (via Wappalyzer)');
    });
  });
});
