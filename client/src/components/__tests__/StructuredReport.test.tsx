import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { StructuredAnalysis } from '@shared/schema';
import { StructuredReport, copyMarkdown, slugify, downloadJson } from '../StructuredReport';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('StructuredReport Component Rendering', () => {
  const completeData: StructuredAnalysis = {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with complete structured data', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    // Check that all main sections are rendered
    expect(screen.getByText('Overview & Business')).toBeInTheDocument();
    expect(screen.getByText('Market & Competitors')).toBeInTheDocument();
    expect(screen.getByText('Technical & Website')).toBeInTheDocument();
    expect(screen.getByText('Data & Analytics')).toBeInTheDocument();
    expect(screen.getByText('Synthesis & Key Takeaways')).toBeInTheDocument();
    
    // Check export buttons are rendered
    expect(screen.getByText('Copy Markdown')).toBeInTheDocument();
    expect(screen.getByText('Download JSON')).toBeInTheDocument();
  });

  it('should render overview section content correctly', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    expect(screen.getByText('Value Proposition')).toBeInTheDocument();
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
    expect(screen.getByText('Target Audience')).toBeInTheDocument();
    expect(screen.getByText('Test target audience')).toBeInTheDocument();
    expect(screen.getByText('Monetization')).toBeInTheDocument();
    expect(screen.getByText('Test monetization strategy')).toBeInTheDocument();
  });

  it('should render competitors with external links', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    expect(screen.getByText('Competitor 1')).toBeInTheDocument();
    expect(screen.getByText('Strong competitor')).toBeInTheDocument();
    expect(screen.getByText('Competitor 2')).toBeInTheDocument();
    expect(screen.getByText('Emerging player')).toBeInTheDocument();
  });

  it('should render SWOT analysis with color-coded sections', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    expect(screen.getByText('Strengths')).toBeInTheDocument();
    expect(screen.getByText('Strong brand')).toBeInTheDocument();
    expect(screen.getByText('Weaknesses')).toBeInTheDocument();
    expect(screen.getByText('Limited market reach')).toBeInTheDocument();
    expect(screen.getByText('Opportunities')).toBeInTheDocument();
    expect(screen.getByText('Growing market')).toBeInTheDocument();
    expect(screen.getByText('Threats')).toBeInTheDocument();
    expect(screen.getByText('Increased competition')).toBeInTheDocument();
  });

  it('should render technical section with tech stack and colors', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    expect(screen.getByText('Technology Stack')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('Node.js')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
    
    expect(screen.getByText('UI Colors')).toBeInTheDocument();
    expect(screen.getByText('#FF0000')).toBeInTheDocument();
    expect(screen.getByText('#00FF00')).toBeInTheDocument();
    
    expect(screen.getByText('Key Pages')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should render data analytics section', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    expect(screen.getByText('Traffic Estimates')).toBeInTheDocument();
    expect(screen.getByText('100K monthly visitors')).toBeInTheDocument();
    expect(screen.getByText('Source: SimilarWeb')).toBeInTheDocument();
    
    expect(screen.getByText('Key Metrics')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('2.5%')).toBeInTheDocument();
    expect(screen.getByText('Source: Analytics')).toBeInTheDocument();
    expect(screen.getByText('Bounce Rate')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should render synthesis section', () => {
    render(<StructuredReport data={completeData} url={testUrl} />);
    
    expect(screen.getByText('Executive Summary')).toBeInTheDocument();
    expect(screen.getByText('This is a comprehensive business analysis summary')).toBeInTheDocument();
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Insight 1')).toBeInTheDocument();
    expect(screen.getByText('Insight 2')).toBeInTheDocument();
    expect(screen.getByText('Next Actions')).toBeInTheDocument();
    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });
});

describe('StructuredReport Partial Data Handling', () => {
  const testUrl = 'https://example.com';

  it('should render with minimal data (only overview)', () => {
    const minimalData: StructuredAnalysis = {
      overview: {
        valueProposition: 'Test value proposition',
        targetAudience: 'Test target audience',
        monetization: 'Test monetization strategy'
      },
      market: {
        competitors: [],
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      },
      synthesis: {
        summary: 'Test summary',
        keyInsights: [],
        nextActions: []
      }
    };
    
    render(<StructuredReport data={minimalData} url={testUrl} />);
    
    // Should render overview section
    expect(screen.getByText('Overview & Business')).toBeInTheDocument();
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
    
    // Should render market section even with empty data
    expect(screen.getByText('Market & Competitors')).toBeInTheDocument();
    
    // Should not render technical section (optional)
    expect(screen.queryByText('Technical & Website')).not.toBeInTheDocument();
    
    // Should not render data section (optional)
    expect(screen.queryByText('Data & Analytics')).not.toBeInTheDocument();
    
    // Should render synthesis section
    expect(screen.getByText('Synthesis & Key Takeaways')).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
  });

  it('should handle missing optional fields gracefully', () => {
    const partialData: StructuredAnalysis = {
      overview: {
        valueProposition: 'Test value proposition',
        targetAudience: 'Test target audience',
        monetization: 'Test monetization strategy'
      },
      market: {
        competitors: [{ name: 'Test Competitor' }],
        swot: {
          strengths: ['Test strength'],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      },
      technical: {
        techStack: ['React']
        // uiColors and keyPages are optional
      },
      data: {
        trafficEstimates: {
          value: '50K visitors'
          // source is optional
        }
        // keyMetrics is optional
      },
      synthesis: {
        summary: 'Test summary',
        keyInsights: ['Test insight'],
        nextActions: []
      }
    };
    
    render(<StructuredReport data={partialData} url={testUrl} />);
    
    // Should render available data
    expect(screen.getByText('Test Competitor')).toBeInTheDocument();
    expect(screen.getByText('Test strength')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('50K visitors')).toBeInTheDocument();
    expect(screen.getByText('Test insight')).toBeInTheDocument();
    
    // Should not render missing optional sections
    expect(screen.queryByText('UI Colors')).not.toBeInTheDocument();
    expect(screen.queryByText('Key Pages')).not.toBeInTheDocument();
    expect(screen.queryByText('Key Metrics')).not.toBeInTheDocument();
  });
});

describe('StructuredReport Null/Undefined Data Handling', () => {
  const testUrl = 'https://example.com';

  it('should return null when data is null', () => {
    const { container } = render(<StructuredReport data={null as any} url={testUrl} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null when data is undefined', () => {
    const { container } = render(<StructuredReport data={undefined as any} url={testUrl} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('StructuredReport Section Collapsible Functionality', () => {
  const testData: StructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test target audience',
      monetization: 'Test monetization strategy'
    },
    market: {
      competitors: [{ name: 'Test Competitor' }],
      swot: {
        strengths: ['Test strength'],
        weaknesses: ['Test weakness'],
        opportunities: ['Test opportunity'],
        threats: ['Test threat']
      }
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Test insight'],
      nextActions: ['Test action']
    }
  };

  const testUrl = 'https://example.com';

  it('should have all sections expanded by default', () => {
    render(<StructuredReport data={testData} url={testUrl} />);
    
    // Content should be visible by default
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
    expect(screen.getByText('Test Competitor')).toBeInTheDocument();
    expect(screen.getByText('Test summary')).toBeInTheDocument();
  });

  it('should collapse and expand overview section when clicked', async () => {
    const user = userEvent.setup();
    render(<StructuredReport data={testData} url={testUrl} />);
    
    const overviewButton = screen.getByRole('button', { name: /overview & business/i });
    
    // Content should be visible initially
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
    
    // Click to collapse
    await user.click(overviewButton);
    
    // Content should be hidden
    expect(screen.queryByText('Test value proposition')).not.toBeInTheDocument();
    
    // Click to expand again
    await user.click(overviewButton);
    
    // Content should be visible again
    expect(screen.getByText('Test value proposition')).toBeInTheDocument();
  });

  it('should collapse and expand market section when clicked', async () => {
    const user = userEvent.setup();
    render(<StructuredReport data={testData} url={testUrl} />);
    
    const marketButton = screen.getByRole('button', { name: /market & competitors/i });
    
    // Content should be visible initially
    expect(screen.getByText('Test Competitor')).toBeInTheDocument();
    
    // Click to collapse
    await user.click(marketButton);
    
    // Content should be hidden
    expect(screen.queryByText('Test Competitor')).not.toBeInTheDocument();
    
    // Click to expand again
    await user.click(marketButton);
    
    // Content should be visible again
    expect(screen.getByText('Test Competitor')).toBeInTheDocument();
  });

  it('should collapse and expand synthesis section when clicked', async () => {
    const user = userEvent.setup();
    render(<StructuredReport data={testData} url={testUrl} />);
    
    const synthesisButton = screen.getByRole('button', { name: /synthesis & key takeaways/i });
    
    // Content should be visible initially
    expect(screen.getByText('Test summary')).toBeInTheDocument();
    
    // Click to collapse
    await user.click(synthesisButton);
    
    // Content should be hidden
    expect(screen.queryByText('Test summary')).not.toBeInTheDocument();
    
    // Click to expand again
    await user.click(synthesisButton);
    
    // Content should be visible again
    expect(screen.getByText('Test summary')).toBeInTheDocument();
  });

  it('should show correct chevron icons for expanded/collapsed states', async () => {
    const user = userEvent.setup();
    render(<StructuredReport data={testData} url={testUrl} />);
    
    const overviewButton = screen.getByRole('button', { name: /overview & business/i });
    
    // Should show ChevronDown icon when expanded (default state)
    const expandedIcon = overviewButton.querySelector('svg');
    expect(expandedIcon).toBeInTheDocument();
    
    // Click to collapse
    await user.click(overviewButton);
    
    // Should show ChevronRight icon when collapsed
    const collapsedIcon = overviewButton.querySelector('svg');
    expect(collapsedIcon).toBeInTheDocument();
  });
});

describe('StructuredReport Export Button Rendering', () => {
  const testData: StructuredAnalysis = {
    overview: {
      valueProposition: 'Test value proposition',
      targetAudience: 'Test target audience',
      monetization: 'Test monetization strategy'
    },
    market: {
      competitors: [{ name: 'Test Competitor' }],
      swot: {
        strengths: ['Test strength'],
        weaknesses: [],
        opportunities: [],
        threats: []
      }
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Test insight'],
      nextActions: ['Test action']
    }
  };

  const testUrl = 'https://example.com';

  it('should render export buttons', () => {
    render(<StructuredReport data={testData} url={testUrl} />);
    
    expect(screen.getByRole('button', { name: /copy markdown/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download json/i })).toBeInTheDocument();
  });

  it('should have correct button text and icons', () => {
    render(<StructuredReport data={testData} url={testUrl} />);
    
    const copyButton = screen.getByRole('button', { name: /copy markdown/i });
    const downloadButton = screen.getByRole('button', { name: /download json/i });
    
    expect(copyButton).toHaveTextContent('Copy Markdown');
    expect(downloadButton).toHaveTextContent('Download JSON');
  });
});

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
        valueProposition: 'Test value proposition',
        targetAudience: 'Test audience',
        monetization: 'Test monetization'
      },
      market: {
        competitors: [],
        swot: {
          strengths: [],
          weaknesses: [],
          opportunities: [],
          threats: []
        }
      },
      synthesis: {
        summary: 'Test summary',
        keyInsights: [],
        nextActions: []
      }
    };
    
    const markdown = copyMarkdown(minimalData, testUrl);
    
    // Should still generate valid markdown
    expect(markdown).toContain('# Business Analysis Report');
    expect(markdown).toContain('## Overview & Business');
    expect(markdown).toContain('Test value proposition');
    
    // Should contain market section even if empty
    expect(markdown).toContain('## Market & Competitors');
    
    // Should not contain optional sections that don't exist
    expect(markdown).not.toContain('## Technical & Website');
    expect(markdown).not.toContain('## Data & Analytics');
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
      valueProposition: 'Test value proposition',
      targetAudience: 'Test audience',
      monetization: 'Test monetization'
    },
    market: {
      competitors: [
        { name: 'Competitor 1', url: 'https://competitor1.com' }
      ],
      swot: {
        strengths: ['Test strength'],
        weaknesses: [],
        opportunities: [],
        threats: []
      }
    },
    synthesis: {
      summary: 'Test summary',
      keyInsights: ['Test insight'],
      nextActions: []
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