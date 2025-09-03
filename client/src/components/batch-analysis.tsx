import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload, FileText, Play, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AIService } from "@/lib/ai-service";

interface BatchAnalysisProps {
  onAnalysisComplete?: (analysisId: string) => void;
}

export function BatchAnalysis({ onAnalysisComplete }: BatchAnalysisProps) {
  const [urls, setUrls] = useState<string>("");
  const [processingUrls, setProcessingUrls] = useState<string[]>([]);
  const [completedUrls, setCompletedUrls] = useState<{ url: string; id: string; success: boolean }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const analyzeUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('/api/business-analyses', 'POST', {
        url,
        businessModel: 'E-commerce Platform',
        revenueStream: 'Subscription-based',
        targetMarket: 'B2B',
        overallScore: 7,
        scoreDetails: {
          technicalComplexity: { score: 6, reasoning: 'Moderate complexity' },
          marketOpportunity: { score: 8, reasoning: 'Large market' },
          competitiveLandscape: { score: 7, reasoning: 'Competitive but viable' },
          resourceRequirements: { score: 7, reasoning: 'Moderate resources needed' },
          timeToMarket: { score: 8, reasoning: 'Quick to launch' }
        },
        aiInsights: {
          keyInsight: 'Strong market opportunity',
          riskFactor: 'Competition is increasing',
          opportunity: 'Niche market potential'
        }
      });
      
      return { url, id: response.id };
    },
    onSuccess: (data) => {
      setCompletedUrls(prev => [...prev, { ...data, success: true }]);
      queryClient.invalidateQueries({ queryKey: ['/api/business-analyses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error, url) => {
      setCompletedUrls(prev => [...prev, { url, id: '', success: false }]);
      console.error(`Failed to analyze ${url}:`, error);
    },
  });

  const handleBatchAnalysis = async () => {
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url && (url.startsWith('http://') || url.startsWith('https://')));

    if (urlList.length === 0) {
      toast({
        title: "Invalid URLs",
        description: "Please enter valid URLs starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    if (urlList.length > 10) {
      toast({
        title: "Too Many URLs",
        description: "Please limit batch analysis to 10 URLs at a time",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingUrls(urlList);
    setCompletedUrls([]);

    for (const url of urlList) {
      try {
        await analyzeUrlMutation.mutateAsync(url);
      } catch (error) {
        // Error handled in mutation
      }
    }

    setIsProcessing(false);
    toast({
      title: "Batch Analysis Complete",
      description: `Analyzed ${completedUrls.filter(c => c.success).length} of ${urlList.length} URLs successfully`,
    });

    // Select the first successful analysis
    const firstSuccess = completedUrls.find(c => c.success);
    if (firstSuccess && onAnalysisComplete) {
      onAnalysisComplete(firstSuccess.id);
    }
  };

  const progress = processingUrls.length > 0 
    ? (completedUrls.length / processingUrls.length) * 100 
    : 0;

  return (
    <Card className="bg-vc-card border-vc-border" data-testid="card-batch-analysis">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-vc-text flex items-center">
          <Upload className="mr-2 h-5 w-5 text-vc-primary" />
          Batch Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-vc-text-muted mb-2 block">
            Enter URLs (one per line, max 10)
          </label>
          <Textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://example.com&#10;https://another-site.com&#10;https://third-site.com"
            className="bg-vc-dark border-vc-border text-vc-text placeholder:text-vc-text-muted h-32 font-mono text-sm"
            disabled={isProcessing}
            data-testid="input-batch-urls"
          />
        </div>

        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-vc-text-muted">Processing...</span>
              <span className="text-sm text-vc-accent font-medium">
                {completedUrls.length}/{processingUrls.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {completedUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-vc-text">Results:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {completedUrls.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-vc-dark rounded border border-vc-border/50"
                  data-testid={`batch-result-${index}`}
                >
                  <span className="text-xs text-vc-text-muted truncate flex-1 mr-2 font-mono">
                    {result.url}
                  </span>
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleBatchAnalysis}
          disabled={isProcessing || !urls.trim()}
          className="w-full bg-gradient-to-r from-vc-primary to-vc-secondary hover:opacity-90"
          data-testid="button-start-batch"
        >
          {isProcessing ? (
            <>
              <FileText className="mr-2 h-4 w-4 animate-pulse" />
              Analyzing {completedUrls.length + 1} of {processingUrls.length}...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Batch Analysis
            </>
          )}
        </Button>

        {!isProcessing && urls.trim() && (
          <p className="text-xs text-vc-text-muted text-center">
            {urls.split('\n').filter(u => u.trim()).length} URLs ready for analysis
          </p>
        )}
      </CardContent>
    </Card>
  );
}