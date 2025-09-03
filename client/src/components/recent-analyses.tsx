import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BusinessAnalysis } from "@/types";

interface RecentAnalysesProps {
  analyses: BusinessAnalysis[];
  onAnalysisSelect: (analysis: BusinessAnalysis) => void;
}

export function RecentAnalyses({ analyses, onAnalysisSelect }: RecentAnalysesProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  const getBusinessIcon = (businessModel?: string) => {
    if (!businessModel) return '🏢';
    
    const model = businessModel.toLowerCase();
    if (model.includes('saas') || model.includes('software')) return '💻';
    if (model.includes('ecommerce') || model.includes('marketplace')) return '🛒';
    if (model.includes('social') || model.includes('network')) return '👥';
    if (model.includes('education') || model.includes('learning')) return '📚';
    if (model.includes('finance') || model.includes('fintech')) return '💳';
    if (model.includes('health') || model.includes('medical')) return '🏥';
    if (model.includes('media') || model.includes('content')) return '📺';
    return '🏢';
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-vc-text-muted';
    if (score >= 7) return 'text-green-400';
    if (score >= 5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadgeColor = (score?: number) => {
    if (!score) return 'bg-vc-border text-vc-text-muted';
    if (score >= 7) return 'bg-green-900/50 text-green-300';
    if (score >= 5) return 'bg-yellow-900/50 text-yellow-300';
    return 'bg-red-900/50 text-red-300';
  };

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="bg-vc-card border-vc-border" data-testid="card-recent-analyses">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-vc-text">Recent Analyses</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-vc-text-muted">No analyses yet</p>
            <p className="text-vc-text-muted text-sm mt-1">
              Start by analyzing a business URL above
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show most recent 5 analyses
  const recentAnalyses = analyses.slice(0, 5);

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-recent-analyses">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-vc-text">Recent Analyses</CardTitle>
          {analyses.length > 5 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-vc-text-muted hover:text-vc-text transition-colors"
              data-testid="button-view-all-analyses"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentAnalyses.map((analysis) => (
          <div
            key={analysis.id}
            className="flex items-center justify-between p-3 bg-vc-dark rounded-lg border border-vc-border/50 hover:border-vc-border transition-colors cursor-pointer"
            onClick={() => onAnalysisSelect(analysis)}
            data-testid={`analysis-item-${analysis.id}`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">
                  {getBusinessIcon(analysis.businessModel)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-vc-text font-medium truncate">
                    {analysis.businessModel || 'Business Analysis'}
                  </p>
                  {analysis.overallScore && (
                    <Badge className={`${getScoreBadgeColor(analysis.overallScore)} text-xs font-medium`}>
                      {analysis.overallScore}/10
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-vc-text-muted text-sm truncate">
                    {analysis.targetMarket || analysis.revenueStream || 'No details'}
                  </p>
                  <span className="text-vc-text-muted">•</span>
                  <span className="text-xs text-vc-text-muted whitespace-nowrap">
                    {formatTimeAgo(analysis.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-vc-text-muted truncate mt-1 font-mono">
                  {analysis.url}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  (analysis.currentStage || 1) === 6 ? 'bg-green-400' :
                  (analysis.currentStage || 1) > 1 ? 'bg-vc-accent animate-pulse' :
                  'bg-vc-border'
                }`}></div>
                <span className="text-xs text-vc-text-muted">
                  Stage {analysis.currentStage || 1}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-vc-primary hover:text-vc-primary/80 transition-colors h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalysisSelect(analysis);
                }}
                data-testid={`button-load-analysis-${analysis.id}`}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {analyses.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-xs text-vc-text-muted">
              Showing {recentAnalyses.length} of {analyses.length} analyses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
