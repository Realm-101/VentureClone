import React, { useState } from 'react';
import { useAnalyses, useAnalyzeUrl, useApiErrorHandling } from '../hooks/use-minimal-api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, ExternalLink, Calendar, Cpu } from 'lucide-react';

/**
 * Example component demonstrating the minimal API integration
 * This shows how to use the API client hooks for fetching analyses and submitting URLs
 */
export function MinimalApiExample() {
  const [url, setUrl] = useState('');
  
  // Hooks for API operations
  const { data: analyses, isLoading: isLoadingAnalyses, error: analysesError } = useAnalyses();
  const { mutate: analyzeUrl, isPending: isAnalyzing, error: analyzeError } = useAnalyzeUrl();
  const { getErrorMessage, isNetworkError, isValidationError, isApiKeyError } = useApiErrorHandling();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      analyzeUrl(url.trim(), {
        onSuccess: () => {
          setUrl(''); // Clear input on success
        },
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getErrorVariant = (error: unknown) => {
    if (isNetworkError(error)) return 'destructive';
    if (isValidationError(error)) return 'default';
    if (isApiKeyError(error)) return 'destructive';
    return 'destructive';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Business Analysis Tool</h1>
        <p className="text-muted-foreground mt-2">
          Analyze any business URL with AI-powered insights
        </p>
      </div>

      {/* URL Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze a Business</CardTitle>
          <CardDescription>
            Enter a URL to get AI-powered business analysis including value proposition, target audience, and monetization strategy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button type="submit" disabled={isAnalyzing || !url.trim()}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze'
              )}
            </Button>
          </form>

          {/* Analysis Error */}
          {analyzeError && (
            <Alert variant={getErrorVariant(analyzeError)} className="mt-4">
              <AlertDescription>
                {getErrorMessage(analyzeError)}
                {isNetworkError(analyzeError) && (
                  <div className="mt-2 text-sm">
                    Please check your internet connection and try again.
                  </div>
                )}
                {isApiKeyError(analyzeError) && (
                  <div className="mt-2 text-sm">
                    Please configure your AI provider API keys in the server environment.
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Analyses</CardTitle>
          <CardDescription>
            View all your previous business analyses in chronological order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {isLoadingAnalyses && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading analyses...
            </div>
          )}

          {/* Error State */}
          {analysesError && (
            <Alert variant={getErrorVariant(analysesError)}>
              <AlertDescription>
                {getErrorMessage(analysesError)}
              </AlertDescription>
            </Alert>
          )}

          {/* Empty State */}
          {analyses && analyses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No analyses yet. Submit a URL above to get started!</p>
            </div>
          )}

          {/* Analyses List */}
          {analyses && analyses.length > 0 && (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {formatDate(analysis.createdAt)}
                        <Cpu className="w-4 h-4 ml-2" />
                        {analysis.model}
                      </div>
                      <a
                        href={analysis.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Site
                      </a>
                    </div>
                    
                    <div className="mb-2">
                      <p className="font-medium text-sm text-muted-foreground mb-1">URL:</p>
                      <p className="text-sm break-all">{analysis.url}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-sm text-muted-foreground mb-1">Analysis:</p>
                      <p className="text-sm leading-relaxed">{analysis.summary}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}