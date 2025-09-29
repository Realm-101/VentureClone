import type { Request, Response } from "express";
import { minimalStorage } from "../minimal-storage";

export interface HealthResponse {
  ok: boolean;
  storage: 'mem' | 'db';
  providers: {
    openai: boolean;
    gemini: boolean;
  };
}

export function healthzHandler(req: Request, res: Response): void {
  // Detect storage mode by checking the constructor name of the storage instance
  const storageMode = minimalStorage.constructor.name === 'MemStorage' ? 'mem' : 'db';
  
  // Check AI provider configuration by testing for API keys
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };

  const healthResponse: HealthResponse = {
    ok: true,
    storage: storageMode,
    providers,
  };

  res.json(healthResponse);
}