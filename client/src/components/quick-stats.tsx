import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuickStats as QuickStatsType } from "@/types";

export function QuickStats() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/stats'],
    queryFn: async (): Promise<QuickStatsType> => {
      const response = await fetch('/api/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const statsItems = [
    {
      key: 'totalAnalyses',
      label: 'Total Analyses',
      icon: TrendingUp,
      value: stats?.totalAnalyses || 0,
      color: 'text-vc-text',
    },
    {
      key: 'strongCandidates',
      label: 'Strong Candidates',
      icon: Target,
      value: stats?.strongCandidates || 0,
      color: 'text-green-400',
    },
    {
      key: 'inProgress',
      label: 'In Progress',
      icon: Clock,
      value: stats?.inProgress || 0,
      color: 'text-vc-accent',
    },
    {
      key: 'aiQueries',
      label: 'AI Queries Used',
      icon: Zap,
      value: stats?.aiQueries || 0,
      color: 'text-vc-text',
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };

  if (error) {
    return (
      <Card className="bg-vc-card border-vc-border" data-testid="card-quick-stats">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-vc-text">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-vc-text-muted text-sm">Failed to load stats</p>
            <p className="text-xs text-vc-text-muted mt-1">
              Please try refreshing the page
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-quick-stats">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text">Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsItems.map((item) => {
          const Icon = item.icon;
          const displayValue = isLoading ? '-' : formatNumber(item.value);
          
          return (
            <div
              key={item.key}
              className="flex justify-between items-center"
              data-testid={`stat-${item.key}`}
            >
              <div className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 ${item.color}`} />
                <span className="text-vc-text-muted text-sm">{item.label}</span>
              </div>
              <span className={`font-semibold ${item.color} ${isLoading ? 'animate-pulse' : ''}`}>
                {displayValue}
              </span>
            </div>
          );
        })}

        {/* Progress indicator for AI queries if applicable */}
        {stats && stats.aiQueries > 0 && (
          <div className="pt-2 border-t border-vc-border/50">
            <div className="flex justify-between items-center text-xs text-vc-text-muted mb-1">
              <span>API Usage</span>
              <span>{Math.min(100, Math.round((stats.aiQueries / 10000) * 100))}%</span>
            </div>
            <div className="w-full bg-vc-border rounded-full h-1">
              <div
                className="bg-vc-primary h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (stats.aiQueries / 10000) * 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-vc-text-muted mt-1">
              Monthly quota usage
            </p>
          </div>
        )}

        {/* Quick insights based on stats */}
        {stats && stats.totalAnalyses > 0 && (
          <div className="pt-2 border-t border-vc-border/50">
            <div className="text-xs text-vc-text-muted space-y-1">
              {stats.strongCandidates > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>
                    {Math.round((stats.strongCandidates / stats.totalAnalyses) * 100)}% success rate
                  </span>
                </div>
              )}
              {stats.inProgress > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-vc-accent rounded-full animate-pulse"></div>
                  <span>
                    {stats.inProgress} project{stats.inProgress !== 1 ? 's' : ''} in development
                  </span>
                </div>
              )}
              {stats.totalAnalyses >= 10 && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-vc-primary rounded-full"></div>
                  <span>Active researcher 🚀</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {!isLoading && (!stats || stats.totalAnalyses === 0) && (
          <div className="text-center py-4 border-t border-vc-border/50">
            <div className="text-2xl mb-2">🚀</div>
            <p className="text-vc-text-muted text-sm">
              Start analyzing businesses to see your stats
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
