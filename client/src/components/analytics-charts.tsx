import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Zap, Target } from "lucide-react";
import type { BusinessAnalysis } from "@/types";

interface AnalyticsChartsProps {
  analyses: BusinessAnalysis[];
}

export function AnalyticsCharts({ analyses }: AnalyticsChartsProps) {
  // Prepare data for score distribution
  const scoreDistribution = [
    { range: '0-2', count: analyses.filter(a => (a.overallScore || 0) <= 2).length },
    { range: '3-4', count: analyses.filter(a => (a.overallScore || 0) > 2 && (a.overallScore || 0) <= 4).length },
    { range: '5-6', count: analyses.filter(a => (a.overallScore || 0) > 4 && (a.overallScore || 0) <= 6).length },
    { range: '7-8', count: analyses.filter(a => (a.overallScore || 0) > 6 && (a.overallScore || 0) <= 8).length },
    { range: '9-10', count: analyses.filter(a => (a.overallScore || 0) > 8).length },
  ];

  // Prepare data for criteria comparison
  const criteriaComparison = analyses.length > 0 ? [
    {
      criteria: 'Technical',
      average: analyses.reduce((acc, a) => acc + (a.scoreDetails?.technicalComplexity?.score || 0), 0) / analyses.length,
    },
    {
      criteria: 'Market',
      average: analyses.reduce((acc, a) => acc + (a.scoreDetails?.marketOpportunity?.score || 0), 0) / analyses.length,
    },
    {
      criteria: 'Competition',
      average: analyses.reduce((acc, a) => acc + (a.scoreDetails?.competitiveLandscape?.score || 0), 0) / analyses.length,
    },
    {
      criteria: 'Resources',
      average: analyses.reduce((acc, a) => acc + (a.scoreDetails?.resourceRequirements?.score || 0), 0) / analyses.length,
    },
    {
      criteria: 'Time',
      average: analyses.reduce((acc, a) => acc + (a.scoreDetails?.timeToMarket?.score || 0), 0) / analyses.length,
    },
  ] : [];

  if (analyses.length === 0) {
    return (
      <Card className="bg-vc-card border-vc-border" data-testid="card-analytics">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-vc-text">Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-vc-text-muted">No data available yet</p>
            <p className="text-vc-text-muted text-sm mt-1">
              Start analyzing businesses to see insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="analytics-charts">
      {/* Score Distribution */}
      <Card className="bg-vc-card border-vc-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-vc-primary" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Chart placeholder</p>
              <p className="text-sm text-gray-500">
                {scoreDistribution.map(d => `${d.range}: ${d.count}`).join(', ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Criteria Comparison */}
        <Card className="bg-vc-card border-vc-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
              <Activity className="mr-2 h-5 w-5 text-vc-secondary" />
              Average Scores by Criteria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-gray-600">Line chart placeholder</p>
                <div className="text-sm text-gray-500 space-y-1">
                  {criteriaComparison.map(c => (
                    <div key={c.criteria}>{c.criteria}: {c.average.toFixed(1)}</div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stage Progress */}
        <Card className="bg-vc-card border-vc-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
              <Zap className="mr-2 h-5 w-5 text-vc-accent" />
              Workflow Stage Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center bg-gray-100 rounded">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p className="text-gray-600">Pie chart placeholder</p>
                <div className="text-sm text-gray-500">
                  {analyses.length} total analyses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Businesses */}
      <Card className="bg-vc-card border-vc-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
            <Target className="mr-2 h-5 w-5 text-vc-primary" />
            Top Businesses Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-gray-600">Radar chart placeholder</p>
              <p className="text-sm text-gray-500">
                Showing top {Math.min(3, analyses.length)} businesses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}