export interface AIProvider {
  id: string;
  userId: string;
  provider: 'openai' | 'gemini' | 'grok' | 'gpt5';
  apiKey: string;
  isActive: boolean;
  createdAt: Date;
}

export interface BusinessAnalysis {
  id: string;
  userId: string;
  url: string;
  businessModel?: string;
  revenueStream?: string;
  targetMarket?: string;
  overallScore?: number;
  scoreDetails?: ScoreDetails;
  aiInsights?: AIInsights;
  currentStage: number;
  stageData?: any;
  structured?: import('@shared/schema').StructuredAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScoreDetails {
  technicalComplexity: { score: number; reasoning: string };
  marketOpportunity: { score: number; reasoning: string };
  competitiveLandscape: { score: number; reasoning: string };
  resourceRequirements: { score: number; reasoning: string };
  timeToMarket: { score: number; reasoning: string };
}

export interface AIInsights {
  keyInsight: string;
  riskFactor: string;
  opportunity: string;
}

export interface WorkflowStage {
  id: string;
  analysisId: string;
  stageNumber: number;
  stageName: string;
  status: 'pending' | 'in_progress' | 'completed';
  data?: any;
  aiGeneratedContent?: any;
  completedAt?: Date;
  createdAt: Date;
}

export interface QuickStats {
  totalAnalyses: number;
  strongCandidates: number;
  inProgress: number;
  aiQueries: number;
}

export interface SearchResult {
  businesses: Array<{
    name: string;
    url: string;
    description: string;
    businessModel: string;
    estimatedScore: number;
  }>;
}
// Re-export types from shared schema
export type {
  User,
  AiProvider,
  BusinessAnalysis,
  WorkflowStage,
  InsertUser,
  InsertAiProvider,
  InsertBusinessAnalysis,
  InsertWorkflowStage
} from '@shared/schema';

// Additional frontend-specific types
export interface BusinessAnalysisResult {
  url: string;
  businessModel: string;
  revenueStream: string;
  targetMarket: string;
  overallScore: number;
  scoreDetails: {
    technicalComplexity: { score: number; reasoning: string };
    marketOpportunity: { score: number; reasoning: string };
    competitiveLandscape: { score: number; reasoning: string };
    resourceRequirements: { score: number; reasoning: string };
    timeToMarket: { score: number; reasoning: string };
  };
  aiInsights: {
    keyInsight: string;
    riskFactor: string;
    opportunity: string;
  };
}

export interface SearchResult {
  businesses: Array<{
    name: string;
    url: string;
    description: string;
    businessModel: string;
    estimatedScore: number;
  }>;
}

export interface StageData {
  [key: string]: any;
}

export interface AnalysisStats {
  totalAnalyses: number;
  strongCandidates: number;
  inProgress: number;
  aiQueries: number;
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

// Export component types
export * from './components';

// Export minimal API types
export * from './minimal-api';