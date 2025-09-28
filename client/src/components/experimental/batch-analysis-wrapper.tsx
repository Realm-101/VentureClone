import React from "react";
import { ExperimentalWrapper } from "@/components/experimental-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";

// Lazy load the heavy batch analysis component
const BatchAnalysis = React.lazy(() => 
  import("@/components/batch-analysis").then(module => ({ 
    default: module.BatchAnalysis 
  }))
);

interface BatchAnalysisWrapperProps {
  onAnalysisComplete?: (analysisId: string) => void;
}

/**
 * Wrapper for BatchAnalysis that only loads when experimental features are enabled
 */
export function BatchAnalysisWrapper({ onAnalysisComplete }: BatchAnalysisWrapperProps) {
  const fallback = (
    <Card className="bg-vc-card border-vc-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
          <Upload className="mr-2 h-5 w-5 text-vc-primary" />
          Batch Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-vc-text-muted">Batch analysis is disabled</p>
          <p className="text-vc-text-muted text-sm mt-1">
            Enable experimental features to analyze multiple URLs at once
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const loadingFallback = (
    <Card className="bg-vc-card border-vc-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
          <Upload className="mr-2 h-5 w-5 text-vc-primary" />
          Batch Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-vc-text-muted">Loading batch analysis...</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ExperimentalWrapper fallback={fallback} loadingFallback={loadingFallback}>
      <BatchAnalysis onAnalysisComplete={onAnalysisComplete} />
    </ExperimentalWrapper>
  );
}