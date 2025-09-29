import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { StructuredAnalysis } from '@shared/schema';
import { copyMarkdown, slugify, downloadJson } from '../StructuredReport';

describe('StructuredReport Copy Markdown Functionality', () => {
  const mockData: StructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test target audience',
      monetization: 'Test monetization strategy'
    },
    market: {
      competitors: [
        { name: 'Competitor 1', url: 'https://competitor1.com', notes: 'Strong competitor' },
        { name: 'Competitor 2', notes: 'Emerging player' }
      ],
      swot: {
        strengths: ['Strong brand', 'Good technology'],
        weaknesses: ['Limited market reach'],
        opportunities: ['Growing market', 'New technologies'],
        threats: ['Increased competition']
      }
    },
    technical: {
      techStack: ['React', 'Node.js', 'PostgreSQL'],
      uiColors: ['#FF0000', '#00FF00'],
      keyPages: ['Home', 'About', 'Contact']
    },
    data: {
      trafficEstimates: {
        value: '100K monthly visitors',
        source: 'SimilarWeb'
      },
      keyMetrics: [
        { name: 'Conversion Rate', value: '2.5%', source: 'Analytics' },
        { name: 'Bounce Rate', value: '45%' }
      ]
    },
    synthesis: {
      summary: 'This is a comprehensive business analysis summary',
      keyInsights: ['Insight 1', 'Insight 2'],
      nextActions: ['Action 1', 'Action 2']
    }
  };

  const testUrl = 'https://example.com';

  it('should generate proper markdown with all sections', () => {
    const markdown = copyMarkdown(mockData, testUrl);
    
    // Check that all main sections are included
    expect(markdown).toContain('# Business Analysis Report');
    expect(markdown).toContain('## Overview & Business');
    expect(markdown).toContain('## Market & Competitors');
    expect(markdown).toContain('## Technical & Website');
    expect(markdown).toContain('## Data & Analytics');
    expect(markdown).toContain('## Synthesis & Key Takeaways');
    
    // Check URL is included
    expect(markdown).toContain(`**URL:** ${testUrl}`);
  });

  it('should format competitor URLs as markdown links', () => {
    const markdown = copyMarkdown(mockData, testUrl);
    
    // Check that competitor with URL is formatted as markdown link
    expect(markdown).toContain('[Competitor 1](https://competitor1.com)');
    // Check that competitor without URL is formatted as plain text
    expect(markdown).toContain('- Competitor 2 - Emerging player');
  });

  it('should format SWOT analysis as separate bullet lists', () => {
    const markdown = copyMarkdown(mockData, testUrl);
    
    // Check SWOT section headers
    expect(markdown).toContain('#### Strengths');
    expect(markdown).toContain('#### Weaknesses');
    expect(markdown).toContain('#### Opportunities');
    expect(markdown).toContain('#### Threats');
    
    // Check bullet points
    expect(markdown).toContain('- Strong brand');
    expect(markdown).toContain('- Limited market reach');
    expect(markdown).toContain('- Growing market');
    expect(markdown).toContain('- Increased competition');
  });

  it('should handle missing data gracefully', () => {
    const minimalData: StructuredAnalysis = {
      overview: {
        valueProposition: 'Test value proposition'
      }
    };
    
    const markdown = copyMarkdown(minimalData, testUrl);
    
    // Should still generate valid markdown
    expect(markdown).toContain('# Business Analysis Report');
    expect(markdown).toContain('## Overview & Business');
    expect(markdown).toContain('Test value proposition');
    
    // Should not contain sections that don't exist
    expect(markdown).not.toContain('### Target Audience');
    expect(markdown).not.toContain('## Market & Competitors');
  });
});

describe('StructuredReport Slugify Functionality', () => {
  it('should convert URL to safe filename', () => {
    expect(slugify('https://example.com')).toBe('https-example-com');
    expect(slugify('https://example.com/path/to/page')).toBe('https-example-com-path-to-page');
    expect(slugify('HTTPS://EXAMPLE.COM')).toBe('https-example-com');
  });

  it('should handle special characters', () => {
    expect(slugify('https://example.com/page?param=value&other=123')).toBe('https-example-com-page-param-value-other-123');
    expect(slugify('https://sub.example.com:8080/path#section')).toBe('https-sub-example-com-8080-path-section');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(slugify('---test---')).toBe('test');
    expect(slugify('!@#test!@#')).toBe('test');
  });

  it('should replace multiple consecutive hyphens with single hyphen', () => {
    expect(slugify('test---multiple---hyphens')).toBe('test-multiple-hyphens');
    expect(slugify('test!!!multiple!!!special')).toBe('test-multiple-special');
  });
});

describe('StructuredReport Download JSON Functionality', () => {
  const mockData: StructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition'
    },
    market: {
      competitors: [
        { name: 'Competitor 1', url: 'https://competitor1.com' }
      ]
    }
  };

  const testUrl = 'https://example.com';

  // Mock DOM APIs
  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-blob-url');
    global.URL.revokeObjectURL = vi.fn();

    // Mock document.createElement and related DOM methods
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create blob with correct JSON data', () => {
    // Mock Blob constructor
    const mockBlob = { type: 'application/json' };
    global.Blob = vi.fn().mockImplementation((content, options) => {
      expect(content[0]).toContain('"url": "https://example.com"');
      expect(content[0]).toContain('"structuredAnalysis"');
      expect(content[0]).toContain('"valueProposition": "Test value proposition"');
      expect(content[0]).toContain('"analyzedAt"');
      expect(options.type).toBe('application/json');
      return mockBlob;
    }) as any;

    downloadJson(mockData, testUrl);

    expect(global.Blob).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining(testUrl)]),
      { type: 'application/json' }
    );
  });

  it('should generate correct filename with slugified URL', () => {
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    downloadJson(mockData, testUrl);

    expect(mockLink.download).toBe('analysis-https-example-com.json');
  });

  it('should trigger download with correct blob URL', () => {
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    downloadJson(mockData, testUrl);

    expect(mockLink.href).toBe('mock-blob-url');
    expect(mockLink.click).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('mock-blob-url');
  });

  it('should handle errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock Blob to throw an error
    global.Blob = vi.fn().mockImplementation(() => {
      throw new Error('Blob creation failed');
    }) as any;

    // Should not throw
    expect(() => downloadJson(mockData, testUrl)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledWith('Failed to download JSON:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });
});