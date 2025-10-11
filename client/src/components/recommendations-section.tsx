import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Info
} from "lucide-react";

interface Recommendation {
  type: 'simplify' | 'alternative' | 'warning' | 'opportunity';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

const getTypeConfig = (type: Recommendation['type']) => {
  const configs = {
    simplify: {
      icon: Zap,
      color: 'bg-blue-900/50 text-blue-300 border-blue-500/50',
      iconColor: 'text-blue-400',
      label: 'Simplify',
    },
    alternative: {
      icon: Lightbulb,
      color: 'bg-purple-900/50 text-purple-300 border-purple-500/50',
      iconColor: 'text-purple-400',
      label: 'Alternative',
    },
    warning: {
      icon: AlertTriangle,
      color: 'bg-orange-900/50 text-orange-300 border-orange-500/50',
      iconColor: 'text-orange-400',
      label: 'Warning',
    },
    opportunity: {
      icon: TrendingUp,
      color: 'bg-green-900/50 text-green-300 border-green-500/50',
      iconColor: 'text-green-400',
      label: 'Opportunity',
    },
  };
  return configs[type];
};

const getImpactConfig = (impact: Recommendation['impact']) => {
  const configs = {
    high: {
      color: 'bg-red-900/50 text-red-300 border-red-500/50',
      label: 'High Impact',
    },
    medium: {
      color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50',
      label: 'Medium Impact',
    },
    low: {
      color: 'bg-gray-900/50 text-gray-300 border-gray-500/50',
      label: 'Low Impact',
    },
  };
  return configs[impact];
};

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Early return for empty or undefined recommendations
  if (!recommendations || recommendations.length === 0) {
    return (
      <Card className="bg-vc-dark border-vc-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Key Recommendations</h3>
              <p className="text-sm text-vc-text-muted">
                No recommendations available
              </p>
            </div>
          </div>
          <div className="text-center py-8 text-vc-text-muted">
            <p className="text-sm">
              Recommendations will appear here after analysis is complete.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group recommendations by type with null safety
  const groupedRecommendations = recommendations.reduce((acc, rec, index) => {
    if (!rec?.type) return acc;
    
    if (!acc[rec.type]) {
      acc[rec.type] = [];
    }
    const group = acc[rec.type];
    if (group) {
      group.push({ ...rec, originalIndex: index });
    }
    return acc;
  }, {} as Record<string, (Recommendation & { originalIndex: number })[]>);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <Card className="bg-vc-dark border-vc-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Key Recommendations</h3>
              <p className="text-sm text-vc-text-muted">
                Actionable insights to improve clonability
              </p>
            </div>
          </div>
          <Badge className="bg-vc-accent/20 text-vc-accent border-vc-accent/50">
            {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'}
          </Badge>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedRecommendations).map(([type, recs]) => {
            const typeConfig = getTypeConfig(type as Recommendation['type']);
            if (!typeConfig) return null;
            
            const TypeIcon = typeConfig.icon;

            return (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <TypeIcon className={`h-4 w-4 ${typeConfig.iconColor}`} />
                  <h4 className="text-sm font-semibold text-vc-text">{typeConfig.label}</h4>
                  <Badge className={`${typeConfig.color} text-xs border`}>
                    {recs.length}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {recs?.map((rec) => {
                    if (!rec) return null;
                    
                    const impactConfig = getImpactConfig(rec.impact ?? 'low');
                    const isExpanded = expandedIndex === rec.originalIndex;

                    return (
                      <div
                        key={rec.originalIndex}
                        className="bg-vc-card border border-vc-border rounded-lg overflow-hidden hover:border-vc-primary transition-colors"
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleExpand(rec.originalIndex)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="text-sm font-medium text-vc-text">
                                  {rec.title ?? 'Untitled Recommendation'}
                                </h5>
                                {rec.actionable && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge className="bg-green-900/50 text-green-300 border-green-500/50 text-xs border">
                                          Actionable
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">You can implement this recommendation immediately</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              {!isExpanded && (
                                <p className="text-sm text-vc-text-muted line-clamp-2">
                                  {rec.description ?? 'No description available'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${impactConfig.color} text-xs border whitespace-nowrap`}>
                                {impactConfig.label}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-vc-text-muted flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-vc-text-muted flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-vc-border pt-4">
                            <div className="space-y-3">
                              <div>
                                <h6 className="text-xs font-semibold text-vc-text-muted mb-2">
                                  Details
                                </h6>
                                <p className="text-sm text-vc-text leading-relaxed">
                                  {rec.description ?? 'No description available'}
                                </p>
                              </div>

                              <div className="flex items-start gap-2 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-300">
                                  <p className="font-semibold mb-1">Why this matters</p>
                                  <p>
                                    {(rec.impact ?? 'low') === 'high' && 
                                      'This recommendation can significantly reduce development time and complexity.'}
                                    {(rec.impact ?? 'low') === 'medium' && 
                                      'This recommendation can moderately improve your cloning strategy.'}
                                    {(rec.impact ?? 'low') === 'low' && 
                                      'This is a nice-to-have optimization that can provide incremental benefits.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-vc-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-vc-text-muted">
              {recommendations?.filter(r => r?.actionable).length ?? 0} actionable recommendations
            </span>
            <span className="text-vc-text-muted">
              {recommendations?.filter(r => r?.impact === 'high').length ?? 0} high impact
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
