import { describe, it, expect } from 'vitest';
import { BusinessImprovementService } from '../services/business-improvement.js';

describe('BusinessImprovementService', () => {
  it('should create service instance', () => {
    const mockAIProvider = {
      generateStructuredContent: vi.fn(),
    } as any;

    const service = new BusinessImprovementService(mockAIProvider);
    expect(service).toBeDefined();
  });

  it('should format plan for clipboard correctly', () => {
    const improvement = {
      twists: [
        "Add AI-powered competitor tracking",
        "Implement collaborative features",
        "Create industry templates"
      ],
      sevenDayPlan: [
        { day: 1, tasks: ["Research APIs", "Define metrics", "Setup project"] },
        { day: 2, tasks: ["Build collection", "Create alerts", "Test accuracy"] }
      ],
      generatedAt: "2024-01-01T12:00:00.000Z"
    };

    const formatted = BusinessImprovementService.formatPlanForClipboard(improvement);

    expect(formatted).toContain('Business Improvement Plan');
    expect(formatted).toContain('Generated: 1/1/2024');
    expect(formatted).toContain('Improvement Angles:');
    expect(formatted).toContain('1. Add AI-powered competitor tracking');
    expect(formatted).toContain('2. Implement collaborative features');
    expect(formatted).toContain('3. Create industry templates');
    expect(formatted).toContain('7-Day Shipping Plan:');
    expect(formatted).toContain('Day 1:');
    expect(formatted).toContain('  • Research APIs');
    expect(formatted).toContain('  • Define metrics');
    expect(formatted).toContain('  • Setup project');
    expect(formatted).toContain('Day 2:');
    expect(formatted).toContain('  • Build collection');
    expect(formatted).toContain('  • Create alerts');
    expect(formatted).toContain('  • Test accuracy');
  });
});