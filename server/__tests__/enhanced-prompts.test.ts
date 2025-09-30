import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIProviderService } from '../services/ai-providers';

describe('Enhanced AI Prompts', () => {
  let aiService: AIProviderService;

  beforeEach(() => {
    // Mock the initializeClient method to avoid OpenAI client initialization
    vi.spyOn(AIProviderService.prototype, 'initializeClient' as any).mockImplementation(() => {});
    aiService = new AIProviderService('test-key', 'openai');
  });

  it('should create evidence-based system prompt without hedging language', () => {
    const systemPrompt = aiService.createEvidenceBasedSystemPrompt();
    
    expect(systemPrompt).toContain('evidence-based analysis');
    expect(systemPrompt).toContain('without hedging language');
    expect(systemPrompt).toContain('Use "unknown" instead of guessing');
    expect(systemPrompt).toContain('confidence scores');
    expect(systemPrompt).toContain('source URLs and excerpts');
    expect(systemPrompt).toContain('Never use hedging language');
    expect(systemPrompt).toContain('Make definitive statements');
  });

  it('should create enhanced analysis prompt with first-party context', () => {
    const firstPartyData = {
      title: 'Test Business',
      description: 'A test business description',
      h1: 'Welcome to Test Business',
      textSnippet: 'We provide amazing services...',
      url: 'https://test-business.com'
    };

    const prompt = aiService.createEnhancedAnalysisPrompt('https://test-business.com', firstPartyData);
    
    expect(prompt).toContain('FIRST-PARTY WEBSITE CONTEXT');
    expect(prompt).toContain('Test Business');
    expect(prompt).toContain('A test business description');
    expect(prompt).toContain('confidence');
    expect(prompt).toContain('sources');
    expect(prompt).toContain('evidence-based');
    expect(prompt).toContain('unknown');
  });

  it('should create enhanced analysis prompt without first-party context', () => {
    const prompt = aiService.createEnhancedAnalysisPrompt('https://test-business.com');
    
    expect(prompt).toContain('SITE CONTEXT unavailable');
    expect(prompt).toContain('confidence');
    expect(prompt).toContain('sources');
    expect(prompt).toContain('evidence-based');
  });

  it('should create business improvement prompt', () => {
    const analysis = {
      overview: {
        valueProposition: 'Test value prop',
        targetAudience: 'Test audience',
        monetization: 'Test monetization'
      },
      synthesis: {
        summary: 'Test summary',
        keyInsights: ['insight 1', 'insight 2'],
        nextActions: ['action 1', 'action 2']
      }
    };

    const prompt = aiService.createImprovementPrompt(analysis);
    
    expect(prompt).toContain('3 distinct improvement angles');
    expect(prompt).toContain('7-day shipping plan');
    expect(prompt).toContain('twists');
    expect(prompt).toContain('sevenDayPlan');
    expect(prompt).toContain('Lean scope');
    expect(prompt).toContain('measurable KPIs');
  });

  it('should create business improvement prompt with goal', () => {
    const analysis = {
      overview: {
        valueProposition: 'Test value prop',
        targetAudience: 'Test audience',
        monetization: 'Test monetization'
      }
    };

    const goal = 'Increase user engagement';
    const prompt = aiService.createImprovementPrompt(analysis, goal);
    
    expect(prompt).toContain('IMPROVEMENT GOAL: Increase user engagement');
  });
});