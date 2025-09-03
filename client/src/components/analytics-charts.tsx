import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Zap, Target } from "lucide-react";
import type { BusinessAnalysis } from "@/types";

interface AnalyticsChartsProps {
  analyses: BusinessAnalysis[];
}

export function AnalyticsCharts({ analyses }: AnalyticsChartsProps) {
  const COLORS = ['#FF4500', '#DC143C', '#FFD700', '#20B2AA', '#9370DB'];

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

  // Prepare data for stage progress
  const stageProgress = [
    { stage: 'Discovery', count: analyses.filter(a => a.currentStage === 1).length },
    { stage: 'Filter', count: analyses.filter(a => a.currentStage === 2).length },
    { stage: 'MVP', count: analyses.filter(a => a.currentStage === 3).length },
    { stage: 'Testing', count: analyses.filter(a => a.currentStage === 4).length },
    { stage: 'Scaling', count: analyses.filter(a => a.currentStage === 5).length },
    { stage: 'Automation', count: analyses.filter(a => a.currentStage === 6).length },
  ];

  // Prepare radar chart data for top analyses
  const topAnalyses = analyses
    .filter(a => a.scoreDetails)
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
    .slice(0, 3);

  const radarData = topAnalyses.length > 0 ? [
    'technicalComplexity',
    'marketOpportunity',
    'competitiveLandscape',
    'resourceRequirements',
    'timeToMarket'
  ].map(key => ({
    criteria: key.replace(/([A-Z])/g, ' $1').trim(),
    ...topAnalyses.reduce((acc, analysis, index) => ({
      ...acc,
      [`business${index + 1}`]: analysis.scoreDetails?.[key as keyof typeof analysis.scoreDetails]?.score || 0
    }), {})
  })) : [];

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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="range" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                labelStyle={{ color: '#FFD700' }}
              />
              <Bar dataKey="count" fill="#FF4500">
                {scoreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={criteriaComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="criteria" stroke="#999" />
                <YAxis domain={[0, 10]} stroke="#999" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                  labelStyle={{ color: '#FFD700' }}
                  formatter={(value: number) => value.toFixed(1)}
                />
                <Line 
                  type="monotone" 
                  dataKey="average" 
                  stroke="#DC143C" 
                  strokeWidth={2}
                  dot={{ fill: '#FFD700', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stageProgress.filter(s => s.count > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ stage, count }) => `${stage}: ${count}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {stageProgress.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                  labelStyle={{ color: '#FFD700' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Radar Comparison for Top 3 */}
      {topAnalyses.length > 0 && (
        <Card className="bg-vc-card border-vc-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
              <Target className="mr-2 h-5 w-5 text-vc-primary" />
              Top Businesses Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="criteria" stroke="#999" />
                <PolarRadiusAxis angle={90} domain={[0, 10]} stroke="#999" />
                {topAnalyses.map((analysis, index) => (
                  <Radar
                    key={index}
                    name={analysis.businessModel || `Business ${index + 1}`}
                    dataKey={`business${index + 1}`}
                    stroke={COLORS[index]}
                    fill={COLORS[index]}
                    fillOpacity={0.3}
                  />
                ))}
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333' }}
                  labelStyle={{ color: '#FFD700' }}
                />
                <Legend 
                  wrapperStyle={{ color: '#999' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}