import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, DollarSign, TrendingUp, Info } from "lucide-react";

interface TimeAndCostEstimates {
  developmentTime: { min: number; max: number }; // months
  oneTimeCost: { min: number; max: number }; // dollars
  monthlyCost: { min: number; max: number }; // dollars
}

interface EstimatesCardProps {
  estimates: TimeAndCostEstimates;
}

const formatCurrency = (amount: number): string => {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount}`;
};

const formatMonths = (months: number): string => {
  if (months === 1) return '1 month';
  if (months < 1) return `${Math.round(months * 4)} weeks`;
  return `${months} months`;
};

export function EstimatesCard({ estimates }: EstimatesCardProps) {
  const avgDevTime = (estimates.developmentTime.min + estimates.developmentTime.max) / 2;
  const avgOneTimeCost = (estimates.oneTimeCost.min + estimates.oneTimeCost.max) / 2;
  const avgMonthlyCost = (estimates.monthlyCost.min + estimates.monthlyCost.max) / 2;

  return (
    <Card className="bg-vc-dark border-vc-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Resource Estimates</h3>
              <p className="text-sm text-vc-text-muted">
                Time and cost projections
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-vc-text-muted cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-xs">Estimation Assumptions</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Solo developer working part-time (10-20 hrs/week)</li>
                    <li>Intermediate skill level in required technologies</li>
                    <li>MVP scope with core features only</li>
                    <li>Using modern tools and frameworks</li>
                    <li>Costs include hosting, services, and tools</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="space-y-6">
          {/* Development Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-vc-text">Development Time</h4>
            </div>
            
            <div className="bg-vc-card rounded-lg p-4 border border-vc-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <div className="text-xs text-vc-text-muted mb-1">Minimum</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatMonths(estimates.developmentTime.min)}
                  </div>
                </div>
                <div className="text-vc-text-muted px-4">→</div>
                <div className="text-center flex-1">
                  <div className="text-xs text-vc-text-muted mb-1">Maximum</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {formatMonths(estimates.developmentTime.max)}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-vc-dark rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                    style={{ width: `${Math.min((avgDevTime / 12) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-vc-text-muted">
                  <span>Fast track</span>
                  <span className="font-medium text-vc-text">
                    Avg: {formatMonths(avgDevTime)}
                  </span>
                  <span>Conservative</span>
                </div>
              </div>
            </div>
          </div>

          {/* One-Time Development Cost */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <h4 className="text-sm font-semibold text-vc-text">One-Time Development Cost</h4>
            </div>
            
            <div className="bg-vc-card rounded-lg p-4 border border-vc-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <div className="text-xs text-vc-text-muted mb-1">Minimum</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(estimates.oneTimeCost.min)}
                  </div>
                </div>
                <div className="text-vc-text-muted px-4">→</div>
                <div className="text-center flex-1">
                  <div className="text-xs text-vc-text-muted mb-1">Maximum</div>
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(estimates.oneTimeCost.max)}
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-vc-dark rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                    style={{ width: `${Math.min((avgOneTimeCost / 50000) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-vc-text-muted">
                  <span>Budget-friendly</span>
                  <span className="font-medium text-vc-text">
                    Avg: {formatCurrency(avgOneTimeCost)}
                  </span>
                  <span>Premium</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-vc-text-muted">
                Includes tools, licenses, and initial setup costs
              </div>
            </div>
          </div>

          {/* Monthly Operating Cost */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <h4 className="text-sm font-semibold text-vc-text">Monthly Operating Cost</h4>
            </div>
            
            <div className="bg-vc-card rounded-lg p-4 border border-vc-border">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center flex-1">
                  <div className="text-xs text-vc-text-muted mb-1">Minimum</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(estimates.monthlyCost.min)}
                  </div>
                  <div className="text-xs text-vc-text-muted mt-1">/month</div>
                </div>
                <div className="text-vc-text-muted px-4">→</div>
                <div className="text-center flex-1">
                  <div className="text-xs text-vc-text-muted mb-1">Maximum</div>
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(estimates.monthlyCost.max)}
                  </div>
                  <div className="text-xs text-vc-text-muted mt-1">/month</div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full bg-vc-dark rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                    style={{ width: `${Math.min((avgMonthlyCost / 1000) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-vc-text-muted">
                  <span>Lean</span>
                  <span className="font-medium text-vc-text">
                    Avg: {formatCurrency(avgMonthlyCost)}/mo
                  </span>
                  <span>Scaled</span>
                </div>
              </div>

              <div className="mt-3 text-xs text-vc-text-muted">
                Includes hosting, databases, APIs, and SaaS subscriptions
              </div>
            </div>
          </div>
        </div>

        {/* Total First Year Cost */}
        <div className="mt-6 pt-4 border-t border-vc-border">
          <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-vc-text-muted mb-1">Estimated First Year Total</div>
                <div className="text-xl font-bold text-orange-300">
                  {formatCurrency(avgOneTimeCost + (avgMonthlyCost * 12))}
                </div>
              </div>
              <Badge className="bg-orange-900/50 text-orange-300 border-orange-500/50 border">
                Year 1
              </Badge>
            </div>
            <div className="text-xs text-vc-text-muted mt-2">
              Development + 12 months operating costs
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-300 leading-relaxed">
              These are rough estimates based on typical project patterns. Actual costs may vary 
              significantly based on your specific requirements, skill level, and chosen technologies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
