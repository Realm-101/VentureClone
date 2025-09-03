
import { ReactNode } from 'react';
import type { BusinessAnalysis, AIProvider, WorkflowStage, ScoreDetails, AIInsights } from './index';

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// AI Assistant Props
export interface AIAssistantProps extends BaseComponentProps {
  onMessageSent?: (message: string) => void;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

// AI Insights Panel Props
export interface AIInsightsPanelProps extends BaseComponentProps {
  analysis: BusinessAnalysis;
  onInsightRequest?: (type: string) => void;
}

// AI Provider Modal Props
export interface AIProviderModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderAdded?: (provider: AIProvider) => void;
  currentProvider?: AIProvider | null;
}

// Analytics Charts Props
export interface AnalyticsChartsProps extends BaseComponentProps {
  data: BusinessAnalysis[];
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange?: (range: string) => void;
}

// Batch Analysis Props
export interface BatchAnalysisProps extends BaseComponentProps {
  onBatchSubmit: (urls: string[]) => void;
  isProcessing?: boolean;
  maxUrls?: number;
}

// Business Comparison Props
export interface BusinessComparisonProps extends BaseComponentProps {
  businesses: BusinessAnalysis[];
  onComparisonUpdate?: (selectedIds: string[]) => void;
  maxComparisons?: number;
}

// Export Analysis Props
export interface ExportAnalysisProps extends BaseComponentProps {
  analysis: BusinessAnalysis | BusinessAnalysis[];
  formats?: ('pdf' | 'csv' | 'json')[];
  onExportComplete?: (format: string, success: boolean) => void;
}

// Progress Tracker Props
export interface ProgressTrackerProps extends BaseComponentProps {
  analysis: BusinessAnalysis;
  stages?: WorkflowStage[];
  onStageClick?: (stageNumber: number) => void;
}

// Quick Stats Props
export interface QuickStatsProps extends BaseComponentProps {
  stats: {
    totalAnalyses: number;
    strongCandidates: number;
    inProgress: number;
    aiQueries: number;
  };
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Recent Analyses Props
export interface RecentAnalysesProps extends BaseComponentProps {
  analyses: BusinessAnalysis[];
  limit?: number;
  onAnalysisClick?: (analysis: BusinessAnalysis) => void;
  onViewAll?: () => void;
}

// Search Filter Props
export interface SearchFilterProps extends BaseComponentProps {
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  totalResults?: number;
}

export interface FilterOptions {
  search?: string;
  businessModel?: string;
  scoreRange?: [number, number];
  dateRange?: {
    from: Date;
    to: Date;
  };
  status?: 'pending' | 'in_progress' | 'completed';
  sortBy?: 'score' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// URL Analysis Input Props
export interface UrlAnalysisInputProps extends BaseComponentProps {
  onSubmit: (url: string) => void;
  isAnalyzing?: boolean;
  placeholder?: string;
  validateUrl?: boolean;
}

// Workflow Tabs Props
export interface WorkflowTabsProps extends BaseComponentProps {
  analysis: BusinessAnalysis;
  activeStage?: number;
  onStageChange?: (stage: number) => void;
  onStageComplete?: (stage: number, data: any) => void;
}

// Score Display Props
export interface ScoreDisplayProps extends BaseComponentProps {
  score: number;
  maxScore?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'circular' | 'bar';
}

// Score Details Props
export interface ScoreDetailsProps extends BaseComponentProps {
  scoreDetails: ScoreDetails;
  expandable?: boolean;
  onScoreClick?: (category: keyof ScoreDetails) => void;
}

// AI Insights Display Props
export interface AIInsightsDisplayProps extends BaseComponentProps {
  insights: AIInsights;
  expandable?: boolean;
  onInsightExpand?: (type: keyof AIInsights) => void;
}

// Analysis Card Props
export interface AnalysisCardProps extends BaseComponentProps {
  analysis: BusinessAnalysis;
  onEdit?: (analysis: BusinessAnalysis) => void;
  onDelete?: (analysisId: string) => void;
  onView?: (analysis: BusinessAnalysis) => void;
  showActions?: boolean;
  compact?: boolean;
}

// Loading State Props
export interface LoadingStateProps extends BaseComponentProps {
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Error State Props
export interface ErrorStateProps extends BaseComponentProps {
  error: string | Error;
  onRetry?: () => void;
  showRetry?: boolean;
}

// Empty State Props
export interface EmptyStateProps extends BaseComponentProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}
