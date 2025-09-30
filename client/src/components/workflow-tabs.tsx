import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Download, RotateCcw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/lib/ai-service";
import { ExportAnalysis } from "@/components/export-analysis";
import { EnhancedAnalysisDisplay } from "@/components/enhanced-analysis-display";
import type { BusinessAnalysis, WorkflowStage } from "@/types";

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
  const [activeStage, setActiveStage] = useState(analysis.currentStage || 1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stages = [] } = useQuery({
    queryKey: ['/api/workflow-stages', analysis.id],
    queryFn: async () => {
      const response = await fetch(`/api/workflow-stages/${analysis.id}`);
      return response.json();
    },
  });

  const generateStageMutation = useMutation({
    mutationFn: (stageNumber: number) => AIService.generateStageContent(analysis.id, stageNumber),
    onSuccess: (stage) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workflow-stages', analysis.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/business-analyses'] });
      toast({
        title: "Stage Generated",
        description: `${STAGE_NAMES[stage.stageNumber]} content generated successfully`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate stage content",
        variant: "destructive",
      });
    },
  });

  const getStageStatus = (stageNumber: number) => {
    const stage = stages.find((s: WorkflowStage) => s.stageNumber === stageNumber);
    if (stage?.status === 'completed') return 'completed';
    if (stageNumber <= (analysis.currentStage || 1)) return 'current';
    return 'pending';
  };

  const getStageData = (stageNumber: number) => {
    return stages.find((s: WorkflowStage) => s.stageNumber === stageNumber);
  };

  const renderStageContent = (stageNumber: number) => {
    const stage = getStageData(stageNumber);
    const status = getStageStatus(stageNumber);

    if (stageNumber === 1) {
      return renderDiscoveryContent();
    }

    if (status === 'pending') {
      return (
        <div className="text-center py-8">
          <p className="text-vc-text-muted mb-4">
            This stage is not yet available. Complete previous stages to unlock.
          </p>
          <Button
            onClick={() => generateStageMutation.mutate(stageNumber)}
            disabled={generateStageMutation.isPending || stageNumber > (analysis.currentStage || 1) + 1}
            className="bg-vc-primary hover:bg-vc-primary/80 text-white shadow-neon"
            data-testid={`button-generate-stage-${stageNumber}`}
          >
            {generateStageMutation.isPending ? 'Generating...' : `Generate ${STAGE_NAMES[stageNumber]}`}
          </Button>
        </div>
      );
    }

    if (stage?.data) {
      return renderStageSpecificContent(stageNumber, stage.data);
    }

    return (
      <div className="text-center py-8">
        <Button
          onClick={() => generateStageMutation.mutate(stageNumber)}
          disabled={generateStageMutation.isPending}
          className="bg-vc-primary hover:bg-vc-primary/80 text-white shadow-neon"
          data-testid={`button-generate-stage-${stageNumber}`}
        >
          {generateStageMutation.isPending ? 'Generating...' : `Generate ${STAGE_NAMES[stageNumber]}`}
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
      { key: 'technicalComplexity', label: 'Technical Complexity', weight: weights.technicalComplexity },
      { key: 'marketOpportunity', label: 'Market Opportunity', weight: weights.marketOpportunity },
      { key: 'competitiveLandscape', label: 'Competitive Landscape', weight: weights.competitiveLandscape },
      { key: 'resourceRequirements', label: 'Resource Requirements', weight: weights.resourceRequirements },
      { key: 'timeToMarket', label: 'Time to Market', weight: weights.timeToMarket },
    ];

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
            <div className="bg-vc-card px-4 py-3 border-b border-vc-border">
              <h4 className="font-semibold text-vc-text">Cloneability Scorecard</h4>
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
                          <td className="py-3 text-vc-text">{item.label}</td>
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
                      <td className="pt-3 font-semibold text-vc-text">Overall Score</td>
                      <td className="pt-3 text-center">
                        <Badge className="bg-vc-primary text-white text-sm font-bold">
                          {analysis.overallScore}/10
                        </Badge>
                      </td>
                      <td className="pt-3 text-center text-vc-text-muted">100%</td>
                      <td className="pt-3 text-center text-vc-accent font-bold text-lg">
                        {analysis.overallScore}
                      </td>
                      <td className="pt-3 text-sm text-green-400 font-medium">
                        {(analysis.overallScore || 0) >= 7 ? 'Strong Clone Candidate ✓' : 
                         (analysis.overallScore || 0) >= 5 ? 'Moderate Candidate' : 
                         'Weak Candidate'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Analysis Display with Improvement Functionality */}
        {analysis.structured && (
          <div className="mt-6">
            <EnhancedAnalysisDisplay analysis={analysis} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-vc-border">
          <ExportAnalysis analysis={analysis} stages={stages} />
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-vc-card border-vc-border text-vc-text hover:border-vc-primary"
              data-testid="button-reanalyze"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Re-analyze
            </Button>
            <Button
              onClick={() => {
                setActiveStage(2);
                generateStageMutation.mutate(2);
              }}
              className="bg-vc-primary hover:bg-vc-primary/80 text-white font-semibold shadow-neon"
              data-testid="button-proceed-stage-2"
            >
              Proceed to Filter
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
      <div className="text-center">
        <Badge className={`text-lg font-bold px-4 py-2 ${
          data.recommendation === 'PROCEED' ? 'bg-green-900/50 text-green-300' :
          data.recommendation === 'MODIFY' ? 'bg-yellow-900/50 text-yellow-300' :
          'bg-red-900/50 text-red-300'
        }`}>
          {data.recommendation}
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-2">Effort Score</h4>
          <div className="text-2xl font-bold text-vc-accent">{data.effortScore}/10</div>
        </div>
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-2">Reward Score</h4>
          <div className="text-2xl font-bold text-vc-accent">{data.rewardScore}/10</div>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
        <h4 className="text-vc-text font-semibold mb-2">AI Reasoning</h4>
        <p className="text-vc-text-muted">{data.reasoning}</p>
      </div>

      {data.modifications && data.modifications.length > 0 && (
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-2">Suggested Modifications</h4>
          <ul className="list-disc list-inside space-y-1 text-vc-text-muted">
            {data.modifications.map((mod: string, index: number) => (
              <li key={index}>{mod}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderMVPPlanning = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Core MVP Features</h4>
          <ul className="space-y-2">
            {data.coreFeatures?.map((feature: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Recommended Tech Stack</h4>
          <div className="flex flex-wrap gap-2">
            {data.techStack?.map((tech: string, index: number) => (
              <Badge key={index} variant="outline" className="border-vc-accent text-vc-accent">
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-2">Timeline</h4>
          <p className="text-vc-accent font-bold">{data.timeline}</p>
        </div>
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-2">Budget Estimate</h4>
          <p className="text-vc-accent font-bold">{data.budgetEstimate}</p>
        </div>
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-2">Team Size</h4>
          <p className="text-vc-accent font-bold">{data.teamRequirements?.length || 0} roles</p>
        </div>
      </div>
    </div>
  );

  const renderDemandTesting = (data: any) => (
    <div className="space-y-6">
      <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
        <h4 className="text-vc-text font-semibold mb-3">Landing Page Strategy</h4>
        <p className="text-vc-text-muted">{data.landingPageStrategy}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Validation Methods</h4>
          <ul className="space-y-2">
            {data.validationMethods?.map((method: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-vc-accent mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{method}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Success Metrics</h4>
          <ul className="space-y-2">
            {data.successMetrics?.map((metric: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{metric}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  const renderScalingGrowth = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Growth Strategies</h4>
          <ul className="space-y-2">
            {data.growthStrategies?.map((strategy: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-vc-primary mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{strategy}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Acquisition Channels</h4>
          <ul className="space-y-2">
            {data.acquisitionChannels?.map((channel: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-vc-secondary mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{channel}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
        <h4 className="text-vc-text font-semibold mb-3">Competitive Positioning</h4>
        <p className="text-vc-text-muted">{data.positioning}</p>
      </div>
    </div>
  );

  const renderAIAutomation = (data: any) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Customer Service AI</h4>
          <ul className="space-y-2">
            {data.customerServiceAI?.map((item: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-vc-accent mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
          <h4 className="text-vc-text font-semibold mb-3">Marketing Automation</h4>
          <ul className="space-y-2">
            {data.marketingAutomation?.map((item: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-vc-primary mt-0.5 flex-shrink-0" />
                <span className="text-vc-text-muted text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-vc-dark rounded-lg border border-vc-border p-4">
        <h4 className="text-vc-text font-semibold mb-3">ROI Projections</h4>
        <p className="text-vc-text-muted">{data.roiProjections}</p>
      </div>
    </div>
  );

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-workflow-tabs">
      <Tabs value={activeStage.toString()} onValueChange={(value) => setActiveStage(parseInt(value))}>
        {/* Tab Navigation */}
        <TabsList className="grid w-full grid-cols-6 bg-vc-card border-b border-vc-border rounded-none h-auto p-0">
          {[1, 2, 3, 4, 5, 6].map((stage) => {
            const status = getStageStatus(stage);
            return (
              <TabsTrigger
                key={stage}
                value={stage.toString()}
                className={`flex-1 min-w-0 py-4 px-3 text-center border-b-2 transition-all data-[state=active]:border-vc-primary data-[state=active]:bg-vc-primary/10 data-[state=active]:text-vc-primary ${
                  status === 'completed' ? 'text-vc-text' : 
                  status === 'current' ? 'text-vc-text' : 'text-vc-text-muted'
                }`}
                disabled={status === 'pending' && stage > (analysis.currentStage || 1) + 1}
                data-testid={`tab-stage-${stage}`}
              >
                <div>
                  <div className="text-xs uppercase tracking-wide">Stage {stage}</div>
                  <div className="text-sm mt-1 truncate">{STAGE_NAMES[stage]}</div>
                  {status === 'completed' && (
                    <CheckCircle className="h-3 w-3 mx-auto mt-1 text-green-400" />
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
