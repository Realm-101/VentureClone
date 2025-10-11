import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ClonabilityScore {
  score: number; // 1-10 (10 = easiest to clone)
  rating: 'very-difficult' | 'difficult' | 'moderate' | 'easy' | 'very-easy';
  components: {
    technicalComplexity: { score: number; weight: number };
    marketOpportunity: { score: number; weight: number };
    resourceRequirements: { score: number; weight: number };
    timeToMarket: { score: number; weight: number };
  };
  recommendation: string;
  confidence: number; // 0-1
}

interface ClonabilityScoreCardProps {
  score: ClonabilityScore;
}

const getRatingConfig = (rating: ClonabilityScore['rating']) => {
  const configs = {
    'very-easy': {
      color: 'bg-green-900/50 text-green-300 border-green-500/50',
      label: 'Very Easy',
      icon: TrendingUp,
      iconColor: 'text-green-400',
    },
    'easy': {
      color: 'bg-emerald-900/50 text-emerald-300 border-emerald-500/50',
      label: 'Easy',
      icon: TrendingUp,
      iconColor: 'text-emerald-400',
    },
    'moderate': {
      color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50',
      label: 'Moderate',
      icon: Minus,
      iconColor: 'text-yellow-400',
    },
    'difficult': {
      color: 'bg-orange-900/50 text-orange-300 border-orange-500/50',
      label: 'Difficult',
      icon: TrendingDown,
      iconColor: 'text-orange-400',
    },
    'very-difficult': {
      color: 'bg-red-900/50 text-red-300 border-red-500/50',
      label: 'Very Difficult',
      icon: TrendingDown,
      iconColor: 'text-red-400',
    },
  };
  return configs[rating];
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-emerald-400';
  if (score >= 4) return 'text-yellow-400';
  if (score >= 2) return 'text-orange-400';
  return 'text-red-400';
};

const getScoreGradient = (score: number) => {
  if (score >= 8) return 'from-green-500 to-emerald-500';
  if (score >= 6) return 'from-emerald-500 to-yellow-500';
  if (score >= 4) return 'from-yellow-500 to-orange-500';
  if (score >= 2) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-red-700';
};

export function ClonabilityScoreCard({ score }: ClonabilityScoreCardProps) {
  const ratingConfig = getRatingConfig(score.rating);
  const Icon = ratingConfig.icon;

  return (
    <Card className="bg-gradient-to-br from-vc-dark to-vc-card border-vc-border shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg bg-gradient-to-br ${getScoreGradient(score.score)}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Clonability Score</h3>
              <p className="text-sm text-vc-text-muted">Overall feasibility assessment</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-vc-text-muted cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Scoring Methodology</p>
                  <p className="text-xs">This score combines multiple factors:</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Technical Complexity (40%)</li>
                    <li>Market Opportunity (30%)</li>
                    <li>Resource Requirements (20%)</li>
                    <li>Time to Market (10%)</li>
                  </ul>
                  <p className="text-xs mt-2">
                    Higher scores (8-10) indicate easier cloning opportunities.
                    Lower scores (1-3) suggest significant challenges.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score.score)}`}>
                {score.score}
              </div>
              <div className="text-sm text-vc-text-muted">out of 10</div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        <div className="flex justify-center mb-6">
          <Badge className={`${ratingConfig.color} text-base font-semibold px-6 py-2 border`}>
            {ratingConfig.label}
          </Badge>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-vc-text">Score Breakdown</h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-vc-text-muted">Technical Complexity</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-vc-text-muted cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Evaluates the difficulty of replicating the technology stack</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-vc-text">
                  {score.components.technicalComplexity.score.toFixed(1)}
                </span>
                <span className="text-xs text-vc-text-muted">
                  ({(score.components.technicalComplexity.weight * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-vc-card rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${(score.components.technicalComplexity.score / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-vc-text-muted">Market Opportunity</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-vc-text-muted cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Assesses market size, competition, and growth potential</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-vc-text">
                  {score.components.marketOpportunity.score.toFixed(1)}
                </span>
                <span className="text-xs text-vc-text-muted">
                  ({(score.components.marketOpportunity.weight * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-vc-card rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                style={{ width: `${(score.components.marketOpportunity.score / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-vc-text-muted">Resource Requirements</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-vc-text-muted cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Evaluates cost and resource needs for development</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-vc-text">
                  {score.components.resourceRequirements.score.toFixed(1)}
                </span>
                <span className="text-xs text-vc-text-muted">
                  ({(score.components.resourceRequirements.weight * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-vc-card rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                style={{ width: `${(score.components.resourceRequirements.score / 10) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-vc-text-muted">Time to Market</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3 w-3 text-vc-text-muted cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Estimates how quickly you can launch an MVP</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-vc-text">
                  {score.components.timeToMarket.score.toFixed(1)}
                </span>
                <span className="text-xs text-vc-text-muted">
                  ({(score.components.timeToMarket.weight * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-vc-card rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                style={{ width: `${(score.components.timeToMarket.score / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className={`${ratingConfig.color} rounded-lg p-4 border`}>
          <div className="flex items-start gap-3">
            <Icon className={`h-5 w-5 ${ratingConfig.iconColor} mt-0.5 flex-shrink-0`} />
            <div>
              <h5 className="font-semibold text-sm mb-1">Recommendation</h5>
              <p className="text-sm leading-relaxed">{score.recommendation}</p>
            </div>
          </div>
        </div>

        {/* Confidence Indicator */}
        {score.confidence && (
          <div className="mt-4 pt-4 border-t border-vc-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-vc-text-muted">Analysis Confidence</span>
              <span className="text-vc-text font-medium">
                {(score.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
