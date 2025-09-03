import { CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessAnalysis } from "@/types";

interface ProgressTrackerProps {
  analysis: BusinessAnalysis;
}

const STAGES = [
  { number: 1, name: 'Discovery & Selection' },
  { number: 2, name: 'Lazy-Entrepreneur Filter' },
  { number: 3, name: 'MVP Launch Planning' },
  { number: 4, name: 'Demand Testing' },
  { number: 5, name: 'Scaling & Growth' },
  { number: 6, name: 'AI Automation' },
];

export function ProgressTracker({ analysis }: ProgressTrackerProps) {
  const currentStage = analysis.currentStage || 1;

  const getStageStatus = (stageNumber: number) => {
    if (stageNumber < currentStage) return 'completed';
    if (stageNumber === currentStage) return 'current';
    return 'pending';
  };

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-progress-tracker">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text">Progress Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {STAGES.map((stage) => {
          const status = getStageStatus(stage.number);
          
          return (
            <div key={stage.number} className="flex items-center space-x-3" data-testid={`progress-stage-${stage.number}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'completed' 
                  ? 'bg-vc-primary' 
                  : status === 'current'
                  ? 'bg-vc-accent'
                  : 'bg-vc-border'
              }`}>
                {status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-white" />
                ) : (
                  <span className={`text-xs font-semibold ${
                    status === 'current' ? 'text-vc-dark' : 'text-vc-text-muted'
                  }`}>
                    {stage.number}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  status === 'pending' ? 'text-vc-text-muted' : 'text-vc-text'
                }`}>
                  {stage.name}
                </p>
                <p className="text-xs text-vc-text-muted">
                  {status === 'completed' ? 'Completed' : 
                   status === 'current' ? 'In Progress' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
