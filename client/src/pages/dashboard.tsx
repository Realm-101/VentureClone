import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Flame, Settings, User, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIProviderModal } from "@/components/ai-provider-modal";
import { URLAnalysisInput } from "@/components/url-analysis-input";
import { WorkflowTabs } from "@/components/workflow-tabs";
import { AIInsightsPanel } from "@/components/ai-insights-panel";
import { ProgressTracker } from "@/components/progress-tracker";
import { RecentAnalyses } from "@/components/recent-analyses";
import { QuickStats } from "@/components/quick-stats";
import { BusinessComparison } from "@/components/business-comparison";
import { AIService } from "@/lib/ai-service";
import type { BusinessAnalysis } from "@/types";

export default function Dashboard() {
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<BusinessAnalysis | null>(null);

  const { data: activeProvider } = useQuery({
    queryKey: ['/api/ai-providers/active'],
    queryFn: () => AIService.getActiveProvider(),
  });

  const { data: analyses } = useQuery({
    queryKey: ['/api/business-analyses'],
    queryFn: async () => {
      const response = await fetch('/api/business-analyses');
      return response.json();
    },
  });

  const handleAnalysisSelect = (analysis: BusinessAnalysis) => {
    setSelectedAnalysis(analysis);
  };

  return (
    <div className="min-h-screen bg-vc-dark text-vc-text font-inter">
      {/* Header */}
      <header className="bg-vc-card border-b border-vc-border" data-testid="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3" data-testid="brand">
              <div className="w-10 h-10 bg-gradient-to-r from-vc-primary to-vc-secondary rounded-lg flex items-center justify-center">
                <Flame className="text-vc-text text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-vc-text">VentureClone AI</h1>
                <p className="text-xs text-vc-text-muted">Systematic Business Cloning Platform</p>
              </div>
            </div>

            {/* AI Provider Selection */}
            <div className="flex items-center space-x-4">
              <Link href="/analytics">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 bg-vc-card border-vc-border hover:border-vc-primary transition-colors"
                  data-testid="button-analytics"
                >
                  <BarChart3 className="h-4 w-4 text-vc-primary" />
                  <span className="text-sm text-vc-text">Analytics</span>
                </Button>
              </Link>

              <div className="relative">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 bg-vc-card border-vc-border hover:border-vc-primary transition-colors"
                  onClick={() => setShowAIModal(true)}
                  data-testid="button-ai-provider"
                >
                  <span className="text-vc-accent">🤖</span>
                  <span className="text-sm text-vc-text">
                    {activeProvider ? `${activeProvider.provider.toUpperCase()}` : 'No AI Provider'}
                  </span>
                  <span className="text-xs">▼</span>
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="border-vc-border hover:border-vc-accent transition-colors"
                onClick={() => setShowAIModal(true)}
                data-testid="button-settings"
              >
                <Settings className="h-4 w-4 text-vc-text-muted" />
              </Button>

              <div className="w-8 h-8 bg-gradient-to-r from-vc-accent to-vc-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-vc-dark" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <URLAnalysisInput onAnalysisComplete={handleAnalysisSelect} />
            
            {selectedAnalysis && (
              <WorkflowTabs analysis={selectedAnalysis} />
            )}

            <RecentAnalyses 
              analyses={analyses || []} 
              onAnalysisSelect={handleAnalysisSelect}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {selectedAnalysis && (
              <AIInsightsPanel analysis={selectedAnalysis} />
            )}
            
            {selectedAnalysis && (
              <ProgressTracker analysis={selectedAnalysis} />
            )}
            
            <BusinessComparison analyses={analyses || []} />
            
            <QuickStats />
          </div>
        </div>
      </div>

      {/* AI Provider Configuration Modal */}
      <AIProviderModal 
        isOpen={showAIModal} 
        onClose={() => setShowAIModal(false)}
      />
    </div>
  );
}
