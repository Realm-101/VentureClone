import { CheckCircle, Clock, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStageNavigation } from "@/hooks/useStageNavigation";
import type { BusinessAnalysis } from "@/types";

interface ProgressTrackerProps {
  analysis: BusinessAnalysis;
}

/**
 * Progress Tracker Component
 * Requirements: 5.3, 5.5
 * 
 * Displays the current progress through the 6-stage workflow with:
 * - Checkmark for completed stages
 * - Highlight for current stage
 * - "Pending" status for future stages
 */
export function ProgressTracker({ analysis }: ProgressTrackerProps) {
  // Fetch stages data to get completion status
  const { data: stagesResponse } = useQuery({
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
  
  // Use stage navigation hook to get stage statuses
  const { stageStatuses, activeStage } = useStageNavigation({
    currentStage: analysis.currentStage || 1,
    stages,
    completedStages: stagesResponse?.completedStages || [],
  });

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-progress-tracker">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text">Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stageStatuses.map((stage) => {
          const isActive = stage.stageNumber === activeStage;
          
          return (
            <div 
              key={stage.stageNumber} 
              className={`flex items-center space-x-3 transition-all ${
                isActive ? 'scale-105' : ''
              }`}
              data-testid={`progress-stage-${stage.stageNumber}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                stage.status === 'completed' 
                  ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                  : stage.status === 'in_progress'
                  ? 'bg-vc-accent shadow-lg shadow-vc-accent/50'
                  : 'bg-vc-border'
              }`}>
                {stage.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-white" data-testid={`checkmark-stage-${stage.stageNumber}`} />
                ) : stage.status === 'in_progress' ? (
                  <Clock className="h-4 w-4 text-vc-dark animate-pulse" />
                ) : (
                  <Lock className="h-3 w-3 text-vc-text-muted" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium transition-colors ${
                  stage.status === 'pending' ? 'text-vc-text-muted' : 'text-vc-text'
                } ${isActive ? 'font-semibold' : ''}`}>
                  {stage.stageName}
                </p>
                <p className={`text-xs transition-colors ${
                  stage.status === 'completed' ? 'text-green-400' :
                  stage.status === 'in_progress' ? 'text-vc-accent' :
                  'text-vc-text-muted'
                }`}>
                  {stage.status === 'completed' ? '✓ Completed' : 
                   stage.status === 'in_progress' ? 'In Progress' : 
                   'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
