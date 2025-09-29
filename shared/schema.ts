import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Structured Analysis Schema for enhanced business analysis output
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

export type StructuredAnalysis = z.infer<typeof structuredAnalysisSchema>;

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
