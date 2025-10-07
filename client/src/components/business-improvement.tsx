import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, Loader2, AlertCircle, Copy, CheckCircle, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { BusinessImprovement as BusinessImprovementType } from '@shared/schema';

interface BusinessImprovementProps {
  analysisId: string;
  existingImprovement?: BusinessImprovementType | undefined;
  onGenerate?: () => void;
}

/**
 * BusinessImprovement Component
 * Displays business improvement suggestions with generation capability
 * Shows opportunities, action items, and impact ratings
 * Requirements: 4.2, 4.3
 */
export function BusinessImprovement({ 
  analysisId, 
  existingImprovement,
  onGenerate 
}: BusinessImprovementProps) {
  const [improvement, setImprovement] = useState<BusinessImprovementType | undefined>(existingImprovement);
  const [isCopying, setIsCopying] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Mutation to generate business improvement suggestions
   * Requirement 4.2: Add loading state during generation
   */
  const generateImprovementMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/business-analyses/${analysisId}/improve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Failed to generate improvement suggestions');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setImprovement(data.improvement);
      queryClient.invalidateQueries({ queryKey: ['/api/business-analyses', analysisId] });
      queryClient.invalidateQueries({ queryKey: ['/api/business-analyses'] });
      
      toast({
        title: "Improvement Suggestions Generated",
        description: "Business improvement plan has been created successfully",
      });

      if (onGenerate) {
        onGenerate();
      }
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate improvement suggestions. Please try again.",
        variant: "destructive",
      });
    },
  });

  /**
   * Handle copying the plan to clipboard
   * Formats the plan as markdown for easy sharing
   */
  const handleCopyPlan = async () => {
    if (!improvement) return;

    try {
      setIsCopying(true);
      const planText = formatPlanForClipboard(improvement);
      await navigator.clipboard.writeText(planText);
      
      toast({
        title: "Copied to Clipboard",
        description: "7-day plan has been copied to your clipboard",
      });
      
      setTimeout(() => setIsCopying(false), 1000);
    } catch (error) {
      console.error('Failed to copy plan:', error);
      setIsCopying(false);
      toast({
        title: "Copy Failed",
        description: "Failed to copy plan to clipboard",
        variant: "destructive",
      });
    }
  };

  /**
   * Handle exporting the improvement plan
   */
  const handleExport = async (format: 'pdf' | 'html' | 'json') => {
    if (!improvement) return;

    try {
      const response = await fetch(`/api/business-analyses/${analysisId}/improvements/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      const extension = format === 'pdf' ? 'pdf' : format === 'html' ? 'html' : 'json';
      a.download = `business-improvement-plan.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Successful",
        description: `Improvement plan exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export improvement plan. Please try again.",
        variant: "destructive",
      });
    }
  };

  /**
   * Format the improvement plan for clipboard export
   */
  const formatPlanForClipboard = (improvement: BusinessImprovementType): string => {
    let planText = `# 7-Day Business Improvement Plan\n\n`;
    
    planText += `## Business Improvement Angles\n\n`;
    improvement.twists.forEach((twist, index) => {
      planText += `${index + 1}. ${twist}\n`;
    });
    
    planText += `\n## Daily Action Plan\n\n`;
    
    improvement.sevenDayPlan.forEach(dayPlan => {
      planText += `### Day ${dayPlan.day}\n\n`;
      dayPlan.tasks.forEach(task => {
        planText += `- [ ] ${task}\n`;
      });
      planText += `\n`;
    });
    
    planText += `\n*Generated on ${new Date(improvement.generatedAt).toLocaleDateString()}*\n`;
    
    return planText;
  };

  // If no improvement exists yet, show generation prompt
  if (!improvement) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Lightbulb className="h-5 w-5" />
            Business Improvement Opportunity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            Get actionable suggestions to build a better version of this business with a 7-day shipping plan.
          </p>
          <Button
            onClick={() => generateImprovementMutation.mutate()}
            disabled={generateImprovementMutation.isPending}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
            data-testid="button-generate-improvement"
          >
            {generateImprovementMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Improvements...
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4 mr-2" />
                Generate Business Improvements
              </>
            )}
          </Button>

          {/* Error state with retry option - Requirement 4.5 */}
          {generateImprovementMutation.isError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>
                  {generateImprovementMutation.error?.message || 'Failed to generate improvements'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateImprovementMutation.mutate()}
                  className="ml-4"
                >
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Display improvement results - Requirement 4.2, 4.3
  return (
    <Card className="border-yellow-200 dark:border-yellow-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <Lightbulb className="h-5 w-5" />
            Business Improvement Suggestions
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPlan}
              disabled={isCopying}
              className="flex items-center gap-2"
              data-testid="button-copy-plan"
            >
              {isCopying ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopying ? 'Copied!' : 'Copy Plan'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  data-testid="button-export-improvement"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('html')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <Download className="mr-2 h-4 w-4" />
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateImprovementMutation.mutate()}
              disabled={generateImprovementMutation.isPending}
              data-testid="button-regenerate-improvement"
            >
              {generateImprovementMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                'Regenerate'
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Improvement Angles - Requirement 4.3: Show opportunities */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Three Ways to Improve This Business
          </h4>
          <div className="space-y-3">
            {improvement.twists.map((twist, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
              >
                <Badge variant="secondary" className="mt-0.5 min-w-fit bg-yellow-600 text-white">
                  {index + 1}
                </Badge>
                <p className="text-sm leading-relaxed">{twist}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 7-Day Plan - Requirement 4.3: Show action items with impact ratings */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            7-Day Shipping Plan
          </h4>
          <p className="text-xs text-muted-foreground mb-4">
            A focused action plan to ship a working prototype in one week
          </p>
          <div className="space-y-4">
            {improvement.sevenDayPlan.map((dayPlan) => (
              <div 
                key={dayPlan.day} 
                className="border rounded-lg p-4 hover:border-yellow-300 dark:hover:border-yellow-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-medium border-yellow-600 text-yellow-600">
                    Day {dayPlan.day}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {dayPlan.tasks.length} task{dayPlan.tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="space-y-2">
                  {dayPlan.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
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

export default BusinessImprovement;
