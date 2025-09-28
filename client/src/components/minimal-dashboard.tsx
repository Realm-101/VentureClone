import React, { useState } from 'react';
import { Loader2, ExternalLink, AlertCircle, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAnalyses, useAnalyzeUrl, useApiErrorHandling } from '@/hooks/use-minimal-api';
import type { AnalysisRecord } from '@/types/minimal-api';

/**
 * URL Input Form Component
 * Handles URL input, validation, and submission for analysis
 */
interface UrlInputFormProps {
  onAnalysisStart?: () => void;
  onAnalysisComplete?: (analysis: AnalysisRecord) => void;
}

function UrlInputForm({ onAnalysisStart, onAnalysisComplete }: UrlInputFormProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const analyzeUrlMutation = useAnalyzeUrl();
  const { getErrorMessage, isValidationError, isApiKeyError } = useApiErrorHandling();

  const validateUrl = (urlString: string): boolean => {
    if (!urlString.trim()) {
      setValidationError('URL is required');
      return false;
    }

    try {
      new URL(urlString);
      setValidationError(null);
      return true;
    } catch {
      setValidationError('Please enter a valid URL (e.g., https://example.com)');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) {
      return;
    }

    onAnalysisStart?.();
    
    try {
      const result = await analyzeUrlMutation.mutateAsync(url);
      setUrl(''); // Clear input on success
      setValidationError(null);
      onAnalysisComplete?.(result);
    } catch (error) {
      // Error is handled by the mutation's onError callback
      // and displayed in the error display below
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Clear validation error when user starts typing
    if (validationError && newUrl.trim()) {
      setValidationError(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-primary" />
          Analyze Business URL
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={handleUrlChange}
              disabled={analyzeUrlMutation.isPending}
              className={validationError ? 'border-destructive' : ''}
            />
            {validationError && (
              <p className="text-sm text-destructive">{validationError}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={analyzeUrlMutation.isPending || !url.trim()}
            className="w-full"
          >
            {analyzeUrlMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Business'
            )}
          </Button>

          {analyzeUrlMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {isApiKeyError(analyzeUrlMutation.error) 
                  ? 'AI service is not configured. Please check your API keys.'
                  : getErrorMessage(analyzeUrlMutation.error)
                }
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Analysis List Item Component
 * Displays individual analysis with metadata and summary
 */
interface AnalysisListItemProps {
  analysis: AnalysisRecord;
}

function AnalysisListItem({ analysis }: AnalysisListItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUrlClick = () => {
    window.open(analysis.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with URL and metadata */}
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={handleUrlClick}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
            >
              <span className="font-medium truncate max-w-md">{analysis.url}</span>
              <ExternalLink className="h-4 w-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <div className="text-xs text-muted-foreground flex-shrink-0">
              {formatDate(analysis.createdAt)}
            </div>
          </div>

          {/* Model info */}
          <div className="text-xs text-muted-foreground">
            Analyzed with {analysis.model}
          </div>

          {/* Summary */}
          <div className="text-sm leading-relaxed">
            {analysis.summary}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Analysis List Component
 * Displays chronological list of analyses with empty state
 */
interface AnalysisListProps {
  analyses: AnalysisRecord[];
  isLoading: boolean;
  error: unknown;
}

function AnalysisList({ analyses, isLoading, error }: AnalysisListProps) {
  const { getErrorMessage } = useApiErrorHandling();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load analyses: {getErrorMessage(error)}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading analyses...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">No analyses yet</p>
            <p className="text-sm text-muted-foreground">
              Enter a URL above to get started with your first business analysis
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Analyses ({analyses.length})</h2>
      <div className="space-y-3">
        {analyses.map((analysis) => (
          <AnalysisListItem key={analysis.id} analysis={analysis} />
        ))}
      </div>
    </div>
  );
}

/**
 * Main Minimal Dashboard Component
 * Combines URL input form and analysis list in a streamlined interface
 */
export function MinimalDashboard() {
  const { data: analyses = [], isLoading, error } = useAnalyses();

  return (
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">VentureClone AI</h1>
              <p className="text-sm text-muted-foreground">Business Analysis Tool</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* URL Input Form */}
        <UrlInputForm />

        {/* Analysis List */}
        <AnalysisList 
          analyses={analyses} 
          isLoading={isLoading} 
          error={error} 
        />
      </main>
    </div>
  );
}

export default MinimalDashboard;