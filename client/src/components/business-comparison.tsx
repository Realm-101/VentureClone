import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Percent, TrendingUp, Clock, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { BusinessAnalysis } from "@/types";

interface BusinessComparisonProps {
  analyses: BusinessAnalysis[];
}

export function BusinessComparison({ analyses }: BusinessComparisonProps) {
  // Ensure analyses is always an array to prevent filter errors
  const safeAnalyses = Array.isArray(analyses) ? analyses : [];
  
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'stage'>('score');

  const toggleSelection = (id: string) => {
    setSelectedAnalyses(prev => 
      prev.includes(id) 
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  };

  const selectedItems = safeAnalyses.filter(a => selectedAnalyses.includes(a.id));

  const sortedAnalyses = [...safeAnalyses].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.overallScore || 0) - (a.overallScore || 0);
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'stage':
        return (b.currentStage || 1) - (a.currentStage || 1);
      default:
        return 0;
    }
  });

  const getAverageScore = (items: BusinessAnalysis[], key: string) => {
    const scores = items
      .filter(item => item.scoreDetails)
      .map(item => {
        const detail = item.scoreDetails![key as keyof typeof item.scoreDetails] as any;
        return detail?.score || 0;
      });
    
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (safeAnalyses.length < 2) {
    return (
      <Card className="bg-vc-card border-vc-border" data-testid="card-business-comparison">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-vc-text">Business Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-vc-text-muted">Need at least 2 analyses to compare</p>
            <p className="text-vc-text-muted text-sm mt-1">
              Analyze more businesses to unlock comparison features
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-business-comparison">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-vc-text">Business Comparison</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy('score')}
              className={`border-vc-border ${sortBy === 'score' ? 'bg-vc-primary/20 border-vc-primary' : ''}`}
              data-testid="button-sort-score"
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              Score
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy('date')}
              className={`border-vc-border ${sortBy === 'date' ? 'bg-vc-primary/20 border-vc-primary' : ''}`}
              data-testid="button-sort-date"
            >
              <Clock className="h-3 w-3 mr-1" />
              Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortBy('stage')}
              className={`border-vc-border ${sortBy === 'stage' ? 'bg-vc-primary/20 border-vc-primary' : ''}`}
              data-testid="button-sort-stage"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Stage
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection List */}
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {sortedAnalyses.map((analysis) => (
            <div
              key={analysis.id}
              className={`flex items-center space-x-3 p-3 bg-vc-dark rounded-lg border ${
                selectedAnalyses.includes(analysis.id) 
                  ? 'border-vc-primary bg-vc-primary/10' 
                  : 'border-vc-border/50'
              } hover:border-vc-border transition-colors cursor-pointer`}
              onClick={() => toggleSelection(analysis.id)}
              data-testid={`comparison-item-${analysis.id}`}
            >
              <Checkbox
                checked={selectedAnalyses.includes(analysis.id)}
                onCheckedChange={() => toggleSelection(analysis.id)}
                className="border-vc-border data-[state=checked]:bg-vc-primary"
              />
              <div className="flex-1">
                <p className="text-vc-text font-medium text-sm">
                  {analysis.businessModel || 'Business Analysis'}
                </p>
                <p className="text-vc-text-muted text-xs font-mono truncate">
                  {analysis.url}
                </p>
              </div>
              <Badge className={`${
                (analysis.overallScore || 0) >= 7 
                  ? 'bg-green-900/50 text-green-300' 
                  : (analysis.overallScore || 0) >= 5 
                  ? 'bg-yellow-900/50 text-yellow-300' 
                  : 'bg-red-900/50 text-red-300'
              } text-xs`}>
                {analysis.overallScore}/10
              </Badge>
            </div>
          ))}
        </div>

        {/* Comparison Results */}
        {selectedItems.length >= 2 && (
          <div className="border-t border-vc-border pt-4">
            <h3 className="text-sm font-semibold text-vc-text mb-3">
              Comparing {selectedItems.length} Businesses
            </h3>
            
            {/* Average Scores Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-vc-dark rounded-lg p-3 border border-vc-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-vc-text-muted">Avg. Overall Score</span>
                  <Percent className="h-3 w-3 text-vc-text-muted" />
                </div>
                <p className={`text-xl font-bold ${getScoreColor(
                  selectedItems.reduce((acc, item) => acc + (item.overallScore || 0), 0) / selectedItems.length
                )}`}>
                  {Math.round((selectedItems.reduce((acc, item) => acc + (item.overallScore || 0), 0) / selectedItems.length) * 10) / 10}
                </p>
              </div>

              <div className="bg-vc-dark rounded-lg p-3 border border-vc-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-vc-text-muted">Avg. Tech Complexity</span>
                  <TrendingUp className="h-3 w-3 text-vc-text-muted" />
                </div>
                <p className={`text-xl font-bold ${getScoreColor(
                  getAverageScore(selectedItems, 'technicalComplexity')
                )}`}>
                  {getAverageScore(selectedItems, 'technicalComplexity')}
                </p>
              </div>

              <div className="bg-vc-dark rounded-lg p-3 border border-vc-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-vc-text-muted">Avg. Market Opportunity</span>
                  <Users className="h-3 w-3 text-vc-text-muted" />
                </div>
                <p className={`text-xl font-bold ${getScoreColor(
                  getAverageScore(selectedItems, 'marketOpportunity')
                )}`}>
                  {getAverageScore(selectedItems, 'marketOpportunity')}
                </p>
              </div>

              <div className="bg-vc-dark rounded-lg p-3 border border-vc-border/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-vc-text-muted">Avg. Time to Market</span>
                  <Clock className="h-3 w-3 text-vc-text-muted" />
                </div>
                <p className={`text-xl font-bold ${getScoreColor(
                  getAverageScore(selectedItems, 'timeToMarket')
                )}`}>
                  {getAverageScore(selectedItems, 'timeToMarket')}
                </p>
              </div>
            </div>

            {/* Best Candidate */}
            <div className="bg-gradient-to-r from-vc-primary/20 to-vc-secondary/20 rounded-lg p-3 border border-vc-primary/30">
              <p className="text-xs text-vc-text-muted mb-1">Best Overall Candidate</p>
              <p className="text-sm font-semibold text-vc-text">
                {selectedItems.reduce((best, current) => 
                  (current.overallScore || 0) > (best.overallScore || 0) ? current : best
                ).businessModel || 'Unknown'}
              </p>
              <p className="text-xs text-vc-accent mt-1">
                Score: {selectedItems.reduce((best, current) => 
                  (current.overallScore || 0) > (best.overallScore || 0) ? current : best
                ).overallScore}/10
              </p>
            </div>
          </div>
        )}

        {selectedItems.length === 1 && (
          <div className="text-center py-4 border-t border-vc-border">
            <p className="text-vc-text-muted text-sm">
              Select at least 2 businesses to compare
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}