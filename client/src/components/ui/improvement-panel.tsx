import React, { useState } from 'react';
import { Copy, Lightbulb, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BusinessImprovement } from '@shared/schema';

interface ImprovementPanelProps {
  improvement: BusinessImprovement;
  className?: string;
}

/**
 * Utility function to copy the 7-day plan to clipboard
 * Formats the plan as markdown for easy sharing
 */
function copyPlanToClipboard(improvement: BusinessImprovement): string {
  let planText = `# 7-Day Business Improvement Plan\n\n`;
  
  // Add business twists
  planText += `## Business Improvement Angles\n\n`;
  improvement.twists.forEach((twist, index) => {
    planText += `${index + 1}. ${twist}\n`;
  });
  
  planText += `\n## Daily Action Plan\n\n`;
  
  // Add daily tasks
  improvement.sevenDayPlan.forEach(dayPlan => {
    planText += `### Day ${dayPlan.day}\n\n`;
    dayPlan.tasks.forEach(task => {
      planText += `- [ ] ${task}\n`;
    });
    planText += `\n`;
  });
  
  planText += `\n*Generated on ${new Date(improvement.generatedAt).toLocaleDateString()}*\n`;
  
  return planText;
}

/**
 * ImprovementPanel Component
 * Displays business improvement suggestions with 3 twists and a 7-day plan
 * Includes copy functionality for the complete plan
 */
export function ImprovementPanel({ improvement, className = '' }: ImprovementPanelProps) {
  const [isCopying, setIsCopying] = useState(false);

  /**
   * Handle copying the plan to clipboard
   * Uses the browser's clipboard API with user feedback
   */
  const handleCopyPlan = async () => {
    try {
      setIsCopying(true);
      const planText = copyPlanToClipboard(improvement);
      await navigator.clipboard.writeText(planText);
      
      // Brief visual feedback
      setTimeout(() => setIsCopying(false), 1000);
    } catch (error) {
      console.error('Failed to copy plan:', error);
      setIsCopying(false);
      // TODO: Add toast notification for error feedback
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Business Improvement Suggestions
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyPlan}
            disabled={isCopying}
            className="flex items-center gap-2"
          >
            {isCopying ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {isCopying ? 'Copied!' : 'Copy Plan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Improvement Angles */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Three Ways to Improve This Business
          </h4>
          <div className="space-y-3">
            {improvement.twists.map((twist, index) => (
              <div key={index} className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5 min-w-fit">
                  {index + 1}
                </Badge>
                <p className="text-sm leading-relaxed">{twist}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Plan */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            7-Day Shipping Plan
          </h4>
          <div className="space-y-4">
            {improvement.sevenDayPlan.map((dayPlan) => (
              <div key={dayPlan.day} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="font-medium">
                    Day {dayPlan.day}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {dayPlan.tasks.length} task{dayPlan.tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="space-y-1">
                  {dayPlan.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1.5 text-xs">•</span>
                      <span className="leading-relaxed">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Generation timestamp */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Generated on {new Date(improvement.generatedAt).toLocaleDateString()} at{' '}
          {new Date(improvement.generatedAt).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}

export default ImprovementPanel;