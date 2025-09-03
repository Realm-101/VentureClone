import { Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessAnalysis } from "@/types";

interface AIInsightsPanelProps {
  analysis: BusinessAnalysis;
}

export function AIInsightsPanel({ analysis }: AIInsightsPanelProps) {
  const insights = analysis.aiInsights;

  if (!insights) {
    return (
      <Card className="bg-vc-card border-vc-border" data-testid="card-ai-insights">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-vc-text">
            <span className="text-vc-accent">🤖</span>
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-vc-text-muted text-sm">No insights available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-ai-insights">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-vc-text">
          <span className="text-vc-accent">🤖</span>
          <span>AI Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Insight */}
        <div className="bg-vc-dark rounded-lg border border-vc-accent/30 p-4" data-testid="insight-key">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-4 w-4 text-vc-accent mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-vc-text font-medium mb-2">Key Insight</p>
              <p className="text-xs text-vc-text-muted">{insights.keyInsight}</p>
            </div>
          </div>
        </div>

        {/* Risk Factor */}
        <div className="bg-vc-dark rounded-lg border border-vc-secondary/30 p-4" data-testid="insight-risk">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-vc-secondary mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-vc-text font-medium mb-2">Risk Factor</p>
              <p className="text-xs text-vc-text-muted">{insights.riskFactor}</p>
            </div>
          </div>
        </div>

        {/* Opportunity */}
        <div className="bg-vc-dark rounded-lg border border-green-500/30 p-4" data-testid="insight-opportunity">
          <div className="flex items-start space-x-2">
            <TrendingUp className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-vc-text font-medium mb-2">Opportunity</p>
              <p className="text-xs text-vc-text-muted">{insights.opportunity}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
