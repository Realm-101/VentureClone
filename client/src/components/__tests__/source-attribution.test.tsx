import { render, screen } from '@testing-library/react';
import { SourceAttribution } from '@/components/ui/source-attribution';
import type { Source } from '@shared/schema';

describe('SourceAttribution', () => {
  const mockSources: Source[] = [
    {
      url: 'https://example.com/article',
      excerpt: 'This is a sample excerpt from the source article that provides evidence for the claim.'
    },
    {
      url: 'https://another-site.com/data',
      excerpt: 'Another piece of evidence from a different source to support the analysis.'
    }
  ];

  it('renders sources with URLs and excerpts', () => {
    render(<SourceAttribution sources={mockSources} />);
    
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
    expect(screen.getByText('another-site.com')).toBeInTheDocument();
    expect(screen.getByText('"This is a sample excerpt from the source article that provides evidence for the claim."')).toBeInTheDocument();
    expect(screen.getByText('"Another piece of evidence from a different source to support the analysis."')).toBeInTheDocument();
  });

  it('does not render when sources array is empty', () => {
    render(<SourceAttribution sources={[]} />);
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
  });

  it('does not render when sources is undefined', () => {
    render(<SourceAttribution />);
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
  });

  it('handles missing source data gracefully', () => {
    render(<SourceAttribution sources={undefined} />);
    expect(screen.queryByText('Sources')).not.toBeInTheDocument();
  });

  it('renders single source correctly', () => {
    const singleSource: Source[] = [
      {
        url: 'https://single-source.com/page',
        excerpt: 'Single source excerpt for testing.'
      }
    ];

    render(<SourceAttribution sources={singleSource} />);
    
    expect(screen.getByText('Sources')).toBeInTheDocument();
    expect(screen.getByText('single-source.com')).toBeInTheDocument();
    expect(screen.getByText('"Single source excerpt for testing."')).toBeInTheDocument();
  });
});