import type { Request, Response } from "express";
import { minimalStorage } from "../minimal-storage";

export interface HealthResponse {
  ok: boolean;
  env: string;
  storage: 'mem' | 'db';
  providers: {
    openai: boolean;
    gemini: boolean;
  };
  commit?: string;
  version?: string;
}

export function healthzHandler(req: Request, res: Response): void {
  // Detect storage mode by checking the constructor name of the storage instance
  const storageMode = minimalStorage.constructor.name === 'MemStorage' ? 'mem' : 'db';
  
  // Check AI provider configuration by testing for API keys
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };

  // Get environment information
  const env = process.env.NODE_ENV || 'development';

  // Get build/commit information if available
  const commit = process.env.COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.RAILWAY_GIT_COMMIT_SHA;
  const version = process.env.npm_package_version;

  const healthResponse: HealthResponse = {
    ok: true,
    env,
    storage: storageMode,
    providers,
  };

  // Add optional fields only if they exist
  if (commit) {
    healthResponse.commit = commit;
  }
  
  if (version) {
    healthResponse.version = version;
  }

  res.json(healthResponse);
}