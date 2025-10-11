import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ShoppingCart, 
  Hammer, 
  ExternalLink, 
  Clock, 
  DollarSign,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";

interface SaasAlternative {
  name: string;
  description: string;
  pricing: string;
  timeSavings: number; // hours
  tradeoffs: {
    pros: string[];
    cons: string[];
  };
  recommendedFor: 'mvp' | 'scale' | 'both';
  website?: string;
}

interface BuildVsBuyRecommendation {
  technology: string;
  recommendation: 'build' | 'buy';
  reasoning: string;
  saasAlternative?: SaasAlternative;
  estimatedSavings: {
    time: number; // hours
    cost: number; // dollars
  };
}

interface BuildVsBuySectionProps {
  recommendations: BuildVsBuyRecommendation[];
}

const getRecommendationBadge = (rec: 'build' | 'buy') => {
  if (rec === 'buy') {
    return {
      color: 'bg-green-900/50 text-green-300 border-green-500/50',
      icon: ShoppingCart,
      label: 'Use SaaS',
    };
  }
  return {
    color: 'bg-blue-900/50 text-blue-300 border-blue-500/50',
    icon: Hammer,
    label: 'Build Custom',
  };
};

const getRecommendedForBadge = (recommendedFor: 'mvp' | 'scale' | 'both') => {
  const configs = {
    mvp: {
      color: 'bg-purple-900/50 text-purple-300 border-purple-500/50',
      label: 'Recommended for MVP',
    },
    scale: {
      color: 'bg-orange-900/50 text-orange-300 border-orange-500/50',
      label: 'Recommended for Scale',
    },
    both: {
      color: 'bg-green-900/50 text-green-300 border-green-500/50',
      label: 'Good for Both',
    },
  };
  return configs[recommendedFor];
};

const formatHours = (hours: number): string => {
  if (hours >= 160) {
    return `${Math.round(hours / 160)} months`;
  }
  if (hours >= 40) {
    return `${Math.round(hours / 40)} weeks`;
  }
  return `${hours} hours`;
};

const formatCurrency = (amount: number): string => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
};

export function BuildVsBuySection({ recommendations }: BuildVsBuySectionProps) {
  // Defensive null check for recommendations array
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="bg-vc-dark border-vc-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Build vs Buy Analysis</h3>
              <p className="text-sm text-vc-text-muted">
                SaaS alternatives to reduce development time
              </p>
            </div>
          </div>
          <Badge className="bg-vc-accent/20 text-vc-accent border-vc-accent/50">
            {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'}
          </Badge>
        </div>

        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const recBadge = getRecommendationBadge(rec.recommendation);
            const RecIcon = recBadge.icon;

            return (
              <div
                key={index}
                className="bg-vc-card border border-vc-border rounded-lg overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-vc-border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h4 className="text-base font-semibold text-vc-text mb-1">
                        {rec.technology}
                      </h4>
                      <p className="text-sm text-vc-text-muted">
                        {rec.reasoning}
                      </p>
                    </div>
                    <Badge className={`${recBadge.color} border whitespace-nowrap`}>
                      <RecIcon className="h-3 w-3 mr-1" />
                      {recBadge.label}
                    </Badge>
                  </div>

                  {/* Estimated Savings */}
                  {rec.recommendation === 'buy' && rec.estimatedSavings && (
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="text-vc-text-muted">Save:</span>
                        <span className="text-green-400 font-medium">
                          {formatHours(rec.estimatedSavings.time ?? 0)}
                        </span>
                      </div>
                      {(rec.estimatedSavings.cost ?? 0) > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-vc-text-muted">Save:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(rec.estimatedSavings.cost)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* SaaS Alternative Details */}
                {rec.saasAlternative && (
                  <div className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="text-sm font-semibold text-vc-text">
                            {rec.saasAlternative.name}
                          </h5>
                          {rec.saasAlternative.website && (
                            <a
                              href={rec.saasAlternative.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-vc-primary hover:text-vc-primary/80 transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-vc-text-muted mb-2">
                          {rec.saasAlternative.description ?? 'No description available'}
                        </p>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-vc-text-muted" />
                          <span className="text-sm text-vc-text">
                            {rec.saasAlternative.pricing ?? 'Pricing not available'}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${getRecommendedForBadge(rec.saasAlternative.recommendedFor ?? 'both').color} border`}>
                        {getRecommendedForBadge(rec.saasAlternative.recommendedFor ?? 'both').label}
                      </Badge>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Pros */}
                      <div className="bg-green-900/10 border border-green-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <h6 className="text-xs font-semibold text-green-300">Pros</h6>
                        </div>
                        <ul className="space-y-1">
                          {rec.saasAlternative.tradeoffs?.pros?.map((pro, i) => (
                            <li key={i} className="text-xs text-green-200 flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{pro}</span>
                            </li>
                          )) ?? <li className="text-xs text-green-200">No pros listed</li>}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle className="h-4 w-4 text-red-400" />
                          <h6 className="text-xs font-semibold text-red-300">Cons</h6>
                        </div>
                        <ul className="space-y-1">
                          {rec.saasAlternative.tradeoffs?.cons?.map((con, i) => (
                            <li key={i} className="text-xs text-red-200 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{con}</span>
                            </li>
                          )) ?? <li className="text-xs text-red-200">No cons listed</li>}
                        </ul>
                      </div>
                    </div>

                    {/* Time Savings Highlight */}
                    {(rec.saasAlternative.timeSavings ?? 0) > 0 && (
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-blue-300">
                            <p className="font-semibold mb-1">Time Savings</p>
                            <p>
                              Using {rec.saasAlternative.name} can save approximately{' '}
                              <span className="font-bold">{formatHours(rec.saasAlternative.timeSavings ?? 0)}</span>{' '}
                              of development time compared to building a custom solution.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 pt-4 border-t border-vc-border">
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-purple-300 font-semibold text-sm mb-2">Strategy Recommendation</h5>
                <p className="text-sm text-purple-200 leading-relaxed">
                  For MVP development, prioritize SaaS solutions to reduce time-to-market. 
                  You can always migrate to custom solutions later as your business scales and 
                  specific needs emerge. Focus your development effort on unique features that 
                  differentiate your product.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-vc-card border border-vc-border rounded-lg p-3 text-center">
            <div className="text-xs text-vc-text-muted mb-1">Total Time Saved</div>
            <div className="text-lg font-bold text-green-400">
              {formatHours(recommendations.reduce((sum, rec) => sum + (rec.estimatedSavings?.time ?? 0), 0))}
            </div>
          </div>
          <div className="bg-vc-card border border-vc-border rounded-lg p-3 text-center">
            <div className="text-xs text-vc-text-muted mb-1">SaaS Options</div>
            <div className="text-lg font-bold text-blue-400">
              {recommendations.filter(r => r.recommendation === 'buy').length}
            </div>
          </div>
          <div className="bg-vc-card border border-vc-border rounded-lg p-3 text-center">
            <div className="text-xs text-vc-text-muted mb-1">Custom Build</div>
            <div className="text-lg font-bold text-orange-400">
              {recommendations.filter(r => r.recommendation === 'build').length}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
