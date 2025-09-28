import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BarChart3, Home, ArrowLeft, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsChartsWrapper } from "@/components/experimental/analytics-charts-wrapper";
import { BusinessComparisonWrapper } from "@/components/experimental/business-comparison-wrapper";
import { SearchFilter } from "@/components/search-filter";
import { BatchAnalysisWrapper } from "@/components/experimental/batch-analysis-wrapper";
import type { BusinessAnalysis } from "@/types";

export function Analytics() {
  const [filteredAnalyses, setFilteredAnalyses] = useState<BusinessAnalysis[]>([]);
  
  const { data: analyses = [] } = useQuery<BusinessAnalysis[]>({
    queryKey: ['/api/business-analyses'],
  });

  const { data: stats } = useQuery<{
    totalAnalyses: number;
    strongCandidates: number;
    inProgress: number;
    avgScore: number;
  }>({
    queryKey: ['/api/stats'],
  });

  // Use filtered analyses if available, otherwise use all
  const displayAnalyses = filteredAnalyses.length > 0 || analyses.length === 0 
    ? filteredAnalyses 
    : analyses;

  return (
    <div className="min-h-screen bg-vc-dark">
      {/* Header */}
      <header className="bg-vc-card border-b border-vc-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-vc-text-muted hover:text-vc-text"
                  data-testid="button-back-dashboard"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-vc-primary mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-vc-text">Analytics & Insights</h1>
                  <p className="text-sm text-vc-text-muted">
                    Comprehensive business analysis visualization
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {stats && (
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <p className="text-vc-text-muted">Total Analyses</p>
                    <p className="text-xl font-bold text-vc-accent">{stats.totalAnalyses}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-vc-text-muted">Strong Candidates</p>
                    <p className="text-xl font-bold text-green-400">{stats.strongCandidates}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-vc-text-muted">In Progress</p>
                    <p className="text-xl font-bold text-vc-primary">{stats.inProgress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-8">
          <SearchFilter 
            analyses={analyses} 
            onFilteredResults={setFilteredAnalyses}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts Area */}
          <div className="lg:col-span-2">
            <AnalyticsChartsWrapper analyses={displayAnalyses} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <BatchAnalysisWrapper />
            <BusinessComparisonWrapper analyses={displayAnalyses} />
            
            {/* Quick Insights */}
            <Card className="bg-vc-card border-vc-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-vc-accent" />
                  Quick Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayAnalyses.length > 0 ? (
                  <>
                    <div className="p-3 bg-vc-dark rounded-lg border border-vc-border/50">
                      <p className="text-xs text-vc-text-muted mb-1">Average Score</p>
                      <p className="text-xl font-bold text-vc-accent">
                        {(displayAnalyses.reduce((acc, a) => acc + (a.overallScore || 0), 0) / displayAnalyses.length).toFixed(1)}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-vc-dark rounded-lg border border-vc-border/50">
                      <p className="text-xs text-vc-text-muted mb-1">Best Performer</p>
                      <p className="text-sm font-semibold text-vc-text">
                        {displayAnalyses.reduce((best, current) => 
                          (current.overallScore || 0) > (best.overallScore || 0) ? current : best
                        ).businessModel || 'N/A'}
                      </p>
                      <p className="text-xs text-green-400 mt-1">
                        Score: {displayAnalyses.reduce((best, current) => 
                          (current.overallScore || 0) > (best.overallScore || 0) ? current : best
                        ).overallScore}/10
                      </p>
                    </div>

                    <div className="p-3 bg-vc-dark rounded-lg border border-vc-border/50">
                      <p className="text-xs text-vc-text-muted mb-1">Most Advanced</p>
                      <p className="text-sm font-semibold text-vc-text">
                        Stage {Math.max(...displayAnalyses.map(a => a.currentStage || 1))}
                      </p>
                      <p className="text-xs text-vc-primary mt-1">
                        {displayAnalyses.filter(a => a.currentStage === Math.max(...displayAnalyses.map(a => a.currentStage || 1))).length} businesses
                      </p>
                    </div>

                    <div className="p-3 bg-gradient-to-r from-vc-primary/20 to-vc-secondary/20 rounded-lg border border-vc-primary/30">
                      <p className="text-xs text-vc-text-muted mb-1">Success Rate</p>
                      <p className="text-xl font-bold text-vc-accent">
                        {Math.round((displayAnalyses.filter(a => (a.overallScore || 0) >= 7).length / displayAnalyses.length) * 100)}%
                      </p>
                      <p className="text-xs text-vc-text-muted mt-1">
                        Score 7+ considered successful
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-vc-text-muted">No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}