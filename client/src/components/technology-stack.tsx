import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info, ExternalLink, Code, Database, Palette, BarChart, Shield, Zap, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClonabilityScoreCard } from "./clonability-score-card";
import { RecommendationsSection } from "./recommendations-section";
import { EstimatesCard } from "./estimates-card";
import { ComplexityBreakdown } from "./complexity-breakdown";
import { BuildVsBuySection } from "./build-vs-buy-section";
import { SkillRequirementsSection } from "./skill-requirements-section";

// Use any for now to allow flexibility with the data structure
type TechnologyInsights = any;
type ClonabilityScore = any;
type EnhancedComplexityResult = any;

interface Technology {
  name: string;
  categories: string[];
  confidence: number;
  version?: string;
  website?: string;
  icon?: string;
}

interface TechDetectionResult {
  technologies: Technology[];
  contentType: string;
  detectedAt: string;
}

interface TechnologyStackProps {
  aiInferredTech?: string[] | undefined;
  detectedTech?: TechDetectionResult | any | undefined;
  complexityScore?: number | undefined;
  insights?: TechnologyInsights | undefined;
  clonabilityScore?: ClonabilityScore | undefined;
  enhancedComplexity?: EnhancedComplexityResult | undefined;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Frontend': Code,
  'JavaScript frameworks': Code,
  'UI frameworks': Palette,
  'Backend': Database,
  'Databases': Database,
  'Analytics': BarChart,
  'Security': Shield,
  'Performance': Zap,
  'CMS': Code,
  'Ecommerce': BarChart,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Frontend': 'bg-blue-900/50 text-blue-300 border-blue-500/50',
  'JavaScript frameworks': 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50',
  'UI frameworks': 'bg-purple-900/50 text-purple-300 border-purple-500/50',
  'Backend': 'bg-green-900/50 text-green-300 border-green-500/50',
  'Databases': 'bg-red-900/50 text-red-300 border-red-500/50',
  'Analytics': 'bg-orange-900/50 text-orange-300 border-orange-500/50',
  'Security': 'bg-pink-900/50 text-pink-300 border-pink-500/50',
  'Performance': 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50',
  'CMS': 'bg-indigo-900/50 text-indigo-300 border-indigo-500/50',
  'Ecommerce': 'bg-teal-900/50 text-teal-300 border-teal-500/50',
};

const getComplexityColor = (score: number) => {
  if (score <= 3) return 'bg-green-900/50 text-green-300 border-green-500/50';
  if (score <= 6) return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50';
  return 'bg-red-900/50 text-red-300 border-red-500/50';
};

const getComplexityLabel = (score: number) => {
  if (score <= 3) return 'Low Complexity';
  if (score <= 6) return 'Medium Complexity';
  return 'High Complexity';
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-400';
  if (confidence >= 50) return 'text-yellow-400';
  return 'text-orange-400';
};

export function TechnologyStack({ 
  aiInferredTech, 
  detectedTech, 
  complexityScore,
  insights,
  clonabilityScore,
  enhancedComplexity 
}: TechnologyStackProps) {
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [isDetailedViewOpen, setIsDetailedViewOpen] = useState(false);

  const groupedTechnologies = detectedTech?.technologies?.reduce((acc: Record<string, Technology[]>, tech: Technology) => {
    tech.categories?.forEach((category: string) => {
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(tech);
    });
    return acc;
  }, {} as Record<string, Technology[]>) ?? {};

  return (
    <div className="space-y-6">
      {/* Technology Stack Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-vc-text flex items-center gap-2">
          <Code className="h-5 w-5 text-vc-primary" />
          Technology Stack Analysis
        </h3>
        {complexityScore && !enhancedComplexity && (
          <Badge className={`${getComplexityColor(complexityScore)} text-sm font-medium px-4 py-1 border`}>
            {getComplexityLabel(complexityScore)} ({complexityScore}/10)
          </Badge>
        )}
      </div>

      {/* Limited Insights Notice */}
      {insights?.recommendations && insights.recommendations.some((r: any) => 
        r.title === 'Limited Insights Available' || r.title === 'Insights Unavailable'
      ) && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-yellow-300 font-semibold text-sm">Limited Insights Available</h4>
              <p className="text-sm text-vc-text-muted leading-relaxed">
                Detailed technology insights could not be fully generated. The analysis continues with basic recommendations. 
                Some advanced features like technology alternatives and build-vs-buy recommendations may be limited.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Clonability Score - Most prominent */}
      {clonabilityScore && (
        <ClonabilityScoreCard score={clonabilityScore} />
      )}

      {/* NEW: Key Recommendations */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <RecommendationsSection recommendations={insights.recommendations} />
      )}

      {/* NEW: Time & Cost Estimates */}
      {insights?.estimates && (
        <EstimatesCard estimates={insights.estimates} />
      )}

      {/* ENHANCED: Complexity Breakdown */}
      {enhancedComplexity ? (
        <ComplexityBreakdown breakdown={enhancedComplexity} />
      ) : complexityScore && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-blue-300 font-semibold text-sm">Technical Complexity Score</h4>
              <p className="text-sm text-vc-text-muted leading-relaxed">
                This score (1-10) indicates how difficult it would be to clone this business from a technical perspective.
                Lower scores mean simpler technology stacks that are easier to replicate.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Build vs Buy Recommendations */}
      {insights?.buildVsBuy && insights.buildVsBuy.length > 0 && (
        <BuildVsBuySection recommendations={insights.buildVsBuy} />
      )}

      {/* NEW: Skill Requirements */}
      {insights?.skills && insights.skills.length > 0 && (
        <SkillRequirementsSection skills={insights.skills} />
      )}

      {/* EXISTING: Technology Details (collapsed by default) */}
      <Collapsible open={isDetailedViewOpen} onOpenChange={setIsDetailedViewOpen}>
        <CollapsibleTrigger className="w-full">
          <Card className="bg-vc-dark border-vc-border hover:border-vc-primary transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-vc-primary" />
                  <div className="text-left">
                    <h4 className="text-vc-text font-semibold">Detailed Technology List</h4>
                    <p className="text-sm text-vc-text-muted">
                      {detectedTech ? `${detectedTech.technologies.length} technologies detected` : 'View all detected technologies'}
                    </p>
                  </div>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-vc-text-muted transition-transform ${isDetailedViewOpen ? 'rotate-180' : ''}`} 
                />
              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Inferred Technologies */}
            {aiInferredTech && aiInferredTech.length > 0 && (
              <Card className="bg-vc-dark border-vc-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-vc-text font-semibold">AI Inferred Stack</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-vc-text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Technologies identified by AI analysis based on website content, patterns, and behavior.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {aiInferredTech.map((tech, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-vc-accent text-vc-accent bg-vc-accent/10"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detected Technologies Summary */}
            {detectedTech && (
              <Card className="bg-vc-dark border-vc-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-vc-text font-semibold">Detected Technologies</h4>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-vc-text-muted cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Technologies detected using Wappalyzer analysis of the website's code, headers, and resources.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-vc-text-muted">Total Technologies</span>
                      <span className="text-lg font-bold text-vc-primary">{detectedTech.technologies.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-vc-text-muted">Categories</span>
                      <span className="text-lg font-bold text-vc-primary">{Object.keys(groupedTechnologies).length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-vc-text-muted">Detected At</span>
                      <span className="text-xs text-vc-text-muted">{new Date(detectedTech.detectedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Technology Breakdown by Category */}
          {detectedTech && Object.keys(groupedTechnologies).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-vc-text font-semibold">Technology Breakdown</h4>
              <div className="grid grid-cols-1 gap-4">
                {(Object.entries(groupedTechnologies) as [string, Technology[]][]).map(([category, technologies]) => {
                  const Icon = CATEGORY_ICONS[category] || Code;
                  const colorClass = CATEGORY_COLORS[category] || 'bg-gray-900/50 text-gray-300 border-gray-500/50';
                  
                  return (
                    <Card key={category} className="bg-vc-dark border-vc-border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="h-4 w-4 text-vc-primary" />
                          <h5 className="text-vc-text font-medium">{category}</h5>
                          <Badge className={`${colorClass} text-xs border ml-auto`}>
                            {technologies.length} {technologies.length === 1 ? 'technology' : 'technologies'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {technologies.map((tech: Technology, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-vc-card rounded-lg border border-vc-border hover:border-vc-primary transition-colors cursor-pointer"
                              onClick={() => setSelectedTech(tech)}
                            >
                              <div className="flex items-center gap-3">
                                {tech.icon && (
                                  <img src={tech.icon} alt={tech.name} className="h-6 w-6" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-vc-text font-medium">{tech.name}</span>
                                    {tech.version && (
                                      <Badge variant="outline" className="text-xs border-vc-border text-vc-text-muted">
                                        v{tech.version}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-vc-text-muted">Confidence:</span>
                                    <span className={`text-xs font-medium ${getConfidenceColor(tech.confidence)}`}>
                                      {tech.confidence}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-vc-text-muted" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Technology Detail Modal */}
      <Dialog open={!!selectedTech} onOpenChange={() => setSelectedTech(null)}>
        <DialogContent className="bg-vc-dark border-vc-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-vc-text flex items-center gap-3">
              {selectedTech?.icon && (
                <img src={selectedTech.icon} alt={selectedTech.name} className="h-8 w-8" />
              )}
              <span>{selectedTech?.name}</span>
              {selectedTech?.version && (
                <Badge variant="outline" className="border-vc-border text-vc-text-muted">
                  v{selectedTech.version}
                </Badge>
              )}
            </DialogTitle>
            <p className="text-sm text-vc-text-muted mt-2">
              Detailed information about this technology
            </p>
          </DialogHeader>
          
          {selectedTech && (
            <div className="space-y-4 mt-4">
              {/* Categories */}
              <div>
                <label className="text-sm font-medium text-vc-text-muted">Categories</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTech.categories.map((category, index) => {
                    const colorClass = CATEGORY_COLORS[category] || 'bg-gray-900/50 text-gray-300 border-gray-500/50';
                    return (
                      <Badge key={index} className={`${colorClass} border`}>
                        {category}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Confidence Level */}
              <div>
                <label className="text-sm font-medium text-vc-text-muted">Detection Confidence</label>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-bold ${getConfidenceColor(selectedTech.confidence)}`}>
                      {selectedTech.confidence}%
                    </span>
                    <span className="text-xs text-vc-text-muted">
                      {selectedTech.confidence >= 80 ? 'High Confidence' :
                       selectedTech.confidence >= 50 ? 'Medium Confidence' :
                       'Low Confidence'}
                    </span>
                  </div>
                  <div className="w-full bg-vc-card rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        selectedTech.confidence >= 80 ? 'bg-green-500' :
                        selectedTech.confidence >= 50 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${selectedTech.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Official Website */}
              {selectedTech.website && (
                <div>
                  <label className="text-sm font-medium text-vc-text-muted">Official Website</label>
                  <a
                    href={selectedTech.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 text-vc-primary hover:text-vc-primary/80 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">{selectedTech.website}</span>
                  </a>
                </div>
              )}

              {/* Cloning Considerations */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h5 className="text-blue-300 font-semibold text-sm mb-2">Cloning Considerations</h5>
                <ul className="text-sm text-vc-text-muted space-y-1 list-disc list-inside">
                  <li>Research if this technology requires licensing or has usage restrictions</li>
                  <li>Consider the learning curve and available documentation</li>
                  <li>Evaluate if there are simpler alternatives that achieve the same goal</li>
                  <li>Check community support and long-term maintenance status</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}