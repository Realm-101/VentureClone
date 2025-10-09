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
      expect(prompt).toContain('IMPORTANT: When recommending a tech stack');
      expect(prompt).toContain('detected technologies above');
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
