// Minimal API types for the streamlined venture analysis feature

export interface AnalysisRecord {
  id: string;
  userId: string;
  url: string;
  summary: string;
  model: string;
  createdAt: string;
}

export interface CreateAnalysisInput {
  url: string;
}

export interface AnalysisResponse extends AnalysisRecord {}

export interface AnalysisListResponse extends Array<AnalysisRecord> {}

export interface ApiError {
  error: string;
  status?: number;
  details?: any;
}

export interface AnalyzeUrlRequest {
  url: string;
}

export interface AnalyzeUrlResponse extends AnalysisRecord {}