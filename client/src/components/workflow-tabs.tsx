import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Download, RotateCcw, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useStageNavigation } from "@/hooks/useStageNavigation";
import { AIService } from "@/lib/ai-service";
import { ExportAnalysis } from "@/components/export-analysis";
import { EnhancedAnalysisDisplay } from "@/components/enhanced-analysis-display";
import { BusinessImprovement } from "@/components/business-improvement";
import { StructuredReport } from "@/components/StructuredReport";
import { ExportCompletePlan } from "@/components/export-complete-plan";
import { ExportDropdown } from "@/components/export-dropdown";
import type { BusinessAnalysis, WorkflowStage } from "@/types";
import type { EnhancedAnalysisRecord } from "@shared/schema";

interface WorkflowTabsProps {
  analysis: BusinessAnalysis;
}

const STAGE_NAMES = [
  '',
  'Discovery & Selection',
  'Lazy-Entrepreneur Filter', 
  'MVP Launch Planning',
  'Demand Testing Strategy',
  'Scaling & Growth',
  'AI Automation Mapping'
];

export function WorkflowTabs({ analysis }: WorkflowTabsProps) {
  const [showContinueButton, setShowContinueButton] = useState<Record<number, boolean>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stagesResponse, isLoading: isLoadingStages } = useQuery({
    queryKey: ['/api/business-analyses', analysis.id, 'stages'],
    queryFn: async () => {
      const response = await fetch(`/api/business-analyses/${analysis.id}/stages`);
      if (!response.ok) {
        throw new Error('Failed to fetch stages');
      }
      return response.json();
    },
  });

  const stages = stagesResponse?.stages || {};
  
  // Use stage navigation hook for state management
  const {
    activeStage,
    stageStatuses,
    navigateToStage,
    getStageStatus,
    canAccessStage,
    isStageCompleted,
  } = useStageNavigation({
    currentStage: analysis.currentStage || 1,
    stages,
    completedStages: stagesResponse?.completedStages || [],
  });

  const generateStageMutation = useMutation({
    mutationFn: async ({ stageNumber, regenerate = false }: { stageNumber: number; regenerate?: boolean }) => {
      const response = await fetch(`/api/business-analyses/${analysis.id}/stages/${stageNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ regenerate }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate stage content');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-analyses', analysis.id, 'stages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/business-analyses'] });
      toast({
        title: "Stage Generated Successfully",
        description: `${STAGE_NAMES[data.stageNumber]} has been generated`,
      });
      // Show continue button instead of auto-navigating
      setShowContinueButton(prev => ({ ...prev, [data.stageNumber]: true }));
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate stage content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStageData = (stageNumber: number) => {
    return stages[stageNumber];
  };

  const handleContinueToNextStage = (currentStage: number) => {
    const nextStage = currentStage + 1;
    if (nextStage <= 6) {
      navigateToStage(nextStage);
      setShowContinueButton(prev => ({ ...prev, [currentStage]: false }));
    }
  };

  const renderStageContent = (stageNumber: number) => {
    const stage = getStageData(stageNumber);
    const status = getStageStatus(stageNumber);
    const isCompleted = isStageCompleted(stageNumber);
    const canAccess = canAccessStage(stageNumber);

    if (stageNumber === 1) {
      return renderDiscoveryContent();
    }

    // Stage is locked - previous stage not completed
    if (!canAccess) {
      return (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vc-dark border-2 border-vc-border mb-4">
            <svg className="w-8 h-8 text-vc-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-vc-text mb-2">Stage Locked</h3>
          <p className="text-vc-text-muted mb-4">
            Complete Stage {stageNumber - 1} ({STAGE_NAMES[stageNumber - 1]}) to unlock this stage.
          </p>
        </div>
      );
    }

    // Stage is completed - show content with regenerate option
    if (isCompleted && stage?.content) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm text-vc-text-muted">
                Generated on {new Date(stage.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {stageNumber >= 2 && STAGE_NAMES[stageNumber] && (
                <ExportDropdown
                  analysisId={analysis.id}
                  stageNumber={stageNumber}
                  stageName={STAGE_NAMES[stageNumber]}
                  businessName={analysis.businessModel || 'Business'}
                />
              )}
              <Button
                onClick={() => {
                  if (confirm(`Are you sure you want to regenerate ${STAGE_NAMES[stageNumber]}? This will replace the existing content.`)) {
                    generateStageMutation.mutate({ stageNumber, regenerate: true });
                  }
                }}
                disabled={generateStageMutation.isPending}
                variant="outline"
                size="sm"
                className="border-vc-border text-vc-text hover:border-vc-primary"
                data-testid={`button-regenerate-stage-${stageNumber}`}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {generateStageMutation.isPending ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
          </div>
          {renderStageSpecificContent(stageNumber, stage.content)}
          
          {/* Continue to Next Stage Button - Show for all completed stages 1-5 */}
          {stageNumber < 6 && (
            <div className="flex justify-end pt-6 border-t border-vc-border">
              <Button
                onClick={() => handleContinueToNextStage(stageNumber)}
                className="bg-vc-primary hover:bg-vc-primary/80 text-white font-semibold shadow-neon"
                data-testid={`button-continue-stage-${stageNumber + 1}`}
              >
                Continue to Stage {stageNumber + 1}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      );
    }

    // Stage is available but not generated yet
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vc-primary/10 border-2 border-vc-primary mb-4">
          <svg className="w-8 h-8 text-vc-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-vc-text mb-2">Ready to Generate</h3>
        <p className="text-vc-text-muted mb-6 max-w-md mx-auto">
          Generate AI-powered insights for {STAGE_NAMES[stageNumber]} based on your business analysis.
        </p>
        <Button
          onClick={() => generateStageMutation.mutate({ stageNumber })}
          disabled={generateStageMutation.isPending}
          className="bg-vc-primary hover:bg-vc-primary/80 text-white shadow-neon"
          data-testid={`button-generate-stage-${stageNumber}`}
        >
          {generateStageMutation.isPending ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>Generate {STAGE_NAMES[stageNumber]}</>
          )}
        </Button>
      </div>
    );
  };

  const renderDiscoveryContent = () => {
    if (!analysis.scoreDetails) return null;

    const weights = {
      technicalComplexity: 20,
      marketOpportunity: 25,
      competitiveLandscape: 15,
      resourceRequirements: 20,
      timeToMarket: 20
    };

    const scoreItems = [
      { 
        key: 'technicalComplexity', 
        label: 'Technical Simplicity', 
        weight: weights.technicalComplexity,
        tooltip: 'Higher score = simpler to build. Measures how easy it is to replicate the technical implementation.'
      },
      { 
        key: 'marketOpportunity', 
        label: 'Market Opportunity', 
        weight: weights.marketOpportunity,
        tooltip: 'Higher score = better opportunity. Measures market size, demand, and growth potential.'
      },
      { 
        key: 'competitiveLandscape', 
        label: 'Competitive Landscape', 
        weight: weights.competitiveLandscape,
        tooltip: 'Higher score = less competition. Measures how easy it is to compete in this market.'
      },
      { 
        key: 'resourceRequirements', 
        label: 'Resource Requirements', 
        weight: weights.resourceRequirements,
        tooltip: 'Higher score = fewer resources needed. Measures capital, team, and infrastructure requirements.'
      },
      { 
        key: 'timeToMarket', 
        label: 'Time to Market', 
        weight: weights.timeToMarket,
        tooltip: 'Higher score = faster to launch. Measures how quickly you can build and launch an MVP.'
      },
    ];

    // Calculate overall score from weighted criteria
    const calculateOverallScore = () => {
      const weightedSum = scoreItems.reduce((sum, item) => {
        const scoreData = analysis.scoreDetails![item.key as keyof typeof analysis.scoreDetails] as any;
        return sum + (scoreData.score * (item.weight / 100));
      }, 0);
      return Math.round(weightedSum * 10) / 10;
    };

    const calculatedOverallScore = calculateOverallScore();

    const getScoreColor = (score: number) => {
      if (score >= 8) return 'bg-green-900/50 text-green-300';
      if (score >= 6) return 'bg-yellow-900/50 text-yellow-300';
      return 'bg-red-900/50 text-red-300';
    };

    return (
      <div className="space-y-6">
        {/* Business Analysis Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-vc-text">Business Analysis Results</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-vc-text-muted">AI Analysis Complete</span>
            </div>
          </div>

          {/* Business Overview Card */}
          <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-vc-text-muted">Business URL</label>
                <p className="text-vc-text font-mono text-sm mt-1">{analysis.url}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-vc-text-muted">Business Model</label>
                <p className="text-vc-text mt-1">{analysis.businessModel}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-vc-text-muted">Primary Revenue Stream</label>
                <p className="text-vc-text mt-1">{analysis.revenueStream}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-vc-text-muted">Target Market</label>
                <p className="text-vc-text mt-1">{analysis.targetMarket}</p>
              </div>
            </div>
          </div>

          {/* Cloneability Scorecard */}
          <div className="bg-vc-dark rounded-lg border border-vc-border overflow-hidden">
            <div className="bg-vc-card px-4 py-3 border-b border-vc-border flex items-center justify-between">
              <h4 className="font-semibold text-vc-text">Cloneability Scorecard</h4>
              <a 
                href="/docs/SCORING_METHODOLOGY.md" 
                target="_blank"
                className="text-xs text-vc-primary hover:text-vc-primary/80 flex items-center gap-1"
              >
                <Info className="h-3 w-3" />
                Learn about scoring methodology
              </a>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-vc-text-muted">
                      <th className="pb-3">Criteria</th>
                      <th className="pb-3 text-center">Score</th>
                      <th className="pb-3 text-center">Weight</th>
                      <th className="pb-3 text-center">Weighted Score</th>
                      <th className="pb-3">AI Reasoning</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {scoreItems.map((item) => {
                      const scoreData = analysis.scoreDetails![item.key as keyof typeof analysis.scoreDetails] as any;
                      const weightedScore = Math.round((scoreData.score * item.weight / 100) * 10) / 10;
                      
                      return (
                        <tr key={item.key} className="border-b border-vc-border/50">
                          <td className="py-3 text-vc-text">
                            <div className="flex items-center gap-2">
                              <span>{item.label}</span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Info className="h-4 w-4 text-vc-text-muted cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <p>{item.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <Badge className={`${getScoreColor(scoreData.score)} text-xs font-medium`}>
                              {scoreData.score}/10
                            </Badge>
                          </td>
                          <td className="py-3 text-center text-vc-text-muted">{item.weight}%</td>
                          <td className="py-3 text-center text-vc-accent font-semibold">{weightedScore}</td>
                          <td className="py-3 text-sm text-vc-text-muted">{scoreData.reasoning}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-vc-border">
                      <td className="pt-3 font-semibold text-vc-text">
                        <div className="flex items-center gap-2">
                          <span>Overall Score</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 text-vc-text-muted cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-sm">
                                <p className="font-semibold mb-2">Weighted Score Calculation:</p>
                                <p className="text-xs">
                                  Overall Score = (Technical Simplicity × 20%) + (Market Opportunity × 25%) + 
                                  (Competitive Landscape × 15%) + (Resource Requirements × 20%) + (Time to Market × 20%)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </td>
                      <td className="pt-3 text-center">
                        <Badge className="bg-vc-primary text-white text-sm font-bold">
                          {calculatedOverallScore}/10
                        </Badge>
                      </td>
                      <td className="pt-3 text-center text-vc-text-muted">100%</td>
                      <td className="pt-3 text-center text-vc-accent font-bold text-lg">
                        {calculatedOverallScore}
                      </td>
                      <td className="pt-3 text-sm text-green-400 font-medium">
                        {calculatedOverallScore >= 7 ? 'Strong Clone Candidate ✓' : 
                         calculatedOverallScore >= 5 ? 'Moderate Candidate' : 
                         'Weak Candidate'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Structured Analysis Report */}
        {analysis.structured && (
          <div className="mt-6">
            <StructuredReport data={analysis.structured} url={analysis.url} />
          </div>
        )}

        {/* Business Improvement Component - Requirements 4.2, 4.3, 4.4, 4.5 */}
        <div className="mt-6">
          <BusinessImprovement 
            analysisId={analysis.id}
            {...((analysis as EnhancedAnalysisRecord).improvements && {
              existingImprovement: (analysis as EnhancedAnalysisRecord).improvements
            })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-vc-border">
          <ExportDropdown 
            analysisId={analysis.id}
            stageNumber={1}
            stageName="Discovery-Selection"
            businessName={analysis.businessModel || 'Business'}
          />
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="bg-vc-card border-vc-border text-vc-text hover:border-vc-primary"
              data-testid="button-reanalyze"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Re-analyze
            </Button>
            {/* Continue to Next Stage Button for Stage 1 */}
            <Button
              onClick={() => handleContinueToNextStage(1)}
              className="bg-vc-primary hover:bg-vc-primary/80 text-white font-semibold shadow-neon"
              data-testid="button-continue-stage-2"
            >
              Continue to Stage 2
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderStageSpecificContent = (stageNumber: number, data: any) => {
    switch (stageNumber) {
      case 2:
        return renderLazyEntrepreneurFilter(data);
      case 3:
        return renderMVPPlanning(data);
      case 4:
        return renderDemandTesting(data);
      case 5:
        return renderScalingGrowth(data);
      case 6:
        return renderAIAutomation(data);
      default:
        return <div className="text-vc-text-muted">Stage content not available</div>;
    }
  };

  const renderLazyEntrepreneurFilter = (data: any) => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-block">
          <div className="text-xs text-vc-text-muted mb-2 font-medium">RECOMMENDATION</div>
          <Badge className={`text-2xl font-bold px-8 py-3 shadow-lg border-2 ${
            data.recommendation === 'go' ? 'bg-green-900/50 text-green-300 border-green-500/50' :
            data.recommendation === 'maybe' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50' :
            'bg-red-900/50 text-red-300 border-red-500/50'
          }`}>
            {data.recommendation === 'go' ? '✓ GO' : 
             data.recommendation === 'maybe' ? '? MAYBE' : 
             '✗ NO-GO'}
          </Badge>
          <div className="text-xs text-vc-text-muted mt-2">
            {data.recommendation === 'go' ? 'Strong opportunity - proceed with confidence' :
             data.recommendation === 'maybe' ? 'Requires more validation before proceeding' :
             'Not recommended - consider alternatives'}
          </div>
        </div>
      </div>

      {/* Score Methodology Explanation */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-blue-300 font-semibold text-sm">How Stage 1 & Stage 2 Scores Relate</h4>
              <a 
                href="/docs/SCORING_METHODOLOGY.md" 
                target="_blank"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                View full methodology →
              </a>
            </div>
            <p className="text-sm text-vc-text-muted leading-relaxed">
              Stage 1's clonability scores inform this stage's effort/reward assessment:
            </p>
            <ul className="text-sm text-vc-text-muted space-y-1 ml-4">
              <li>• <span className="text-vc-text">Effort Score</span> is derived from Technical Simplicity, Resource Requirements, and Time to Market</li>
              <li>• <span className="text-vc-text">Reward Score</span> is derived from Market Opportunity and Competitive Landscape</li>
              <li>• The <span className="text-vc-text">recommendation</span> balances effort vs. reward to determine if this is worth pursuing</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-vc-text-muted text-sm font-medium">Effort Score</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-vc-text-muted cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Measures how much work is required. Based on technical complexity, resources needed, and time to build. Lower scores mean less effort required.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-3xl font-bold text-vc-accent">{data.effortScore}/10</div>
          <p className="text-xs text-vc-text-muted mt-2">Lower is better</p>
        </div>
        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-vc-text-muted text-sm font-medium">Reward Score</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-vc-text-muted cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Measures potential return on investment. Based on market size, demand, and competitive advantage. Higher scores mean better potential rewards.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="text-3xl font-bold text-vc-accent">{data.rewardScore}/10</div>
          <p className="text-xs text-vc-text-muted mt-2">Higher is better</p>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-vc-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI Reasoning
        </h4>
        <p className="text-vc-text-muted leading-relaxed">{data.reasoning}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <h4 className="text-vc-text font-semibold mb-3">Automation Potential</h4>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-vc-text-muted">Score</span>
              <span className="text-lg font-bold text-vc-primary">{Math.round(data.automationPotential.score * 100)}%</span>
            </div>
            <div className="w-full bg-vc-card rounded-full h-2">
              <div 
                className="bg-vc-primary h-2 rounded-full transition-all"
                style={{ width: `${data.automationPotential.score * 100}%` }}
              />
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-vc-text-muted mb-2">Opportunities</h5>
            <ul className="space-y-2">
              {data.automationPotential.opportunities.map((opp: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-vc-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-vc-text-muted">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <h4 className="text-vc-text font-semibold mb-3">Resource Requirements</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-vc-text-muted mb-1">Time</h5>
              <p className="text-vc-text">{data.resourceRequirements.time}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-vc-text-muted mb-1">Money</h5>
              <p className="text-vc-text">{data.resourceRequirements.money}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-vc-text-muted mb-2">Skills Required</h5>
              <div className="flex flex-wrap gap-2">
                {data.resourceRequirements.skills.map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="border-vc-accent text-vc-accent">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-3">Next Steps</h4>
        <ol className="space-y-2">
          {data.nextSteps.map((step: string, index: number) => (
            <li key={index} className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-vc-primary/20 text-vc-primary flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </span>
              <span className="text-vc-text-muted pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );

  const renderMVPPlanning = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <h4 className="text-vc-text font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
            Core MVP Features
          </h4>
          <ul className="space-y-3">
            {data.coreFeatures?.map((feature: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-vc-text-muted pt-0.5">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <h4 className="text-vc-text font-semibold mb-4">Nice-to-Have Features</h4>
          <ul className="space-y-3">
            {data.niceToHaves?.map((feature: string, index: number) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-vc-card text-vc-text-muted flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span className="text-vc-text-muted pt-0.5">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Recommended Tech Stack</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h5 className="text-sm font-medium text-vc-text-muted mb-3">Frontend</h5>
            <div className="flex flex-wrap gap-2">
              {data.techStack?.frontend?.map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="border-blue-500/50 text-blue-400">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-vc-text-muted mb-3">Backend</h5>
            <div className="flex flex-wrap gap-2">
              {data.techStack?.backend?.map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="border-green-500/50 text-green-400">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-vc-text-muted mb-3">Infrastructure</h5>
            <div className="flex flex-wrap gap-2">
              {data.techStack?.infrastructure?.map((tech: string, index: number) => (
                <Badge key={index} variant="outline" className="border-purple-500/50 text-purple-400">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Development Timeline</h4>
        <div className="space-y-4">
          {data.timeline?.map((phase: any, index: number) => (
            <div key={index} className="border-l-2 border-vc-primary pl-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-vc-text font-medium">{phase.phase}</h5>
                <Badge className="bg-vc-primary/20 text-vc-primary">{phase.duration}</Badge>
              </div>
              <ul className="space-y-1">
                {phase.deliverables?.map((deliverable: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="h-3 w-3 text-vc-accent mt-1 flex-shrink-0" />
                    <span className="text-sm text-vc-text-muted">{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <div className="flex items-center justify-between">
          <h4 className="text-vc-text font-semibold">Estimated Cost</h4>
          <div className="text-2xl font-bold text-vc-accent">{data.estimatedCost}</div>
        </div>
      </div>
    </div>
  );

  const renderDemandTesting = (data: any) => (
    <div className="space-y-6">
      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Testing Methods</h4>
        <div className="space-y-4">
          {data.testingMethods?.map((method: any, index: number) => (
            <div key={index} className="border-l-2 border-vc-accent pl-4">
              <h5 className="text-vc-text font-medium mb-2">{method.method}</h5>
              <p className="text-sm text-vc-text-muted mb-3">{method.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-vc-text-muted">Cost:</span>
                  <Badge className="bg-vc-primary/20 text-vc-primary">{method.cost}</Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-vc-text-muted">Timeline:</span>
                  <Badge className="bg-vc-accent/20 text-vc-accent">{method.timeline}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Success Metrics & KPIs</h4>
        <div className="space-y-4">
          {data.successMetrics?.map((metric: any, index: number) => (
            <div key={index} className="bg-vc-card rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-vc-text font-medium">{metric.metric}</h5>
                <Badge className="bg-green-900/30 text-green-400">{metric.target}</Badge>
              </div>
              <p className="text-sm text-vc-text-muted">{metric.measurement}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <h4 className="text-vc-text font-semibold mb-4">Budget Breakdown</h4>
          <div className="space-y-3">
            {data.budget?.breakdown?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-vc-text-muted">{item.item}</span>
                <span className="text-vc-text font-medium">{item.cost}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-vc-border flex items-center justify-between">
              <span className="text-vc-text font-semibold">Total Budget</span>
              <span className="text-xl font-bold text-vc-accent">{data.budget?.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
          <h4 className="text-vc-text font-semibold mb-4">Testing Timeline</h4>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-vc-primary mb-2">{data.timeline}</div>
              <p className="text-sm text-vc-text-muted">Total Duration</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScalingGrowth = (data: any) => (
    <div className="space-y-6">
      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Growth Channels</h4>
        <div className="space-y-4">
          {data.growthChannels?.map((channel: any, index: number) => (
            <div key={index} className="bg-vc-card rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h5 className="text-vc-text font-medium">{channel.channel}</h5>
                <Badge className={`${
                  channel.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                  channel.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                  'bg-blue-900/30 text-blue-400'
                }`}>
                  {channel.priority.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-vc-text-muted">{channel.strategy}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Growth Milestones</h4>
        <div className="space-y-4">
          {data.milestones?.map((milestone: any, index: number) => (
            <div key={index} className="border-l-2 border-vc-primary pl-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-vc-text font-medium">{milestone.milestone}</h5>
                <Badge className="bg-vc-primary/20 text-vc-primary">{milestone.timeline}</Badge>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {milestone.metrics?.map((metric: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="border-vc-accent text-vc-accent text-xs">
                    {metric}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Resource Scaling Plan</h4>
        <div className="space-y-4">
          {data.resourceScaling?.map((phase: any, index: number) => (
            <div key={index} className="bg-vc-card rounded-lg p-4">
              <h5 className="text-vc-text font-medium mb-3">{phase.phase}</h5>
              <div className="space-y-3">
                <div>
                  <h6 className="text-sm font-medium text-vc-text-muted mb-2">Team Requirements</h6>
                  <div className="flex flex-wrap gap-2">
                    {phase.team?.map((role: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-green-500/50 text-green-400">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="text-sm font-medium text-vc-text-muted mb-1">Infrastructure</h6>
                  <p className="text-sm text-vc-text-muted">{phase.infrastructure}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAIAutomation = (data: any) => (
    <div className="space-y-6">
      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Automation Opportunities</h4>
        <div className="space-y-4">
          {data.automationOpportunities?.sort((a: any, b: any) => b.priority - a.priority).map((opp: any, index: number) => (
            <div key={index} className="bg-vc-card rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h5 className="text-vc-text font-medium">{opp.process}</h5>
                    <Badge className={`${
                      opp.priority >= 8 ? 'bg-red-900/30 text-red-400' :
                      opp.priority >= 5 ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      Priority: {opp.priority}/10
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-vc-text-muted">Tool:</span>
                      <Badge variant="outline" className="border-vc-primary text-vc-primary">
                        {opp.tool}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-vc-text-muted">ROI:</span>
                      <span className="text-green-400 font-medium">{opp.roi}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-6">
        <h4 className="text-vc-text font-semibold mb-4">Implementation Plan</h4>
        <div className="space-y-4">
          {data.implementationPlan?.map((phase: any, index: number) => (
            <div key={index} className="border-l-2 border-vc-accent pl-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-vc-text font-medium">{phase.phase}</h5>
                <Badge className="bg-vc-accent/20 text-vc-accent">{phase.timeline}</Badge>
              </div>
              <ul className="space-y-2">
                {phase.automations?.map((automation: string, idx: number) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-vc-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-vc-text-muted">{automation}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-lg border border-green-500/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-vc-text font-semibold mb-1">Estimated Annual Savings</h4>
            <p className="text-sm text-vc-text-muted">Through AI automation implementation</p>
          </div>
          <div className="text-3xl font-bold text-green-400">{data.estimatedSavings}</div>
        </div>
      </div>

      {/* Export Complete Plan Button */}
      <div className="flex justify-center pt-6 border-t border-vc-border">
        <ExportCompletePlan analysisId={analysis.id} businessName={analysis.businessModel || 'Business-Plan'} />
      </div>
    </div>
  );

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-workflow-tabs">
      <Tabs value={activeStage.toString()} onValueChange={(value) => navigateToStage(parseInt(value))}>
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-6 bg-vc-card border-b border-vc-border rounded-none h-auto p-0">
          {[1, 2, 3, 4, 5, 6].map((stage) => {
            const status = getStageStatus(stage);
            const isCompleted = isStageCompleted(stage);
            const canAccess = canAccessStage(stage);
            const isCurrent = stage === activeStage;
            
            return (
              <TabsTrigger
                key={stage}
                value={stage.toString()}
                className={`flex-1 min-w-0 py-4 px-3 text-center border-b-2 transition-all data-[state=active]:border-vc-primary data-[state=active]:bg-vc-primary/10 data-[state=active]:text-vc-primary ${
                  isCompleted ? 'text-vc-text border-green-400/30' : 
                  isCurrent ? 'text-vc-text border-vc-primary/30' : 
                  canAccess ? 'text-vc-text-muted border-transparent' :
                  'text-vc-text-muted/50 border-transparent cursor-not-allowed'
                }`}
                disabled={!canAccess}
                data-testid={`tab-stage-${stage}`}
              >
                <div className="relative">
                  <div className="text-xs uppercase tracking-wide">Stage {stage}</div>
                  <div className="text-sm mt-1 truncate">{STAGE_NAMES[stage]}</div>
                  {isCompleted && (
                    <CheckCircle className="h-3 w-3 mx-auto mt-1 text-green-400" />
                  )}
                  {isCurrent && !isCompleted && (
                    <div className="h-2 w-2 mx-auto mt-1 rounded-full bg-vc-primary animate-pulse" />
                  )}
                  {!canAccess && (
                    <svg className="h-3 w-3 mx-auto mt-1 text-vc-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content */}
        {[1, 2, 3, 4, 5, 6].map((stage) => (
          <TabsContent key={stage} value={stage.toString()} className="p-6">
            {renderStageContent(stage)}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
