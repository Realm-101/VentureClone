import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { StructuredReport } from '@/components/StructuredReport';
import { ImprovementPanel } from '@/components/ui/improvement-panel';
import type { BusinessAnalysis } from '@/types';
import type { EnhancedAnalysisRecord } from '@shared/schema';

interface EnhancedAnalysisDisplayProps {
  analysis: BusinessAnalysis;
  className?: string;
}

/**
 * EnhancedAnalysisDisplay Component
 * Displays structured analysis with optional business improvement suggestions
 * Integrates with existing analysis dashboard and provides "Improve this" functionality
 */
export function EnhancedAnalysisDisplay({ analysis, className = '' }: EnhancedAnalysisDisplayProps) {
  const [showImprovement, setShowImprovement] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cast to enhanced analysis record to access improvements
  const enhancedAnalysis = analysis as EnhancedAnalysisRecord;

  /**
   * Mutation to generate business improvement suggestions
   * Calls the /api/business-analyses/:id/improve endpoint
   */
  const generateImprovementMutation = useMutation({
    mutationFn: async (analysisId: string) => {
      const response = await fetch(`/api/business-analyses/${analysisId}/improve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate improvement suggestions');
      }

      return response.json();
    },
    onSuccess: (improvement) => {
      // Update the analysis with improvement data
      queryClient.setQueryData(['/api/business-analyses'], (oldData: BusinessAnalysis[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(a => 
          a.id === analysis.id 
            ? { ...a, improvements: improvement } as EnhancedAnalysisRecord
            : a
        );
      });

      setShowImprovement(true);
      toast({
        title: "Improvement Suggestions Generated",
        description: "Business improvement plan has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate improvement suggestions",
        variant: "destructive",
      });
    },
  });

  /**
   * Handle generating improvement suggestions
   * Shows existing improvements or generates new ones
   */
  const handleImproveThis = () => {
    if (enhancedAnalysis.improvements) {
      // If improvements already exist, just show them
      setShowImprovement(true);
    } else {
      // Generate new improvements
      generateImprovementMutation.mutate(analysis.id);
    }
  };

  /**
   * Handle hiding improvement panel
   */
  const handleHideImprovement = () => {
    setShowImprovement(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Structured Analysis Report */}
      {analysis.structured && (
        <StructuredReport 
          data={analysis.structured} 
          url={analysis.url} 
        />
      )}

      {/* Improvement Action Card */}
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
          <div className="flex gap-3">
            <Button
              onClick={handleImproveThis}
              disabled={generateImprovementMutation.isPending}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {generateImprovementMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  {enhancedAnalysis.improvements ? 'Show Improvements' : 'Improve This Business'}
                </>
              )}
            </Button>
            {showImprovement && enhancedAnalysis.improvements && (
              <Button
                variant="outline"
                onClick={handleHideImprovement}
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-950/20"
              >
                Hide Improvements
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Improvement Panel */}
      {showImprovement && enhancedAnalysis.improvements && (
        <ImprovementPanel 
          improvement={enhancedAnalysis.improvements}
          className="animate-in slide-in-from-bottom-4 duration-300"
        />
      )}
    </div>
  );
}

export default EnhancedAnalysisDisplay;