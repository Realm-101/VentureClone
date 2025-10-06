import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Source attribution schema for evidence-based analysis
export const zSource = z.object({
  url: z.string().url(),
  excerpt: z.string().min(10).max(300)
});

export type Source = z.infer<typeof zSource>;

// First-party data interface for website content extraction
export interface FirstPartyData {
  title: string;
  description: string;
  h1: string;
  textSnippet: string;
  url: string;
}

// Business improvement interface for actionable suggestions
export interface BusinessImprovement {
  twists: string[];
  sevenDayPlan: {
    day: number;
    tasks: string[];
  }[];
  generatedAt: string;
}

// Original structured analysis schema (maintained for backward compatibility)
export const structuredAnalysisSchema = z.object({
  overview: z.object({
    valueProposition: z.string(),
    targetAudience: z.string(),
    monetization: z.string(),
  }),
  market: z.object({
    competitors: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
      notes: z.string().optional(),
    })),
    swot: z.object({
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunities: z.array(z.string()),
      threats: z.array(z.string()),
    }),
  }),
  technical: z.object({
    techStack: z.array(z.string()).optional(),
    uiColors: z.array(z.string()).optional(),
    keyPages: z.array(z.string()).optional(),
  }).optional(),
  data: z.object({
    trafficEstimates: z.object({
      value: z.string(),
      source: z.string().optional(),
    }).optional(),
    keyMetrics: z.array(z.object({
      name: z.string(),
      value: z.string(),
      source: z.string().optional(),
    })).optional(),
  }).optional(),
  synthesis: z.object({
    summary: z.string(),
    keyInsights: z.array(z.string()),
    nextActions: z.array(z.string()),
  }),
});

// Enhanced structured analysis schema with confidence scoring and source attribution
export const enhancedStructuredAnalysisSchema = z.object({
  overview: z.object({
    valueProposition: z.string(),
    targetAudience: z.string(),
    monetization: z.string(),
  }),
  market: z.object({
    competitors: z.array(z.object({
      name: z.string(),
      url: z.string().optional(),
      notes: z.string().optional(),
    })),
    swot: z.object({
      strengths: z.array(z.string()),
      weaknesses: z.array(z.string()),
      opportunities: z.array(z.string()),
      threats: z.array(z.string()),
    }),
  }),
  // Enhanced technical section with confidence scoring
  technical: z.object({
    techStack: z.array(z.string()).optional(),
    confidence: z.number().min(0).max(1).optional(),
    uiColors: z.array(z.string()).optional(),
    keyPages: z.array(z.string()).optional(),
  }).optional(),
  // Enhanced data section with source attribution
  data: z.object({
    trafficEstimates: z.object({
      value: z.string(),
      source: z.string().url().optional(),
    }).optional(),
    keyMetrics: z.array(z.object({
      name: z.string(),
      value: z.string(),
      source: z.string().url().optional(),
      asOf: z.string().optional()
    })).optional(),
  }).optional(),
  synthesis: z.object({
    summary: z.string(),
    keyInsights: z.array(z.string()),
    nextActions: z.array(z.string()),
  }),
  // New sources section for evidence attribution
  sources: z.array(zSource).default([])
});

export type StructuredAnalysis = z.infer<typeof structuredAnalysisSchema>;
export type EnhancedStructuredAnalysis = z.infer<typeof enhancedStructuredAnalysisSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const aiProviders = pgTable("ai_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  provider: text("provider").notNull(), // 'openai', 'gemini', 'grok'
  apiKey: text("api_key").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const businessAnalyses = pgTable("business_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  url: text("url").notNull(),
  businessModel: text("business_model"),
  revenueStream: text("revenue_stream"),
  targetMarket: text("target_market"),
  overallScore: integer("overall_score"),
  scoreDetails: jsonb("score_details"),
  aiInsights: jsonb("ai_insights"),
  currentStage: integer("current_stage").default(1),
  stageData: jsonb("stage_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowStages = pgTable("workflow_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").notNull(),
  stageNumber: integer("stage_number").notNull(),
  stageName: text("stage_name").notNull(),
  status: text("status").default("pending"), // 'pending', 'in_progress', 'completed'
  data: jsonb("data"),
  aiGeneratedContent: jsonb("ai_generated_content"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAiProviderSchema = createInsertSchema(aiProviders).pick({
  userId: true,
  provider: true,
  apiKey: true,
  isActive: true,
});

export const insertBusinessAnalysisSchema: any = createInsertSchema(businessAnalyses).pick({
  userId: true,
  url: true,
  businessModel: true,
  revenueStream: true,
  targetMarket: true,
  overallScore: true,
  scoreDetails: true,
  aiInsights: true,
  currentStage: true,
  stageData: true,
});

export const insertWorkflowStageSchema: any = createInsertSchema(workflowStages).pick({
  analysisId: true,
  stageNumber: true,
  stageName: true,
  status: true,
  data: true,
  aiGeneratedContent: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AiProvider = typeof aiProviders.$inferSelect;
export type InsertAiProvider = z.infer<typeof insertAiProviderSchema>;
export type BusinessAnalysis = typeof businessAnalyses.$inferSelect;
export type InsertBusinessAnalysis = z.infer<typeof insertBusinessAnalysisSchema>;
export type WorkflowStage = typeof workflowStages.$inferSelect;
export type InsertWorkflowStage = z.infer<typeof insertWorkflowStageSchema>;

// Enhanced analysis record interface that extends the base BusinessAnalysis
export interface EnhancedAnalysisRecord extends BusinessAnalysis {
  structured?: EnhancedStructuredAnalysis;
  firstPartyData?: FirstPartyData;
  improvements?: BusinessImprovement;
}

// Analysis record interface for backward compatibility
export interface AnalysisRecord extends BusinessAnalysis {
  structured?: StructuredAnalysis;
}

// Stage 2: Lazy-Entrepreneur Filter schema
export const stage2ContentSchema = z.object({
  effortScore: z.number().min(1).max(10),
  rewardScore: z.number().min(1).max(10),
  recommendation: z.enum(['go', 'no-go', 'maybe']),
  reasoning: z.string(),
  automationPotential: z.object({
    score: z.number().min(0).max(1),
    opportunities: z.array(z.string()),
  }),
  resourceRequirements: z.object({
    time: z.string(),
    money: z.string(),
    skills: z.array(z.string()),
  }),
  nextSteps: z.array(z.string()),
});

export type Stage2Content = z.infer<typeof stage2ContentSchema>;

// Stage 3: MVP Launch Planning schema
export const stage3ContentSchema = z.object({
  coreFeatures: z.array(z.string()).min(3).max(5),
  niceToHaves: z.array(z.string()).min(3).max(5),
  techStack: z.object({
    frontend: z.array(z.string()).min(1),
    backend: z.array(z.string()).min(1),
    infrastructure: z.array(z.string()).min(1),
  }),
  timeline: z.array(z.object({
    phase: z.string(),
    duration: z.string(),
    deliverables: z.array(z.string()).min(3),
  })).min(3).max(4),
  estimatedCost: z.string(),
});

export type Stage3Content = z.infer<typeof stage3ContentSchema>;

// Stage 4: Demand Testing Strategy schema
export const stage4ContentSchema = z.object({
  testingMethods: z.array(z.object({
    method: z.string(),
    description: z.string(),
    cost: z.string(),
    timeline: z.string(),
  })).min(3).max(5),
  successMetrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    measurement: z.string(),
  })).min(3).max(5),
  budget: z.object({
    total: z.string(),
    breakdown: z.array(z.object({
      item: z.string(),
      cost: z.string(),
    })),
  }),
  timeline: z.string(),
});

export type Stage4Content = z.infer<typeof stage4ContentSchema>;

// Stage 5: Scaling & Growth schema
export const stage5ContentSchema = z.object({
  growthChannels: z.array(z.object({
    channel: z.string(),
    strategy: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).min(3).max(5),
  milestones: z.array(z.object({
    milestone: z.string(),
    timeline: z.string(),
    metrics: z.array(z.string()).min(3),
  })).min(3).max(4),
  resourceScaling: z.array(z.object({
    phase: z.string(),
    team: z.array(z.string()),
    infrastructure: z.string(),
  })).min(3).max(3),
});

export type Stage5Content = z.infer<typeof stage5ContentSchema>;

// Stage 6: AI Automation Mapping schema
export const stage6ContentSchema = z.object({
  automationOpportunities: z.array(z.object({
    process: z.string(),
    tool: z.string(),
    roi: z.string(),
    priority: z.number().min(1).max(10),
  })).min(4).max(6),
  implementationPlan: z.array(z.object({
    phase: z.string(),
    automations: z.array(z.string()).min(3),
    timeline: z.string(),
  })).min(3).max(3),
  estimatedSavings: z.string(),
});

export type Stage6Content = z.infer<typeof stage6ContentSchema>;
