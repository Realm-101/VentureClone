import React from "react";
import { ExperimentalWrapper } from "@/components/experimental-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

// Lazy load the heavy analytics charts component
const AnalyticsCharts = React.lazy(() => 
  import("@/components/analytics-charts").then(module => ({ 
    default: module.AnalyticsCharts 
  }))
);

interface AnalyticsChartsWrapperProps {
  analyses: any[];
}

/**
 * Wrapper for AnalyticsCharts that only loads when experimental features are enabled
 */
export function AnalyticsChartsWrapper({ analyses }: AnalyticsChartsWrapperProps) {
  const fallback = (
    <Card className="bg-vc-card border-vc-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-vc-primary" />
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-vc-text-muted">Analytics features are disabled</p>
          <p className="text-vc-text-muted text-sm mt-1">
            Enable experimental features to access advanced analytics
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const loadingFallback = (
    <Card className="bg-vc-card border-vc-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-vc-primary" />
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="text-vc-text-muted">Loading analytics...</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ExperimentalWrapper fallback={fallback} loadingFallback={loadingFallback}>
      <AnalyticsCharts analyses={analyses} />
    </ExperimentalWrapper>
  );
}