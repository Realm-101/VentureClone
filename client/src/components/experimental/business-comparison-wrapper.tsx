import React from "react";
import { ExperimentalWrapper } from "@/components/experimental-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";

// Lazy load the heavy business comparison component
const BusinessComparison = React.lazy(() => 
  import("@/components/business-comparison").then(module => ({ 
    default: module.BusinessComparison 
  }))
);

interface BusinessComparisonWrapperProps {
  analyses: any[];
}

/**
 * Wrapper for BusinessComparison that only loads when experimental features are enabled
 */
export function BusinessComparisonWrapper({ analyses }: BusinessComparisonWrapperProps) {
  // Ensure analyses is always an array
  const safeAnalyses = Array.isArray(analyses) ? analyses : [];
  
  const fallback = (
    <Card className="bg-vc-card border-vc-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text">Business Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-vc-text-muted">Comparison features are disabled</p>
          <p className="text-vc-text-muted text-sm mt-1">
            Enable experimental features to compare multiple businesses
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const loadingFallback = (
    <Card className="bg-vc-card border-vc-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text">Business Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <div className="text-vc-text-muted">Loading comparison...</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ExperimentalWrapper fallback={fallback} loadingFallback={loadingFallback}>
      <BusinessComparison analyses={safeAnalyses} />
    </ExperimentalWrapper>
  );
}