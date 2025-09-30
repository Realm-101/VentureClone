import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ExternalLink, Copy, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from '@/components/ui/confidence-badge';
import { SourceAttribution } from '@/components/ui/source-attribution';
import type { StructuredAnalysis, EnhancedStructuredAnalysis } from '@shared/schema';

/**
 * Props interface for the StructuredReport component
 * Supports both original and enhanced structured analysis data
 */
interface StructuredReportProps {
  data: StructuredAnalysis | EnhancedStructuredAnalysis;
  url: string;
}

/**
 * Props interface for the collapsible Section component
 */
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Utility function to generate markdown from structured analysis data
 * Formats all 5 sections with proper heading hierarchy and markdown syntax
 * Supports both original and enhanced structured analysis data
 */
export function copyMarkdown(data: StructuredAnalysis | EnhancedStructuredAnalysis, url: string): string {
  let markdown = `# Business Analysis Report\n\n**URL:** ${url}\n\n`;

  // Overview & Business Section
  if (data.overview) {
    markdown += `## Overview & Business\n\n`;
    
    if (data.overview.valueProposition) {
      markdown += `### Value Proposition\n${data.overview.valueProposition}\n\n`;
    }
    
    if (data.overview.targetAudience) {
      markdown += `### Target Audience\n${data.overview.targetAudience}\n\n`;
    }
    
    if (data.overview.monetization) {
      markdown += `### Monetization\n${data.overview.monetization}\n\n`;
    }
  }

  // Market & Competitors Section
  if (data.market) {
    markdown += `## Market & Competitors\n\n`;
    
    // Competitors
    if (data.market.competitors && data.market.competitors.length > 0) {
      markdown += `### Competitors\n\n`;
      data.market.competitors.forEach(competitor => {
        if (competitor.url) {
          markdown += `- [${competitor.name}](${competitor.url})`;
        } else {
          markdown += `- ${competitor.name}`;
        }
        if (competitor.notes) {
          markdown += ` - ${competitor.notes}`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    }
    
    // SWOT Analysis
    if (data.market.swot) {
      markdown += `### SWOT Analysis\n\n`;
      
      if (data.market.swot.strengths && data.market.swot.strengths.length > 0) {
        markdown += `#### Strengths\n`;
        data.market.swot.strengths.forEach(strength => {
          markdown += `- ${strength}\n`;
        });
        markdown += `\n`;
      }
      
      if (data.market.swot.weaknesses && data.market.swot.weaknesses.length > 0) {
        markdown += `#### Weaknesses\n`;
        data.market.swot.weaknesses.forEach(weakness => {
          markdown += `- ${weakness}\n`;
        });
        markdown += `\n`;
      }
      
      if (data.market.swot.opportunities && data.market.swot.opportunities.length > 0) {
        markdown += `#### Opportunities\n`;
        data.market.swot.opportunities.forEach(opportunity => {
          markdown += `- ${opportunity}\n`;
        });
        markdown += `\n`;
      }
      
      if (data.market.swot.threats && data.market.swot.threats.length > 0) {
        markdown += `#### Threats\n`;
        data.market.swot.threats.forEach(threat => {
          markdown += `- ${threat}\n`;
        });
        markdown += `\n`;
      }
    }
  }

  // Technical & Website Section
  if (data.technical) {
    markdown += `## Technical & Website\n\n`;
    
    if (data.technical.techStack && data.technical.techStack.length > 0) {
      markdown += `### Technology Stack\n`;
      data.technical.techStack.forEach(tech => {
        markdown += `- ${tech}\n`;
      });
      markdown += `\n`;
    }
    
    if (data.technical.uiColors && data.technical.uiColors.length > 0) {
      markdown += `### UI Colors\n`;
      data.technical.uiColors.forEach(color => {
        markdown += `- ${color}\n`;
      });
      markdown += `\n`;
    }
    
    if (data.technical.keyPages && data.technical.keyPages.length > 0) {
      markdown += `### Key Pages\n`;
      data.technical.keyPages.forEach(page => {
        markdown += `- ${page}\n`;
      });
      markdown += `\n`;
    }
  }

  // Data & Analytics Section
  if (data.data) {
    markdown += `## Data & Analytics\n\n`;
    
    if (data.data.trafficEstimates) {
      markdown += `### Traffic Estimates\n`;
      markdown += `**Value:** ${data.data.trafficEstimates.value}\n`;
      if (data.data.trafficEstimates.source) {
        markdown += `**Source:** ${data.data.trafficEstimates.source}\n`;
      }
      markdown += `\n`;
    }
    
    if (data.data.keyMetrics && data.data.keyMetrics.length > 0) {
      markdown += `### Key Metrics\n\n`;
      data.data.keyMetrics.forEach(metric => {
        markdown += `**${metric.name}:** ${metric.value}`;
        if (metric.source) {
          markdown += ` (Source: ${metric.source})`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    }
  }

  // Synthesis & Key Takeaways Section
  if (data.synthesis) {
    markdown += `## Synthesis & Key Takeaways\n\n`;
    
    if (data.synthesis.summary) {
      markdown += `### Executive Summary\n${data.synthesis.summary}\n\n`;
    }
    
    if (data.synthesis.keyInsights && data.synthesis.keyInsights.length > 0) {
      markdown += `### Key Insights\n`;
      data.synthesis.keyInsights.forEach(insight => {
        markdown += `- ${insight}\n`;
      });
      markdown += `\n`;
    }
    
    if (data.synthesis.nextActions && data.synthesis.nextActions.length > 0) {
      markdown += `### Next Actions\n`;
      data.synthesis.nextActions.forEach(action => {
        markdown += `- ${action}\n`;
      });
      markdown += `\n`;
    }
  }

  return markdown;
}

/**
 * Utility function to convert URL to safe filename
 * Replaces non-alphanumeric characters with hyphens and converts to lowercase
 */
export function slugify(url: string): string {
  return url
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading and trailing hyphens
}

/**
 * Utility function to download structured analysis data as JSON file
 * Creates a blob and triggers automatic download with slugified filename
 * Supports both original and enhanced structured analysis data
 */
export function downloadJson(data: StructuredAnalysis | EnhancedStructuredAnalysis, url: string): void {
  try {
    // Create the complete analysis object to download
    const analysisData = {
      url,
      analyzedAt: new Date().toISOString(),
      structuredAnalysis: data
    };

    // Convert to JSON string with proper formatting
    const jsonString = JSON.stringify(analysisData, null, 2);
    
    // Create blob with JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Generate filename using slugified URL
    const slugifiedUrl = slugify(url);
    const filename = `analysis-${slugifiedUrl}.json`;
    
    // Create download link and trigger download
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Failed to download JSON:', error);
    // TODO: Add toast notification for error feedback
  }
}

/**
 * Reusable collapsible section component
 * Provides toggle functionality with default expanded state
 */
function Section({ title, children }: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="border rounded-lg">
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * StructuredReport Component
 * Renders structured business analysis data in organized, collapsible sections
 * Handles missing data gracefully and provides proper null safety
 */
export function StructuredReport({ data, url }: StructuredReportProps) {
  // Return null if no data is provided (graceful degradation)
  if (!data) {
    return null;
  }

  /**
   * Handle copying markdown to clipboard
   * Uses the browser's clipboard API to copy formatted markdown
   */
  const handleCopyMarkdown = async () => {
    try {
      const markdown = copyMarkdown(data, url);
      await navigator.clipboard.writeText(markdown);
      // TODO: Add toast notification for success feedback
    } catch (error) {
      console.error('Failed to copy markdown:', error);
      // TODO: Add toast notification for error feedback
    }
  };

  /**
   * Handle downloading JSON file
   * Uses the downloadJson utility to generate and download the file
   */
  const handleDownloadJson = () => {
    downloadJson(data, url);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Export Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download JSON
          </Button>
        </div>

        <div className="space-y-4">
          {/* Overview & Business Section */}
          {data.overview && (
            <Section title="Overview & Business">
              <div className="space-y-3 mt-3">
                {data.overview.valueProposition && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Value Proposition</h4>
                    <p className="text-sm">{data.overview.valueProposition}</p>
                  </div>
                )}
                {data.overview.targetAudience && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Target Audience</h4>
                    <p className="text-sm">{data.overview.targetAudience}</p>
                  </div>
                )}
                {data.overview.monetization && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Monetization</h4>
                    <p className="text-sm">{data.overview.monetization}</p>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Market & Competitors Section */}
          {data.market && (
            <Section title="Market & Competitors">
              <div className="space-y-4 mt-3">
                {/* Competitors */}
                {data.market.competitors && data.market.competitors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Competitors</h4>
                    <div className="space-y-2">
                      {data.market.competitors.map((competitor, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{competitor.name}</span>
                              {competitor.url && (
                                <button
                                  onClick={() => window.open(competitor.url, '_blank', 'noopener,noreferrer')}
                                  className="text-primary hover:text-primary/80 transition-colors"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            {competitor.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{competitor.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SWOT Analysis */}
                {data.market.swot && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">SWOT Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Strengths */}
                      {data.market.swot.strengths && data.market.swot.strengths.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-xs text-green-700 dark:text-green-400">Strengths</h5>
                          <ul className="text-xs space-y-1">
                            {data.market.swot.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                                <span>{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {data.market.swot.weaknesses && data.market.swot.weaknesses.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-xs text-red-700 dark:text-red-400">Weaknesses</h5>
                          <ul className="text-xs space-y-1">
                            {data.market.swot.weaknesses.map((weakness, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                                <span>{weakness}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Opportunities */}
                      {data.market.swot.opportunities && data.market.swot.opportunities.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-xs text-blue-700 dark:text-blue-400">Opportunities</h5>
                          <ul className="text-xs space-y-1">
                            {data.market.swot.opportunities.map((opportunity, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                <span>{opportunity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Threats */}
                      {data.market.swot.threats && data.market.swot.threats.length > 0 && (
                        <div className="space-y-1">
                          <h5 className="font-medium text-xs text-orange-700 dark:text-orange-400">Threats</h5>
                          <ul className="text-xs space-y-1">
                            {data.market.swot.threats.map((threat, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                                <span>{threat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Technical & Website Section */}
          {data.technical && (
            <Section title="Technical & Website">
              <div className="space-y-3 mt-3">
                {data.technical.techStack && data.technical.techStack.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Technology Stack</h4>
                      <ConfidenceBadge confidence={(data.technical as any).confidence} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.technical.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted rounded-md text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.technical.uiColors && data.technical.uiColors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">UI Colors</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.technical.uiColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-xs font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.technical.keyPages && data.technical.keyPages.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Pages</h4>
                    <ul className="text-sm space-y-1">
                      {data.technical.keyPages.map((page, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{page}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Data & Analytics Section */}
          {data.data && (
            <Section title="Data & Analytics">
              <div className="space-y-3 mt-3">
                {data.data.trafficEstimates && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Traffic Estimates</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{data.data.trafficEstimates.value}</span>
                      {data.data.trafficEstimates.source && (
                        <span className="text-xs text-muted-foreground">Source: {data.data.trafficEstimates.source}</span>
                      )}
                    </div>
                  </div>
                )}
                {data.data.keyMetrics && data.data.keyMetrics.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Metrics</h4>
                    <div className="space-y-2">
                      {data.data.keyMetrics.map((metric, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{metric.name}</span>
                            <span className="text-sm text-muted-foreground">{metric.value}</span>
                          </div>
                          {metric.source && (
                            <div className="text-xs text-muted-foreground pl-0">
                              Source: {metric.source}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Source Attribution for enhanced analysis */}
                {(data as any).sources && (
                  <SourceAttribution sources={(data as any).sources} className="mt-4" />
                )}
              </div>
            </Section>
          )}

          {/* Synthesis & Key Takeaways Section */}
          {data.synthesis && (
            <Section title="Synthesis & Key Takeaways">
              <div className="space-y-3 mt-3">
                {data.synthesis.summary && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Executive Summary</h4>
                    <p className="text-sm">{data.synthesis.summary}</p>
                  </div>
                )}
                {data.synthesis.keyInsights && data.synthesis.keyInsights.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Key Insights</h4>
                    <ul className="text-sm space-y-1">
                      {data.synthesis.keyInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.synthesis.nextActions && data.synthesis.nextActions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">Next Actions</h4>
                    <ul className="text-sm space-y-1">
                      {data.synthesis.nextActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StructuredReport;