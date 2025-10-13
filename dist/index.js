var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiProviders: () => aiProviders,
  businessAnalyses: () => businessAnalyses,
  enhancedStructuredAnalysisSchema: () => enhancedStructuredAnalysisSchema,
  insertAiProviderSchema: () => insertAiProviderSchema,
  insertBusinessAnalysisSchema: () => insertBusinessAnalysisSchema,
  insertUserSchema: () => insertUserSchema,
  insertWorkflowStageSchema: () => insertWorkflowStageSchema,
  stage2ContentSchema: () => stage2ContentSchema,
  stage3ContentSchema: () => stage3ContentSchema,
  stage4ContentSchema: () => stage4ContentSchema,
  stage5ContentSchema: () => stage5ContentSchema,
  stage6ContentSchema: () => stage6ContentSchema,
  structuredAnalysisSchema: () => structuredAnalysisSchema,
  users: () => users,
  workflowStages: () => workflowStages,
  zSource: () => zSource
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var zSource, structuredAnalysisSchema, enhancedStructuredAnalysisSchema, users, aiProviders, businessAnalyses, workflowStages, insertUserSchema, insertAiProviderSchema, insertBusinessAnalysisSchema, insertWorkflowStageSchema, stage2ContentSchema, stage3ContentSchema, stage4ContentSchema, stage5ContentSchema, stage6ContentSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    zSource = z.object({
      url: z.string().url(),
      excerpt: z.string().min(10).max(300)
    });
    structuredAnalysisSchema = z.object({
      overview: z.object({
        valueProposition: z.string(),
        targetAudience: z.string(),
        monetization: z.string()
      }),
      market: z.object({
        competitors: z.array(z.object({
          name: z.string(),
          url: z.string().optional(),
          notes: z.string().optional()
        })),
        swot: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string())
        })
      }),
      technical: z.object({
        techStack: z.array(z.string()).optional(),
        uiColors: z.array(z.string()).optional(),
        keyPages: z.array(z.string()).optional(),
        // Tech detection fields (for backward compatibility)
        actualDetected: z.object({
          technologies: z.array(z.object({
            name: z.string(),
            categories: z.array(z.string()),
            confidence: z.number(),
            version: z.string().optional(),
            website: z.string().optional(),
            icon: z.string().optional()
          })),
          contentType: z.string(),
          detectedAt: z.string()
        }).optional(),
        complexityScore: z.number().min(1).max(10).optional(),
        complexityFactors: z.object({
          customCode: z.boolean(),
          frameworkComplexity: z.enum(["low", "medium", "high"]),
          infrastructureComplexity: z.enum(["low", "medium", "high"])
        }).optional(),
        detectedTechStack: z.array(z.string()).optional(),
        detectionAttempted: z.boolean().optional(),
        detectionFailed: z.boolean().optional()
      }).optional(),
      data: z.object({
        trafficEstimates: z.object({
          value: z.string(),
          source: z.string().optional()
        }).optional(),
        keyMetrics: z.array(z.object({
          name: z.string(),
          value: z.string(),
          source: z.string().optional()
        })).optional()
      }).optional(),
      synthesis: z.object({
        summary: z.string(),
        keyInsights: z.array(z.string()),
        nextActions: z.array(z.string())
      })
    });
    enhancedStructuredAnalysisSchema = z.object({
      overview: z.object({
        valueProposition: z.string(),
        targetAudience: z.string(),
        monetization: z.string()
      }),
      market: z.object({
        competitors: z.array(z.object({
          name: z.string(),
          url: z.string().optional(),
          notes: z.string().optional()
        })),
        swot: z.object({
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          opportunities: z.array(z.string()),
          threats: z.array(z.string())
        })
      }),
      // Enhanced technical section with confidence scoring and tech detection
      technical: z.object({
        techStack: z.array(z.string()).optional(),
        confidence: z.number().min(0).max(1).optional(),
        uiColors: z.array(z.string()).optional(),
        keyPages: z.array(z.string()).optional(),
        // Wappalyzer detection results
        actualDetected: z.object({
          technologies: z.array(z.object({
            name: z.string(),
            categories: z.array(z.string()),
            confidence: z.number(),
            version: z.string().optional(),
            website: z.string().optional(),
            icon: z.string().optional()
          })),
          contentType: z.string(),
          detectedAt: z.string()
        }).optional(),
        // Complexity analysis
        complexityScore: z.number().min(1).max(10).optional(),
        complexityFactors: z.object({
          customCode: z.boolean(),
          frameworkComplexity: z.enum(["low", "medium", "high"]),
          infrastructureComplexity: z.enum(["low", "medium", "high"])
        }).optional(),
        // Merged tech stack (AI + Wappalyzer)
        detectedTechStack: z.array(z.string()).optional(),
        // Detection status flags
        detectionAttempted: z.boolean().optional(),
        detectionFailed: z.boolean().optional()
      }).optional(),
      // Enhanced data section with source attribution
      data: z.object({
        trafficEstimates: z.object({
          value: z.string(),
          source: z.string().url().optional()
        }).optional(),
        keyMetrics: z.array(z.object({
          name: z.string(),
          value: z.string(),
          source: z.string().url().optional(),
          asOf: z.string().optional()
        })).optional()
      }).optional(),
      synthesis: z.object({
        summary: z.string(),
        keyInsights: z.array(z.string()),
        nextActions: z.array(z.string())
      }),
      // New sources section for evidence attribution
      sources: z.array(zSource).default([])
    });
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      username: text("username").notNull().unique(),
      password: text("password").notNull()
    });
    aiProviders = pgTable("ai_providers", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull(),
      provider: text("provider").notNull(),
      // 'openai', 'gemini', 'grok'
      apiKey: text("api_key").notNull(),
      isActive: boolean("is_active").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    businessAnalyses = pgTable("business_analyses", {
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
      // Technology insights fields
      technologyInsights: jsonb("technology_insights"),
      clonabilityScore: jsonb("clonability_score"),
      enhancedComplexity: jsonb("enhanced_complexity"),
      insightsGeneratedAt: timestamp("insights_generated_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    workflowStages = pgTable("workflow_stages", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      analysisId: varchar("analysis_id").notNull(),
      stageNumber: integer("stage_number").notNull(),
      stageName: text("stage_name").notNull(),
      status: text("status").default("pending"),
      // 'pending', 'in_progress', 'completed'
      data: jsonb("data"),
      aiGeneratedContent: jsonb("ai_generated_content"),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertUserSchema = createInsertSchema(users).pick({
      username: true,
      password: true
    });
    insertAiProviderSchema = createInsertSchema(aiProviders).pick({
      userId: true,
      provider: true,
      apiKey: true,
      isActive: true
    });
    insertBusinessAnalysisSchema = createInsertSchema(businessAnalyses).pick({
      userId: true,
      url: true,
      businessModel: true,
      revenueStream: true,
      targetMarket: true,
      overallScore: true,
      scoreDetails: true,
      aiInsights: true,
      currentStage: true,
      stageData: true
    });
    insertWorkflowStageSchema = createInsertSchema(workflowStages).pick({
      analysisId: true,
      stageNumber: true,
      stageName: true,
      status: true,
      data: true,
      aiGeneratedContent: true
    });
    stage2ContentSchema = z.object({
      effortScore: z.number().min(1).max(10),
      rewardScore: z.number().min(1).max(10),
      recommendation: z.enum(["go", "no-go", "maybe"]),
      reasoning: z.string(),
      automationPotential: z.object({
        score: z.number().min(0).max(1),
        opportunities: z.array(z.string())
      }),
      resourceRequirements: z.object({
        time: z.string(),
        money: z.string(),
        skills: z.array(z.string())
      }),
      nextSteps: z.array(z.string())
    });
    stage3ContentSchema = z.object({
      coreFeatures: z.array(z.string()).min(3).max(5),
      niceToHaves: z.array(z.string()).min(3).max(5),
      techStack: z.object({
        frontend: z.array(z.string()).min(1),
        backend: z.array(z.string()).min(1),
        infrastructure: z.array(z.string()).min(1)
      }),
      timeline: z.array(z.object({
        phase: z.string(),
        duration: z.string(),
        deliverables: z.array(z.string()).min(3)
      })).min(3).max(4),
      estimatedCost: z.string()
    });
    stage4ContentSchema = z.object({
      testingMethods: z.array(z.object({
        method: z.string(),
        description: z.string(),
        cost: z.string(),
        timeline: z.string()
      })).min(3).max(5),
      successMetrics: z.array(z.object({
        metric: z.string(),
        target: z.string(),
        measurement: z.string()
      })).min(3).max(5),
      budget: z.object({
        total: z.string(),
        breakdown: z.array(z.object({
          item: z.string(),
          cost: z.string()
        }))
      }),
      timeline: z.string()
    });
    stage5ContentSchema = z.object({
      growthChannels: z.array(z.object({
        channel: z.string(),
        strategy: z.string(),
        priority: z.enum(["high", "medium", "low"])
      })).min(3).max(5),
      milestones: z.array(z.object({
        milestone: z.string(),
        timeline: z.string(),
        metrics: z.array(z.string()).min(3)
      })).min(3).max(4),
      resourceScaling: z.array(z.object({
        phase: z.string(),
        team: z.array(z.string()),
        infrastructure: z.string()
      })).min(3).max(3)
    });
    stage6ContentSchema = z.object({
      automationOpportunities: z.array(z.object({
        process: z.string(),
        tool: z.string(),
        roi: z.string(),
        priority: z.number().min(1).max(10)
      })).min(4).max(6),
      implementationPlan: z.array(z.object({
        phase: z.string(),
        automations: z.array(z.string()).min(3),
        timeline: z.string()
      })).min(3).max(3),
      estimatedSavings: z.string()
    });
  }
});

// server/services/workflow.ts
var workflow_exports = {};
__export(workflow_exports, {
  STAGE_NAMES: () => STAGE_NAMES,
  VALID_STAGES: () => VALID_STAGES,
  WorkflowService: () => WorkflowService
});
var STAGE_NAMES, VALID_STAGES, WorkflowService;
var init_workflow = __esm({
  "server/services/workflow.ts"() {
    "use strict";
    STAGE_NAMES = {
      1: "Discovery & Selection",
      2: "Lazy-Entrepreneur Filter",
      3: "MVP Launch Planning",
      4: "Demand Testing Strategy",
      5: "Scaling & Growth",
      6: "AI Automation Mapping"
    };
    VALID_STAGES = [1, 2, 3, 4, 5, 6];
    WorkflowService = class {
      constructor(storage) {
        this.storage = storage;
      }
      /**
       * Validates if a user can progress to a specific stage
       * Requirements: 6.1, 6.2, 6.3, 7.4, 7.6
       * 
       * Rules:
       * - Stage 1 is auto-completed after analysis
       * - Must complete Stage N before accessing Stage N+1
       * - Can regenerate any completed stage
       * - Can view any completed stage without validation errors
       */
      async validateStageProgression(userId, analysisId, targetStage, isRegenerate = false) {
        if (!VALID_STAGES.includes(targetStage)) {
          return {
            valid: false,
            reason: `Invalid stage number: ${targetStage}. Must be between 1 and 6.`
          };
        }
        const analysis = await this.storage.getAnalysis(userId, analysisId);
        if (!analysis) {
          return {
            valid: false,
            reason: "Analysis not found"
          };
        }
        if (targetStage === 1) {
          return { valid: true };
        }
        const stages = this.getStagesFromAnalysis(analysis);
        const completedStages = this.getCompletedStages(stages);
        if (completedStages.includes(targetStage)) {
          return { valid: true };
        }
        const previousStage = targetStage - 1;
        if (!completedStages.includes(previousStage)) {
          return {
            valid: false,
            reason: `Stage ${previousStage} (${STAGE_NAMES[previousStage]}) must be completed before accessing Stage ${targetStage}`
          };
        }
        return { valid: true };
      }
      /**
       * Gets the current stage number for an analysis
       * Returns the highest completed stage + 1, or 1 if no stages completed
       */
      getCurrentStage(stages) {
        if (!stages) {
          return 1;
        }
        const completedStages = this.getCompletedStages(stages);
        if (completedStages.length === 0) {
          return 1;
        }
        const maxCompleted = Math.max(...completedStages);
        return Math.min(maxCompleted + 1, 6);
      }
      /**
       * Gets list of completed stage numbers
       */
      getCompletedStages(stages) {
        if (!stages) {
          return [];
        }
        return Object.values(stages).filter((stage) => stage.status === "completed").map((stage) => stage.stageNumber).sort((a, b) => a - b);
      }
      /**
       * Extracts stages data from analysis record
       * Handles both new format (stages object) and legacy format
       */
      getStagesFromAnalysis(analysis) {
        if (analysis.stages && typeof analysis.stages === "object") {
          return analysis.stages;
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const createdAt = analysis.createdAt || now;
        const stages = {
          1: {
            stageNumber: 1,
            stageName: STAGE_NAMES[1] || "Discovery & Selection",
            status: "completed",
            content: {
              analysis: analysis.structured || {},
              summary: analysis.summary,
              url: analysis.url
            },
            generatedAt: createdAt,
            completedAt: createdAt
          }
        };
        return stages;
      }
      /**
       * Checks if a stage can be regenerated
       * Any completed stage can be regenerated without affecting other stages
       */
      canRegenerateStage(stages, stageNumber) {
        if (!stages) {
          return false;
        }
        const stage = stages[stageNumber];
        return stage?.status === "completed";
      }
      /**
       * Gets the next available stage for an analysis
       * Returns null if all stages are completed
       */
      getNextStage(stages) {
        const currentStage = this.getCurrentStage(stages);
        return currentStage <= 6 ? currentStage : null;
      }
      /**
       * Checks if all stages are completed
       */
      isWorkflowComplete(stages) {
        const completedStages = this.getCompletedStages(stages);
        return completedStages.length === 6 && completedStages.includes(6);
      }
      /**
       * Gets stage progress summary
       */
      getProgressSummary(stages) {
        const completedStages = this.getCompletedStages(stages);
        const currentStage = this.getCurrentStage(stages);
        const nextStage = this.getNextStage(stages);
        const isComplete = this.isWorkflowComplete(stages);
        return {
          currentStage,
          completedStages,
          totalStages: 6,
          isComplete,
          nextStage
        };
      }
      /**
       * Validates stage data structure
       * Ensures required fields are present
       */
      validateStageData(stageNumber, content) {
        const errors = [];
        if (!content || typeof content !== "object") {
          errors.push("Stage content must be an object");
          return { valid: false, errors };
        }
        if (Object.keys(content).length === 0) {
          errors.push("Stage content cannot be empty");
        }
        if (errors.length > 0) {
          return { valid: false, errors };
        }
        return { valid: true };
      }
      /**
       * Creates a new stage data object
       */
      createStageData(stageNumber, content, status = "completed") {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const stageName = STAGE_NAMES[stageNumber];
        if (!stageName) {
          throw new Error(`Invalid stage number: ${stageNumber}`);
        }
        const stageData = {
          stageNumber,
          stageName,
          status,
          content,
          generatedAt: now
        };
        if (status === "completed") {
          stageData.completedAt = now;
        }
        return stageData;
      }
      /**
       * Gets the AI prompt for Stage 2 (Lazy-Entrepreneur Filter)
       * Requirements: 1.1, 1.2, 1.3
       * 
       * Analyzes effort vs. reward and automation potential
       * REFINED: Added clearer scoring criteria and more specific examples
       */
      getStage2Prompt(analysis) {
        const businessName = analysis.businessModel || analysis.url;
        const valueProposition = analysis.structured?.overview?.valueProposition || "Unknown";
        const monetization = analysis.structured?.overview?.monetization || "Unknown";
        const techStack = analysis.structured?.technical?.techStack?.join(", ") || "Unknown";
        const targetAudience = analysis.structured?.overview?.targetAudience || "Unknown";
        const systemPrompt = `You are a business efficiency analyst specializing in effort-reward analysis and automation potential assessment. 

CRITICAL INSTRUCTIONS:
- Provide realistic, evidence-based evaluations without hedging language
- Use definitive statements based on the business context provided
- Focus on actionable insights that help entrepreneurs make go/no-go decisions
- Consider modern tools and AI capabilities when assessing automation potential
- Base all estimates on the specific business model, not generic assumptions`;
        const prompt = `Analyze this business opportunity for effort vs. reward and automation potential.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Tech Stack: ${techStack}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

Provide a "Lazy-Entrepreneur Filter" analysis in this exact JSON format:

{
  "effortScore": 5,
  "rewardScore": 7,
  "recommendation": "go",
  "reasoning": "Clear explanation of why this is or isn't worth pursuing based on effort/reward ratio",
  "automationPotential": {
    "score": 0.75,
    "opportunities": [
      "Specific automation opportunity 1",
      "Specific automation opportunity 2",
      "Specific automation opportunity 3"
    ]
  },
  "resourceRequirements": {
    "time": "Specific time estimate (e.g., '2-4 weeks to MVP' for simple, '2-3 months' for moderate, '4-6 months' for complex)",
    "money": "Specific budget estimate (e.g., '$500-$2,000' for simple, '$3,000-$8,000' for moderate, '$10,000-$25,000' for complex)",
    "skills": ["Required skill 1", "Required skill 2", "Required skill 3"]
  },
  "nextSteps": [
    "Specific actionable step 1",
    "Specific actionable step 2",
    "Specific actionable step 3"
  ]
}

SCORING GUIDELINES:
- effortScore: 1-10 (1 = minimal effort, 10 = maximum effort)
  * 1-3: Simple landing page, no-code tools, minimal custom development
  * 4-6: Standard web app with common features, moderate complexity
  * 7-9: Complex platform with custom features, significant development
  * 10: Highly technical, requires specialized skills, long development cycle
  
- rewardScore: 1-10 (1 = minimal reward, 10 = maximum reward)
  * 1-3: Niche market, limited revenue potential, low scalability
  * 4-6: Moderate market size, decent revenue potential, some scalability
  * 7-9: Large market, strong revenue potential, highly scalable
  * 10: Massive market opportunity, exceptional revenue potential, unlimited scale
  
- recommendation: "go" | "no-go" | "maybe"
  * "go": High reward, low-to-medium effort (reward > effort by 2+ points) - Worth pursuing
  * "no-go": Low reward or extremely high effort (effort > reward) - Not recommended
  * "maybe": Balanced or uncertain (within 1 point difference) - Requires more validation
  
- automationPotential.score: 0-1 (0 = no automation, 1 = fully automatable)
  * 0.0-0.3: Requires significant manual work, limited automation opportunities
  * 0.4-0.6: Moderate automation possible with AI tools and APIs
  * 0.7-0.9: Highly automatable with modern AI and no-code platforms
  * 1.0: Fully automatable, minimal human intervention needed

REQUIREMENTS:
- Be specific and actionable in all recommendations
- Base estimates on the actual business model and tech stack provided
- Identify concrete automation opportunities using modern tools (ChatGPT API, Zapier, Make, n8n, etc.)
- Provide realistic, LEAN resource requirements - assume modern tools and frameworks reduce costs significantly
- Make a clear go/no-go recommendation with solid reasoning (minimum 100 words)
- Each automation opportunity should name specific tools or services
- Resource requirements should reflect MODERN development practices (AI tools, no-code platforms, open-source libraries)
- Time estimates should assume focused, part-time work (10-20 hours/week) for solo entrepreneurs
- Budget estimates should be CONSERVATIVE and account for free/low-cost tools available today
- Next steps should be immediately actionable (not vague suggestions)

EXAMPLE AUTOMATION OPPORTUNITIES:
- "Use ChatGPT API for customer support chatbot (saves 20-30 hours/week)"
- "Implement Stripe for payment processing (no custom payment code needed)"
- "Use Zapier to automate email marketing workflows (reduces manual work by 80%)"

Respond ONLY with valid JSON.`;
        return { prompt, systemPrompt };
      }
      /**
       * Gets the AI prompt for Stage 3 (MVP Launch Planning)
       * Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4, 6.5
       * 
       * Identifies MVP features, tech stack, and timeline
       * ENHANCED: Integrated technology insights, complexity breakdown, alternatives, and clonability score
       */
      getStage3Prompt(analysis) {
        const businessName = analysis.businessModel || analysis.url;
        const valueProposition = analysis.structured?.overview?.valueProposition || "Unknown";
        const monetization = analysis.structured?.overview?.monetization || "Unknown";
        const targetAudience = analysis.structured?.overview?.targetAudience || "Unknown";
        const keyFeatures = analysis.structured?.technical?.keyFeatures?.join(", ") || "Unknown";
        const detectedTech = analysis.structured?.technical?.actualDetected?.technologies || [];
        const inferredTechStack = analysis.structured?.technical?.techStack || [];
        const complexityScore = analysis.structured?.technical?.complexityScore;
        let techStackInfo = "";
        if (detectedTech.length > 0) {
          const techNames = detectedTech.map(
            (t) => t.version ? `${t.name} ${t.version}` : t.name
          ).join(", ");
          techStackInfo = `Detected Technologies (via Wappalyzer): ${techNames}`;
          if (inferredTechStack.length > 0) {
            techStackInfo += `
AI-Inferred Technologies: ${inferredTechStack.join(", ")}`;
          }
          if (complexityScore) {
            techStackInfo += `
Technical Complexity Score: ${complexityScore}/10`;
          }
        } else if (inferredTechStack.length > 0) {
          techStackInfo = `AI-Inferred Technologies: ${inferredTechStack.join(", ")}`;
        } else {
          techStackInfo = "Unknown";
        }
        const insights = analysis.technologyInsights;
        const enhancedComplexity = analysis.enhancedComplexity;
        const clonabilityScore = analysis.clonabilityScore;
        let complexityBreakdown = "";
        if (enhancedComplexity) {
          complexityBreakdown = `
COMPLEXITY BREAKDOWN:
- Overall Complexity: ${enhancedComplexity.score}/10
- Frontend Complexity: ${enhancedComplexity.breakdown.frontend.score}/${enhancedComplexity.breakdown.frontend.max} (Technologies: ${enhancedComplexity.breakdown.frontend.technologies.join(", ") || "None"})
- Backend Complexity: ${enhancedComplexity.breakdown.backend.score}/${enhancedComplexity.breakdown.backend.max} (Technologies: ${enhancedComplexity.breakdown.backend.technologies.join(", ") || "None"})
- Infrastructure Complexity: ${enhancedComplexity.breakdown.infrastructure.score}/${enhancedComplexity.breakdown.infrastructure.max} (Technologies: ${enhancedComplexity.breakdown.infrastructure.technologies.join(", ") || "None"})
- Contributing Factors:
  * Custom Code Required: ${enhancedComplexity.factors.customCode ? "Yes" : "No"}
  * Framework Complexity: ${enhancedComplexity.factors.frameworkComplexity}
  * Infrastructure Complexity: ${enhancedComplexity.factors.infrastructureComplexity}
  * Technology Count: ${enhancedComplexity.factors.technologyCount}
  * Licensing Complexity: ${enhancedComplexity.factors.licensingComplexity ? "Yes" : "No"}
- Explanation: ${enhancedComplexity.explanation}`;
        }
        let alternativesInfo = "";
        if (insights?.alternatives && Object.keys(insights.alternatives).length > 0) {
          alternativesInfo = "\nRECOMMENDED ALTERNATIVES FOR MVP:";
          for (const [tech, alts] of Object.entries(insights.alternatives)) {
            if (Array.isArray(alts) && alts.length > 0) {
              alternativesInfo += `
- Instead of ${tech}, consider: ${alts.join(", ")}`;
            }
          }
        }
        let buildVsBuyInfo = "";
        if (insights?.buildVsBuy && insights.buildVsBuy.length > 0) {
          buildVsBuyInfo = "\n\nBUILD VS BUY RECOMMENDATIONS:";
          insights.buildVsBuy.forEach((rec) => {
            buildVsBuyInfo += `
- ${rec.technology}: ${rec.recommendation.toUpperCase()}`;
            buildVsBuyInfo += `
  Reasoning: ${rec.reasoning}`;
            if (rec.alternatives && rec.alternatives.length > 0) {
              buildVsBuyInfo += `
  Alternatives: ${rec.alternatives.join(", ")}`;
            }
            if (rec.estimatedCost) {
              buildVsBuyInfo += `
  Cost Comparison: Build (${rec.estimatedCost.build}) vs Buy (${rec.estimatedCost.buy})`;
            }
          });
        }
        let effortEstimates = "";
        if (insights?.estimates) {
          effortEstimates = `
ESTIMATED EFFORT:
- Development Time: ${insights.estimates.timeEstimate.minimum} to ${insights.estimates.timeEstimate.maximum} (Realistic: ${insights.estimates.timeEstimate.realistic})
- Development Cost: ${insights.estimates.costEstimate.development}
- Infrastructure Cost: ${insights.estimates.costEstimate.infrastructure}
- Maintenance Cost: ${insights.estimates.costEstimate.maintenance}
- Total Estimated Cost: ${insights.estimates.costEstimate.total}
- Team Size: ${insights.estimates.teamSize.minimum} minimum, ${insights.estimates.teamSize.recommended} recommended`;
        }
        let clonabilityInfo = "";
        if (clonabilityScore) {
          clonabilityInfo = `
CLONABILITY SCORE: ${clonabilityScore.score}/10 (${clonabilityScore.rating.toUpperCase()})
- Technical Complexity Component: ${clonabilityScore.components.technicalComplexity.score}/10 (Weight: ${clonabilityScore.components.technicalComplexity.weight * 100}%)
- Market Opportunity Component: ${clonabilityScore.components.marketOpportunity.score}/10 (Weight: ${clonabilityScore.components.marketOpportunity.weight * 100}%)
- Resource Requirements Component: ${clonabilityScore.components.resourceRequirements.score}/10 (Weight: ${clonabilityScore.components.resourceRequirements.weight * 100}%)
- Time to Market Component: ${clonabilityScore.components.timeToMarket.score}/10 (Weight: ${clonabilityScore.components.timeToMarket.weight * 100}%)
- Recommendation: ${clonabilityScore.recommendation}
- Confidence: ${(clonabilityScore.confidence * 100).toFixed(0)}%`;
        }
        const stage2Data = analysis.stages?.[2]?.content;
        const effortScore = stage2Data?.effortScore || "Unknown";
        const recommendation = stage2Data?.recommendation || "Unknown";
        const automationScore = stage2Data?.automationPotential?.score || "Unknown";
        const systemPrompt = `You are a product strategy expert specializing in MVP development and lean startup methodology.

CRITICAL INSTRUCTIONS:
- Focus on MINIMUM viable product - the smallest version that delivers core value
- Prioritize features that enable monetization and user validation
- Recommend modern, proven technologies that accelerate development
- Provide realistic timelines based on the effort score from Stage 2 and technology insights
- Consider no-code/low-code solutions where appropriate
- Use the technology insights, complexity breakdown, and recommended alternatives to inform your recommendations
- Clearly distinguish between the original tech stack and your recommended MVP stack
- Every recommendation should be specific and actionable`;
        const prompt = `Create an MVP launch plan for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- Key Features: ${keyFeatures}
- URL: ${analysis.url}

ORIGINAL TECHNOLOGY STACK:
${techStackInfo}
${complexityBreakdown}
${alternativesInfo}
${buildVsBuyInfo}
${effortEstimates}
${clonabilityInfo}

IMPORTANT: The above analysis provides detailed insights about the original business's technology stack and complexity. Use this information to:
1. Understand what technologies the original business uses and WHY they might have chosen them
2. Identify opportunities to simplify the stack for an MVP using the recommended alternatives
3. Consider build vs buy recommendations to reduce development time and complexity
4. Base your timeline and cost estimates on the provided effort estimates
5. Take the clonability score into account when making recommendations

When recommending a tech stack for the MVP, clearly distinguish between:
- ORIGINAL STACK: What the business currently uses (and why it works for them)
- RECOMMENDED MVP STACK: Your simplified recommendations for getting to market quickly

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Effort Score: ${effortScore}/10
- Recommendation: ${recommendation}
- Automation Potential: ${automationScore}

Provide an MVP Launch Plan in this exact JSON format:

{
  "originalStackAnalysis": {
    "technologies": ["List of technologies the original business uses"],
    "strengths": ["Why these technologies work for the original business"],
    "complexity": "Assessment of the original stack's complexity for an MVP"
  },
  "coreFeatures": [
    "Essential feature 1 that delivers core value",
    "Essential feature 2 that enables monetization",
    "Essential feature 3 for user experience"
  ],
  "niceToHaves": [
    "Feature that can wait for v2",
    "Enhancement for future iteration",
    "Advanced feature for later"
  ],
  "recommendedMvpStack": {
    "frontend": ["React", "Tailwind CSS"],
    "backend": ["Node.js", "Express"],
    "infrastructure": ["Vercel", "PostgreSQL"],
    "reasoning": "Explanation of why these technologies are recommended for the MVP, referencing the original stack and alternatives"
  },
  "timeline": [
    {
      "phase": "Phase 1: Foundation",
      "duration": "2 weeks",
      "deliverables": [
        "User authentication",
        "Basic UI/UX",
        "Database setup"
      ]
    },
    {
      "phase": "Phase 2: Core Features",
      "duration": "4 weeks",
      "deliverables": [
        "Core feature 1 implementation",
        "Core feature 2 implementation",
        "Payment integration"
      ]
    },
    {
      "phase": "Phase 3: Launch Prep",
      "duration": "2 weeks",
      "deliverables": [
        "Testing and bug fixes",
        "Performance optimization",
        "Launch marketing materials"
      ]
    }
  ],
  "estimatedCost": "$5,000-$10,000 (including hosting, tools, and initial marketing)"
}

REQUIREMENTS:
- Original Stack Analysis: Analyze the original business's technology choices
  * List the key technologies detected from the original business
  * Explain why these technologies work well for the original business
  * Assess whether the original stack is appropriate for an MVP or needs simplification
  * Reference the complexity breakdown and clonability score in your analysis

- Core features: 3-5 features that are ABSOLUTELY ESSENTIAL for the business to function
  * Must enable the core value proposition
  * Must enable monetization (payment, subscription, etc.)
  * Must provide minimum viable user experience
  * Be specific - "User authentication with email/password" not just "Authentication"
  
- Nice-to-haves: 3-5 features that add value but can wait for v2
  * Features that enhance but aren't critical
  * Advanced features that can be added after validation
  * Optimizations that can wait until there's user feedback
  
- Recommended MVP Stack: Recommend modern, proven technologies appropriate for the MVP
  * Frontend: Specific framework (React, Vue, Next.js) + styling solution (Tailwind, CSS-in-JS)
  * Backend: Specific runtime and framework (Node.js + Express, Python + FastAPI, etc.)
  * Infrastructure: Specific hosting (Vercel, Railway, AWS), database (PostgreSQL, MongoDB), and key services
  * Reasoning: Explain your technology choices, referencing:
    - The original stack and why you're keeping or changing technologies
    - The recommended alternatives from the technology insights
    - The build vs buy recommendations (prefer SaaS solutions where suggested)
    - The complexity breakdown (aim to reduce complexity for MVP)
    - The clonability score (higher scores suggest simpler approaches work)
  * **CRITICAL**: Clearly distinguish your MVP recommendations from the original stack
  * If recommending the same technologies as the original, explain why they're still the best choice
  * If recommending different technologies, explain the benefits (faster development, lower cost, simpler maintenance)
  * Consider the automation score - recommend no-code/low-code where appropriate
  * Prioritize technologies that accelerate time to market
  
- Timeline: Break into 3-4 phases with realistic durations
  * Adjust timeline based on effort score: Low effort (1-3) = 1-2 months, Medium (4-6) = 2-4 months, High (7-10) = 4-6 months
  * Each phase should have 3-5 specific, measurable deliverables
  * Phase 1 should focus on foundation (auth, database, basic UI)
  * Phase 2 should implement core features
  * Phase 3 should focus on polish and launch prep
  * Each deliverable should be concrete - "Implement Stripe payment integration" not "Add payments"
  
- Estimated cost: Provide realistic range including all expenses
  * Development tools and services ($50-500/month)
  * Hosting and infrastructure ($20-200/month initially)
  * Initial marketing budget ($500-2000)
  * Third-party integrations and APIs ($100-500/month)
  * Total should be realistic for bootstrapped entrepreneurs
  * Break down by category with specific ranges

GUIDELINES:
- Focus on MINIMUM viable product - what's the smallest version that delivers value?
- Prioritize features that enable monetization and user validation FIRST
- **USE THE TECHNOLOGY INSIGHTS**: The complexity breakdown, alternatives, and build vs buy recommendations are provided to help you make informed decisions
- **DISTINGUISH ORIGINAL VS MVP STACK**: Always analyze the original stack first, then recommend your MVP stack with clear reasoning
- Choose tech stack based on: 1) Speed to market, 2) Developer availability, 3) Cost, 4) Insights from the original business
- Leverage the recommended alternatives - they're specifically chosen to reduce complexity and accelerate development
- Follow build vs buy recommendations - prefer SaaS solutions where suggested to save development time
- Consider the clonability score - higher scores (8-10) suggest the original approach is already simple enough
- Be specific about deliverables - avoid vague descriptions like "Build feature X"
- Consider the effort score from Stage 2 and the estimated effort from technology insights when planning timeline
- If automation score is high (>0.7), strongly recommend no-code/low-code solutions
- Every feature should map to a specific user need or business requirement
- Timeline should be aggressive but achievable - use the provided time estimates as a baseline
- If the original stack is complex (complexity > 7), prioritize simplification in your MVP recommendations
- If the original stack is already simple (complexity < 4), consider keeping similar technologies

Respond ONLY with valid JSON.`;
        return { prompt, systemPrompt };
      }
      /**
       * Gets the AI prompt for Stage 4 (Demand Testing Strategy)
       * Requirements: 3.1, 3.2, 3.3, 3.4
       * 
       * Recommends demand testing strategies and validation methods
       */
      getStage4Prompt(analysis) {
        const businessName = analysis.businessModel || analysis.url;
        const valueProposition = analysis.structured?.overview?.valueProposition || "Unknown";
        const monetization = analysis.structured?.overview?.monetization || "Unknown";
        const targetAudience = analysis.structured?.overview?.targetAudience || "Unknown";
        const stage2Data = analysis.stages?.[2]?.content;
        const effortScore = stage2Data?.effortScore || "Unknown";
        const rewardScore = stage2Data?.rewardScore || "Unknown";
        const stage3Data = analysis.stages?.[3]?.content;
        const coreFeatures = stage3Data?.coreFeatures?.join(", ") || "Unknown";
        const estimatedCost = stage3Data?.estimatedCost || "Unknown";
        const systemPrompt = `You are a lean startup expert specializing in demand validation and market testing. Provide specific, actionable testing strategies that minimize investment while maximizing learning.`;
        const prompt = `Create a demand testing strategy for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Effort Score: ${effortScore}/10
- Reward Score: ${rewardScore}/10

STAGE 3 CONTEXT (MVP Launch Planning):
- Core Features: ${coreFeatures}
- Estimated MVP Cost: ${estimatedCost}

Provide a Demand Testing Strategy in this exact JSON format:

{
  "testingMethods": [
    {
      "method": "Landing Page + Ads",
      "description": "Create a simple landing page describing the product and run targeted ads to measure interest",
      "cost": "$500-$1,000",
      "timeline": "1-2 weeks"
    },
    {
      "method": "Customer Interviews",
      "description": "Conduct 15-20 interviews with target customers to validate problem and solution",
      "cost": "$0-$200",
      "timeline": "2-3 weeks"
    },
    {
      "method": "Waitlist Campaign",
      "description": "Build email waitlist and measure conversion rate from awareness to signup",
      "cost": "$200-$500",
      "timeline": "2-4 weeks"
    }
  ],
  "successMetrics": [
    {
      "metric": "Landing Page Conversion Rate",
      "target": "5-10% of visitors sign up for waitlist",
      "measurement": "Track email signups vs. unique visitors"
    },
    {
      "metric": "Ad Click-Through Rate",
      "target": "2-5% CTR on targeted ads",
      "measurement": "Google/Facebook Ads dashboard"
    },
    {
      "metric": "Customer Interview Validation",
      "target": "70%+ of interviewees confirm they have the problem",
      "measurement": "Interview notes and scoring"
    }
  ],
  "budget": {
    "total": "$1,000-$2,500",
    "breakdown": [
      { "item": "Landing page design and hosting", "cost": "$200-$500" },
      { "item": "Paid advertising (Google/Facebook)", "cost": "$500-$1,000" },
      { "item": "Email marketing tool", "cost": "$50-$100" },
      { "item": "Interview incentives", "cost": "$200-$500" },
      { "item": "Analytics and tracking tools", "cost": "$50-$400" }
    ]
  },
  "timeline": "4-6 weeks total for comprehensive testing"
}

REQUIREMENTS:
- Testing methods: 3-5 specific, actionable testing approaches
  - Each method should include: name, description, cost estimate, timeline
  - Focus on low-cost, high-signal validation methods
  - Prioritize methods appropriate for the target audience
- Success metrics: 3-5 key performance indicators
  - Each metric should include: name, target value, measurement method
  - Metrics should be specific and measurable
  - Focus on leading indicators of product-market fit
- Budget: Realistic cost breakdown
  - Total budget should be 10-30% of MVP development cost
  - Break down by major expense categories
  - Include specific line items with cost ranges
- Timeline: Overall testing duration (typically 4-8 weeks)
  - Should be realistic for the testing methods chosen
  - Consider time for setup, execution, and analysis

GUIDELINES:
- Prioritize testing methods that validate demand BEFORE building the full product
- Recommend a mix of quantitative (ads, landing pages) and qualitative (interviews) methods
- Consider the target audience when recommending channels (B2B vs B2C)
- Budget should be accessible for bootstrapped entrepreneurs
- Focus on learning velocity - fast, cheap tests that provide clear signals
- Include at least one method that tests willingness to pay
- Metrics should help make a clear go/no-go decision

Respond ONLY with valid JSON.`;
        return { prompt, systemPrompt };
      }
      /**
       * Gets the AI prompt for Stage 5 (Scaling & Growth)
       * Requirements: 4.1, 4.2, 4.3, 4.4
       * 
       * Plans growth strategy and resource scaling
       */
      getStage5Prompt(analysis) {
        const businessName = analysis.businessModel || analysis.url;
        const valueProposition = analysis.structured?.overview?.valueProposition || "Unknown";
        const monetization = analysis.structured?.overview?.monetization || "Unknown";
        const targetAudience = analysis.structured?.overview?.targetAudience || "Unknown";
        const stage2Data = analysis.stages?.[2]?.content;
        const rewardScore = stage2Data?.rewardScore || "Unknown";
        const stage3Data = analysis.stages?.[3]?.content;
        const coreFeatures = stage3Data?.coreFeatures?.join(", ") || "Unknown";
        const mvpTimeline = stage3Data?.timeline?.map((t) => t.phase).join(" \u2192 ") || "Unknown";
        const stage4Data = analysis.stages?.[4]?.content;
        const testingMethods = stage4Data?.testingMethods?.map((m) => m.method).join(", ") || "Unknown";
        const successMetrics = stage4Data?.successMetrics?.map((m) => m.metric).join(", ") || "Unknown";
        const systemPrompt = `You are a growth strategy expert specializing in scaling startups and optimizing growth channels. Provide specific, actionable strategies for sustainable business growth.`;
        const prompt = `Create a scaling and growth plan for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Reward Score: ${rewardScore}/10

STAGE 3 CONTEXT (MVP Launch Planning):
- Core Features: ${coreFeatures}
- MVP Timeline: ${mvpTimeline}

STAGE 4 CONTEXT (Demand Testing Strategy):
- Testing Methods: ${testingMethods}
- Success Metrics: ${successMetrics}

Provide a Scaling & Growth Plan in this exact JSON format:

{
  "growthChannels": [
    {
      "channel": "Content Marketing & SEO",
      "strategy": "Create high-quality blog content targeting long-tail keywords in the niche, build backlinks through guest posting",
      "priority": "high"
    },
    {
      "channel": "Paid Advertising",
      "strategy": "Run targeted Google Ads and Facebook campaigns with A/B testing to optimize conversion rates",
      "priority": "medium"
    },
    {
      "channel": "Partnerships & Affiliates",
      "strategy": "Build affiliate program and partner with complementary businesses for cross-promotion",
      "priority": "medium"
    }
  ],
  "milestones": [
    {
      "milestone": "First 100 Paying Customers",
      "timeline": "3-6 months post-launch",
      "metrics": ["$10K MRR", "20% month-over-month growth", "< 5% churn rate"]
    },
    {
      "milestone": "Product-Market Fit Validation",
      "timeline": "6-9 months post-launch",
      "metrics": ["40%+ organic growth", "NPS > 50", "80%+ retention rate"]
    },
    {
      "milestone": "Scale to $100K MRR",
      "timeline": "12-18 months post-launch",
      "metrics": ["1,000+ active customers", "CAC < 3 months payback", "Positive unit economics"]
    }
  ],
  "resourceScaling": [
    {
      "phase": "Phase 1: Foundation (0-6 months)",
      "team": ["1 founder/developer", "1 part-time marketer", "Freelance designer as needed"],
      "infrastructure": "Basic hosting ($50-100/mo), essential SaaS tools ($200-300/mo), minimal ad spend ($500-1K/mo)"
    },
    {
      "phase": "Phase 2: Growth (6-12 months)",
      "team": ["2 full-time developers", "1 full-time marketer", "1 customer success manager"],
      "infrastructure": "Scaled hosting ($200-500/mo), growth tools ($500-1K/mo), increased ad spend ($2-5K/mo)"
    },
    {
      "phase": "Phase 3: Scale (12-24 months)",
      "team": ["5-7 team members across engineering, marketing, sales, and support"],
      "infrastructure": "Enterprise hosting ($1-2K/mo), full marketing stack ($2-3K/mo), significant ad spend ($10-20K/mo)"
    }
  ]
}

REQUIREMENTS:
- Growth channels: 3-5 specific acquisition channels
  - Each channel should include: name, strategy description, priority (high/medium/low)
  - Focus on channels appropriate for the target audience and business model
  - Mix of organic (SEO, content) and paid (ads, partnerships) channels
  - Prioritize channels with best ROI for this specific business
- Milestones: 3-4 major growth milestones
  - Each milestone should include: name, timeline, 3-4 specific metrics
  - Milestones should be sequential and build on each other
  - Timeline should span 12-24 months post-launch
  - Metrics should be specific, measurable, and realistic
- Resource scaling: 3 phases of team and infrastructure growth
  - Each phase should include: phase name/timeline, team composition, infrastructure needs
  - Show clear progression from lean startup to scaled operation
  - Include specific cost estimates for infrastructure
  - Team should scale based on business needs and revenue

GUIDELINES:
- Prioritize sustainable, profitable growth over vanity metrics
- Consider the business model when recommending channels (B2B vs B2C, SaaS vs marketplace, etc.)
- Focus on channels that can scale efficiently (good unit economics)
- Recommend a mix of short-term and long-term growth strategies
- Resource scaling should be tied to revenue milestones (don't overhire)
- Infrastructure costs should scale proportionally with usage
- Include both customer acquisition and retention strategies
- Consider the reward score from Stage 2 when setting growth targets
- Be realistic about timelines - sustainable growth takes time
- Emphasize building systems and processes that enable scale

Respond ONLY with valid JSON.`;
        return { prompt, systemPrompt };
      }
      /**
       * Gets the AI prompt for Stage 6 (AI Automation Mapping)
       * Requirements: 5.1, 5.2, 5.3, 5.4
       * 
       * Identifies automation opportunities and AI tools
       */
      getStage6Prompt(analysis) {
        const businessName = analysis.businessModel || analysis.url;
        const valueProposition = analysis.structured?.overview?.valueProposition || "Unknown";
        const monetization = analysis.structured?.overview?.monetization || "Unknown";
        const targetAudience = analysis.structured?.overview?.targetAudience || "Unknown";
        const detectedTech = analysis.structured?.technical?.actualDetected?.technologies || [];
        const inferredTechStack = analysis.structured?.technical?.techStack || [];
        const complexityScore = analysis.structured?.technical?.complexityScore;
        let techStackInfo = "";
        if (detectedTech.length > 0) {
          const techNames = detectedTech.map(
            (t) => t.version ? `${t.name} ${t.version}` : t.name
          ).join(", ");
          const categoriesSet = new Set(detectedTech.flatMap((t) => t.categories || []));
          const categories = Array.from(categoriesSet).join(", ");
          techStackInfo = `Detected Technologies (via Wappalyzer): ${techNames}`;
          if (categories) {
            techStackInfo += `
Technology Categories: ${categories}`;
          }
          if (inferredTechStack.length > 0) {
            techStackInfo += `
AI-Inferred Technologies: ${inferredTechStack.join(", ")}`;
          }
          if (complexityScore) {
            techStackInfo += `
Technical Complexity Score: ${complexityScore}/10`;
          }
        } else if (inferredTechStack.length > 0) {
          techStackInfo = `AI-Inferred Technologies: ${inferredTechStack.join(", ")}`;
        } else {
          techStackInfo = "Unknown";
        }
        const stage2Data = analysis.stages?.[2]?.content;
        const automationPotential = stage2Data?.automationPotential?.score || "Unknown";
        const automationOpportunities = stage2Data?.automationPotential?.opportunities?.join(", ") || "Unknown";
        const stage3Data = analysis.stages?.[3]?.content;
        const coreFeatures = stage3Data?.coreFeatures?.join(", ") || "Unknown";
        const mvpTechStack = stage3Data?.techStack ? `Frontend: ${stage3Data.techStack.frontend?.join(", ")}, Backend: ${stage3Data.techStack.backend?.join(", ")}` : "Unknown";
        const stage5Data = analysis.stages?.[5]?.content;
        const growthChannels = stage5Data?.growthChannels?.map((c) => c.channel).join(", ") || "Unknown";
        const resourceScaling = stage5Data?.resourceScaling?.map((r) => r.phase).join(" \u2192 ") || "Unknown";
        const systemPrompt = `You are an AI automation expert specializing in identifying opportunities to leverage AI tools and services for business efficiency. Provide specific, actionable recommendations with realistic ROI estimates.`;
        const prompt = `Create an AI automation mapping plan for this business opportunity.

BUSINESS CONTEXT:
- Business: ${businessName}
- Value Proposition: ${valueProposition}
- Monetization: ${monetization}
- Target Audience: ${targetAudience}
- URL: ${analysis.url}

TECHNOLOGY STACK ANALYSIS:
${techStackInfo}

IMPORTANT: When recommending AI automation tools and integrations, consider the detected technologies above. If actual technologies were detected via Wappalyzer, recommend automation tools that integrate well with those specific technologies. For example:
- If WordPress is detected, recommend WordPress-specific AI plugins
- If Shopify is detected, recommend Shopify AI apps and integrations
- If React/Next.js is detected, recommend JavaScript-based AI SDKs
- If specific analytics tools are detected, recommend AI tools that integrate with them

STAGE 2 CONTEXT (Lazy-Entrepreneur Filter):
- Automation Potential Score: ${automationPotential}
- Initial Opportunities: ${automationOpportunities}

STAGE 3 CONTEXT (MVP Launch Planning):
- Core Features: ${coreFeatures}
- MVP Tech Stack: ${mvpTechStack}

STAGE 5 CONTEXT (Scaling & Growth):
- Growth Channels: ${growthChannels}
- Resource Scaling: ${resourceScaling}

Provide an AI Automation Mapping Plan in this exact JSON format:

{
  "automationOpportunities": [
    {
      "process": "Customer Support",
      "tool": "ChatGPT API + Custom Knowledge Base",
      "roi": "Save 20-30 hours/week, reduce support costs by 60%",
      "priority": 1
    },
    {
      "process": "Content Generation",
      "tool": "Claude API for blog posts, social media content",
      "roi": "Generate 10x more content, reduce content costs by 70%",
      "priority": 2
    },
    {
      "process": "Email Marketing",
      "tool": "Mailchimp AI + Personalization Engine",
      "roi": "Increase open rates by 40%, save 10 hours/week",
      "priority": 3
    },
    {
      "process": "Data Analysis & Reporting",
      "tool": "Google Analytics + AI-powered dashboards",
      "roi": "Real-time insights, save 15 hours/week on reporting",
      "priority": 4
    }
  ],
  "implementationPlan": [
    {
      "phase": "Phase 1: Quick Wins (Month 1-2)",
      "automations": [
        "Implement AI chatbot for customer support",
        "Set up automated email sequences with AI personalization",
        "Deploy AI content generation for social media"
      ],
      "timeline": "6-8 weeks"
    },
    {
      "phase": "Phase 2: Core Operations (Month 3-4)",
      "automations": [
        "Automate data analysis and reporting",
        "Implement AI-powered lead scoring",
        "Deploy automated content calendar with AI suggestions"
      ],
      "timeline": "6-8 weeks"
    },
    {
      "phase": "Phase 3: Advanced Optimization (Month 5-6)",
      "automations": [
        "Implement predictive analytics for customer behavior",
        "Deploy AI-powered A/B testing automation",
        "Set up automated inventory/resource management"
      ],
      "timeline": "6-8 weeks"
    }
  ],
  "estimatedSavings": "$50,000-$100,000 annually in labor costs + 40-60 hours/week in time savings"
}

REQUIREMENTS:
- Automation opportunities: 4-6 specific processes that can be automated
  - Each opportunity should include: process name, specific tool/service, ROI estimate, priority (1-6)
  - Focus on high-impact, achievable automations
  - Prioritize based on ROI and implementation difficulty
  - Include both cost savings and time savings in ROI
  - Recommend specific, real AI tools and services (ChatGPT, Claude, Zapier, Make, etc.)
- Implementation plan: 3 phases of automation rollout
  - Each phase should include: phase name/timeline, 3-4 specific automations, duration
  - Phases should build on each other (quick wins \u2192 core operations \u2192 advanced)
  - Timeline should span 4-6 months total
  - Start with easiest/highest-impact automations first
- Estimated savings: Overall financial and time impact
  - Include both annual cost savings and weekly time savings
  - Be realistic and conservative with estimates
  - Consider both direct costs (labor) and indirect benefits (speed, quality)

GUIDELINES:
- Focus on AI tools that are readily available and proven (ChatGPT, Claude, Gemini, etc.)
- Prioritize automations that directly impact revenue or reduce major costs
- Consider the business model and target audience when recommending tools
- Include both customer-facing (chatbots, personalization) and internal (analytics, reporting) automations
- Recommend no-code/low-code solutions where possible (Zapier, Make, n8n)
- **CRITICAL**: Consider the detected technologies when recommending integrations
  * If specific platforms are detected (WordPress, Shopify, etc.), recommend platform-specific AI tools
  * If specific frameworks are detected (React, Vue, etc.), recommend compatible AI SDKs and libraries
  * If specific analytics/marketing tools are detected, recommend AI tools that integrate with them
  * Match automation recommendations to the actual tech stack for easier implementation
- Consider the MVP tech stack from Stage 3 when recommending integrations
- Balance quick wins (easy to implement) with long-term strategic automations
- Include specific ROI metrics (% cost reduction, hours saved, revenue increase)
- Consider the automation potential score from Stage 2
- Consider the complexity score - higher complexity may require more sophisticated automation tools
- Emphasize tools that scale with the business (from Stage 5 context)
- Recommend automations that free up time for high-value activities
- Include both AI-powered tools and traditional automation platforms
- Consider data privacy and security when recommending tools
- Provide realistic implementation timelines based on team size and technical capability

Respond ONLY with valid JSON.`;
        return { prompt, systemPrompt };
      }
    };
  }
});

// server/lib/retry.ts
var retry_exports = {};
__export(retry_exports, {
  createPartialResultHandler: () => createPartialResultHandler,
  generateErrorGuidance: () => generateErrorGuidance,
  isRetryableError: () => isRetryableError,
  retryWithBackoff: () => retryWithBackoff
});
function isRetryableError(error, retryablePatterns) {
  const defaultRetryablePatterns = [
    "timeout",
    "ETIMEDOUT",
    "ECONNRESET",
    "ECONNREFUSED",
    "ENOTFOUND",
    "network",
    "fetch failed",
    "rate limit",
    "quota",
    "RESOURCE_EXHAUSTED",
    "DEADLINE_EXCEEDED",
    "429",
    "502",
    "503",
    "504"
  ];
  const patterns = retryablePatterns || defaultRetryablePatterns;
  const errorMessage = error.message.toLowerCase();
  const errorName = error.name.toLowerCase();
  return patterns.some(
    (pattern) => errorMessage.includes(pattern.toLowerCase()) || errorName.includes(pattern.toLowerCase())
  );
}
async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    delayMs = 1e3,
    backoffMultiplier = 2,
    maxDelayMs = 1e4,
    retryableErrors,
    onRetry
  } = options;
  const startTime = Date.now();
  let lastError;
  let currentDelay = delayMs;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fn();
      const totalTimeMs2 = Date.now() - startTime;
      return {
        success: true,
        data,
        attempts: attempt,
        totalTimeMs: totalTimeMs2
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxAttempts) {
        break;
      }
      if (!isRetryableError(lastError, retryableErrors)) {
        console.log(`Non-retryable error on attempt ${attempt}:`, lastError.message);
        break;
      }
      if (onRetry) {
        onRetry(lastError, attempt);
      }
      console.log(`Retryable error on attempt ${attempt}/${maxAttempts}:`, lastError.message);
      console.log(`Waiting ${currentDelay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
    }
  }
  const totalTimeMs = Date.now() - startTime;
  return {
    success: false,
    error: lastError || new Error("Unknown error"),
    attempts: maxAttempts,
    totalTimeMs
  };
}
function createPartialResultHandler(storageKey) {
  const cache = /* @__PURE__ */ new Map();
  return {
    async save(partialData) {
      cache.set(storageKey, partialData);
      console.log(`Saved partial result for ${storageKey}`);
    },
    async load() {
      const data = cache.get(storageKey);
      if (data) {
        console.log(`Loaded partial result for ${storageKey}`);
      }
      return data || null;
    },
    async clear() {
      cache.delete(storageKey);
      console.log(`Cleared partial result for ${storageKey}`);
    }
  };
}
function generateErrorGuidance(error, context) {
  const errorMessage = error.message.toLowerCase();
  if (errorMessage.includes("timeout") || errorMessage.includes("etimedout")) {
    return {
      error,
      userMessage: "The AI service took too long to respond. This usually happens during high traffic periods.",
      nextSteps: [
        "Wait 1-2 minutes and try again",
        "The system will automatically retry with a longer timeout",
        "If the problem persists, try a different time of day"
      ],
      retryable: true,
      estimatedWaitTime: "1-2 minutes"
    };
  }
  if (errorMessage.includes("rate limit") || errorMessage.includes("quota") || errorMessage.includes("429")) {
    return {
      error,
      userMessage: "The AI service rate limit has been reached. This is temporary.",
      nextSteps: [
        "Wait 5-10 minutes before trying again",
        "Rate limits reset automatically",
        "Consider upgrading your AI provider plan for higher limits"
      ],
      retryable: true,
      estimatedWaitTime: "5-10 minutes"
    };
  }
  if (errorMessage.includes("network") || errorMessage.includes("econnrefused") || errorMessage.includes("econnreset")) {
    return {
      error,
      userMessage: "A network error occurred while connecting to the AI service.",
      nextSteps: [
        "Check your internet connection",
        "Try again in a few moments",
        "The system will automatically retry"
      ],
      retryable: true,
      estimatedWaitTime: "30 seconds"
    };
  }
  if (errorMessage.includes("api key") || errorMessage.includes("unauthorized") || errorMessage.includes("401")) {
    return {
      error,
      userMessage: "There is an issue with the AI service configuration.",
      nextSteps: [
        "Contact support to verify API key configuration",
        "This is not a temporary issue and requires administrator action"
      ],
      retryable: false
    };
  }
  if (errorMessage.includes("validation") || errorMessage.includes("schema") || errorMessage.includes("invalid")) {
    return {
      error,
      userMessage: "The AI service returned invalid data. This is usually temporary.",
      nextSteps: [
        "Try again - the AI will generate a new response",
        "If this persists, the prompt may need adjustment",
        "Contact support if you see this repeatedly"
      ],
      retryable: true,
      estimatedWaitTime: "30 seconds"
    };
  }
  return {
    error,
    userMessage: `An unexpected error occurred${context ? ` while ${context}` : ""}.`,
    nextSteps: [
      "Try again in a few moments",
      "If the problem persists, contact support",
      "Include the error message when reporting issues"
    ],
    retryable: true,
    estimatedWaitTime: "1 minute"
  };
}
var init_retry = __esm({
  "server/lib/retry.ts"() {
    "use strict";
  }
});

// server/services/validation.ts
var validation_exports = {};
__export(validation_exports, {
  ValidationService: () => ValidationService2
});
var STAGE_SCHEMAS, ValidationService2;
var init_validation = __esm({
  "server/services/validation.ts"() {
    "use strict";
    STAGE_SCHEMAS = {
      2: {
        required: ["effortScore", "rewardScore", "recommendation", "reasoning", "automationPotential", "resourceRequirements", "nextSteps"],
        nested: {
          automationPotential: ["score", "opportunities"],
          resourceRequirements: ["time", "money", "skills"]
        }
      },
      3: {
        required: ["coreFeatures", "niceToHaves", "techStack", "timeline", "estimatedCost"],
        nested: {
          techStack: ["frontend", "backend", "infrastructure"]
        }
      },
      4: {
        required: ["testingMethods", "successMetrics", "budget", "timeline"],
        nested: {
          budget: ["total", "breakdown"]
        }
      },
      5: {
        required: ["growthChannels", "milestones", "resourceScaling"]
      },
      6: {
        required: ["automationOpportunities", "implementationPlan", "estimatedSavings"]
      }
    };
    ValidationService2 = class {
      /**
       * Validates AI response structure matches expected schema
       * Requirement: 10.1
       */
      validateResponseStructure(stageNumber, content) {
        const errors = [];
        const warnings = [];
        if (!content || typeof content !== "object") {
          errors.push("Content must be a valid object");
          return { valid: false, errors, warnings };
        }
        const schema = STAGE_SCHEMAS[stageNumber];
        if (!schema) {
          warnings.push(`No validation schema defined for stage ${stageNumber}`);
          return { valid: true, errors, warnings };
        }
        for (const field of schema.required) {
          if (!(field in content)) {
            errors.push(`Missing required field: ${field}`);
          } else if (content[field] === null || content[field] === void 0) {
            errors.push(`Field ${field} cannot be null or undefined`);
          }
        }
        if ("nested" in schema && schema.nested) {
          for (const [parent, children] of Object.entries(schema.nested)) {
            if (content[parent] && typeof content[parent] === "object") {
              for (const child of children) {
                if (!(child in content[parent])) {
                  errors.push(`Missing required nested field: ${parent}.${child}`);
                }
              }
            }
          }
        }
        return {
          valid: errors.length === 0,
          errors,
          warnings
        };
      }
      /**
       * Validates that required fields are present and non-empty
       * Requirement: 10.1
       */
      validateRequiredFields(stageNumber, content) {
        const errors = [];
        const warnings = [];
        const schema = STAGE_SCHEMAS[stageNumber];
        if (!schema) {
          return { valid: true, errors, warnings };
        }
        for (const field of schema.required) {
          if (Array.isArray(content[field])) {
            if (content[field].length === 0) {
              errors.push(`Array field ${field} cannot be empty`);
            }
          } else if (typeof content[field] === "string") {
            if (content[field].trim().length === 0) {
              errors.push(`String field ${field} cannot be empty`);
            }
          }
        }
        return {
          valid: errors.length === 0,
          errors,
          warnings
        };
      }
      /**
       * Ensures content is business-specific, not generic
       * Requirement: 10.1
       */
      validateBusinessSpecificity(content, businessContext) {
        const errors = [];
        const warnings = [];
        const contentStr = JSON.stringify(content).toLowerCase();
        const placeholders = [
          "example",
          "placeholder",
          "todo",
          "tbd",
          "to be determined",
          "insert here",
          "your business",
          "your company",
          "sample"
        ];
        for (const placeholder of placeholders) {
          if (contentStr.includes(placeholder)) {
            warnings.push(`Content contains generic placeholder: "${placeholder}"`);
          }
        }
        const businessName = businessContext.businessModel?.toLowerCase();
        const businessDomain = businessContext.url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0].toLowerCase();
        if (businessName && !contentStr.includes(businessName)) {
          warnings.push("Content does not mention the specific business name");
        }
        if (businessDomain && !contentStr.includes(businessDomain)) {
          warnings.push("Content does not reference the business domain/URL");
        }
        return {
          valid: errors.length === 0,
          errors,
          warnings
        };
      }
      /**
       * Verifies recommendations are actionable
       * Requirement: 10.2
       */
      checkRecommendationsActionable(content) {
        const issues = [];
        let actionableCount = 0;
        let totalCount = 0;
        const recommendationFields = [
          "nextSteps",
          "recommendations",
          "actionItems",
          "deliverables",
          "tasks",
          "automations"
        ];
        for (const field of recommendationFields) {
          if (Array.isArray(content[field])) {
            for (const item of content[field]) {
              totalCount++;
              const itemStr = typeof item === "string" ? item : JSON.stringify(item);
              const actionVerbs = ["create", "build", "implement", "develop", "design", "test", "launch", "deploy", "set up", "configure", "integrate", "analyze", "measure", "track", "optimize"];
              const hasActionVerb = actionVerbs.some((verb) => itemStr.toLowerCase().includes(verb));
              if (hasActionVerb) {
                actionableCount++;
              } else {
                issues.push(`Recommendation may not be actionable: "${itemStr.substring(0, 50)}..."`);
              }
            }
          }
        }
        if (content.timeline && Array.isArray(content.timeline)) {
          for (const phase of content.timeline) {
            if (Array.isArray(phase.deliverables)) {
              totalCount += phase.deliverables.length;
              actionableCount += phase.deliverables.length;
            }
          }
        }
        if (content.implementationPlan && Array.isArray(content.implementationPlan)) {
          for (const phase of content.implementationPlan) {
            if (Array.isArray(phase.automations)) {
              totalCount += phase.automations.length;
              actionableCount += phase.automations.length;
            }
          }
        }
        const score = totalCount > 0 ? actionableCount / totalCount : 1;
        const passed = score >= 0.7;
        if (!passed) {
          issues.push(`Only ${(score * 100).toFixed(0)}% of recommendations are actionable (target: 70%)`);
        }
        return {
          passed,
          issues,
          score
        };
      }
      /**
       * Checks for placeholder text in content
       * Requirement: 10.2
       */
      checkForPlaceholders(content) {
        const issues = [];
        const contentStr = JSON.stringify(content);
        const placeholderPatterns = [
          /\[.*?\]/g,
          // [placeholder]
          /\{.*?\}/g,
          // {placeholder}
          /xxx+/gi,
          // xxx, XXX
          /tbd/gi,
          // TBD, tbd
          /todo/gi,
          // TODO, todo
          /placeholder/gi,
          /example\.com/gi,
          /sample/gi,
          /insert\s+here/gi,
          /your\s+(business|company|product|service)/gi
        ];
        for (const pattern of placeholderPatterns) {
          const matches = contentStr.match(pattern);
          if (matches && matches.length > 0) {
            issues.push(`Found ${matches.length} placeholder pattern(s): ${matches.slice(0, 3).join(", ")}`);
          }
        }
        return {
          passed: issues.length === 0,
          issues,
          score: issues.length === 0 ? 1 : 0.5
        };
      }
      /**
       * Ensures estimates are realistic (not too vague or extreme)
       * Requirement: 10.2, 10.3
       */
      checkEstimatesRealistic(stageNumber, content) {
        const issues = [];
        let checksPerformed = 0;
        let checksPassed = 0;
        if (stageNumber === 2) {
          if (typeof content.effortScore === "number") {
            checksPerformed++;
            if (content.effortScore >= 1 && content.effortScore <= 10) {
              checksPassed++;
            } else {
              issues.push(`Effort score ${content.effortScore} is out of valid range (1-10)`);
            }
          }
          if (typeof content.rewardScore === "number") {
            checksPerformed++;
            if (content.rewardScore >= 1 && content.rewardScore <= 10) {
              checksPassed++;
            } else {
              issues.push(`Reward score ${content.rewardScore} is out of valid range (1-10)`);
            }
          }
          if (content.automationPotential?.score !== void 0) {
            checksPerformed++;
            if (content.automationPotential.score >= 0 && content.automationPotential.score <= 1) {
              checksPassed++;
            } else {
              issues.push(`Automation potential score ${content.automationPotential.score} is out of valid range (0-1)`);
            }
          }
          if (content.resourceRequirements) {
            checksPerformed++;
            const time = content.resourceRequirements.time?.toLowerCase() || "";
            const money = content.resourceRequirements.money?.toLowerCase() || "";
            const hasTimeEstimate = /\d+/.test(time) && (time.includes("month") || time.includes("week") || time.includes("day"));
            const hasMoneyEstimate = /\$\d+/.test(money) || money.includes("unknown");
            if (hasTimeEstimate && hasMoneyEstimate) {
              checksPassed++;
            } else {
              if (!hasTimeEstimate) issues.push("Time estimate is too vague or missing numbers");
              if (!hasMoneyEstimate) issues.push("Money estimate is too vague or missing dollar amounts");
            }
          }
        }
        if (stageNumber === 3) {
          if (content.estimatedCost) {
            checksPerformed++;
            const cost = content.estimatedCost.toLowerCase();
            if (/\$\d+/.test(cost)) {
              checksPassed++;
            } else {
              issues.push("Estimated cost should include specific dollar amounts");
            }
          }
          if (Array.isArray(content.timeline)) {
            checksPerformed++;
            let hasRealisticDurations = true;
            for (const phase of content.timeline) {
              if (phase.duration) {
                const duration = phase.duration.toLowerCase();
                if (!/\d+\s*(week|month)/.test(duration)) {
                  hasRealisticDurations = false;
                  issues.push(`Phase "${phase.phase}" has vague duration: ${phase.duration}`);
                }
              }
            }
            if (hasRealisticDurations) checksPassed++;
          }
        }
        if (stageNumber === 4) {
          if (content.budget) {
            checksPerformed++;
            if (content.budget.total && /\$\d+/.test(content.budget.total)) {
              checksPassed++;
            } else {
              issues.push("Budget total should include specific dollar amounts");
            }
            if (Array.isArray(content.budget.breakdown)) {
              checksPerformed++;
              const allHaveCosts = content.budget.breakdown.every(
                (item) => item.cost && /\$\d+/.test(item.cost)
              );
              if (allHaveCosts) {
                checksPassed++;
              } else {
                issues.push("Budget breakdown items should have specific cost estimates");
              }
            }
          }
        }
        const score = checksPerformed > 0 ? checksPassed / checksPerformed : 1;
        const passed = score >= 0.8;
        return {
          passed,
          issues,
          score
        };
      }
      /**
       * Comprehensive validation combining all checks
       * Requirements: 10.1, 10.2, 10.3, 10.4
       */
      validateStageContent(stageNumber, content, businessContext) {
        const structureValidation = this.validateResponseStructure(stageNumber, content);
        const fieldsValidation = this.validateRequiredFields(stageNumber, content);
        const specificityValidation = this.validateBusinessSpecificity(content, businessContext);
        const actionableCheck = this.checkRecommendationsActionable(content);
        const placeholderCheck = this.checkForPlaceholders(content);
        const estimatesCheck = this.checkEstimatesRealistic(stageNumber, content);
        const scores = [
          structureValidation.valid ? 1 : 0,
          fieldsValidation.valid ? 1 : 0,
          specificityValidation.valid ? 1 : 0,
          actionableCheck.score,
          placeholderCheck.score,
          estimatesCheck.score
        ];
        const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;
        const valid = structureValidation.valid && fieldsValidation.valid && overallScore >= 0.7;
        return {
          valid,
          structureValidation,
          fieldsValidation,
          specificityValidation,
          actionableCheck,
          placeholderCheck,
          estimatesCheck,
          overallScore
        };
      }
    };
  }
});

// server/lib/export-utils.ts
var export_utils_exports = {};
__export(export_utils_exports, {
  escapeCSV: () => escapeCSV,
  flattenForCSV: () => flattenForCSV,
  generateCSV: () => generateCSV,
  generateCSVFromArray: () => generateCSVFromArray
});
function flattenForCSV(data, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === void 0) {
      result[newKey] = "";
    } else if (Array.isArray(value)) {
      result[newKey] = value.map(
        (v) => typeof v === "object" ? JSON.stringify(v) : String(v)
      ).join("; ");
    } else if (typeof value === "object") {
      Object.assign(result, flattenForCSV(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  return result;
}
function escapeCSV(value) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
function generateCSV(data, includeHeaders = true) {
  const flattened = flattenForCSV(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened).map((v) => escapeCSV(String(v)));
  if (includeHeaders) {
    return [
      headers.join(","),
      values.join(",")
    ].join("\n");
  }
  return values.join(",");
}
function generateCSVFromArray(dataArray) {
  if (!dataArray || dataArray.length === 0) {
    return "";
  }
  const flattenedArray = dataArray.map((item) => flattenForCSV(item));
  const allHeaders = /* @__PURE__ */ new Set();
  flattenedArray.forEach((item) => {
    Object.keys(item).forEach((key) => allHeaders.add(key));
  });
  const headers = Array.from(allHeaders);
  const rows = flattenedArray.map((item) => {
    return headers.map((header) => {
      const value = item[header] || "";
      return escapeCSV(String(value));
    }).join(",");
  });
  return [
    headers.join(","),
    ...rows
  ].join("\n");
}
var init_export_utils = __esm({
  "server/lib/export-utils.ts"() {
    "use strict";
  }
});

// server/index.ts
import dotenv from "dotenv";
import express2 from "express";
import cookieParser from "cookie-parser";

// server/routes.ts
import { createServer } from "http";

// server/minimal-storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  analyses = /* @__PURE__ */ new Map();
  async listAnalyses(userId) {
    const userAnalyses = this.analyses.get(userId) || [];
    return [...userAnalyses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  async getAnalysis(userId, id) {
    const userAnalyses = this.analyses.get(userId) || [];
    return userAnalyses.find((analysis) => analysis.id === id) || null;
  }
  async createAnalysis(userId, record) {
    let overallScore;
    let businessModel;
    let revenueStream;
    let targetMarket;
    let aiInsights;
    let scoreDetails;
    if (record.structured) {
      overallScore = this.calculateScore(record.structured);
      businessModel = record.structured.overview?.valueProposition || "Business Analysis";
      revenueStream = record.structured.overview?.monetization || "Unknown";
      targetMarket = record.structured.overview?.targetAudience || "Unknown";
      aiInsights = {
        keyInsights: record.structured.synthesis?.keyInsights || [],
        risks: record.structured.market?.swot?.threats || [],
        opportunities: record.structured.market?.swot?.opportunities || []
      };
      const confidence = "confidence" in record.structured.technical ? record.structured.technical.confidence : void 0;
      scoreDetails = {
        technicalComplexity: {
          score: confidence ? Math.round(confidence * 10) : 7,
          reasoning: record.structured.technical?.techStack?.join(", ") || "Standard web technologies"
        },
        marketOpportunity: {
          score: 7,
          reasoning: record.structured.market?.swot?.opportunities?.[0] || "Market opportunity exists"
        },
        competitiveLandscape: {
          score: 6,
          reasoning: `${record.structured.market?.competitors?.length || 0} competitors identified`
        },
        resourceRequirements: {
          score: 7,
          reasoning: "Moderate resource requirements"
        },
        timeToMarket: {
          score: 7,
          reasoning: "Estimated 3-6 months to MVP"
        }
      };
    }
    const analysis = {
      id: randomUUID(),
      userId,
      url: record.url,
      summary: record.summary,
      model: record.model,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (record.structured) analysis.structured = record.structured;
    if (record.firstPartyData) analysis.firstPartyData = record.firstPartyData;
    if (record.improvements) analysis.improvements = record.improvements;
    if (record.technologyInsights) analysis.technologyInsights = record.technologyInsights;
    if (record.clonabilityScore) analysis.clonabilityScore = record.clonabilityScore;
    if (record.enhancedComplexity) analysis.enhancedComplexity = record.enhancedComplexity;
    if (record.insightsGeneratedAt) analysis.insightsGeneratedAt = record.insightsGeneratedAt;
    if (overallScore) analysis.overallScore = overallScore;
    if (businessModel) analysis.businessModel = businessModel;
    if (revenueStream) analysis.revenueStream = revenueStream;
    if (targetMarket) analysis.targetMarket = targetMarket;
    if (aiInsights) analysis.aiInsights = aiInsights;
    if (scoreDetails) analysis.scoreDetails = scoreDetails;
    const userAnalyses = this.analyses.get(userId) || [];
    userAnalyses.push(analysis);
    this.analyses.set(userId, userAnalyses);
    return analysis;
  }
  calculateScore(structured) {
    let score = 5;
    if (structured.overview) score += 1;
    if (structured.market?.competitors && structured.market.competitors.length > 0) score += 1;
    if (structured.market?.swot) score += 1;
    if (structured.technical?.techStack && structured.technical.techStack.length > 0) score += 1;
    if (structured.synthesis?.keyInsights && structured.synthesis.keyInsights.length >= 3) score += 1;
    return Math.min(10, Math.max(1, score));
  }
  async deleteAnalysis(userId, id) {
    const userAnalyses = this.analyses.get(userId) || [];
    const filteredAnalyses = userAnalyses.filter((analysis) => analysis.id !== id);
    this.analyses.set(userId, filteredAnalyses);
  }
  async updateAnalysisImprovements(userId, id, improvements) {
    const userAnalyses = this.analyses.get(userId) || [];
    const analysisIndex = userAnalyses.findIndex((analysis2) => analysis2.id === id);
    if (analysisIndex === -1) {
      return null;
    }
    const analysis = userAnalyses[analysisIndex];
    if (!analysis) {
      return null;
    }
    analysis.improvements = improvements;
    this.analyses.set(userId, userAnalyses);
    return analysis;
  }
  async getAnalysisImprovements(userId, id) {
    const analysis = await this.getAnalysis(userId, id);
    return analysis?.improvements || null;
  }
  async updateAnalysisStageData(userId, id, stageNumber, stageData) {
    const userAnalyses = this.analyses.get(userId) || [];
    const analysisIndex = userAnalyses.findIndex((analysis2) => analysis2.id === id);
    if (analysisIndex === -1) {
      return null;
    }
    const analysis = userAnalyses[analysisIndex];
    if (!analysis) {
      return null;
    }
    if (!analysis.stages) {
      analysis.stages = {};
    }
    const existingStage = analysis.stages[stageNumber];
    const updatedStageData = {
      stageNumber: stageData.stageNumber,
      stageName: stageData.stageName,
      status: stageData.status,
      content: stageData.content,
      // Preserve original generatedAt timestamp if it exists
      generatedAt: existingStage?.generatedAt || stageData.generatedAt
    };
    if (stageData.status === "completed") {
      updatedStageData.completedAt = stageData.completedAt || (/* @__PURE__ */ new Date()).toISOString();
    } else if (existingStage?.completedAt) {
      updatedStageData.completedAt = existingStage.completedAt;
    }
    analysis.stages[stageNumber] = updatedStageData;
    if (!analysis.completedStages) {
      analysis.completedStages = [];
    }
    if (stageData.status === "completed") {
      if (!analysis.completedStages.includes(stageNumber)) {
        analysis.completedStages.push(stageNumber);
        analysis.completedStages.sort((a, b) => a - b);
      }
    } else if (stageData.status === "failed" || stageData.status === "pending") {
      analysis.completedStages = analysis.completedStages.filter((s) => s !== stageNumber);
    }
    const maxCompleted = analysis.completedStages.length > 0 ? Math.max(...analysis.completedStages) : 0;
    analysis.currentStage = Math.min(maxCompleted + 1, 6);
    this.analyses.set(userId, userAnalyses);
    return analysis;
  }
  async getAnalysisStages(userId, id) {
    const analysis = await this.getAnalysis(userId, id);
    if (!analysis) {
      return null;
    }
    return analysis.stages || {};
  }
};
var DbStorage = class {
  async listAnalyses(userId) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async getAnalysis(userId, id) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async createAnalysis(userId, record) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async deleteAnalysis(userId, id) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async updateAnalysisImprovements(userId, id, improvements) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async getAnalysisImprovements(userId, id) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async updateAnalysisStageData(userId, id, stageNumber, stageData) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
  async getAnalysisStages(userId, id) {
    throw new Error("DbStorage not implemented yet - use STORAGE=mem for now");
  }
};
function createStorage() {
  const storageType = process.env.STORAGE || "mem";
  switch (storageType) {
    case "mem":
      return new MemStorage();
    case "db":
      return new DbStorage();
    default:
      console.warn(`Unknown storage type: ${storageType}, defaulting to memory storage`);
      return new MemStorage();
  }
}
var minimalStorage = createStorage();

// server/middleware/rateLimit.ts
var hits = /* @__PURE__ */ new Map();
var cleanupInterval = null;
function createRateLimit(options = {}) {
  const windowMs = options.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || "300000");
  const max = options.max || parseInt(process.env.RATE_LIMIT_MAX || "20");
  const keyGenerator = options.keyGenerator || ((req) => {
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const userId = req.user?.id || "anonymous";
    return `${ip}:${userId}`;
  });
  if (!cleanupInterval) {
    cleanupInterval = setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      for (const [key, timestamps] of Array.from(hits.entries())) {
        const validTimestamps = timestamps.filter((timestamp2) => now - timestamp2 < windowMs);
        if (validTimestamps.length === 0) {
          hits.delete(key);
          cleanedCount++;
        } else if (validTimestamps.length < timestamps.length) {
          hits.set(key, validTimestamps);
        }
      }
      if (process.env.NODE_ENV === "development" && cleanedCount > 0) {
        console.log(`Rate limit cleanup: removed ${cleanedCount} expired entries`);
      }
    }, Math.min(windowMs / 4, 6e4));
  }
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const userHits = hits.get(key) || [];
    const validHits = userHits.filter((timestamp2) => now - timestamp2 < windowMs);
    if (validHits.length >= max) {
      const requestId = req.requestId || "unknown";
      return res.status(429).json({
        error: `Too many requests. Maximum ${max} requests allowed per ${Math.floor(windowMs / 1e3 / 60)} minutes.`,
        code: "RATE_LIMITED",
        requestId,
        retryAfter: Math.ceil(windowMs / 1e3)
      });
    }
    validHits.push(now);
    hits.set(key, validHits);
    if (options.skipSuccessfulRequests || options.skipFailedRequests) {
      const originalSend = res.send;
      res.send = function(body) {
        const shouldRemove = options.skipSuccessfulRequests && res.statusCode < 400 || options.skipFailedRequests && res.statusCode >= 400;
        if (shouldRemove) {
          const currentHits = hits.get(key) || [];
          const updatedHits = currentHits.filter((timestamp2) => timestamp2 !== now);
          hits.set(key, updatedHits);
        }
        return originalSend.call(this, body);
      };
    }
    next();
  };
}
var rateLimit = createRateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "300000"),
  // 5 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || "20"),
  // 20 requests per 5 minutes
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

// server/middleware/errorHandler.ts
var getErrorCode = (statusCode) => {
  switch (statusCode) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 422:
      return "VALIDATION_ERROR";
    case 429:
      return "RATE_LIMITED";
    case 500:
      return "INTERNAL";
    case 502:
      return "AI_PROVIDER_DOWN";
    case 503:
      return "SERVICE_UNAVAILABLE";
    case 504:
      return "GATEWAY_TIMEOUT";
    default:
      return "UNKNOWN";
  }
};
var getUserFriendlyMessage = (error, errorType) => {
  if (error instanceof AppError && error.userMessage) {
    return error.userMessage;
  }
  const message = error.message.toLowerCase();
  if (message.includes("timeout") || errorType === "TIMEOUT_ERROR" /* TIMEOUT */) {
    if (message.includes("first-party") || message.includes("extraction")) {
      return "Website content extraction timed out. Analysis will continue with available data.";
    }
    if (message.includes("improvement") || message.includes("business improvement")) {
      return "Business improvement generation timed out. Please try again.";
    }
    return "Request timed out. Please try again.";
  }
  if (message.includes("ai provider") || message.includes("gemini") || message.includes("openai") || message.includes("grok") || errorType === "AI_PROVIDER_ERROR" /* AI_PROVIDER */) {
    if (message.includes("api key")) {
      return "AI service configuration error. Please check your API keys.";
    }
    if (message.includes("rate limit")) {
      return "AI service rate limit exceeded. Please try again in a few minutes.";
    }
    return "AI service is temporarily unavailable. Please try again.";
  }
  if (message.includes("confidence") || errorType === "CONFIDENCE_VALIDATION_ERROR" /* CONFIDENCE_VALIDATION */) {
    return "Analysis confidence data is invalid. Results may be less accurate.";
  }
  if (message.includes("source") || errorType === "SOURCE_VALIDATION_ERROR" /* SOURCE_VALIDATION */) {
    return "Source attribution data is invalid. Analysis will continue without source links.";
  }
  if (message.includes("validation") || errorType === "VALIDATION_ERROR" /* VALIDATION */) {
    return "Invalid input data. Please check your request and try again.";
  }
  if (message.includes("first-party") || message.includes("extraction") || errorType === "FIRST_PARTY_EXTRACTION_ERROR" /* FIRST_PARTY_EXTRACTION */) {
    return "Unable to extract content from the target website. Analysis will continue with available data.";
  }
  if (message.includes("improvement") || errorType === "IMPROVEMENT_GENERATION_ERROR" /* IMPROVEMENT_GENERATION */) {
    return "Unable to generate business improvements. Please try again.";
  }
  if (message.includes("network") || message.includes("fetch") || message.includes("connection") || errorType === "NETWORK_ERROR" /* NETWORK */) {
    return "Network connection error. Please check your internet connection and try again.";
  }
  if (message.includes("rate limit") || errorType === "RATE_LIMIT_ERROR" /* RATE_LIMIT */) {
    return "Too many requests. Please wait a moment before trying again.";
  }
  if (message.includes("config") || message.includes("api key") || errorType === "CONFIG_ERROR" /* CONFIG */) {
    return "Service configuration error. Please contact support if this persists.";
  }
  return "An unexpected error occurred. Please try again.";
};
var AppError = class _AppError extends Error {
  statusCode;
  code;
  userMessage;
  errorType;
  details;
  retryable;
  constructor(message, statusCode = 500, code, userMessage, errorType, details, retryable = false) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || getErrorCode(statusCode);
    this.userMessage = userMessage;
    this.errorType = errorType;
    this.details = details;
    this.retryable = retryable;
    this.name = "AppError";
  }
  // Static factory methods for common error types
  static timeout(message, userMessage, details) {
    return new _AppError(
      message,
      504,
      "GATEWAY_TIMEOUT",
      userMessage || "Request timed out. Please try again.",
      "TIMEOUT_ERROR" /* TIMEOUT */,
      details,
      true
    );
  }
  static validation(message, userMessage, details) {
    return new _AppError(
      message,
      422,
      "VALIDATION_ERROR",
      userMessage || "Invalid input data. Please check your request and try again.",
      "VALIDATION_ERROR" /* VALIDATION */,
      details,
      false
    );
  }
  static aiProvider(message, userMessage, details) {
    return new _AppError(
      message,
      502,
      "AI_PROVIDER_DOWN",
      userMessage || "AI service is temporarily unavailable. Please try again.",
      "AI_PROVIDER_ERROR" /* AI_PROVIDER */,
      details,
      true
    );
  }
  static firstPartyExtraction(message, userMessage, details) {
    return new _AppError(
      message,
      503,
      "SERVICE_UNAVAILABLE",
      userMessage || "Unable to extract content from the target website. Analysis will continue with available data.",
      "FIRST_PARTY_EXTRACTION_ERROR" /* FIRST_PARTY_EXTRACTION */,
      details,
      true
    );
  }
  static improvementGeneration(message, userMessage, details) {
    return new _AppError(
      message,
      503,
      "SERVICE_UNAVAILABLE",
      userMessage || "Unable to generate business improvements. Please try again.",
      "IMPROVEMENT_GENERATION_ERROR" /* IMPROVEMENT_GENERATION */,
      details,
      true
    );
  }
  static confidenceValidation(message, userMessage, details) {
    return new _AppError(
      message,
      422,
      "VALIDATION_ERROR",
      userMessage || "Analysis confidence data is invalid. Results may be less accurate.",
      "CONFIDENCE_VALIDATION_ERROR" /* CONFIDENCE_VALIDATION */,
      details,
      false
    );
  }
  static sourceValidation(message, userMessage, details) {
    return new _AppError(
      message,
      422,
      "VALIDATION_ERROR",
      userMessage || "Source attribution data is invalid. Analysis will continue without source links.",
      "SOURCE_VALIDATION_ERROR" /* SOURCE_VALIDATION */,
      details,
      false
    );
  }
};
var errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  let statusCode = 500;
  let errorCode = "INTERNAL";
  let message = "Internal server error";
  let userMessage = "An unexpected error occurred. Please try again.";
  let details = void 0;
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code || getErrorCode(statusCode);
    message = err.message;
    userMessage = err.userMessage || getUserFriendlyMessage(err, err.errorType);
    details = err.details;
  } else if (err.name === "ValidationError" || err.name === "ZodError") {
    statusCode = 422;
    errorCode = "VALIDATION_ERROR";
    message = err.message;
    userMessage = "Invalid input data. Please check your request and try again.";
  } else if (err.message.includes("timeout") || err.message.includes("TIMEOUT")) {
    statusCode = 504;
    errorCode = "GATEWAY_TIMEOUT";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "TIMEOUT_ERROR" /* TIMEOUT */);
  } else if (err.message.includes("rate limit") || err.message.includes("RATE_LIMITED")) {
    statusCode = 429;
    errorCode = "RATE_LIMITED";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "RATE_LIMIT_ERROR" /* RATE_LIMIT */);
  } else if (err.message.includes("AI provider") || err.message.includes("gemini") || err.message.includes("openai") || err.message.includes("grok")) {
    statusCode = 502;
    errorCode = "AI_PROVIDER_DOWN";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "AI_PROVIDER_ERROR" /* AI_PROVIDER */);
  } else if (err.message.includes("first-party") || err.message.includes("extraction")) {
    statusCode = 503;
    errorCode = "SERVICE_UNAVAILABLE";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "FIRST_PARTY_EXTRACTION_ERROR" /* FIRST_PARTY_EXTRACTION */);
  } else if (err.message.includes("improvement") || err.message.includes("business improvement")) {
    statusCode = 503;
    errorCode = "SERVICE_UNAVAILABLE";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "IMPROVEMENT_GENERATION_ERROR" /* IMPROVEMENT_GENERATION */);
  } else if (err.message.includes("confidence")) {
    statusCode = 422;
    errorCode = "VALIDATION_ERROR";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "CONFIDENCE_VALIDATION_ERROR" /* CONFIDENCE_VALIDATION */);
  } else if (err.message.includes("source")) {
    statusCode = 422;
    errorCode = "VALIDATION_ERROR";
    message = err.message;
    userMessage = getUserFriendlyMessage(err, "SOURCE_VALIDATION_ERROR" /* SOURCE_VALIDATION */);
  } else {
    console.error("Unhandled error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      url: req.url,
      method: req.method,
      userId: req.userId
    });
    message = "Internal server error";
    userMessage = "An unexpected error occurred. Please try again.";
  }
  const requestId = req.requestId || "unknown";
  const errorResponse = {
    error: userMessage,
    // Use user-friendly message for client
    code: errorCode,
    requestId,
    ...process.env.NODE_ENV === "development" && { details: message }
    // Include technical details in development
  };
  console.error(`Error ${errorCode} (${statusCode}):`, {
    requestId,
    message,
    userMessage,
    url: req.url,
    method: req.method,
    userId: req.userId,
    stack: err.stack
  });
  res.status(statusCode).json(errorResponse);
};

// server/routes/healthz.ts
function healthzHandler(req, res) {
  const storageMode = minimalStorage.constructor.name === "MemStorage" ? "mem" : "db";
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY
  };
  const env = process.env.NODE_ENV || "development";
  const commit = process.env.COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || process.env.RAILWAY_GIT_COMMIT_SHA;
  const version = process.env.npm_package_version;
  const healthResponse = {
    ok: true,
    env,
    storage: storageMode,
    providers
  };
  if (commit) {
    healthResponse.commit = commit;
  }
  if (version) {
    healthResponse.version = version;
  }
  res.json(healthResponse);
}

// server/routes.ts
init_schema();

// server/services/ai-providers.ts
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
var AIProviderService = class {
  constructor(apiKey, provider, timeoutMs = 15e3) {
    this.apiKey = apiKey;
    this.provider = provider;
    this.timeoutMs = timeoutMs;
    this.initializeClient();
  }
  openaiClient = null;
  geminiClient = null;
  grokClient = null;
  timeoutMs;
  initializeClient() {
    const clientOptions = {
      timeout: this.timeoutMs,
      maxRetries: 1
      // Reduce retries to fail faster
    };
    switch (this.provider) {
      case "openai":
        this.openaiClient = new OpenAI({
          apiKey: this.apiKey,
          ...clientOptions
        });
        break;
      case "gpt5":
        this.openaiClient = new OpenAI({
          apiKey: this.apiKey,
          ...clientOptions
        });
        break;
      case "gemini":
        this.geminiClient = new GoogleGenerativeAI(this.apiKey);
        break;
      case "grok":
        this.grokClient = new OpenAI({
          baseURL: "https://api.x.ai/v1",
          apiKey: this.apiKey,
          ...clientOptions
        });
        break;
    }
  }
  async generateContent(prompt, systemPrompt) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI provider ${this.provider} timeout after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });
      const contentPromise = (async () => {
        switch (this.provider) {
          case "openai":
            return await this.generateOpenAIContent(prompt, systemPrompt);
          case "gpt5":
            return await this.generateGPT5Content(prompt, systemPrompt);
          case "gemini":
            return await this.generateGeminiContent(prompt, systemPrompt);
          case "grok":
            return await this.generateGrokContent(prompt, systemPrompt);
          default:
            throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
      })();
      return await Promise.race([contentPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error(`AI provider ${this.provider} request timeout after ${this.timeoutMs}ms`);
      }
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async generateStructuredContent(prompt, schema, systemPrompt) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI provider ${this.provider} structured content timeout after ${this.timeoutMs}ms`));
        }, this.timeoutMs);
      });
      const contentPromise = (async () => {
        switch (this.provider) {
          case "openai":
            return await this.generateOpenAIStructuredContent(prompt, schema, systemPrompt);
          case "gpt5":
            return await this.generateGPT5StructuredContent(prompt, schema, systemPrompt);
          case "gemini":
            return await this.generateGeminiStructuredContent(prompt, schema, systemPrompt);
          case "grok":
            return await this.generateGrokStructuredContent(prompt, schema, systemPrompt);
          default:
            throw new Error(`Unsupported AI provider: ${this.provider}`);
        }
      })();
      return await Promise.race([contentPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message.includes("timeout")) {
        throw new Error(`AI provider ${this.provider} structured content timeout after ${this.timeoutMs}ms`);
      }
      throw new Error(`Structured AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  async generateOpenAIContent(prompt, systemPrompt) {
    if (!this.openaiClient) throw new Error("OpenAI client not initialized");
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages
    });
    const aiResponse = {
      content: response.choices[0]?.message?.content || ""
    };
    if (response.usage) {
      aiResponse.usage = {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      };
    }
    return aiResponse;
  }
  async generateOpenAIStructuredContent(prompt, schema, systemPrompt) {
    if (!this.openaiClient) throw new Error("OpenAI client not initialized");
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  }
  async generateGPT5Content(prompt, systemPrompt) {
    if (!this.openaiClient) throw new Error("OpenAI client not initialized");
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-5-preview",
      // GPT-5 preview model
      messages
    });
    const aiResponse = {
      content: response.choices[0]?.message?.content || ""
    };
    if (response.usage) {
      aiResponse.usage = {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      };
    }
    return aiResponse;
  }
  async generateGPT5StructuredContent(prompt, schema, systemPrompt) {
    if (!this.openaiClient) throw new Error("OpenAI client not initialized");
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const response = await this.openaiClient.chat.completions.create({
      model: "gpt-5-preview",
      messages,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  }
  async generateGeminiContent(prompt, systemPrompt) {
    if (!this.geminiClient) throw new Error("Gemini client not initialized");
    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-pro" });
      const fullPrompt = systemPrompt ? `${systemPrompt}

${prompt}` : prompt;
      console.log(`Gemini API request starting (timeout: ${this.timeoutMs}ms)...`);
      const startTime = Date.now();
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const elapsedTime = Date.now() - startTime;
      console.log(`Gemini API request completed in ${elapsedTime}ms`);
      const aiResponse = {
        content: response.text() || ""
      };
      return aiResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Gemini API error: ${errorMessage}`);
      if (errorMessage.includes("API key")) {
        throw new Error(`Gemini API key error: ${errorMessage}`);
      }
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        throw new Error(`Gemini API quota exceeded: ${errorMessage}`);
      }
      if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
        throw new Error(`Gemini API timeout: Request took too long to complete`);
      }
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }
  async generateGeminiStructuredContent(prompt, schema, systemPrompt) {
    if (!this.geminiClient) throw new Error("Gemini client not initialized");
    try {
      console.log(`Gemini structured API request starting (timeout: ${this.timeoutMs}ms)...`);
      const startTime = Date.now();
      const model = this.geminiClient.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: {
          responseMimeType: "application/json"
        }
      });
      const fullPrompt = systemPrompt ? `${systemPrompt}

${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const elapsedTime = Date.now() - startTime;
      console.log(`Gemini structured API request completed in ${elapsedTime}ms`);
      const content = response.text();
      return content ? JSON.parse(content) : null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      const errorStack = error instanceof Error ? error.stack : "";
      console.error(`Gemini structured API error: ${errorMessage}`);
      if (errorStack) {
        console.error(`Error stack: ${errorStack}`);
      }
      if (errorMessage.includes("API key") || errorMessage.includes("API_KEY")) {
        throw new Error(`Gemini API key error: ${errorMessage}`);
      }
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        throw new Error(`Gemini API quota exceeded: ${errorMessage}`);
      }
      if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT") || errorMessage.includes("DEADLINE_EXCEEDED")) {
        throw new Error(`Gemini API timeout: Request took too long to complete`);
      }
      if (errorMessage.includes("INVALID_ARGUMENT") || errorMessage.includes("schema")) {
        throw new Error(`Gemini schema error: ${errorMessage}`);
      }
      if (errorMessage.includes("SAFETY") || errorMessage.includes("blocked")) {
        throw new Error(`Gemini safety filter triggered: ${errorMessage}`);
      }
      throw new Error(`Gemini structured content error: ${errorMessage}`);
    }
  }
  async generateGrokContent(prompt, systemPrompt) {
    if (!this.grokClient) throw new Error("Grok client not initialized");
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });
    const response = await this.grokClient.chat.completions.create({
      model: "grok-4-fast-reasoning",
      messages
    });
    const aiResponse = {
      content: response.choices[0]?.message?.content || ""
    };
    if (response.usage) {
      aiResponse.usage = {
        prompt_tokens: response.usage.prompt_tokens,
        completion_tokens: response.usage.completion_tokens,
        total_tokens: response.usage.total_tokens
      };
    }
    return aiResponse;
  }
  async generateGrokStructuredContent(prompt, schema, systemPrompt) {
    if (!this.grokClient) throw new Error("Grok client not initialized");
    try {
      const messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });
      console.log(`Grok structured API request starting (timeout: ${this.timeoutMs}ms)...`);
      const startTime = Date.now();
      const response = await this.grokClient.chat.completions.create({
        model: "grok-4-fast-reasoning",
        messages,
        response_format: { type: "json_object" }
      });
      const elapsedTime = Date.now() - startTime;
      console.log(`Grok structured API request completed in ${elapsedTime}ms`);
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Grok returned empty content");
      }
      console.log("Grok response preview:", content.substring(0, 200));
      if (content.trim().startsWith("<") || content.includes("<!DOCTYPE")) {
        console.error("Grok returned HTML instead of JSON:", content.substring(0, 500));
        throw new Error("Grok API returned HTML instead of JSON. This may indicate an API error or invalid API key.");
      }
      return JSON.parse(content);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Grok structured content error: ${errorMessage}`);
      if (errorMessage.includes("API key") || errorMessage.includes("API_KEY") || errorMessage.includes("Unauthorized")) {
        throw new Error(`Grok API key error: ${errorMessage}`);
      }
      if (errorMessage.includes("quota") || errorMessage.includes("rate limit")) {
        throw new Error(`Grok API quota exceeded: ${errorMessage}`);
      }
      if (errorMessage.includes("timeout") || errorMessage.includes("ETIMEDOUT")) {
        throw new Error(`Grok API timeout: ${errorMessage}`);
      }
      if (errorMessage.includes("HTML")) {
        throw new Error(`Grok API error: ${errorMessage}`);
      }
      throw new Error(`Grok structured content error: ${errorMessage}`);
    }
  }
  async testConnection() {
    try {
      const response = await this.generateContent("Test connection. Respond with 'OK'.");
      return response.content.includes("OK");
    } catch (error) {
      return false;
    }
  }
  /**
   * Creates an enhanced system prompt that eliminates hedging language and requires evidence-based analysis
   */
  createEvidenceBasedSystemPrompt() {
    return `You are a business analyst who provides evidence-based analysis without hedging language.

CRITICAL REQUIREMENTS:
- Make definitive statements only when you have concrete evidence
- Use "unknown" instead of guessing or speculating
- Include confidence scores (0-1) for technical claims
- Provide source URLs and excerpts for all factual claims
- Never use hedging language like "could", "possibly", "appears to", "seems like"
- If you cannot find evidence for a claim, do not include that claim

CONFIDENCE SCORING:
- Only provide confidence scores for technical stack claims
- 0.8-1.0: Direct evidence (visible in code, explicit mentions)
- 0.6-0.79: Strong indicators (job postings, documentation patterns)
- 0.4-0.59: Moderate indicators (common patterns, indirect evidence)
- 0.0-0.39: Weak indicators (speculation based on limited evidence)

SOURCE ATTRIBUTION:
- Every factual claim must include a source URL and 10-300 character excerpt
- Sources must be real, accessible URLs
- Excerpts must be direct quotes from the source
- If no source exists, state "unknown" instead of making the claim

Respond only with valid JSON in the exact format requested.`;
  }
  /**
   * Creates an enhanced analysis prompt with first-party context integration
   */
  createEnhancedAnalysisPrompt(url, firstPartyData) {
    const contextSection = firstPartyData ? `
FIRST-PARTY WEBSITE CONTEXT:
- Title: ${firstPartyData.title}
- Description: ${firstPartyData.description}
- Main Heading: ${firstPartyData.h1}
- Content Sample: ${firstPartyData.textSnippet}
- Source URL: ${firstPartyData.url}

Use this actual website content as the primary source for your analysis. Anchor all insights to what is actually present on the site.` : `
FIRST-PARTY CONTEXT: SITE CONTEXT unavailable - analysis will be limited to general knowledge.`;
    return `Analyze this business URL and provide a structured JSON response with evidence-based analysis.

${contextSection}

TARGET URL: ${url}

Provide analysis in this exact JSON format:

{
  "overview": {
    "valueProposition": "Definitive statement based on actual site content",
    "targetAudience": "Specific audience based on site evidence",
    "monetization": "Concrete monetization model or 'unknown' if not evident"
  },
  "market": {
    "competitors": [
      {"name": "Competitor name", "url": "competitor URL", "notes": "relationship notes"}
    ],
    "swot": {
      "strengths": ["evidence-based strength 1", "evidence-based strength 2"],
      "weaknesses": ["observable weakness 1", "observable weakness 2"],
      "opportunities": ["market opportunity 1", "market opportunity 2"],
      "threats": ["competitive threat 1", "competitive threat 2"]
    }
  },
  "technical": {
    "techStack": ["technology 1", "technology 2"],
    "confidence": 0.85,
    "uiColors": ["#color1", "#color2"],
    "keyPages": ["/page1", "/page2"]
  },
  "data": {
    "trafficEstimates": {
      "value": "specific estimate or 'unknown'",
      "source": "https://source-url.com"
    },
    "keyMetrics": [
      {
        "name": "metric name",
        "value": "specific value or 'unknown'",
        "source": "https://source-url.com",
        "asOf": "date if available"
      }
    ]
  },
  "synthesis": {
    "summary": "Evidence-based 100-150 word summary without hedging language",
    "keyInsights": ["definitive insight 1", "definitive insight 2", "definitive insight 3"],
    "nextActions": ["specific action 1", "specific action 2", "specific action 3"]
  },
  "sources": [
    {
      "url": "https://source-url.com",
      "excerpt": "Direct quote from source (10-300 characters)"
    }
  ]
}

REQUIREMENTS:
- Include confidence score only for technical stack claims (0-1 range)
- All data claims must include source URLs
- Use "unknown" for any information not directly observable
- Include the target site as a source for claims made about it
- No hedging language - make definitive statements or use "unknown"
- Sources array must contain real URLs with actual excerpts

Respond ONLY with valid JSON. Do not include any text before or after the JSON.`;
  }
  /**
   * Creates a business improvement generation prompt
   */
  createImprovementPrompt(analysis, goal) {
    const goalSection = goal ? `
IMPROVEMENT GOAL: ${goal}` : "";
    return `Based on this business analysis, generate 3 distinct improvement angles and a 7-day shipping plan.

BUSINESS ANALYSIS:
${JSON.stringify(analysis, null, 2)}${goalSection}

Generate improvements focused on:
- Lean scope and quick validation
- measurable KPIs
- Competitive differentiation
- User experience enhancements

Provide response in this exact JSON format:

{
  "twists": [
    "Improvement angle 1: Specific, actionable business twist",
    "Improvement angle 2: Different approach or market angle", 
    "Improvement angle 3: Technical or operational improvement"
  ],
  "sevenDayPlan": [
    {
      "day": 1,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 2,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 3,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 4,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 5,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 6,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "day": 7,
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ]
}

REQUIREMENTS:
- Each day must have exactly 3 tasks maximum
- Tasks should be specific and actionable
- Focus on shipping a working prototype quickly
- Include validation and measurement tasks
- Build incrementally from day 1 to day 7

Respond ONLY with valid JSON.`;
  }
};

// server/lib/fetchFirstParty.ts
import * as cheerio from "cheerio";
async function fetchFirstParty(url, timeoutMs = 1e4) {
  const startTime = Date.now();
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      console.error(`Unsupported protocol for ${url}: ${parsedUrl.protocol}`);
      return null;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    try {
      const fetchOptions = {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; VentureClone/1.0)",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Cache-Control": "max-age=300"
          // Allow 5-minute cache for performance
        },
        redirect: "follow",
        signal: controller.signal
      };
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      if (!response.ok) {
        const elapsed = Date.now() - startTime;
        console.error(`HTTP error fetching ${url}: ${response.status} ${response.statusText} (${elapsed}ms)`);
        if (response.status >= 400 && response.status < 500) {
          console.error(`Client error (${response.status}): Target site may be blocking requests or URL may be invalid`);
        } else if (response.status >= 500) {
          console.error(`Server error (${response.status}): Target site may be experiencing issues`);
        }
        return null;
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("text/html")) {
        console.error(`Non-HTML content type for ${url}: ${contentType}`);
        return null;
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }
      let html = "";
      let totalSize = 0;
      const maxSize = 2 * 1024 * 1024;
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalSize += value.length;
          if (totalSize > maxSize) {
            console.warn(`HTML content too large for ${url}, truncating at ${maxSize} bytes`);
            break;
          }
          html += decoder.decode(value, { stream: true });
          if (html.includes("</head>") && html.length > 5e4) {
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }
      const $ = cheerio.load(html, {
        xmlMode: false,
        decodeEntities: false,
        // Faster parsing
        lowerCaseAttributeNames: false
      });
      let title = $("title").first().text().trim();
      if (!title) {
        title = $("h1").first().text().trim();
      }
      if (!title) {
        title = "Untitled";
      }
      let description = $('meta[name="description"]').attr("content") || $('meta[property="og:description"]').attr("content") || $('meta[name="twitter:description"]').attr("content") || "";
      description = description.trim();
      if (!description) {
        const firstP = $("p").first().text().trim();
        if (firstP && firstP.length > 20) {
          description = firstP.substring(0, 200) + (firstP.length > 200 ? "..." : "");
        }
      }
      let h1 = $("h1").first().text().trim();
      if (!h1) {
        h1 = title;
      }
      let textSnippet = "";
      $("script, style, nav, header, footer, aside, noscript, iframe").remove();
      const contentSelectors = [
        "main",
        '[role="main"]',
        ".main-content",
        ".content",
        "article",
        ".post-content",
        ".entry-content",
        ".article-content"
      ];
      let mainContent;
      for (const selector of contentSelectors) {
        mainContent = $(selector).first();
        if (mainContent.length > 0) break;
      }
      if (mainContent && mainContent.length > 0) {
        textSnippet = mainContent.text();
      } else {
        const paragraphs = $("p").slice(0, 5);
        textSnippet = paragraphs.map((_, el) => $(el).text()).get().join(" ");
        if (!textSnippet) {
          const bodyText = $("body").text();
          textSnippet = bodyText.substring(0, 1e3);
        }
      }
      textSnippet = textSnippet.replace(/\s+/g, " ").trim().substring(0, 500);
      if (!textSnippet || textSnippet.length < 10) {
        textSnippet = description || title || "No content available";
      }
      return {
        title: title.substring(0, 200),
        // Limit title length
        description: description.substring(0, 300),
        // Limit description length
        h1: h1.substring(0, 200),
        // Limit H1 length
        textSnippet,
        url: parsedUrl.href
        // Use the parsed URL to ensure it's properly formatted
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          console.error(`Timeout fetching ${url}: Request aborted after ${elapsed}ms (limit: ${timeoutMs}ms)`);
        } else if (fetchError.message.includes("network") || fetchError.message.includes("fetch")) {
          console.error(`Network error fetching ${url} (${elapsed}ms):`, fetchError.message);
        } else {
          console.error(`Fetch error for ${url} (${elapsed}ms):`, fetchError.message);
        }
      } else {
        console.error(`Unknown fetch error for ${url} (${elapsed}ms):`, fetchError);
      }
      return null;
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    if (error instanceof Error) {
      if (error.message.includes("Invalid URL")) {
        console.error(`Invalid URL format: ${url}`);
      } else {
        console.error(`Error processing URL ${url} (${elapsed}ms):`, error.message);
      }
    } else {
      console.error(`Unknown error processing URL ${url} (${elapsed}ms):`, error);
    }
    return null;
  }
}
async function validateUrl(url, timeoutMs = 5e3) {
  const startTime = Date.now();
  try {
    const parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      console.warn(`URL validation failed: Unsupported protocol ${parsedUrl.protocol} for ${url}`);
      return false;
    }
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        const elapsed = Date.now() - startTime;
        reject(new Error(`URL validation timeout after ${elapsed}ms (limit: ${timeoutMs}ms)`));
      }, timeoutMs);
    });
    try {
      const fetchPromise = fetch(url, {
        method: "HEAD",
        // Use HEAD to avoid downloading content
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "*/*",
          "Cache-Control": "no-cache"
        },
        redirect: "follow",
        signal: AbortSignal.timeout(timeoutMs - 500)
        // Leave buffer for processing
      });
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      const elapsed = Date.now() - startTime;
      if (response.ok) {
        console.log(`URL validation successful for ${url} (${elapsed}ms)`);
        return true;
      } else {
        console.warn(`URL validation failed for ${url}: ${response.status} ${response.statusText} (${elapsed}ms)`);
        return false;
      }
    } catch (fetchError) {
      const elapsed = Date.now() - startTime;
      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError" || fetchError.message.includes("timeout")) {
          console.warn(`URL validation timeout for ${url} (${elapsed}ms)`);
        } else {
          console.warn(`URL validation network error for ${url} (${elapsed}ms):`, fetchError.message);
        }
      }
      return false;
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid URL")) {
      console.warn(`URL validation failed: Invalid URL format for ${url}`);
    } else {
      console.warn(`URL validation error for ${url}:`, error);
    }
    return false;
  }
}
async function fetchFirstPartyWithRetry(url, options = {}) {
  const {
    timeoutMs = 1e4,
    validateFirst = false,
    retryCount = 1,
    retryDelayMs = 1e3
  } = options;
  const startTime = Date.now();
  let attempts = 0;
  let lastError = null;
  if (validateFirst) {
    const isValid = await validateUrl(url, Math.min(5e3, timeoutMs / 2));
    if (!isValid) {
      return {
        success: false,
        error: {
          type: "VALIDATION",
          message: "URL is not accessible or returns non-success status",
          retryable: true
        },
        metadata: {
          url,
          elapsedMs: Date.now() - startTime,
          attempts: 0
        }
      };
    }
  }
  for (let attempt = 0; attempt <= retryCount; attempt++) {
    attempts++;
    try {
      const data = await fetchFirstParty(url, timeoutMs);
      if (data) {
        return {
          success: true,
          data,
          metadata: {
            url,
            elapsedMs: Date.now() - startTime,
            attempts
          }
        };
      } else {
        lastError = new Error("First-party extraction returned null");
      }
    } catch (error) {
      lastError = error;
      if (error instanceof Error) {
        if (error.message.includes("Invalid URL") || error.message.includes("Unsupported protocol")) {
          break;
        }
      }
    }
    if (attempt < retryCount) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  let errorType = "UNKNOWN";
  let retryable = true;
  if (lastError instanceof Error) {
    const message = lastError.message.toLowerCase();
    if (message.includes("timeout")) {
      errorType = "TIMEOUT";
      retryable = true;
    } else if (message.includes("network") || message.includes("fetch") || message.includes("connection")) {
      errorType = "NETWORK";
      retryable = true;
    } else if (message.includes("invalid url") || message.includes("protocol")) {
      errorType = "VALIDATION";
      retryable = false;
    } else if (message.includes("parsing") || message.includes("html")) {
      errorType = "PARSING";
      retryable = true;
    }
  }
  return {
    success: false,
    error: {
      type: errorType,
      message: lastError?.message || "Unknown error during first-party extraction",
      retryable
    },
    metadata: {
      url,
      elapsedMs: Date.now() - startTime,
      attempts
    }
  };
}

// server/lib/validation.ts
init_schema();
import { z as z2 } from "zod";
var ValidationService = class {
  /**
   * Validates confidence score is within 0-1 range
   * Requirement 1.1: Confidence score between 0 and 1
   */
  static validateConfidenceScore(confidence) {
    if (confidence === void 0 || confidence === null) {
      return void 0;
    }
    if (typeof confidence !== "number") {
      throw new Error(`Invalid confidence score type: expected number, got ${typeof confidence}`);
    }
    if (isNaN(confidence)) {
      throw new Error("Confidence score cannot be NaN");
    }
    if (confidence < 0 || confidence > 1) {
      throw new Error(`Confidence score must be between 0 and 1, got ${confidence}`);
    }
    return confidence;
  }
  /**
   * Validates source URL and excerpt according to schema requirements
   * Requirement 1.6: Sources include URL and 10-300 character excerpt
   */
  static validateSource(source) {
    try {
      return zSource.parse(source);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        const issues = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join(", ");
        throw new Error(`Invalid source format: ${issues}`);
      }
      throw new Error(`Source validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Validates array of sources
   * Requirement 1.3: Source URLs and excerpts for claims
   */
  static validateSources(sources) {
    if (!Array.isArray(sources)) {
      throw new Error(`Sources must be an array, got ${typeof sources}`);
    }
    return sources.map((source, index) => {
      try {
        return this.validateSource(source);
      } catch (error) {
        throw new Error(`Source at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }
  /**
   * Automatically adds target site as first-party source if not already present
   * Requirement 1.6: Target site included as source for claims
   */
  static addTargetSiteAsSource(sources, targetUrl, firstPartyData) {
    const targetDomain = new URL(targetUrl).origin;
    const hasTargetSource = sources.some((source) => {
      try {
        const sourceDomain = new URL(source.url).origin;
        return sourceDomain === targetDomain;
      } catch {
        return false;
      }
    });
    if (!hasTargetSource && firstPartyData) {
      const excerpt = this.createFirstPartyExcerpt(firstPartyData);
      if (excerpt.length >= 10 && excerpt.length <= 300) {
        sources.unshift({
          url: targetUrl,
          excerpt
        });
      }
    }
    return sources;
  }
  /**
   * Creates an excerpt from first-party data for source attribution
   */
  static createFirstPartyExcerpt(firstPartyData) {
    const candidates = [
      firstPartyData.description,
      firstPartyData.h1,
      firstPartyData.title,
      firstPartyData.textSnippet
    ].filter((text2) => text2 && text2.trim().length > 0);
    for (const candidate of candidates) {
      const trimmed = candidate.trim();
      if (trimmed.length >= 10 && trimmed.length <= 300) {
        return trimmed;
      }
      if (trimmed.length > 300) {
        return trimmed.substring(0, 297) + "...";
      }
    }
    return "";
  }
  /**
   * Validates and sanitizes enhanced structured analysis response
   * Implements comprehensive validation for confidence scores and sources
   */
  static validateEnhancedAnalysis(rawAnalysis, targetUrl, firstPartyData) {
    if (!rawAnalysis || typeof rawAnalysis !== "object") {
      throw new Error("Analysis must be an object");
    }
    const analysis = rawAnalysis;
    if (analysis.technical?.confidence !== void 0) {
      try {
        analysis.technical.confidence = this.validateConfidenceScore(analysis.technical.confidence);
      } catch (error) {
        console.warn(`Confidence score validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        delete analysis.technical.confidence;
      }
    }
    if (analysis.data?.trafficEstimates?.source) {
      try {
        new URL(analysis.data.trafficEstimates.source);
      } catch (error) {
        console.warn(`Invalid traffic estimates source URL: ${analysis.data.trafficEstimates.source}`);
        delete analysis.data.trafficEstimates.source;
      }
    }
    if (analysis.data?.keyMetrics) {
      analysis.data.keyMetrics = analysis.data.keyMetrics.map((metric, index) => {
        if (metric.source) {
          try {
            new URL(metric.source);
          } catch (error) {
            console.warn(`Invalid key metric source URL at index ${index}: ${metric.source}`);
            delete metric.source;
          }
        }
        return metric;
      });
    }
    if (analysis.sources) {
      try {
        analysis.sources = this.validateSources(analysis.sources);
      } catch (error) {
        console.warn(`Sources validation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        analysis.sources = [];
      }
    } else {
      analysis.sources = [];
    }
    analysis.sources = this.addTargetSiteAsSource(analysis.sources, targetUrl, firstPartyData);
    return analysis;
  }
  /**
   * Checks if confidence score indicates speculative analysis
   * Requirement 1.2: Display "Speculative" badge when confidence < 0.6
   */
  static isSpeculative(confidence) {
    return confidence !== void 0 && confidence < 0.6;
  }
  /**
   * Normalizes URL by auto-prepending https:// if no protocol is present
   * Requirement 9.1, 9.2, 9.3: Accept URLs with or without protocol
   */
  static normalizeUrl(url) {
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }
  /**
   * Sanitizes URL to prevent XSS attacks
   */
  static sanitizeUrl(url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error(`Unsupported protocol: ${parsed.protocol}`);
      }
      return parsed.toString();
    } catch (error) {
      throw new Error(`Invalid URL: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  /**
   * Sanitizes excerpt text to prevent injection attacks
   */
  static sanitizeExcerpt(excerpt) {
    if (typeof excerpt !== "string") {
      throw new Error("Excerpt must be a string");
    }
    return excerpt.replace(/[<>'"&]/g, "").replace(/\s+/g, " ").trim().substring(0, 300);
  }
  /**
   * Validates API input parameters for analysis requests
   * Requirements 9.4, 9.5: Use normalized URL and provide clear error messages
   */
  static validateAnalysisRequest(body) {
    if (!body || typeof body !== "object") {
      throw new Error("Request body must be an object");
    }
    if (body.url === void 0 || body.url === null) {
      throw new Error("URL is required");
    }
    if (typeof body.url !== "string") {
      throw new Error("URL must be a string");
    }
    const trimmedUrl = body.url.trim();
    if (trimmedUrl.length === 0) {
      throw new Error("URL cannot be empty");
    }
    const normalizedUrl = this.normalizeUrl(trimmedUrl);
    let sanitizedUrl;
    try {
      sanitizedUrl = this.sanitizeUrl(normalizedUrl);
    } catch (error) {
      throw new Error(
        `Invalid URL format. Please enter a valid website URL (e.g., example.com or https://example.com). ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
    if (body.goal !== void 0) {
      if (typeof body.goal !== "string") {
        throw new Error("Goal must be a string if provided");
      }
      const trimmedGoal = body.goal.trim();
      if (trimmedGoal.length === 0) {
        throw new Error("Goal cannot be empty if provided");
      }
      if (trimmedGoal.length > 500) {
        throw new Error("Goal cannot exceed 500 characters");
      }
      return { url: sanitizedUrl, goal: trimmedGoal };
    }
    return { url: sanitizedUrl };
  }
  /**
   * Validates improvement request parameters
   */
  static validateImprovementRequest(body) {
    if (!body || typeof body !== "object") {
      return {};
    }
    if (body.goal !== void 0) {
      if (typeof body.goal !== "string") {
        throw new Error("Goal must be a string if provided");
      }
      const trimmedGoal = body.goal.trim();
      if (trimmedGoal.length === 0) {
        throw new Error("Goal cannot be empty if provided");
      }
      if (trimmedGoal.length > 500) {
        throw new Error("Goal cannot exceed 500 characters");
      }
      const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /eval\s*\(/i
      ];
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(trimmedGoal)) {
          throw new Error("Goal contains potentially harmful content");
        }
      }
      return { goal: trimmedGoal };
    }
    return {};
  }
  /**
   * Validates analysis ID parameter
   */
  static validateAnalysisId(id) {
    if (id === null || id === void 0) {
      throw new Error("Analysis ID is required");
    }
    if (typeof id !== "string") {
      throw new Error("Analysis ID must be a string");
    }
    const trimmedId = id.trim();
    if (trimmedId.length === 0) {
      throw new Error("Analysis ID cannot be empty");
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
      throw new Error("Analysis ID must be a valid UUID");
    }
    return trimmedId;
  }
  /**
   * Validates timeout values
   */
  static validateTimeout(timeoutMs, min = 1e3, max = 6e4) {
    if (typeof timeoutMs !== "number" || isNaN(timeoutMs)) {
      throw new Error("Timeout must be a valid number");
    }
    if (timeoutMs < min) {
      throw new Error(`Timeout must be at least ${min}ms`);
    }
    if (timeoutMs > max) {
      throw new Error(`Timeout cannot exceed ${max}ms`);
    }
    return Math.floor(timeoutMs);
  }
  /**
   * Validates and sanitizes first-party data
   */
  static validateFirstPartyData(data) {
    if (!data || typeof data !== "object") {
      return null;
    }
    try {
      const validated = {
        title: this.sanitizeText(data.title, 200, "Untitled"),
        description: this.sanitizeText(data.description, 300, ""),
        h1: this.sanitizeText(data.h1, 200, ""),
        textSnippet: this.sanitizeText(data.textSnippet, 500, ""),
        url: this.sanitizeUrl(data.url)
      };
      return validated;
    } catch (error) {
      console.warn("First-party data validation failed:", error);
      return null;
    }
  }
  /**
   * Sanitizes text fields with length limits and fallbacks
   */
  static sanitizeText(text2, maxLength, fallback = "") {
    if (typeof text2 !== "string") {
      return fallback;
    }
    return text2.replace(/[<>'"&]/g, "").replace(/\s+/g, " ").trim().substring(0, maxLength) || fallback;
  }
  /**
   * Creates a comprehensive validation error with details
   */
  static createValidationError(field, message, value) {
    const error = new Error(`Validation failed for ${field}: ${message}`);
    error.name = "ValidationError";
    error.field = field;
    error.value = value;
    return error;
  }
};

// server/services/business-improvement.ts
var BusinessImprovementService = class {
  constructor(aiProvider, options = {}) {
    this.aiProvider = aiProvider;
    this.timeoutMs = options.timeoutMs || 3e4;
  }
  timeoutMs;
  /**
   * Generates business improvement suggestions based on analysis
   * Requirements: 3.2, 3.3, 3.4, 5.3
   */
  async generateImprovement(analysis, goal) {
    const startTime = Date.now();
    try {
      this.validateInputAnalysis(analysis);
      if (goal !== void 0) {
        this.validateGoal(goal);
      }
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          const elapsed2 = Date.now() - startTime;
          reject(new Error(`Business improvement generation timeout after ${elapsed2}ms (limit: ${this.timeoutMs}ms)`));
        }, this.timeoutMs);
      });
      const improvementPromise = this.generateImprovementContent(analysis, goal);
      const result = await Promise.race([improvementPromise, timeoutPromise]);
      this.validateImprovement(result);
      const elapsed = Date.now() - startTime;
      console.log(`Business improvement generation completed in ${elapsed}ms`);
      return {
        ...result,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`Business improvement generation failed after ${elapsed}ms:`, error);
      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          throw new Error(`Business improvement generation failed: Request timeout after ${elapsed}ms (limit: ${this.timeoutMs}ms)`);
        }
        if (error.message.includes("validation")) {
          throw new Error(`Business improvement generation failed: ${error.message}`);
        }
        if (error.message.includes("AI generation")) {
          throw new Error(`Business improvement generation failed: AI service error - ${error.message}`);
        }
        if (error.message.includes("network") || error.message.includes("fetch")) {
          throw new Error(`Business improvement generation failed: Network error - ${error.message}`);
        }
        throw new Error(`Business improvement generation failed: ${error.message}`);
      }
      throw new Error("Business improvement generation failed: Unknown error");
    }
  }
  /**
   * Validates input analysis for improvement generation
   */
  validateInputAnalysis(analysis) {
    if (!analysis) {
      throw new Error("validation failed: analysis is required");
    }
    if (!analysis.overview) {
      throw new Error("validation failed: analysis must have overview section");
    }
    if (!analysis.overview.valueProposition || analysis.overview.valueProposition.trim().length === 0) {
      throw new Error("validation failed: analysis must have value proposition");
    }
    if (!analysis.overview.targetAudience || analysis.overview.targetAudience.trim().length === 0) {
      throw new Error("validation failed: analysis must have target audience");
    }
    if (!analysis.overview.monetization || analysis.overview.monetization.trim().length === 0) {
      throw new Error("validation failed: analysis must have monetization strategy");
    }
    if (!analysis.synthesis) {
      throw new Error("validation failed: analysis must have synthesis section");
    }
    if (!analysis.synthesis.keyInsights || analysis.synthesis.keyInsights.length === 0) {
      throw new Error("validation failed: analysis must have key insights");
    }
  }
  /**
   * Validates goal parameter
   */
  validateGoal(goal) {
    if (typeof goal !== "string") {
      throw new Error("validation failed: goal must be a string");
    }
    const trimmedGoal = goal.trim();
    if (trimmedGoal.length === 0) {
      throw new Error("validation failed: goal cannot be empty");
    }
    if (trimmedGoal.length > 500) {
      throw new Error("validation failed: goal cannot exceed 500 characters");
    }
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /eval\s*\(/i
    ];
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(trimmedGoal)) {
        throw new Error("validation failed: goal contains potentially harmful content");
      }
    }
  }
  /**
   * Generates improvement content using AI provider
   */
  async generateImprovementContent(analysis, goal) {
    const startTime = Date.now();
    try {
      const prompt = this.createImprovementPrompt(analysis, goal);
      const systemPrompt = this.createImprovementSystemPrompt();
      if (prompt.length > 5e4) {
        console.warn(`Improvement prompt is very long (${prompt.length} chars), truncating...`);
        const truncatedPrompt = prompt.substring(0, 45e3) + "\n\n[Content truncated for length]";
      }
      console.log(`Generating improvement content with AI provider (timeout: ${this.timeoutMs}ms)`);
      const response = await this.aiProvider.generateStructuredContent(
        prompt,
        this.getImprovementSchema(),
        systemPrompt
      );
      const elapsed = Date.now() - startTime;
      console.log(`AI improvement generation completed in ${elapsed}ms`);
      if (!response) {
        throw new Error("AI provider returned empty response");
      }
      if (typeof response !== "object" || response === null) {
        throw new Error("AI provider returned invalid response format");
      }
      return response;
    } catch (error) {
      const elapsed = Date.now() - startTime;
      console.error(`AI improvement generation failed after ${elapsed}ms:`, error);
      if (error instanceof Error) {
        if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
          throw new Error(`AI generation timeout after ${elapsed}ms: ${error.message}`);
        }
        if (error.message.includes("rate limit") || error.message.includes("RATE_LIMITED")) {
          throw new Error(`AI generation rate limited: ${error.message}`);
        }
        if (error.message.includes("API key") || error.message.includes("authentication")) {
          throw new Error(`AI generation authentication error: ${error.message}`);
        }
        if (error.message.includes("network") || error.message.includes("fetch")) {
          throw new Error(`AI generation network error: ${error.message}`);
        }
        throw new Error(`AI generation error: ${error.message}`);
      }
      throw new Error("AI generation failed with unknown error");
    }
  }
  /**
   * Creates the system prompt for improvement generation
   */
  createImprovementSystemPrompt() {
    return `You are a business strategy consultant who generates actionable improvement suggestions for existing businesses.

CRITICAL REQUIREMENTS:
- Generate exactly 3 distinct business improvement angles
- Create a 7-day shipping plan with exactly 3 tasks per day maximum
- Focus on lean scope, quick validation, and measurable KPIs
- Each improvement angle should be specific and actionable
- Tasks should build incrementally from day 1 to day 7
- Prioritize shipping a working prototype quickly
- Include validation and measurement tasks throughout the plan

IMPROVEMENT FOCUS AREAS:
- Competitive differentiation strategies
- User experience enhancements
- Technical or operational improvements
- Market positioning adjustments
- Revenue model optimizations

TASK REQUIREMENTS:
- Each task must be specific and actionable
- Tasks should be completable within a single day
- Include both building and validation activities
- Focus on measurable outcomes and KPIs
- Build toward a shippable prototype by day 7

Respond only with valid JSON in the exact format requested.`;
  }
  /**
   * Creates the improvement generation prompt
   */
  createImprovementPrompt(analysis, goal) {
    const goalSection = goal ? `
IMPROVEMENT GOAL: ${goal}

Focus the improvements on achieving this specific goal while maintaining the core business model.` : "";
    return `Based on this business analysis, generate 3 distinct improvement angles and a 7-day shipping plan.

BUSINESS ANALYSIS:
Value Proposition: ${analysis.overview.valueProposition}
Target Audience: ${analysis.overview.targetAudience}
Monetization: ${analysis.overview.monetization}

Market Analysis:
- Competitors: ${analysis.market.competitors.map((c) => c.name).join(", ")}
- Strengths: ${analysis.market.swot.strengths.join(", ")}
- Weaknesses: ${analysis.market.swot.weaknesses.join(", ")}
- Opportunities: ${analysis.market.swot.opportunities.join(", ")}
- Threats: ${analysis.market.swot.threats.join(", ")}

Technical Details:
${analysis.technical ? `- Tech Stack: ${analysis.technical.techStack?.join(", ") || "Unknown"}
- Key Pages: ${analysis.technical.keyPages?.join(", ") || "Unknown"}` : "- Technical details not available"}

Key Insights: ${analysis.synthesis.keyInsights.join(", ")}
Summary: ${analysis.synthesis.summary}${goalSection}

Generate improvements that:
1. Address identified weaknesses and threats
2. Leverage opportunities and strengths
3. Differentiate from existing competitors
4. Improve user experience and engagement
5. Optimize revenue generation

Provide response in this exact JSON format:

{
  "twists": [
    "Improvement angle 1: Specific, actionable business twist that addresses a key weakness or opportunity",
    "Improvement angle 2: Different approach focusing on competitive differentiation or market positioning", 
    "Improvement angle 3: Technical, operational, or user experience improvement that enhances value proposition"
  ],
  "sevenDayPlan": [
    {
      "day": 1,
      "tasks": ["Research and validate core assumption", "Set up basic project structure", "Define success metrics and KPIs"]
    },
    {
      "day": 2,
      "tasks": ["Build minimum viable feature", "Create user feedback collection system", "Test core functionality"]
    },
    {
      "day": 3,
      "tasks": ["Implement key differentiator", "Gather initial user feedback", "Iterate based on feedback"]
    },
    {
      "day": 4,
      "tasks": ["Add essential integrations", "Optimize user experience", "Measure key performance indicators"]
    },
    {
      "day": 5,
      "tasks": ["Polish user interface", "Implement analytics tracking", "Prepare for user testing"]
    },
    {
      "day": 6,
      "tasks": ["Conduct user testing sessions", "Fix critical issues", "Prepare launch materials"]
    },
    {
      "day": 7,
      "tasks": ["Launch prototype to target audience", "Monitor key metrics", "Plan next iteration based on results"]
    }
  ]
}

REQUIREMENTS:
- Each day must have exactly 3 tasks maximum (requirement 3.4)
- Tasks should be specific and actionable
- Focus on shipping a working prototype quickly
- Include validation and measurement tasks
- Build incrementally from day 1 to day 7
- Each improvement angle should be distinct and address different aspects of the business

Respond ONLY with valid JSON.`;
  }
  /**
   * Gets the JSON schema for improvement generation
   */
  getImprovementSchema() {
    return {
      type: "object",
      properties: {
        twists: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        sevenDayPlan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number", minimum: 1, maximum: 7 },
              tasks: {
                type: "array",
                items: { type: "string" },
                minItems: 1,
                maxItems: 3
              }
            },
            required: ["day", "tasks"]
          },
          minItems: 7,
          maxItems: 7
        }
      },
      required: ["twists", "sevenDayPlan"]
    };
  }
  /**
   * Validates the generated improvement data
   */
  validateImprovement(improvement) {
    if (!improvement.twists || !Array.isArray(improvement.twists)) {
      throw new Error("validation failed: twists must be an array");
    }
    if (improvement.twists.length !== 3) {
      throw new Error("validation failed: must have exactly 3 improvement twists");
    }
    for (const twist of improvement.twists) {
      if (typeof twist !== "string" || twist.trim().length === 0) {
        throw new Error("validation failed: each twist must be a non-empty string");
      }
    }
    if (!improvement.sevenDayPlan || !Array.isArray(improvement.sevenDayPlan)) {
      throw new Error("validation failed: sevenDayPlan must be an array");
    }
    if (improvement.sevenDayPlan.length !== 7) {
      throw new Error("validation failed: sevenDayPlan must have exactly 7 days");
    }
    for (let i = 0; i < improvement.sevenDayPlan.length; i++) {
      const dayPlan = improvement.sevenDayPlan[i];
      if (!dayPlan || typeof dayPlan !== "object") {
        throw new Error(`validation failed: day ${i + 1} plan must be an object`);
      }
      if (dayPlan.day !== i + 1) {
        throw new Error(`validation failed: day ${i + 1} must have day property set to ${i + 1}`);
      }
      if (!dayPlan.tasks || !Array.isArray(dayPlan.tasks)) {
        throw new Error(`validation failed: day ${i + 1} tasks must be an array`);
      }
      if (dayPlan.tasks.length === 0 || dayPlan.tasks.length > 3) {
        throw new Error(`validation failed: day ${i + 1} must have 1-3 tasks, got ${dayPlan.tasks.length}`);
      }
      for (const task of dayPlan.tasks) {
        if (typeof task !== "string" || task.trim().length === 0) {
          throw new Error(`validation failed: day ${i + 1} tasks must be non-empty strings`);
        }
      }
    }
  }
  /**
   * Creates a formatted text version of the 7-day plan for clipboard export
   */
  static formatPlanForClipboard(improvement) {
    let formatted = `Business Improvement Plan
`;
    formatted += `Generated: ${new Date(improvement.generatedAt).toLocaleDateString()}

`;
    formatted += `Improvement Angles:
`;
    improvement.twists.forEach((twist, index) => {
      formatted += `${index + 1}. ${twist}
`;
    });
    formatted += `
7-Day Shipping Plan:
`;
    improvement.sevenDayPlan.forEach((dayPlan) => {
      formatted += `
Day ${dayPlan.day}:
`;
      dayPlan.tasks.forEach((task) => {
        formatted += `  \u2022 ${task}
`;
      });
    });
    return formatted;
  }
};

// server/services/export-service.ts
import PDFDocument from "pdfkit";
var ExportService = class {
  constructor(storage) {
    this.storage = storage;
  }
  /**
   * Aggregates all stage data for a business analysis
   * Returns complete plan data ready for export
   */
  async aggregateCompletePlan(userId, analysisId) {
    const analysis = await this.storage.getAnalysis(userId, analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }
    const stages = await this.storage.getAnalysisStages(userId, analysisId);
    if (!stages) {
      throw new Error("No stage data found");
    }
    const stage1 = stages[1];
    const stage2 = stages[2]?.content;
    const stage3 = stages[3]?.content;
    const stage4 = stages[4]?.content;
    const stage5 = stages[5]?.content;
    const stage6 = stages[6]?.content;
    return {
      metadata: {
        businessName: analysis.businessModel || "Business Analysis",
        url: analysis.url,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        analysisId: analysis.id
      },
      stage1: {
        name: "Discovery & Selection",
        summary: analysis.summary,
        url: analysis.url,
        overallScore: analysis.overallScore,
        structured: analysis.structured,
        scoreDetails: analysis.scoreDetails,
        aiInsights: analysis.aiInsights,
        firstPartyData: analysis.firstPartyData,
        improvements: analysis.improvements,
        businessModel: analysis.businessModel,
        revenueStream: analysis.revenueStream,
        targetMarket: analysis.targetMarket
      },
      stage2: stage2 ? {
        name: "Lazy-Entrepreneur Filter",
        ...stage2
      } : void 0,
      stage3: stage3 ? {
        name: "MVP Launch Planning",
        ...stage3
      } : void 0,
      stage4: stage4 ? {
        name: "Demand Testing Strategy",
        ...stage4
      } : void 0,
      stage5: stage5 ? {
        name: "Scaling & Growth",
        ...stage5
      } : void 0,
      stage6: stage6 ? {
        name: "AI Automation Mapping",
        ...stage6
      } : void 0
    };
  }
  /**
   * Generates JSON export of complete plan
   */
  async exportJSON(userId, analysisId) {
    const planData = await this.aggregateCompletePlan(userId, analysisId);
    return JSON.stringify(planData, null, 2);
  }
  /**
   * Generates HTML export of complete plan
   */
  async exportHTML(userId, analysisId) {
    const planData = await this.aggregateCompletePlan(userId, analysisId);
    return this.generateHTMLDocument(planData);
  }
  /**
   * Generates PDF export of complete plan
   */
  async exportPDF(userId, analysisId) {
    const planData = await this.aggregateCompletePlan(userId, analysisId);
    return this.generatePDFDocument(planData);
  }
  /**
   * Exports a specific stage in the requested format
   */
  async exportStage(userId, analysisId, stageNumber, format) {
    const analysis = await this.storage.getAnalysis(userId, analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }
    const stages = await this.storage.getAnalysisStages(userId, analysisId);
    if (!stages) {
      throw new Error("No stages found");
    }
    const stageData = stages[stageNumber];
    if (!stageData) {
      throw new Error(`Stage ${stageNumber} not found`);
    }
    const stageName = this.getStageName(stageNumber);
    switch (format) {
      case "json":
        return this.exportStageJSON(stageData, stageName);
      case "html":
        return this.exportStageHTML(stageData, stageName, analysis);
      case "pdf":
        return this.exportStagePDF(stageData, stageName, analysis);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  getStageName(stageNumber) {
    const names = {
      1: "Discovery & Selection",
      2: "Lazy-Entrepreneur Filter",
      3: "MVP Launch Planning",
      4: "Demand Testing Strategy",
      5: "Scaling & Growth",
      6: "AI Automation Mapping"
    };
    return names[stageNumber] || `Stage ${stageNumber}`;
  }
  exportStageJSON(stageData, stageName) {
    return JSON.stringify({
      stageName,
      ...stageData
    }, null, 2);
  }
  exportStageHTML(stageData, stageName, analysis) {
    const stageNumber = this.getStageNumber(stageName);
    let stageContent = "";
    switch (stageNumber) {
      case 1:
        stageContent = this.renderStage1HTML({
          name: stageName,
          summary: analysis.summary,
          url: analysis.url,
          overallScore: analysis.overallScore,
          structured: analysis.structured
        });
        break;
      case 2:
        stageContent = this.renderStage2HTML({ name: stageName, ...stageData.content });
        break;
      case 3:
        stageContent = this.renderStage3HTML({ name: stageName, ...stageData.content });
        break;
      case 4:
        stageContent = this.renderStage4HTML({ name: stageName, ...stageData.content });
        break;
      case 5:
        stageContent = this.renderStage5HTML({ name: stageName, ...stageData.content });
        break;
      case 6:
        stageContent = this.renderStage6HTML({ name: stageName, ...stageData.content });
        break;
    }
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${analysis.businessModel || "Business"} - ${stageName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    .stage {
      background: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stage h2 {
      color: #667eea;
      margin-top: 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stage h3 {
      color: #555;
      margin-top: 25px;
    }
    .score-badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin: 5px 5px 5px 0;
    }
    .recommendation {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      font-weight: 500;
    }
    .recommendation.go {
      background: #d1fae5;
      border-left: 4px solid #10b981;
    }
    .recommendation.no-go {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    .recommendation.maybe {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    ul, ol {
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
    }
    .timeline-item {
      border-left: 3px solid #667eea;
      padding-left: 20px;
      margin: 20px 0;
    }
    .priority-high { color: #ef4444; font-weight: bold; }
    .priority-medium { color: #f59e0b; font-weight: bold; }
    .priority-low { color: #10b981; font-weight: bold; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${analysis.businessModel || "Business Analysis"}</h1>
    <div>Stage ${stageNumber}: ${stageName}</div>
  </div>

  ${stageContent}

  <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.9em;">
    <p>Generated by VentureClone AI</p>
  </div>
</body>
</html>`;
  }
  async exportStagePDF(stageData, stageName, analysis) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
      doc.fontSize(24).font("Helvetica-Bold").text(analysis.businessModel || "Business Analysis");
      doc.fontSize(16).font("Helvetica").text(stageName);
      doc.moveDown(2);
      const stageNumber = this.getStageNumber(stageName);
      switch (stageNumber) {
        case 1:
          this.addStage1PDF(doc, {
            name: stageName,
            summary: analysis.summary,
            url: analysis.url,
            overallScore: analysis.overallScore
          });
          break;
        case 2:
          this.addStage2PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 3:
          this.addStage3PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 4:
          this.addStage4PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 5:
          this.addStage5PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 6:
          this.addStage6PDF(doc, { name: stageName, ...stageData.content });
          break;
      }
      doc.end();
    });
  }
  getStageNumber(stageName) {
    const names = {
      "Discovery & Selection": 1,
      "Lazy-Entrepreneur Filter": 2,
      "MVP Launch Planning": 3,
      "Demand Testing Strategy": 4,
      "Scaling & Growth": 5,
      "AI Automation Mapping": 6
    };
    return names[stageName] || 1;
  }
  /**
   * Generates PDF document from plan data using PDFKit
   */
  async generatePDFDocument(planData) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `${planData.metadata.businessName} - Complete Business Plan`,
          Author: "VentureClone AI",
          Subject: "Business Cloning Analysis",
          CreationDate: new Date(planData.metadata.generatedAt)
        }
      });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
      this.addCoverPage(doc, planData.metadata);
      doc.addPage();
      this.addTableOfContents(doc, planData);
      doc.addPage();
      this.addStage1PDF(doc, planData.stage1);
      if (planData.stage2) {
        doc.addPage();
        this.addStage2PDF(doc, planData.stage2);
      }
      if (planData.stage3) {
        doc.addPage();
        this.addStage3PDF(doc, planData.stage3);
      }
      if (planData.stage4) {
        doc.addPage();
        this.addStage4PDF(doc, planData.stage4);
      }
      if (planData.stage5) {
        doc.addPage();
        this.addStage5PDF(doc, planData.stage5);
      }
      if (planData.stage6) {
        doc.addPage();
        this.addStage6PDF(doc, planData.stage6);
      }
      this.addFooter(doc);
      doc.end();
    });
  }
  addCoverPage(doc, metadata) {
    doc.fontSize(32).font("Helvetica-Bold").text(metadata.businessName, { align: "center" });
    doc.moveDown(2);
    doc.fontSize(20).font("Helvetica").text("Complete Business Plan", { align: "center" });
    doc.moveDown(4);
    doc.fontSize(12).font("Helvetica").text(`URL: ${metadata.url}`, { align: "center" }).text(`Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}`, { align: "center" });
    doc.moveDown(8);
    doc.fontSize(10).fillColor("#666").text("Generated by VentureClone AI", { align: "center" }).text("Systematic Business Cloning Platform", { align: "center" });
  }
  addTableOfContents(doc, planData) {
    doc.fontSize(24).font("Helvetica-Bold").fillColor("#000").text("Table of Contents");
    doc.moveDown(1);
    doc.fontSize(12).font("Helvetica");
    const toc = [
      "Stage 1: Discovery & Selection",
      planData.stage2 ? "Stage 2: Lazy-Entrepreneur Filter" : null,
      planData.stage3 ? "Stage 3: MVP Launch Planning" : null,
      planData.stage4 ? "Stage 4: Demand Testing Strategy" : null,
      planData.stage5 ? "Stage 5: Scaling & Growth" : null,
      planData.stage6 ? "Stage 6: AI Automation Mapping" : null
    ].filter(Boolean);
    toc.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`);
      doc.moveDown(0.5);
    });
  }
  addStage1PDF(doc, stage1) {
    this.addSectionHeader(doc, `Stage 1: ${stage1.name}`);
    doc.fontSize(14).font("Helvetica-Bold").text("Business Information");
    doc.fontSize(12).font("Helvetica").text(`URL: ${stage1.url}`);
    if (stage1.businessModel) {
      doc.text(`Business Model: ${stage1.businessModel}`);
    }
    if (stage1.revenueStream) {
      doc.text(`Revenue Stream: ${stage1.revenueStream}`);
    }
    if (stage1.targetMarket) {
      doc.text(`Target Market: ${stage1.targetMarket}`);
    }
    doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Summary");
    doc.fontSize(12).font("Helvetica").text(stage1.summary);
    if (stage1.overallScore) {
      doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text(`Overall Score: ${stage1.overallScore}/10`);
    }
    if (stage1.scoreDetails) {
      doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Detailed Scoring");
      doc.fontSize(12).font("Helvetica");
      for (const [key, value] of Object.entries(stage1.scoreDetails)) {
        const detail = value;
        doc.moveDown(0.5).font("Helvetica-Bold").text(`${this.formatCamelCase(key)}: ${detail.score}/10`);
        doc.font("Helvetica").text(detail.reasoning || "");
      }
    }
    if (stage1.aiInsights) {
      if (stage1.aiInsights.keyInsights?.length > 0) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Key Insights");
        doc.fontSize(12).font("Helvetica");
        stage1.aiInsights.keyInsights.forEach((insight) => {
          doc.text(`\u2022 ${insight}`);
        });
      }
      if (stage1.aiInsights.opportunities?.length > 0) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Opportunities");
        doc.fontSize(12).font("Helvetica");
        stage1.aiInsights.opportunities.forEach((opp) => {
          doc.text(`\u2022 ${opp}`);
        });
      }
      if (stage1.aiInsights.risks?.length > 0) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Risks");
        doc.fontSize(12).font("Helvetica");
        stage1.aiInsights.risks.forEach((risk) => {
          doc.text(`\u2022 ${risk}`);
        });
      }
    }
    if (stage1.structured) {
      const s = stage1.structured;
      if (s.overview) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Business Overview");
        doc.fontSize(12).font("Helvetica").text(`Value Proposition: ${s.overview.valueProposition || "N/A"}`).text(`Target Audience: ${s.overview.targetAudience || "N/A"}`).text(`Monetization: ${s.overview.monetization || "N/A"}`);
      }
      if (s.market?.competitors?.length > 0) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Competitors");
        doc.fontSize(12).font("Helvetica");
        s.market.competitors.forEach((comp) => {
          doc.text(`\u2022 ${comp.name}${comp.url ? ` (${comp.url})` : ""}${comp.notes ? `: ${comp.notes}` : ""}`);
        });
      }
      if (s.market?.swot) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("SWOT Analysis");
        doc.fontSize(12);
        if (s.market.swot.strengths?.length > 0) {
          doc.font("Helvetica-Bold").text("Strengths:");
          doc.font("Helvetica");
          s.market.swot.strengths.forEach((item) => {
            doc.text(`\u2022 ${item}`);
          });
        }
        if (s.market.swot.weaknesses?.length > 0) {
          doc.moveDown(0.5).font("Helvetica-Bold").text("Weaknesses:");
          doc.font("Helvetica");
          s.market.swot.weaknesses.forEach((item) => {
            doc.text(`\u2022 ${item}`);
          });
        }
        if (s.market.swot.opportunities?.length > 0) {
          doc.moveDown(0.5).font("Helvetica-Bold").text("Opportunities:");
          doc.font("Helvetica");
          s.market.swot.opportunities.forEach((item) => {
            doc.text(`\u2022 ${item}`);
          });
        }
        if (s.market.swot.threats?.length > 0) {
          doc.moveDown(0.5).font("Helvetica-Bold").text("Threats:");
          doc.font("Helvetica");
          s.market.swot.threats.forEach((item) => {
            doc.text(`\u2022 ${item}`);
          });
        }
      }
      if (s.technical) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Technical Details");
        doc.fontSize(12).font("Helvetica");
        if (s.technical.techStack?.length > 0) {
          doc.text(`Tech Stack: ${s.technical.techStack.join(", ")}`);
        }
        if (s.technical.uiColors?.length > 0) {
          doc.text(`UI Colors: ${s.technical.uiColors.join(", ")}`);
        }
        if (s.technical.keyPages?.length > 0) {
          doc.text("Key Pages:");
          s.technical.keyPages.forEach((page) => {
            doc.text(`\u2022 ${page}`);
          });
        }
      }
    }
    if (stage1.improvements) {
      if (stage1.improvements.twists?.length > 0) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("Business Improvement Twists");
        doc.fontSize(12).font("Helvetica");
        stage1.improvements.twists.forEach((twist) => {
          doc.text(`\u2022 ${twist}`);
        });
      }
      if (stage1.improvements.sevenDayPlan?.length > 0) {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text("7-Day Action Plan");
        doc.fontSize(12);
        stage1.improvements.sevenDayPlan.forEach((day) => {
          doc.moveDown(0.5).font("Helvetica-Bold").text(`Day ${day.day}:`);
          doc.font("Helvetica");
          day.tasks.forEach((task) => {
            doc.text(`\u2022 ${task}`);
          });
        });
      }
    }
  }
  addStage2PDF(doc, stage2) {
    this.addSectionHeader(doc, `Stage 2: ${stage2.name}`);
    doc.fontSize(12).font("Helvetica-Bold").text(`Effort Score: ${stage2.effortScore}/10 | Reward Score: ${stage2.rewardScore}/10`);
    doc.moveDown(0.5).font("Helvetica").text(`Recommendation: ${stage2.recommendation.toUpperCase()}`);
    doc.moveDown(1).font("Helvetica-Bold").text("Reasoning:");
    doc.font("Helvetica").text(stage2.reasoning);
    doc.moveDown(1).font("Helvetica-Bold").text(`Automation Potential: ${Math.round(stage2.automationPotential.score * 100)}%`);
    doc.font("Helvetica");
    stage2.automationPotential.opportunities.forEach((opp) => {
      doc.text(`\u2022 ${opp}`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Resource Requirements:");
    doc.font("Helvetica").text(`Time: ${stage2.resourceRequirements.time}`).text(`Money: ${stage2.resourceRequirements.money}`).text(`Skills: ${stage2.resourceRequirements.skills.join(", ")}`);
    doc.moveDown(1).font("Helvetica-Bold").text("Next Steps:");
    doc.font("Helvetica");
    stage2.nextSteps.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`);
    });
  }
  addStage3PDF(doc, stage3) {
    this.addSectionHeader(doc, `Stage 3: ${stage3.name}`);
    doc.fontSize(12).font("Helvetica-Bold").text("Core Features (MVP):");
    doc.font("Helvetica");
    stage3.coreFeatures.forEach((feature) => {
      doc.text(`\u2022 ${feature}`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Nice-to-Have Features:");
    doc.font("Helvetica");
    stage3.niceToHaves.forEach((feature) => {
      doc.text(`\u2022 ${feature}`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Technology Stack:");
    doc.font("Helvetica").text(`Frontend: ${stage3.techStack.frontend.join(", ")}`).text(`Backend: ${stage3.techStack.backend.join(", ")}`).text(`Infrastructure: ${stage3.techStack.infrastructure.join(", ")}`);
    doc.moveDown(1).font("Helvetica-Bold").text("Development Timeline:");
    stage3.timeline.forEach((phase) => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(`${phase.phase} (${phase.duration})`);
      doc.font("Helvetica");
      phase.deliverables.forEach((d) => {
        doc.text(`  \u2022 ${d}`);
      });
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Estimated Cost:");
    doc.font("Helvetica").text(stage3.estimatedCost);
  }
  addStage4PDF(doc, stage4) {
    this.addSectionHeader(doc, `Stage 4: ${stage4.name}`);
    doc.fontSize(12).font("Helvetica-Bold").text("Testing Methods:");
    stage4.testingMethods.forEach((method) => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(method.method);
      doc.font("Helvetica").text(method.description).text(`Cost: ${method.cost} | Timeline: ${method.timeline}`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Success Metrics:");
    doc.font("Helvetica");
    stage4.successMetrics.forEach((metric) => {
      doc.text(`\u2022 ${metric.metric}: ${metric.target}`);
      doc.text(`  Measurement: ${metric.measurement}`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Budget:");
    doc.font("Helvetica").text(`Total: ${stage4.budget.total}`);
    stage4.budget.breakdown.forEach((item) => {
      doc.text(`\u2022 ${item.item}: ${item.cost}`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Timeline:");
    doc.font("Helvetica").text(stage4.timeline);
  }
  addStage5PDF(doc, stage5) {
    this.addSectionHeader(doc, `Stage 5: ${stage5.name}`);
    doc.fontSize(12).font("Helvetica-Bold").text("Growth Channels:");
    stage5.growthChannels.forEach((channel) => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(`${channel.channel} [${channel.priority.toUpperCase()}]`);
      doc.font("Helvetica").text(channel.strategy);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Growth Milestones:");
    stage5.milestones.forEach((milestone) => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(`${milestone.milestone} (${milestone.timeline})`);
      doc.font("Helvetica");
      milestone.metrics.forEach((m) => {
        doc.text(`  \u2022 ${m}`);
      });
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Resource Scaling Plan:");
    stage5.resourceScaling.forEach((phase) => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(phase.phase);
      doc.font("Helvetica").text(`Team: ${phase.team.join(", ")}`).text(`Infrastructure: ${phase.infrastructure}`);
    });
  }
  addStage6PDF(doc, stage6) {
    this.addSectionHeader(doc, `Stage 6: ${stage6.name}`);
    doc.fontSize(12).font("Helvetica-Bold").text("Automation Opportunities:");
    doc.font("Helvetica");
    stage6.automationOpportunities.forEach((opp) => {
      doc.text(`\u2022 ${opp.process} \u2192 ${opp.tool}`);
      doc.text(`  ROI: ${opp.roi} | Priority: ${opp.priority}/10`);
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Implementation Plan:");
    stage6.implementationPlan.forEach((phase) => {
      doc.moveDown(0.5).font("Helvetica-Bold").text(`${phase.phase} (${phase.timeline})`);
      doc.font("Helvetica");
      phase.automations.forEach((a) => {
        doc.text(`  \u2022 ${a}`);
      });
    });
    doc.moveDown(1).font("Helvetica-Bold").text("Estimated Savings:");
    doc.font("Helvetica").text(stage6.estimatedSavings);
  }
  addSectionHeader(doc, title) {
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#667eea").text(title);
    doc.moveDown(1).fillColor("#000");
  }
  addFooter(doc) {
    doc.addPage();
    doc.fontSize(10).fillColor("#666").font("Helvetica").text("Generated by VentureClone AI", { align: "center" }).moveDown(0.5).text("This document contains AI-generated analysis and recommendations.", { align: "center" }).text("Please validate all information independently.", { align: "center" });
  }
  /**
   * Generates formatted HTML document from plan data
   */
  generateHTMLDocument(planData) {
    const { metadata, stage1, stage2, stage3, stage4, stage5, stage6 } = planData;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.businessName} - Complete Business Plan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    .header .meta {
      opacity: 0.9;
      font-size: 0.95em;
    }
    .stage {
      background: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stage h2 {
      color: #667eea;
      margin-top: 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stage h3 {
      color: #555;
      margin-top: 25px;
    }
    .score-badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin: 5px 5px 5px 0;
    }
    .recommendation {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      font-weight: 500;
    }
    .recommendation.go {
      background: #d1fae5;
      border-left: 4px solid #10b981;
    }
    .recommendation.no-go {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    .recommendation.maybe {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    ul, ol {
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
    }
    .timeline-item {
      border-left: 3px solid #667eea;
      padding-left: 20px;
      margin: 20px 0;
    }
    .priority-high { color: #ef4444; font-weight: bold; }
    .priority-medium { color: #f59e0b; font-weight: bold; }
    .priority-low { color: #10b981; font-weight: bold; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${metadata.businessName}</h1>
    <div class="meta">
      <div>URL: <a href="${metadata.url}" style="color: white;">${metadata.url}</a></div>
      <div>Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}</div>
    </div>
  </div>

  ${this.renderStage1HTML(stage1)}
  ${stage2 ? this.renderStage2HTML(stage2) : ""}
  ${stage3 ? this.renderStage3HTML(stage3) : ""}
  ${stage4 ? this.renderStage4HTML(stage4) : ""}
  ${stage5 ? this.renderStage5HTML(stage5) : ""}
  ${stage6 ? this.renderStage6HTML(stage6) : ""}

  <div class="footer">
    <p>Generated by VentureClone AI</p>
    <p>This document contains AI-generated analysis and recommendations. Please validate all information independently.</p>
  </div>
</body>
</html>`;
  }
  renderStage1HTML(stage1) {
    let scoreDetailsHTML = "";
    if (stage1.scoreDetails) {
      scoreDetailsHTML = "<h3>Detailed Scoring</h3><table>";
      for (const [key, value] of Object.entries(stage1.scoreDetails)) {
        const detail = value;
        scoreDetailsHTML += `
          <tr>
            <td><strong>${this.formatCamelCase(key)}</strong></td>
            <td><span class="score-badge">${detail.score}/10</span></td>
            <td>${detail.reasoning || ""}</td>
          </tr>`;
      }
      scoreDetailsHTML += "</table>";
    }
    let aiInsightsHTML = "";
    if (stage1.aiInsights) {
      if (stage1.aiInsights.keyInsights?.length > 0) {
        aiInsightsHTML += "<h3>Key Insights</h3><ul>";
        stage1.aiInsights.keyInsights.forEach((insight) => {
          aiInsightsHTML += `<li>${insight}</li>`;
        });
        aiInsightsHTML += "</ul>";
      }
      if (stage1.aiInsights.opportunities?.length > 0) {
        aiInsightsHTML += "<h3>Opportunities</h3><ul>";
        stage1.aiInsights.opportunities.forEach((opp) => {
          aiInsightsHTML += `<li>${opp}</li>`;
        });
        aiInsightsHTML += "</ul>";
      }
      if (stage1.aiInsights.risks?.length > 0) {
        aiInsightsHTML += "<h3>Risks</h3><ul>";
        stage1.aiInsights.risks.forEach((risk) => {
          aiInsightsHTML += `<li>${risk}</li>`;
        });
        aiInsightsHTML += "</ul>";
      }
    }
    let structuredHTML = "";
    if (stage1.structured) {
      const s = stage1.structured;
      structuredHTML += "<h3>Business Overview</h3>";
      if (s.overview) {
        structuredHTML += `
          <p><strong>Value Proposition:</strong> ${s.overview.valueProposition || "N/A"}</p>
          <p><strong>Target Audience:</strong> ${s.overview.targetAudience || "N/A"}</p>
          <p><strong>Monetization:</strong> ${s.overview.monetization || "N/A"}</p>
        `;
      }
      if (s.market?.competitors?.length > 0) {
        structuredHTML += "<h3>Competitors</h3><ul>";
        s.market.competitors.forEach((comp) => {
          structuredHTML += `<li><strong>${comp.name}</strong>${comp.url ? ` - <a href="${comp.url}">${comp.url}</a>` : ""}${comp.notes ? `: ${comp.notes}` : ""}</li>`;
        });
        structuredHTML += "</ul>";
      }
      if (s.market?.swot) {
        structuredHTML += "<h3>SWOT Analysis</h3>";
        if (s.market.swot.strengths?.length > 0) {
          structuredHTML += "<h4>Strengths</h4><ul>";
          s.market.swot.strengths.forEach((item) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += "</ul>";
        }
        if (s.market.swot.weaknesses?.length > 0) {
          structuredHTML += "<h4>Weaknesses</h4><ul>";
          s.market.swot.weaknesses.forEach((item) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += "</ul>";
        }
        if (s.market.swot.opportunities?.length > 0) {
          structuredHTML += "<h4>Opportunities</h4><ul>";
          s.market.swot.opportunities.forEach((item) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += "</ul>";
        }
        if (s.market.swot.threats?.length > 0) {
          structuredHTML += "<h4>Threats</h4><ul>";
          s.market.swot.threats.forEach((item) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += "</ul>";
        }
      }
      if (s.technical) {
        structuredHTML += "<h3>Technical Details</h3>";
        if (s.technical.techStack?.length > 0) {
          structuredHTML += `<p><strong>Tech Stack:</strong> ${s.technical.techStack.join(", ")}</p>`;
        }
        if (s.technical.uiColors?.length > 0) {
          structuredHTML += `<p><strong>UI Colors:</strong> ${s.technical.uiColors.join(", ")}</p>`;
        }
        if (s.technical.keyPages?.length > 0) {
          structuredHTML += "<p><strong>Key Pages:</strong></p><ul>";
          s.technical.keyPages.forEach((page) => {
            structuredHTML += `<li>${page}</li>`;
          });
          structuredHTML += "</ul>";
        }
      }
    }
    let improvementsHTML = "";
    if (stage1.improvements) {
      if (stage1.improvements.twists?.length > 0) {
        improvementsHTML += "<h3>Business Improvement Twists</h3><ul>";
        stage1.improvements.twists.forEach((twist) => {
          improvementsHTML += `<li>${twist}</li>`;
        });
        improvementsHTML += "</ul>";
      }
      if (stage1.improvements.sevenDayPlan?.length > 0) {
        improvementsHTML += "<h3>7-Day Action Plan</h3>";
        stage1.improvements.sevenDayPlan.forEach((day) => {
          improvementsHTML += `<h4>Day ${day.day}</h4><ul>`;
          day.tasks.forEach((task) => {
            improvementsHTML += `<li>${task}</li>`;
          });
          improvementsHTML += "</ul>";
        });
      }
    }
    return `
  <div class="stage">
    <h2>Stage 1: ${stage1.name}</h2>
    
    <h3>Business Information</h3>
    <p><strong>URL:</strong> <a href="${stage1.url}">${stage1.url}</a></p>
    ${stage1.businessModel ? `<p><strong>Business Model:</strong> ${stage1.businessModel}</p>` : ""}
    ${stage1.revenueStream ? `<p><strong>Revenue Stream:</strong> ${stage1.revenueStream}</p>` : ""}
    ${stage1.targetMarket ? `<p><strong>Target Market:</strong> ${stage1.targetMarket}</p>` : ""}
    
    <h3>Summary</h3>
    <p>${stage1.summary}</p>
    
    ${stage1.overallScore ? `<div><span class="score-badge">Overall Score: ${stage1.overallScore}/10</span></div>` : ""}
    
    ${scoreDetailsHTML}
    ${aiInsightsHTML}
    ${structuredHTML}
    ${improvementsHTML}
  </div>`;
  }
  formatCamelCase(str) {
    return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim();
  }
  renderStage2HTML(stage2) {
    return `
  <div class="stage">
    <h2>Stage 2: ${stage2.name}</h2>
    
    <div>
      <span class="score-badge">Effort: ${stage2.effortScore}/10</span>
      <span class="score-badge">Reward: ${stage2.rewardScore}/10</span>
    </div>

    <div class="recommendation ${stage2.recommendation}">
      <strong>Recommendation:</strong> ${stage2.recommendation.toUpperCase()}
    </div>

    <h3>Reasoning</h3>
    <p>${stage2.reasoning}</p>

    <h3>Automation Potential</h3>
    <p><strong>Score:</strong> ${Math.round(stage2.automationPotential.score * 100)}%</p>
    <ul>
      ${stage2.automationPotential.opportunities.map((opp) => `<li>${opp}</li>`).join("")}
    </ul>

    <h3>Resource Requirements</h3>
    <p><strong>Time:</strong> ${stage2.resourceRequirements.time}</p>
    <p><strong>Money:</strong> ${stage2.resourceRequirements.money}</p>
    <p><strong>Skills:</strong> ${stage2.resourceRequirements.skills.join(", ")}</p>

    <h3>Next Steps</h3>
    <ol>
      ${stage2.nextSteps.map((step) => `<li>${step}</li>`).join("")}
    </ol>
  </div>`;
  }
  renderStage3HTML(stage3) {
    return `
  <div class="stage">
    <h2>Stage 3: ${stage3.name}</h2>
    
    <h3>Core Features (MVP)</h3>
    <ul>
      ${stage3.coreFeatures.map((feature) => `<li>${feature}</li>`).join("")}
    </ul>

    <h3>Nice-to-Have Features</h3>
    <ul>
      ${stage3.niceToHaves.map((feature) => `<li>${feature}</li>`).join("")}
    </ul>

    <h3>Technology Stack</h3>
    <p><strong>Frontend:</strong> ${stage3.techStack.frontend.join(", ")}</p>
    <p><strong>Backend:</strong> ${stage3.techStack.backend.join(", ")}</p>
    <p><strong>Infrastructure:</strong> ${stage3.techStack.infrastructure.join(", ")}</p>

    <h3>Development Timeline</h3>
    ${stage3.timeline.map((phase) => `
      <div class="timeline-item">
        <h4>${phase.phase} (${phase.duration})</h4>
        <ul>
          ${phase.deliverables.map((d) => `<li>${d}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h3>Estimated Cost</h3>
    <p>${stage3.estimatedCost}</p>
  </div>`;
  }
  renderStage4HTML(stage4) {
    return `
  <div class="stage">
    <h2>Stage 4: ${stage4.name}</h2>
    
    <h3>Testing Methods</h3>
    ${stage4.testingMethods.map((method) => `
      <div style="margin: 20px 0;">
        <h4>${method.method}</h4>
        <p>${method.description}</p>
        <p><strong>Cost:</strong> ${method.cost} | <strong>Timeline:</strong> ${method.timeline}</p>
      </div>
    `).join("")}

    <h3>Success Metrics</h3>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Target</th>
          <th>Measurement</th>
        </tr>
      </thead>
      <tbody>
        ${stage4.successMetrics.map((metric) => `
          <tr>
            <td>${metric.metric}</td>
            <td>${metric.target}</td>
            <td>${metric.measurement}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <h3>Budget</h3>
    <p><strong>Total:</strong> ${stage4.budget.total}</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        ${stage4.budget.breakdown.map((item) => `
          <tr>
            <td>${item.item}</td>
            <td>${item.cost}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <h3>Timeline</h3>
    <p>${stage4.timeline}</p>
  </div>`;
  }
  renderStage5HTML(stage5) {
    return `
  <div class="stage">
    <h2>Stage 5: ${stage5.name}</h2>
    
    <h3>Growth Channels</h3>
    ${stage5.growthChannels.map((channel) => `
      <div style="margin: 20px 0;">
        <h4>${channel.channel} <span class="priority-${channel.priority}">[${channel.priority.toUpperCase()}]</span></h4>
        <p>${channel.strategy}</p>
      </div>
    `).join("")}

    <h3>Growth Milestones</h3>
    ${stage5.milestones.map((milestone) => `
      <div class="timeline-item">
        <h4>${milestone.milestone} (${milestone.timeline})</h4>
        <ul>
          ${milestone.metrics.map((m) => `<li>${m}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h3>Resource Scaling Plan</h3>
    ${stage5.resourceScaling.map((phase) => `
      <div style="margin: 20px 0;">
        <h4>${phase.phase}</h4>
        <p><strong>Team:</strong> ${phase.team.join(", ")}</p>
        <p><strong>Infrastructure:</strong> ${phase.infrastructure}</p>
      </div>
    `).join("")}
  </div>`;
  }
  renderStage6HTML(stage6) {
    return `
  <div class="stage">
    <h2>Stage 6: ${stage6.name}</h2>
    
    <h3>Automation Opportunities</h3>
    <table>
      <thead>
        <tr>
          <th>Process</th>
          <th>Tool</th>
          <th>ROI</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${stage6.automationOpportunities.map((opp) => `
          <tr>
            <td>${opp.process}</td>
            <td>${opp.tool}</td>
            <td>${opp.roi}</td>
            <td>${opp.priority}/10</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <h3>Implementation Plan</h3>
    ${stage6.implementationPlan.map((phase) => `
      <div class="timeline-item">
        <h4>${phase.phase} (${phase.timeline})</h4>
        <ul>
          ${phase.automations.map((a) => `<li>${a}</li>`).join("")}
        </ul>
      </div>
    `).join("")}

    <h3>Estimated Savings</h3>
    <p>${stage6.estimatedSavings}</p>
  </div>`;
  }
  /**
   * Generate HTML export for business improvement plan
   */
  generateImprovementHTML(improvements, analysis) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Improvement Plan - ${analysis.businessModel || "Business"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    .section {
      background: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #f59e0b;
      margin-top: 0;
      border-bottom: 2px solid #f59e0b;
      padding-bottom: 10px;
    }
    .twist {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .day-plan {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .day-plan h3 {
      color: #f59e0b;
      margin-top: 0;
    }
    .task {
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .task:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Business Improvement Plan</h1>
    <div>${analysis.businessModel || "Business Analysis"}</div>
    <div style="opacity: 0.9; margin-top: 10px;">
      <a href="${analysis.url}" style="color: white;">${analysis.url}</a>
    </div>
  </div>

  <div class="section">
    <h2>Three Ways to Improve This Business</h2>
    ${improvements.twists.map((twist, index) => `
      <div class="twist">
        <strong>${index + 1}.</strong> ${twist}
      </div>
    `).join("")}
  </div>

  <div class="section">
    <h2>7-Day Shipping Plan</h2>
    <p style="color: #6b7280; margin-bottom: 20px;">
      A focused action plan to ship a working prototype in one week
    </p>
    ${improvements.sevenDayPlan.map((day) => `
      <div class="day-plan">
        <h3>Day ${day.day}</h3>
        ${day.tasks.map((task) => `
          <div class="task">\u2713 ${task}</div>
        `).join("")}
      </div>
    `).join("")}
  </div>

  <div class="footer">
    <p>Generated by VentureClone AI</p>
    <p>Generated on ${new Date(improvements.generatedAt).toLocaleDateString()}</p>
  </div>
</body>
</html>`;
  }
  /**
   * Generate PDF export for business improvement plan
   */
  async generateImprovementPDF(improvements, analysis) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
      doc.fontSize(24).font("Helvetica-Bold").text("Business Improvement Plan");
      doc.fontSize(16).font("Helvetica").text(analysis.businessModel || "Business Analysis");
      doc.fontSize(12).text(analysis.url);
      doc.moveDown(2);
      doc.fontSize(18).font("Helvetica-Bold").fillColor("#f59e0b").text("Three Ways to Improve This Business");
      doc.moveDown(1).fontSize(12).font("Helvetica").fillColor("#000");
      improvements.twists.forEach((twist, index) => {
        doc.moveDown(0.5).font("Helvetica-Bold").text(`${index + 1}. `, { continued: true }).font("Helvetica").text(twist);
      });
      doc.moveDown(2).fontSize(18).font("Helvetica-Bold").fillColor("#f59e0b").text("7-Day Shipping Plan");
      doc.moveDown(0.5).fontSize(11).font("Helvetica").fillColor("#666").text("A focused action plan to ship a working prototype in one week");
      doc.moveDown(1).fillColor("#000");
      improvements.sevenDayPlan.forEach((day) => {
        doc.moveDown(1).fontSize(14).font("Helvetica-Bold").text(`Day ${day.day}`);
        doc.fontSize(12).font("Helvetica");
        day.tasks.forEach((task) => {
          doc.text(`\u2713 ${task}`);
        });
      });
      doc.moveDown(3).fontSize(10).fillColor("#666").text("Generated by VentureClone AI", { align: "center" }).text(`Generated on ${new Date(improvements.generatedAt).toLocaleDateString()}`, { align: "center" });
      doc.end();
    });
  }
};

// server/services/tech-detection.ts
import Wappalyzer from "simple-wappalyzer";
import { nanoid } from "nanoid";

// server/services/performance-monitor.ts
var PerformanceMonitor = class _PerformanceMonitor {
  static instance;
  metrics = [];
  insightsMetrics = [];
  maxMetrics = 1e3;
  // Keep last 1000 metrics in memory
  slowThreshold = 1e4;
  // 10 seconds
  insightsSlowThreshold = 500;
  // 500ms
  monitoringInterval = null;
  constructor() {
  }
  static getInstance() {
    if (!_PerformanceMonitor.instance) {
      _PerformanceMonitor.instance = new _PerformanceMonitor();
    }
    return _PerformanceMonitor.instance;
  }
  /**
   * Records a detection attempt
   */
  recordDetection(duration, success, technologiesDetected = 0, isFallback = false) {
    const metric = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      duration,
      success,
      technologiesDetected,
      isFallback
    };
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    if (duration > this.slowThreshold) {
      console.warn("[PerformanceMonitor] Slow detection detected", {
        duration,
        threshold: this.slowThreshold,
        success,
        timestamp: metric.timestamp
      });
    }
    if (this.metrics.length % 50 === 0) {
      this.logStats();
    }
  }
  /**
   * Gets current performance statistics
   */
  getStats() {
    if (this.metrics.length === 0) {
      return {
        totalDetections: 0,
        successfulDetections: 0,
        failedDetections: 0,
        fallbackCount: 0,
        successRate: 0,
        fallbackRate: 0,
        averageDetectionTime: 0,
        slowDetections: 0
      };
    }
    const totalDetections = this.metrics.length;
    const successfulDetections = this.metrics.filter((m) => m.success).length;
    const failedDetections = totalDetections - successfulDetections;
    const fallbackCount = this.metrics.filter((m) => m.isFallback).length;
    const slowDetections = this.metrics.filter((m) => m.duration > this.slowThreshold).length;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDetectionTime = totalDuration / totalDetections;
    const successRate = successfulDetections / totalDetections * 100;
    const fallbackRate = fallbackCount / totalDetections * 100;
    return {
      totalDetections,
      successfulDetections,
      failedDetections,
      fallbackCount,
      successRate: Math.round(successRate * 100) / 100,
      fallbackRate: Math.round(fallbackRate * 100) / 100,
      averageDetectionTime: Math.round(averageDetectionTime),
      slowDetections
    };
  }
  /**
   * Logs current performance statistics
   */
  logStats() {
    const stats = this.getStats();
    console.log("[PerformanceMonitor] Tech Detection Stats", {
      ...stats,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  }
  /**
   * Gets recent metrics (last N)
   */
  getRecentMetrics(count = 10) {
    return this.metrics.slice(-count);
  }
  /**
   * Records an insights generation attempt
   */
  recordInsightsGeneration(duration, cacheHit) {
    const metric = {
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      duration,
      cacheHit
    };
    this.insightsMetrics.push(metric);
    if (this.insightsMetrics.length > this.maxMetrics) {
      this.insightsMetrics.shift();
    }
    if (!cacheHit && duration > this.insightsSlowThreshold) {
      console.warn("[PerformanceMonitor] Slow insights generation detected", {
        duration,
        threshold: this.insightsSlowThreshold,
        timestamp: metric.timestamp
      });
    }
  }
  /**
   * Gets insights generation statistics
   */
  getInsightsStats() {
    if (this.insightsMetrics.length === 0) {
      return {
        totalGenerations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
        averageGenerationTime: 0,
        slowGenerations: 0
      };
    }
    const totalGenerations = this.insightsMetrics.length;
    const cacheHits = this.insightsMetrics.filter((m) => m.cacheHit).length;
    const cacheMisses = totalGenerations - cacheHits;
    const slowGenerations = this.insightsMetrics.filter(
      (m) => !m.cacheHit && m.duration > this.insightsSlowThreshold
    ).length;
    const totalDuration = this.insightsMetrics.reduce((sum, m) => sum + m.duration, 0);
    const averageGenerationTime = totalDuration / totalGenerations;
    const cacheHitRate = cacheHits / totalGenerations * 100;
    return {
      totalGenerations,
      cacheHits,
      cacheMisses,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      averageGenerationTime: Math.round(averageGenerationTime),
      slowGenerations
    };
  }
  /**
   * Start periodic monitoring and logging
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      return;
    }
    this.monitoringInterval = setInterval(() => {
      const detectionStats = this.getStats();
      const insightsStats = this.getInsightsStats();
      if (detectionStats.totalDetections > 0 || insightsStats.totalGenerations > 0) {
        console.log("[PerformanceMonitor] Periodic Stats Report", {
          detection: detectionStats,
          insights: insightsStats,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }, 5 * 60 * 1e3);
  }
  /**
   * Stop periodic monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  /**
   * Resets all metrics (useful for testing)
   */
  reset() {
    this.metrics = [];
    this.insightsMetrics = [];
  }
};
var performanceMonitor = PerformanceMonitor.getInstance();

// server/services/tech-detection.ts
var TechDetectionService = class {
  timeout = 15e3;
  // 15 seconds
  maxRetries = 1;
  // Single retry on failure
  performanceMonitor = PerformanceMonitor.getInstance();
  /**
   * Detects technologies used by a website with retry logic
   * @param url - The URL to analyze
   * @returns Detection result or null if detection fails
   */
  async detectTechnologies(url) {
    const requestId = nanoid(10);
    const startTime = Date.now();
    try {
      const sanitizedUrl = this.sanitizeUrl(url);
      if (!sanitizedUrl) {
        this.logError(requestId, url, "Invalid URL format", 0);
        return null;
      }
      const result = await this.detectWithRetry(sanitizedUrl, requestId, startTime);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logError(requestId, url, error.message, duration);
      return null;
    }
  }
  /**
   * Attempts detection with retry logic
   */
  async detectWithRetry(url, requestId, startTime) {
    let lastError = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Detection timeout")), this.timeout);
        });
        const detectionPromise = this.runDetection(url);
        const technologies = await Promise.race([detectionPromise, timeoutPromise]);
        const duration2 = Date.now() - startTime;
        this.logSuccess(requestId, url, technologies.length, duration2);
        this.performanceMonitor.recordDetection(duration2, true, technologies.length, false);
        return {
          technologies,
          contentType: "text/html",
          detectedAt: (/* @__PURE__ */ new Date()).toISOString(),
          success: true
        };
      } catch (error) {
        lastError = error;
        if (this.isValidationError(lastError) || attempt === this.maxRetries) {
          break;
        }
        this.logRetry(requestId, url, attempt + 1, lastError.message);
        await new Promise((resolve) => setTimeout(resolve, 1e3 * (attempt + 1)));
      }
    }
    const duration = Date.now() - startTime;
    this.logError(requestId, url, lastError?.message || "Unknown error", duration);
    this.performanceMonitor.recordDetection(duration, false, 0, false);
    return null;
  }
  /**
   * Runs the actual Wappalyzer detection
   */
  async runDetection(url) {
    const wappalyzer = new Wappalyzer();
    const results = await wappalyzer.analyze(url);
    return results.map((tech) => ({
      name: tech.name,
      categories: tech.categories || [],
      confidence: tech.confidence || 100,
      version: tech.version,
      website: tech.website,
      icon: tech.icon
    }));
  }
  /**
   * Validates and sanitizes URL
   */
  sanitizeUrl(url) {
    try {
      const trimmed = url.trim();
      if (trimmed.length === 0 || trimmed.length > 2048) {
        return null;
      }
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
      }
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === "localhost" || hostname.startsWith("127.") || hostname.startsWith("192.168.") || hostname.startsWith("10.") || hostname.startsWith("172.16.") || hostname.startsWith("172.17.") || hostname.startsWith("172.18.") || hostname.startsWith("172.19.") || hostname.startsWith("172.20.") || hostname.startsWith("172.21.") || hostname.startsWith("172.22.") || hostname.startsWith("172.23.") || hostname.startsWith("172.24.") || hostname.startsWith("172.25.") || hostname.startsWith("172.26.") || hostname.startsWith("172.27.") || hostname.startsWith("172.28.") || hostname.startsWith("172.29.") || hostname.startsWith("172.30.") || hostname.startsWith("172.31.")) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }
  /**
   * Checks if error is a validation error (should not retry)
   */
  isValidationError(error) {
    const message = error.message.toLowerCase();
    return message.includes("invalid url") || message.includes("validation");
  }
  /**
   * Logs successful detection
   */
  logSuccess(requestId, url, technologiesDetected, duration) {
    const log2 = {
      requestId,
      url,
      service: "tech-detection",
      duration,
      success: true,
      technologiesDetected,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: "INFO"
    };
    if (duration > 1e4) {
      log2.level = "WARN";
      console.warn("[TechDetection]", JSON.stringify(log2));
    } else {
      console.log("[TechDetection]", JSON.stringify(log2));
    }
  }
  /**
   * Logs detection error
   */
  logError(requestId, url, error, duration) {
    const log2 = {
      requestId,
      url,
      service: "tech-detection",
      duration,
      success: false,
      error,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: "ERROR"
    };
    console.error("[TechDetection]", JSON.stringify(log2));
  }
  /**
   * Logs retry attempt
   */
  logRetry(requestId, url, attempt, error) {
    const log2 = {
      requestId,
      url,
      service: "tech-detection",
      retryAttempt: attempt,
      error,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      level: "WARN"
    };
    console.warn("[TechDetection] Retry attempt", JSON.stringify(log2));
  }
};

// server/services/complexity-calculator.ts
var ComplexityCalculator = class {
  // Frontend technologies categorized by complexity
  noCodePlatforms = [
    "Webflow",
    "Wix",
    "Squarespace",
    "Shopify",
    "WordPress.com"
  ];
  staticSiteGenerators = [
    "Jekyll",
    "Hugo",
    "Eleventy",
    "11ty"
  ];
  modernFrameworks = [
    "React",
    "Vue.js",
    "Next.js",
    "Nuxt.js",
    "Svelte",
    "Gatsby",
    "Astro"
  ];
  complexFrameworks = [
    "Angular",
    "Ember",
    "Backbone"
  ];
  // Backend technologies categorized by complexity
  serverlessBackend = [
    "Firebase",
    "Supabase",
    "AWS Lambda",
    "Vercel Functions",
    "Netlify Functions"
  ];
  simpleBackend = [
    "Express",
    "Flask",
    "FastAPI",
    "Sinatra"
  ];
  complexBackend = [
    "Node.js",
    "Django",
    "Ruby on Rails",
    "Laravel",
    "Spring",
    "ASP.NET",
    "NestJS"
  ];
  microservicesTech = [
    "Kubernetes",
    "Docker",
    "Consul",
    "Istio",
    "Envoy",
    "Service Mesh"
  ];
  // Infrastructure technologies categorized by complexity
  managedHosting = [
    "Vercel",
    "Netlify",
    "GitHub Pages",
    "Cloudflare Pages"
  ];
  simpleHosting = [
    "Heroku",
    "DigitalOcean",
    "Render",
    "Railway",
    "Fly.io"
  ];
  cloudPlatforms = [
    "AWS",
    "Google Cloud",
    "Azure",
    "GCP"
  ];
  containerOrchestration = [
    "Kubernetes",
    "Docker Swarm",
    "ECS",
    "EKS"
  ];
  // Commercial/licensed technologies
  commercialLicenses = [
    "Oracle",
    "Microsoft SQL Server",
    "SAP",
    "Salesforce",
    "Adobe"
  ];
  /**
   * Calculates complexity score based on detected technologies
   * @param technologies - Array of detected technologies
   * @returns Complexity score (1-10) and contributing factors
   */
  calculateComplexity(technologies) {
    const enhanced = this.calculateEnhancedComplexity(technologies);
    return {
      score: enhanced.score,
      factors: enhanced.factors
    };
  }
  /**
   * Calculates enhanced complexity with breakdown and explanation
   * @param technologies - Array of detected technologies
   * @returns Enhanced complexity result with breakdown
   */
  calculateEnhancedComplexity(technologies) {
    const techNames = technologies.map((t) => t.name);
    const techCount = technologies.length;
    const breakdown = this.calculateBreakdown(techNames);
    let score = breakdown.frontend.score + breakdown.backend.score + breakdown.infrastructure.score;
    if (techCount > 20) {
      score += 2;
    } else if (techCount > 10) {
      score += 1;
    }
    const hasCommercialLicense = this.hasAnyTechnology(techNames, this.commercialLicenses);
    if (hasCommercialLicense) {
      score += 1;
    }
    const finalScore = Math.max(1, Math.min(10, score));
    const hasNoCode = this.hasAnyTechnology(techNames, this.noCodePlatforms);
    const hasModernFramework = this.hasAnyTechnology(techNames, this.modernFrameworks);
    const hasComplexBackend = this.hasAnyTechnology(techNames, this.complexBackend);
    const hasMicroservices = this.hasAnyTechnology(techNames, this.microservicesTech);
    const hasCustomInfra = this.hasAnyTechnology(techNames, this.cloudPlatforms);
    const factors = {
      customCode: !hasNoCode && (hasModernFramework || hasComplexBackend),
      frameworkComplexity: this.determineFrameworkComplexity(
        hasNoCode,
        hasModernFramework,
        hasComplexBackend
      ),
      infrastructureComplexity: this.determineInfrastructureComplexity(
        hasMicroservices,
        hasCustomInfra
      ),
      technologyCount: techCount,
      licensingComplexity: hasCommercialLicense
    };
    const explanation = this.generateExplanation(finalScore, breakdown, factors);
    return {
      score: finalScore,
      breakdown,
      factors,
      explanation
    };
  }
  /**
   * Calculates breakdown by component (frontend, backend, infrastructure)
   */
  calculateBreakdown(techNames) {
    let frontendScore = 0;
    const frontendTechs = [];
    if (this.hasAnyTechnology(techNames, this.noCodePlatforms)) {
      frontendScore = 0;
      frontendTechs.push(...this.filterTechnologies(techNames, this.noCodePlatforms));
    } else if (this.hasAnyTechnology(techNames, this.complexFrameworks)) {
      frontendScore = 3;
      frontendTechs.push(...this.filterTechnologies(techNames, this.complexFrameworks));
    } else if (this.hasAnyTechnology(techNames, this.modernFrameworks)) {
      frontendScore = 2;
      frontendTechs.push(...this.filterTechnologies(techNames, this.modernFrameworks));
    } else if (this.hasAnyTechnology(techNames, this.staticSiteGenerators)) {
      frontendScore = 1;
      frontendTechs.push(...this.filterTechnologies(techNames, this.staticSiteGenerators));
    }
    let backendScore = 0;
    const backendTechs = [];
    if (this.hasAnyTechnology(techNames, this.microservicesTech)) {
      backendScore = 4;
      backendTechs.push(...this.filterTechnologies(techNames, this.microservicesTech));
    } else if (this.hasAnyTechnology(techNames, this.complexBackend)) {
      backendScore = 3;
      backendTechs.push(...this.filterTechnologies(techNames, this.complexBackend));
    } else if (this.hasAnyTechnology(techNames, this.simpleBackend)) {
      backendScore = 2;
      backendTechs.push(...this.filterTechnologies(techNames, this.simpleBackend));
    } else if (this.hasAnyTechnology(techNames, this.serverlessBackend)) {
      backendScore = 1;
      backendTechs.push(...this.filterTechnologies(techNames, this.serverlessBackend));
    }
    let infraScore = 0;
    const infraTechs = [];
    if (this.hasAnyTechnology(techNames, this.containerOrchestration)) {
      infraScore = 3;
      infraTechs.push(...this.filterTechnologies(techNames, this.containerOrchestration));
    } else if (this.hasAnyTechnology(techNames, this.cloudPlatforms)) {
      infraScore = 2;
      infraTechs.push(...this.filterTechnologies(techNames, this.cloudPlatforms));
    } else if (this.hasAnyTechnology(techNames, this.simpleHosting)) {
      infraScore = 1;
      infraTechs.push(...this.filterTechnologies(techNames, this.simpleHosting));
    } else if (this.hasAnyTechnology(techNames, this.managedHosting)) {
      infraScore = 0;
      infraTechs.push(...this.filterTechnologies(techNames, this.managedHosting));
    }
    return {
      frontend: { score: frontendScore, max: 3, technologies: frontendTechs },
      backend: { score: backendScore, max: 4, technologies: backendTechs },
      infrastructure: { score: infraScore, max: 3, technologies: infraTechs }
    };
  }
  /**
   * Generates human-readable explanation of complexity score
   */
  generateExplanation(score, breakdown, factors) {
    const parts = [];
    if (score <= 3) {
      parts.push("This is a low-complexity stack that should be relatively easy to clone.");
    } else if (score <= 6) {
      parts.push("This is a moderate-complexity stack that will require solid development skills.");
    } else {
      parts.push("This is a high-complexity stack that will be challenging to clone.");
    }
    if (breakdown.frontend.score === 0) {
      parts.push("The frontend uses a no-code platform, minimizing development effort.");
    } else if (breakdown.frontend.score === 1) {
      parts.push("The frontend is relatively simple with static site generation.");
    } else if (breakdown.frontend.score === 2) {
      parts.push("The frontend uses modern frameworks requiring intermediate skills.");
    } else if (breakdown.frontend.score === 3) {
      parts.push("The frontend uses complex frameworks requiring advanced skills.");
    }
    if (breakdown.backend.score === 0) {
      parts.push("No backend detected or minimal backend requirements.");
    } else if (breakdown.backend.score === 1) {
      parts.push("The backend uses serverless/BaaS solutions, reducing complexity.");
    } else if (breakdown.backend.score === 2) {
      parts.push("The backend uses simple frameworks that are beginner-friendly.");
    } else if (breakdown.backend.score === 3) {
      parts.push("The backend uses complex frameworks requiring significant experience.");
    } else if (breakdown.backend.score === 4) {
      parts.push("The backend uses microservices architecture, requiring advanced expertise.");
    }
    if (breakdown.infrastructure.score === 0) {
      parts.push("Infrastructure is fully managed, requiring minimal DevOps knowledge.");
    } else if (breakdown.infrastructure.score === 1) {
      parts.push("Infrastructure uses simple hosting with basic DevOps requirements.");
    } else if (breakdown.infrastructure.score === 2) {
      parts.push("Infrastructure uses cloud platforms requiring intermediate DevOps skills.");
    } else if (breakdown.infrastructure.score === 3) {
      parts.push("Infrastructure uses container orchestration requiring advanced DevOps expertise.");
    }
    if (factors.technologyCount > 20) {
      parts.push(`The large number of technologies (${factors.technologyCount}) adds significant integration complexity.`);
    } else if (factors.technologyCount > 10) {
      parts.push(`The moderate number of technologies (${factors.technologyCount}) requires careful integration.`);
    }
    if (factors.licensingComplexity) {
      parts.push("Commercial licensing adds cost and legal complexity.");
    }
    return parts.join(" ");
  }
  /**
   * Checks if any technology from the list is present
   */
  hasAnyTechnology(detectedTech, techList) {
    return detectedTech.some(
      (tech) => techList.some((listTech) => tech.toLowerCase().includes(listTech.toLowerCase()))
    );
  }
  /**
   * Filters and returns technologies that match the given list
   */
  filterTechnologies(detectedTech, techList) {
    return detectedTech.filter(
      (tech) => techList.some((listTech) => tech.toLowerCase().includes(listTech.toLowerCase()))
    );
  }
  /**
   * Determines framework complexity level
   */
  determineFrameworkComplexity(hasNoCode, hasModernFramework, hasComplexBackend) {
    if (hasNoCode) return "low";
    if (hasComplexBackend) return "high";
    if (hasModernFramework) return "medium";
    return "low";
  }
  /**
   * Determines infrastructure complexity level
   */
  determineInfrastructureComplexity(hasMicroservices, hasCustomInfra) {
    if (hasMicroservices) return "high";
    if (hasCustomInfra) return "medium";
    return "low";
  }
};

// server/services/technology-knowledge-base.ts
import { readFileSync } from "fs";
import { join } from "path";
var TechnologyKnowledgeBase = class _TechnologyKnowledgeBase {
  static instance;
  technologies = /* @__PURE__ */ new Map();
  categorizedTechnologies = /* @__PURE__ */ new Map();
  isLoaded = false;
  constructor() {
  }
  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!_TechnologyKnowledgeBase.instance) {
      _TechnologyKnowledgeBase.instance = new _TechnologyKnowledgeBase();
    }
    return _TechnologyKnowledgeBase.instance;
  }
  /**
   * Load technology data from JSON file
   * Should be called once on server start
   */
  loadData() {
    if (this.isLoaded) {
      return;
    }
    try {
      const dataPath = join(process.cwd(), "dist/data/technology-knowledge-base.json");
      const rawData = readFileSync(dataPath, "utf-8");
      const data = JSON.parse(rawData);
      this.technologies.clear();
      this.categorizedTechnologies.clear();
      for (const tech of data.technologies) {
        const normalizedName = tech.name.toLowerCase();
        this.technologies.set(normalizedName, tech);
        if (!this.categorizedTechnologies.has(tech.category)) {
          this.categorizedTechnologies.set(tech.category, []);
        }
        this.categorizedTechnologies.get(tech.category).push(tech);
      }
      this.isLoaded = true;
      console.log(`\u2713 Loaded ${this.technologies.size} technologies from knowledge base`);
    } catch (error) {
      console.error("Failed to load technology knowledge base:", error);
      throw new Error("Failed to initialize technology knowledge base");
    }
  }
  /**
   * Get technology profile by name with O(1) lookup
   * Returns undefined if technology not found
   */
  getTechnology(name) {
    if (!this.isLoaded) {
      this.loadData();
    }
    const normalizedName = name.toLowerCase();
    const tech = this.technologies.get(normalizedName);
    if (tech) {
      return tech;
    }
    return this.findTechnologyByPartialMatch(normalizedName);
  }
  /**
   * Get all technologies in a specific category
   */
  getTechnologiesByCategory(category) {
    if (!this.isLoaded) {
      this.loadData();
    }
    return this.categorizedTechnologies.get(category) || [];
  }
  /**
   * Get all available categories
   */
  getCategories() {
    if (!this.isLoaded) {
      this.loadData();
    }
    return Array.from(this.categorizedTechnologies.keys());
  }
  /**
   * Get fallback profile for unknown technologies
   */
  getFallbackProfile(name, detectedCategory) {
    return {
      name,
      category: detectedCategory || "unknown",
      difficulty: "medium",
      description: `${name} - Technology details not available in knowledge base`,
      alternatives: [],
      costEstimate: {
        development: "medium",
        hosting: "medium",
        maintenance: "medium"
      },
      learningResources: [],
      typicalUseCase: "General purpose technology",
      marketDemand: "medium"
    };
  }
  /**
   * Search for technology by partial name match
   * Used as fallback when exact match fails
   */
  findTechnologyByPartialMatch(searchTerm) {
    const entries = Array.from(this.technologies.entries());
    for (const [name, tech] of entries) {
      if (name.includes(searchTerm) || searchTerm.includes(name)) {
        return tech;
      }
    }
    return void 0;
  }
  /**
   * Get technology alternatives with enriched data
   */
  getTechnologyAlternatives(technologyName) {
    const tech = this.getTechnology(technologyName);
    if (!tech || !tech.alternatives) {
      return [];
    }
    return tech.alternatives.map((altName) => {
      const altTech = this.getTechnology(altName);
      return {
        name: altName,
        difficulty: altTech?.difficulty || "unknown",
        marketDemand: altTech?.marketDemand || "unknown"
      };
    });
  }
  /**
   * Get SaaS alternatives for a technology category
   */
  getSaasAlternatives(category) {
    const techs = this.getTechnologiesByCategory(category);
    return techs.filter(
      (tech) => tech.category.includes("service") || tech.category.includes("platform") || tech.category.includes("hosting")
    ).map((tech) => ({
      name: tech.name,
      category: tech.category,
      costEstimate: tech.costEstimate
    }));
  }
  /**
   * Get learning resources for a technology
   */
  getLearningResources(technologyName) {
    const tech = this.getTechnology(technologyName);
    if (!tech || !tech.learningResources) {
      return [];
    }
    return tech.learningResources.map((url) => ({
      url,
      type: this.inferResourceType(url)
    }));
  }
  /**
   * Infer resource type from URL
   */
  inferResourceType(url) {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("docs") || lowerUrl.includes("documentation") || lowerUrl.includes(".dev") || lowerUrl.includes("developer.")) {
      return "documentation";
    }
    if (lowerUrl.includes("tutorial")) {
      return "tutorial";
    }
    if (lowerUrl.includes("course") || lowerUrl.includes("udemy") || lowerUrl.includes("egghead") || lowerUrl.includes("university")) {
      return "course";
    }
    if (lowerUrl.includes("guide")) {
      return "guide";
    }
    return "resource";
  }
  /**
   * Get all technologies (for testing/debugging)
   */
  getAllTechnologies() {
    if (!this.isLoaded) {
      this.loadData();
    }
    return Array.from(this.technologies.values());
  }
  /**
   * Check if knowledge base is loaded
   */
  isDataLoaded() {
    return this.isLoaded;
  }
};
var technologyKnowledgeBase = TechnologyKnowledgeBase.getInstance();

// server/services/insights-cache.ts
var InsightsCache = class _InsightsCache {
  static instance;
  cache = /* @__PURE__ */ new Map();
  TTL = 24 * 60 * 60 * 1e3;
  // 24 hours in milliseconds
  stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0
  };
  // Common technology combinations for cache warming
  COMMON_TECH_PATTERNS = [
    ["React", "Node.js", "PostgreSQL"],
    ["Next.js", "Vercel", "Supabase"],
    ["Vue.js", "Express", "MongoDB"],
    ["Angular", "NestJS", "MySQL"],
    ["Svelte", "Firebase", "Firestore"]
  ];
  constructor() {
    this.startCleanupInterval();
  }
  static getInstance() {
    if (!this.instance) {
      this.instance = new _InsightsCache();
    }
    return this.instance;
  }
  /**
   * Generate cache key from technology names
   */
  generateKey(technologies) {
    return technologies.map((t) => t.toLowerCase().trim()).sort().join("|");
  }
  /**
   * Get cached insights for a set of technologies
   */
  get(technologies) {
    const key = this.generateKey(technologies);
    const cached = this.cache.get(key);
    if (!cached) {
      this.stats.misses++;
      this.logCacheEvent("miss", key);
      return null;
    }
    const age = Date.now() - cached.timestamp;
    if (age > this.TTL) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.logCacheEvent("expired", key, age);
      return null;
    }
    this.stats.hits++;
    this.logCacheEvent("hit", key, age);
    return cached.insights;
  }
  /**
   * Store insights in cache
   */
  set(technologies, insights, analysisId) {
    const key = this.generateKey(technologies);
    this.cache.set(key, {
      insights,
      timestamp: Date.now(),
      analysisId
    });
    this.stats.size = this.cache.size;
    this.logCacheEvent("set", key);
  }
  /**
   * Warm cache with common technology patterns
   */
  async warmCache(insightsGenerator) {
    console.log("[InsightsCache] Starting cache warming...");
    const startTime = Date.now();
    for (const techPattern of this.COMMON_TECH_PATTERNS) {
      try {
        if (this.get(techPattern)) {
          continue;
        }
        const insights = await insightsGenerator(techPattern);
        this.set(techPattern, insights, "cache-warming");
        console.log(`[InsightsCache] Warmed cache for: ${techPattern.join(", ")}`);
      } catch (error) {
        console.error(`[InsightsCache] Failed to warm cache for ${techPattern.join(", ")}:`, error);
      }
    }
    const duration = Date.now() - startTime;
    console.log(`[InsightsCache] Cache warming completed in ${duration}ms`);
  }
  /**
   * Clear all cached entries
   */
  clear() {
    const previousSize = this.cache.size;
    this.cache.clear();
    this.stats.size = 0;
    console.log(`[InsightsCache] Cleared ${previousSize} cache entries`);
  }
  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    let cleared = 0;
    const entries = Array.from(this.cache.entries());
    for (const [key, cached] of entries) {
      const age = now - cached.timestamp;
      if (age > this.TTL) {
        this.cache.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      this.stats.evictions += cleared;
      this.stats.size = this.cache.size;
      console.log(`[InsightsCache] Cleared ${cleared} expired entries`);
    }
    return cleared;
  }
  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }
  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: this.cache.size
    };
  }
  /**
   * Log cache events with structured format
   */
  logCacheEvent(event, key, age) {
    const logData = {
      service: "insights-cache",
      event,
      key: key.substring(0, 50),
      // Truncate long keys
      age: age ? Math.round(age / 1e3) : void 0,
      // Convert to seconds
      stats: this.getStats(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (event === "miss" || event === "expired") {
      console.log(JSON.stringify(logData));
    }
  }
  /**
   * Start periodic cleanup of expired entries
   */
  startCleanupInterval() {
    setInterval(() => {
      this.clearExpired();
    }, 60 * 60 * 1e3);
  }
  /**
   * Get cache entry age in milliseconds
   */
  getEntryAge(technologies) {
    const key = this.generateKey(technologies);
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }
    return Date.now() - cached.timestamp;
  }
  /**
   * Check if cache entry exists and is valid
   */
  has(technologies) {
    const key = this.generateKey(technologies);
    const cached = this.cache.get(key);
    if (!cached) {
      return false;
    }
    const age = Date.now() - cached.timestamp;
    return age <= this.TTL;
  }
};
var insightsCache = InsightsCache.getInstance();

// server/services/technology-insights.ts
var TechnologyInsightsService = class {
  maxRetries = 2;
  retryDelay = 100;
  // ms
  /**
   * Generate comprehensive insights from detected technologies
   * Includes error handling and graceful degradation
   */
  generateInsights(technologies, complexityScore) {
    const startTime = Date.now();
    try {
      const techNames = technologies.map((t) => t.name);
      const cached = insightsCache.get(techNames);
      if (cached) {
        const duration2 = Date.now() - startTime;
        performanceMonitor.recordInsightsGeneration(duration2, true);
        this.logInsightsGeneration("success", duration2, true, technologies.length);
        return cached;
      }
      if (!technologyKnowledgeBase.isDataLoaded()) {
        technologyKnowledgeBase.loadData();
      }
      const insights = this.generateInsightsWithRetry(technologies, complexityScore);
      insightsCache.set(techNames, insights, "generated");
      const duration = Date.now() - startTime;
      performanceMonitor.recordInsightsGeneration(duration, false);
      if (duration > 500) {
        console.warn(`[TechnologyInsights] Insights generation took ${duration}ms (target: <500ms)`);
      }
      this.logInsightsGeneration("success", duration, false, technologies.length);
      return insights;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logInsightsError(error, technologies.length, duration);
      return this.generateFallbackInsights(technologies, complexityScore);
    }
  }
  /**
   * Generate insights with retry logic for transient failures
   */
  generateInsightsWithRetry(technologies, complexityScore, attempt = 1) {
    try {
      return this.generateInsightsInternal(technologies, complexityScore);
    } catch (error) {
      if (attempt < this.maxRetries) {
        console.warn(`[TechnologyInsights] Attempt ${attempt} failed, retrying...`, {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          maxRetries: this.maxRetries
        });
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        this.sleep(delay);
        return this.generateInsightsWithRetry(technologies, complexityScore, attempt + 1);
      }
      throw error;
    }
  }
  /**
   * Sleep for specified milliseconds (synchronous)
   */
  sleep(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
    }
  }
  /**
   * Generate fallback insights when full generation fails
   */
  generateFallbackInsights(technologies, complexityScore) {
    console.log("[TechnologyInsights] Generating fallback insights");
    try {
      const basicSkills = this.extractBasicSkills(technologies);
      const basicEstimates = this.getDefaultEstimates(complexityScore);
      const fallbackRecommendations = this.getFallbackRecommendations(complexityScore);
      return {
        alternatives: {},
        buildVsBuy: [],
        skills: basicSkills,
        estimates: basicEstimates,
        recommendations: fallbackRecommendations,
        summary: this.generateFallbackSummary(technologies.length, complexityScore)
      };
    } catch (fallbackError) {
      console.error("[TechnologyInsights] Fallback generation failed:", fallbackError);
      return this.getMinimalInsights();
    }
  }
  /**
   * Extract basic skills without knowledge base
   */
  extractBasicSkills(technologies) {
    const skills = [];
    for (const tech of technologies) {
      const techName = tech.name.toLowerCase();
      if (techName.includes("react") || techName.includes("vue") || techName.includes("angular")) {
        skills.push({
          skill: "Frontend Development",
          proficiency: "intermediate",
          category: "Frontend",
          estimatedLearningTime: "2-3 months"
        });
      }
      if (techName.includes("node") || techName.includes("express") || techName.includes("django")) {
        skills.push({
          skill: "Backend Development",
          proficiency: "intermediate",
          category: "Backend",
          estimatedLearningTime: "2-3 months"
        });
      }
      if (techName.includes("postgres") || techName.includes("mysql") || techName.includes("mongo")) {
        skills.push({
          skill: "Database Management",
          proficiency: "beginner",
          category: "Database",
          estimatedLearningTime: "1-2 months"
        });
      }
    }
    const uniqueSkills = skills.filter(
      (skill, index, self) => index === self.findIndex((s) => s.skill === skill.skill)
    );
    return uniqueSkills.length > 0 ? uniqueSkills : [{
      skill: "Full-Stack Development",
      proficiency: "intermediate",
      category: "General",
      estimatedLearningTime: "3-6 months"
    }];
  }
  /**
   * Get default estimates based on complexity
   */
  getDefaultEstimates(complexityScore) {
    const timeMultiplier = complexityScore / 5;
    const baseWeeks = Math.round(12 * timeMultiplier);
    return {
      timeEstimate: {
        minimum: this.formatWeeksToTime(Math.round(baseWeeks * 0.7)),
        maximum: this.formatWeeksToTime(Math.round(baseWeeks * 1.5)),
        realistic: this.formatWeeksToTime(baseWeeks)
      },
      costEstimate: {
        development: complexityScore <= 5 ? "$15,000-$50,000" : "$50,000-$150,000",
        infrastructure: "$100-$500/month",
        maintenance: "$2,000-$10,000/month",
        total: complexityScore <= 5 ? "$50,000-$150,000 (first year)" : "$150,000-$500,000 (first year)"
      },
      teamSize: {
        minimum: complexityScore <= 5 ? 1 : 2,
        recommended: complexityScore <= 5 ? 2 : 3
      }
    };
  }
  /**
   * Get fallback recommendations
   */
  getFallbackRecommendations(complexityScore) {
    return [
      {
        priority: "high",
        category: "Notice",
        title: "Limited Insights Available",
        description: "Detailed technology insights could not be generated. The analysis continues with basic recommendations.",
        impact: "Some advanced recommendations may not be available. Consider manual research for specific technologies."
      },
      {
        priority: "medium",
        category: "Strategy",
        title: "Start with MVP",
        description: "Focus on core features first to validate the concept before building the full solution.",
        impact: "Reduces initial development time and allows for early user feedback."
      },
      {
        priority: "medium",
        category: "Development",
        title: "Use Established Technologies",
        description: "Stick to well-documented, popular technologies to ensure good community support.",
        impact: "Easier to find resources, tutorials, and developers familiar with the stack."
      }
    ];
  }
  /**
   * Generate fallback summary
   */
  generateFallbackSummary(techCount, complexityScore) {
    const complexityLevel = complexityScore <= 3 ? "simple" : complexityScore <= 6 ? "moderate" : "complex";
    return `This stack uses ${techCount} detected technologies with ${complexityLevel} complexity. Detailed insights are limited, but the analysis suggests careful planning and potentially consulting with experienced developers for successful implementation.`;
  }
  /**
   * Get minimal insights when everything fails
   */
  getMinimalInsights() {
    return {
      alternatives: {},
      buildVsBuy: [],
      skills: [],
      estimates: {
        timeEstimate: {
          minimum: "3 months",
          maximum: "12 months",
          realistic: "6 months"
        },
        costEstimate: {
          development: "$30,000-$100,000",
          infrastructure: "$100-$1,000/month",
          maintenance: "$5,000-$20,000/month",
          total: "$100,000-$300,000 (first year)"
        },
        teamSize: {
          minimum: 1,
          recommended: 2
        }
      },
      recommendations: [
        {
          priority: "high",
          category: "Notice",
          title: "Insights Unavailable",
          description: "Technology insights could not be generated. Please review the detected technologies manually.",
          impact: "Manual analysis required for accurate planning."
        }
      ],
      summary: "Technology insights are temporarily unavailable. The analysis continues with basic information."
    };
  }
  /**
   * Log insights generation with structured format
   */
  logInsightsGeneration(status, duration, cached, techCount) {
    console.log(JSON.stringify({
      service: "technology-insights",
      action: "generate-insights",
      status,
      duration,
      cached,
      techCount,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  /**
   * Log insights error with structured format
   */
  logInsightsError(error, techCount, duration) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : void 0;
    console.error(JSON.stringify({
      service: "technology-insights",
      action: "generate-insights",
      status: "error",
      error: errorMessage,
      stack: errorStack,
      techCount,
      duration,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  /**
   * Internal method to generate insights (without caching)
   */
  generateInsightsInternal(technologies, complexityScore) {
    const alternatives = {};
    for (const tech of technologies) {
      const alts = this.getAlternatives(tech.name);
      if (alts.length > 0) {
        alternatives[tech.name] = alts;
      }
    }
    const buildVsBuy = this.analyzeBuildVsBuy(technologies);
    const skills = this.extractSkillRequirements(technologies);
    const estimates = this.calculateEstimates(technologies, complexityScore);
    const recommendations = this.generateRecommendations(
      { alternatives, buildVsBuy, skills, estimates, recommendations: [], summary: "" },
      complexityScore
    );
    const summary = this.generateSummary(technologies, complexityScore, recommendations);
    return {
      alternatives,
      buildVsBuy,
      skills,
      estimates,
      recommendations,
      summary
    };
  }
  /**
   * Get alternatives for a specific technology
   */
  getAlternatives(technology) {
    const profile = technologyKnowledgeBase.getTechnology(technology);
    return profile?.alternatives || [];
  }
  /**
   * Analyze build vs buy decisions for technologies
   */
  analyzeBuildVsBuy(technologies) {
    const recommendations = [];
    for (const tech of technologies) {
      const profile = technologyKnowledgeBase.getTechnology(tech.name);
      if (!profile) continue;
      const recommendation = this.determineBuildVsBuy(profile);
      recommendations.push({
        technology: tech.name,
        recommendation: recommendation.type,
        reasoning: recommendation.reasoning,
        alternatives: profile.alternatives || [],
        estimatedCost: {
          build: profile.costEstimate.development,
          buy: this.estimateSaasCost(profile)
        }
      });
    }
    return recommendations;
  }
  /**
   * Determine build vs buy recommendation for a technology
   */
  determineBuildVsBuy(profile) {
    const category = profile.category.toLowerCase();
    const difficulty = profile.difficulty.toLowerCase();
    if (category.includes("authentication") || category.includes("auth")) {
      return {
        type: "buy",
        reasoning: "Authentication is security-critical and better handled by specialized services. Building custom auth increases security risks and maintenance burden."
      };
    }
    if (category.includes("hosting") || category.includes("platform")) {
      return {
        type: "buy",
        reasoning: "Infrastructure and hosting are best left to specialized providers. Building your own hosting infrastructure is not cost-effective for most projects."
      };
    }
    if (category.includes("payment") || category.includes("commerce")) {
      return {
        type: "buy",
        reasoning: "Payment processing requires PCI compliance and is highly regulated. Use established payment providers to ensure security and compliance."
      };
    }
    if (category.includes("email") || category.includes("messaging")) {
      return {
        type: "buy",
        reasoning: "Email deliverability is complex. Using established email services ensures better inbox placement and reduces spam issues."
      };
    }
    if (category.includes("database")) {
      if (difficulty === "hard" || difficulty === "very-hard") {
        return {
          type: "buy",
          reasoning: "Complex database setups benefit from managed services. They provide automatic backups, scaling, and maintenance."
        };
      }
      return {
        type: "hybrid",
        reasoning: "Consider managed database services for production reliability, but self-hosting is viable for simpler setups or development."
      };
    }
    if (category.includes("framework") || category.includes("frontend") || category.includes("backend")) {
      if (difficulty === "very-easy" || difficulty === "easy") {
        return {
          type: "build",
          reasoning: "This framework is beginner-friendly and well-documented. Building with it gives you full control and customization."
        };
      }
      if (difficulty === "hard" || difficulty === "very-hard") {
        return {
          type: "hybrid",
          reasoning: "Consider using templates, boilerplates, or hiring experienced developers to accelerate development with this complex framework."
        };
      }
      return {
        type: "build",
        reasoning: "Building with this framework provides flexibility and control. The learning curve is manageable with available resources."
      };
    }
    return {
      type: "build",
      reasoning: "This technology is best implemented as part of your custom solution to maintain flexibility and control."
    };
  }
  /**
   * Estimate SaaS cost based on profile
   */
  estimateSaasCost(profile) {
    const category = profile.category.toLowerCase();
    if (category.includes("authentication")) {
      return "free-to-medium ($0-$100/month for small apps)";
    }
    if (category.includes("hosting")) {
      return profile.costEstimate.hosting;
    }
    if (category.includes("database")) {
      return "low-to-medium ($10-$200/month depending on scale)";
    }
    if (category.includes("email")) {
      return "low ($10-$50/month for moderate volume)";
    }
    return "variable (depends on usage and provider)";
  }
  /**
   * Extract skill requirements from technologies
   */
  extractSkillRequirements(technologies) {
    const skillsMap = /* @__PURE__ */ new Map();
    for (const tech of technologies) {
      const profile = technologyKnowledgeBase.getTechnology(tech.name);
      if (!profile) continue;
      const proficiency = this.mapDifficultyToProficiency(profile.difficulty);
      const learningTime = this.estimateLearningTime(profile.difficulty);
      const skillKey = `${profile.name}-${profile.category}`;
      if (!skillsMap.has(skillKey)) {
        skillsMap.set(skillKey, {
          skill: profile.name,
          proficiency,
          category: this.normalizeCategoryName(profile.category),
          estimatedLearningTime: learningTime
        });
      }
      const relatedSkills = this.getRelatedSkills(profile);
      for (const relatedSkill of relatedSkills) {
        const relatedKey = `${relatedSkill.skill}-${relatedSkill.category}`;
        if (!skillsMap.has(relatedKey)) {
          skillsMap.set(relatedKey, relatedSkill);
        }
      }
    }
    return Array.from(skillsMap.values()).sort((a, b) => {
      const proficiencyOrder = { expert: 0, advanced: 1, intermediate: 2, beginner: 3 };
      const profDiff = proficiencyOrder[a.proficiency] - proficiencyOrder[b.proficiency];
      if (profDiff !== 0) return profDiff;
      return a.category.localeCompare(b.category);
    });
  }
  /**
   * Map difficulty to proficiency level
   */
  mapDifficultyToProficiency(difficulty) {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === "very-easy" || difficultyLower === "easy") {
      return "beginner";
    }
    if (difficultyLower === "medium") {
      return "intermediate";
    }
    if (difficultyLower === "hard") {
      return "advanced";
    }
    if (difficultyLower === "very-hard") {
      return "expert";
    }
    return "intermediate";
  }
  /**
   * Estimate learning time based on difficulty
   */
  estimateLearningTime(difficulty) {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === "very-easy") {
      return "1-2 weeks";
    }
    if (difficultyLower === "easy") {
      return "2-4 weeks";
    }
    if (difficultyLower === "medium") {
      return "1-2 months";
    }
    if (difficultyLower === "hard") {
      return "2-4 months";
    }
    if (difficultyLower === "very-hard") {
      return "4-6 months";
    }
    return "1-2 months";
  }
  /**
   * Normalize category name for display
   */
  normalizeCategoryName(category) {
    return category.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  }
  /**
   * Get related skills based on technology profile
   */
  getRelatedSkills(profile) {
    const relatedSkills = [];
    const category = profile.category.toLowerCase();
    if (category.includes("frontend")) {
      relatedSkills.push({
        skill: "JavaScript/TypeScript",
        proficiency: "intermediate",
        category: "Programming Language",
        estimatedLearningTime: "1-2 months"
      });
      relatedSkills.push({
        skill: "HTML/CSS",
        proficiency: "intermediate",
        category: "Web Fundamentals",
        estimatedLearningTime: "2-4 weeks"
      });
    }
    if (category.includes("backend")) {
      if (profile.name.toLowerCase().includes("express") || profile.name.toLowerCase().includes("node")) {
        relatedSkills.push({
          skill: "Node.js",
          proficiency: "intermediate",
          category: "Backend Runtime",
          estimatedLearningTime: "1-2 months"
        });
      }
      if (profile.name.toLowerCase().includes("django") || profile.name.toLowerCase().includes("flask")) {
        relatedSkills.push({
          skill: "Python",
          proficiency: "intermediate",
          category: "Programming Language",
          estimatedLearningTime: "1-2 months"
        });
      }
      if (profile.name.toLowerCase().includes("rails")) {
        relatedSkills.push({
          skill: "Ruby",
          proficiency: "intermediate",
          category: "Programming Language",
          estimatedLearningTime: "1-2 months"
        });
      }
      if (profile.name.toLowerCase().includes("laravel")) {
        relatedSkills.push({
          skill: "PHP",
          proficiency: "intermediate",
          category: "Programming Language",
          estimatedLearningTime: "1-2 months"
        });
      }
      relatedSkills.push({
        skill: "REST API Design",
        proficiency: "intermediate",
        category: "Architecture",
        estimatedLearningTime: "2-4 weeks"
      });
    }
    if (category.includes("database")) {
      if (profile.name.toLowerCase().includes("mongo") || profile.name.toLowerCase().includes("couch")) {
        relatedSkills.push({
          skill: "NoSQL Concepts",
          proficiency: "beginner",
          category: "Database",
          estimatedLearningTime: "1-2 weeks"
        });
      } else {
        relatedSkills.push({
          skill: "SQL",
          proficiency: "intermediate",
          category: "Database",
          estimatedLearningTime: "2-4 weeks"
        });
      }
    }
    if (category.includes("hosting") || category.includes("platform")) {
      relatedSkills.push({
        skill: "DevOps Basics",
        proficiency: "beginner",
        category: "Infrastructure",
        estimatedLearningTime: "2-4 weeks"
      });
      if (profile.difficulty === "hard" || profile.difficulty === "very-hard") {
        relatedSkills.push({
          skill: "Cloud Architecture",
          proficiency: "advanced",
          category: "Infrastructure",
          estimatedLearningTime: "2-4 months"
        });
      }
    }
    return relatedSkills;
  }
  /**
   * Calculate time and cost estimates
   */
  calculateEstimates(technologies, complexityScore) {
    const timeEstimate = this.estimateTime(complexityScore, technologies.length);
    const costEstimate = this.estimateCost(complexityScore, technologies);
    const teamSize = this.estimateTeamSize(complexityScore, technologies);
    return {
      timeEstimate,
      costEstimate,
      teamSize
    };
  }
  /**
   * Estimate development time based on complexity
   */
  estimateTime(complexityScore, techCount) {
    let baseWeeks = 4;
    if (complexityScore <= 3) {
      baseWeeks = 4;
    } else if (complexityScore <= 6) {
      baseWeeks = 12;
    } else {
      baseWeeks = 24;
    }
    const techFactor = Math.min(techCount / 10, 2);
    baseWeeks = Math.round(baseWeeks * (1 + techFactor * 0.3));
    const minimum = this.formatWeeksToTime(Math.round(baseWeeks * 0.7));
    const maximum = this.formatWeeksToTime(Math.round(baseWeeks * 1.5));
    const realistic = this.formatWeeksToTime(baseWeeks);
    return { minimum, maximum, realistic };
  }
  /**
   * Format weeks to human-readable time
   */
  formatWeeksToTime(weeks) {
    if (weeks < 4) {
      return `${weeks} weeks`;
    }
    const months = Math.round(weeks / 4);
    if (months < 12) {
      return `${months} months`;
    }
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years > 1 ? "s" : ""}`;
    }
    return `${years} year${years > 1 ? "s" : ""} ${remainingMonths} months`;
  }
  /**
   * Estimate costs based on complexity and technologies
   */
  estimateCost(complexityScore, technologies) {
    let devCostLevel = "medium";
    let infraCostLevel = "medium";
    let maintCostLevel = "medium";
    const profiles = technologies.map((tech) => technologyKnowledgeBase.getTechnology(tech.name)).filter((p) => p !== void 0);
    if (profiles.length > 0) {
      devCostLevel = this.averageCostLevel(profiles.map((p) => p.costEstimate.development));
      infraCostLevel = this.averageCostLevel(profiles.map((p) => p.costEstimate.hosting));
      maintCostLevel = this.averageCostLevel(profiles.map((p) => p.costEstimate.maintenance));
    }
    if (complexityScore >= 8) {
      devCostLevel = this.increaseCostLevel(devCostLevel);
      maintCostLevel = this.increaseCostLevel(maintCostLevel);
    }
    const development = this.formatCostRange(devCostLevel, "development");
    const infrastructure = this.formatCostRange(infraCostLevel, "infrastructure");
    const maintenance = this.formatCostRange(maintCostLevel, "maintenance");
    const total = this.calculateTotalCost(development, infrastructure, maintenance);
    return { development, infrastructure, maintenance, total };
  }
  /**
   * Average cost level from multiple values
   */
  averageCostLevel(levels) {
    const costMap = {
      "very-low": 1,
      "low": 2,
      "low-to-medium": 2.5,
      "medium": 3,
      "medium-to-high": 3.5,
      "high": 4,
      "very-high": 5,
      "free-to-low": 1.5,
      "free-to-medium": 2,
      "variable": 3
    };
    const reverseMap = {
      1: "very-low",
      2: "low",
      3: "medium",
      4: "high",
      5: "very-high"
    };
    const numericValues = levels.map((level) => costMap[level.toLowerCase()] || 3);
    const average = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    const rounded = Math.round(average);
    return reverseMap[rounded] || "medium";
  }
  /**
   * Increase cost level by one tier
   */
  increaseCostLevel(level) {
    const progression = ["very-low", "low", "medium", "high", "very-high"];
    const currentIndex = progression.indexOf(level);
    if (currentIndex === -1 || currentIndex === progression.length - 1) {
      return level;
    }
    return progression[currentIndex + 1] ?? level;
  }
  /**
   * Format cost level to dollar range
   */
  formatCostRange(level, type) {
    const ranges = {
      development: {
        "very-low": "$5,000-$15,000",
        "low": "$15,000-$30,000",
        "medium": "$30,000-$75,000",
        "high": "$75,000-$150,000",
        "very-high": "$150,000+"
      },
      infrastructure: {
        "very-low": "$0-$50/month",
        "low": "$50-$200/month",
        "medium": "$200-$1,000/month",
        "high": "$1,000-$5,000/month",
        "very-high": "$5,000+/month"
      },
      maintenance: {
        "very-low": "$500-$2,000/month",
        "low": "$2,000-$5,000/month",
        "medium": "$5,000-$15,000/month",
        "high": "$15,000-$30,000/month",
        "very-high": "$30,000+/month"
      }
    };
    const typeRanges = ranges[type];
    if (!typeRanges) return "$0";
    return typeRanges[level] ?? typeRanges["medium"] ?? "$0";
  }
  /**
   * Calculate total cost from components
   */
  calculateTotalCost(dev, infra, maint) {
    const extractMin = (range) => {
      const match = range.match(/\$([0-9,]+)/);
      if (match && match[1]) {
        return parseInt(match[1].replace(/,/g, ""));
      }
      return 0;
    };
    const devMin = extractMin(dev);
    const infraMin = extractMin(infra);
    const maintMin = extractMin(maint);
    const firstYearMin = devMin + infraMin * 12 + maintMin * 12;
    if (firstYearMin < 5e4) {
      return "$25,000-$75,000 (first year)";
    } else if (firstYearMin < 15e4) {
      return "$75,000-$200,000 (first year)";
    } else if (firstYearMin < 3e5) {
      return "$200,000-$500,000 (first year)";
    } else {
      return "$500,000+ (first year)";
    }
  }
  /**
   * Estimate team size based on complexity
   */
  estimateTeamSize(complexityScore, technologies) {
    let minimum = 1;
    let recommended = 2;
    if (complexityScore <= 3) {
      minimum = 1;
      recommended = 1;
    } else if (complexityScore <= 6) {
      minimum = 1;
      recommended = 2;
    } else if (complexityScore <= 8) {
      minimum = 2;
      recommended = 3;
    } else {
      minimum = 3;
      recommended = 5;
    }
    const categories = new Set(
      technologies.map((tech) => technologyKnowledgeBase.getTechnology(tech.name)?.category).filter(Boolean)
    );
    if (categories.size > 5) {
      recommended += 1;
    }
    return { minimum, recommended };
  }
  /**
   * Generate actionable recommendations
   */
  generateRecommendations(insights, complexityScore) {
    const recommendations = [];
    const buyRecommendations = insights.buildVsBuy.filter((b) => b.recommendation === "buy");
    if (buyRecommendations.length > 0) {
      recommendations.push({
        priority: "high",
        category: "Architecture",
        title: "Leverage SaaS Solutions",
        description: `Use managed services for ${buyRecommendations.map((b) => b.technology).join(", ")} to reduce development time and maintenance burden.`,
        impact: `Could save ${this.estimateSavings(buyRecommendations.length)} in development costs and reduce time to market by 30-50%.`
      });
    }
    if (complexityScore >= 7) {
      recommendations.push({
        priority: "high",
        category: "Strategy",
        title: "Build an MVP First",
        description: "Given the high complexity, start with a Minimum Viable Product focusing on core features. This reduces risk and allows for faster validation.",
        impact: "Reduces initial development time by 40-60% and allows for early user feedback."
      });
    }
    const advancedSkills = insights.skills.filter(
      (s) => s.proficiency === "advanced" || s.proficiency === "expert"
    );
    if (advancedSkills.length > 0) {
      recommendations.push({
        priority: "high",
        category: "Team",
        title: "Address Skill Gaps",
        description: `Consider hiring or training for: ${advancedSkills.slice(0, 3).map((s) => s.skill).join(", ")}. These are critical for successful implementation.`,
        impact: "Proper expertise can reduce development time by 30% and improve code quality significantly."
      });
    }
    if (complexityScore >= 5) {
      recommendations.push({
        priority: "medium",
        category: "Development",
        title: "Use Starter Templates",
        description: "Leverage existing templates and boilerplates for your tech stack to accelerate initial setup and follow best practices.",
        impact: "Can save 1-2 weeks of initial setup time and ensure proper project structure."
      });
    }
    const hasComplexInfra = complexityScore >= 6;
    if (hasComplexInfra) {
      recommendations.push({
        priority: "medium",
        category: "Infrastructure",
        title: "Implement Infrastructure as Code",
        description: "Use tools like Terraform or AWS CDK to manage infrastructure. This ensures reproducibility and easier scaling.",
        impact: "Reduces deployment errors by 70% and makes scaling much easier."
      });
    }
    if (complexityScore >= 5) {
      recommendations.push({
        priority: "medium",
        category: "Quality",
        title: "Invest in Automated Testing",
        description: "Set up comprehensive testing (unit, integration, e2e) early. This is crucial for maintaining quality as complexity grows.",
        impact: "Reduces bugs in production by 60% and makes refactoring safer."
      });
    }
    if (complexityScore >= 6) {
      recommendations.push({
        priority: "medium",
        category: "Operations",
        title: "Set Up Monitoring Early",
        description: "Implement logging, monitoring, and error tracking from day one. Tools like Sentry, DataDog, or New Relic are essential.",
        impact: "Reduces mean time to resolution (MTTR) by 50% and improves user experience."
      });
    }
    const techWithAlternatives = insights.buildVsBuy.filter((b) => b.alternatives.length > 0);
    if (techWithAlternatives.length > 0) {
      const example = techWithAlternatives[0];
      if (example) {
        recommendations.push({
          priority: "low",
          category: "Technology",
          title: "Evaluate Technology Alternatives",
          description: `Consider alternatives like ${example.alternatives.slice(0, 2).join(" or ")} for ${example.technology}. They might better fit your team's expertise or project requirements.`,
          impact: "Could reduce learning curve and improve development velocity."
        });
      }
    }
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
  /**
   * Estimate savings from using SaaS
   */
  estimateSavings(count) {
    if (count === 1) return "$5,000-$15,000";
    if (count === 2) return "$15,000-$30,000";
    if (count >= 3) return "$30,000-$50,000";
    return "$5,000+";
  }
  /**
   * Generate summary of insights
   */
  generateSummary(technologies, complexityScore, recommendations) {
    const parts = [];
    if (complexityScore <= 3) {
      parts.push("This is a relatively simple stack that can be cloned with basic development skills.");
    } else if (complexityScore <= 6) {
      parts.push("This is a moderately complex stack requiring solid full-stack development experience.");
    } else {
      parts.push("This is a highly complex stack that will require an experienced team and significant resources.");
    }
    parts.push(`The stack uses ${technologies.length} detected technologies across multiple categories.`);
    if (recommendations.length > 0) {
      const topRec = recommendations[0];
      if (topRec) {
        parts.push(`Key recommendation: ${topRec.title} - ${topRec.description}`);
      }
    }
    return parts.join(" ");
  }
};
var technologyInsightsService = new TechnologyInsightsService();

// server/services/clonability-score.ts
var ClonabilityScoreService = class {
  // Component weights (must sum to 1.0)
  WEIGHTS = {
    technicalComplexity: 0.4,
    marketOpportunity: 0.3,
    resourceRequirements: 0.2,
    timeToMarket: 0.1
  };
  /**
   * Calculate clonability score from multiple factors
   */
  calculateClonability(technicalComplexity, marketData, resourceEstimates) {
    const techScore = this.calculateTechnicalScore(technicalComplexity);
    const marketScore = this.calculateMarketScore(marketData);
    const resourceScore = this.calculateResourceScore(resourceEstimates);
    const timeScore = this.calculateTimeScore(resourceEstimates);
    const totalScore = techScore * this.WEIGHTS.technicalComplexity + marketScore * this.WEIGHTS.marketOpportunity + resourceScore * this.WEIGHTS.resourceRequirements + timeScore * this.WEIGHTS.timeToMarket;
    const finalScore = Math.round(totalScore);
    const confidence = this.calculateConfidence(marketData, resourceEstimates);
    return {
      score: finalScore,
      rating: this.getRating(finalScore),
      components: {
        technicalComplexity: { score: techScore, weight: this.WEIGHTS.technicalComplexity },
        marketOpportunity: { score: marketScore, weight: this.WEIGHTS.marketOpportunity },
        resourceRequirements: { score: resourceScore, weight: this.WEIGHTS.resourceRequirements },
        timeToMarket: { score: timeScore, weight: this.WEIGHTS.timeToMarket }
      },
      recommendation: this.getRecommendation(finalScore, techScore, marketScore),
      confidence
    };
  }
  /**
   * Calculate technical complexity score (inverted: lower complexity = higher score)
   */
  calculateTechnicalScore(complexityScore) {
    return 11 - complexityScore;
  }
  /**
   * Calculate market opportunity score based on SWOT and competition
   */
  calculateMarketScore(marketData) {
    if (!marketData?.market) {
      return 5;
    }
    let score = 5;
    const { swot, competitors } = marketData.market;
    const strengthsCount = swot.strengths.length;
    const weaknessesCount = swot.weaknesses.length;
    const opportunitiesCount = swot.opportunities.length;
    const threatsCount = swot.threats.length;
    score += Math.min(opportunitiesCount * 0.5, 2);
    score -= Math.min(strengthsCount * 0.3, 1.5);
    score += Math.min(weaknessesCount * 0.3, 1.5);
    score -= Math.min(threatsCount * 0.4, 2);
    const competitorCount = competitors.length;
    if (competitorCount === 0) {
      score += 2;
    } else if (competitorCount <= 3) {
      score += 1;
    } else if (competitorCount <= 5) {
      score += 0;
    } else {
      score -= 1;
    }
    return Math.max(1, Math.min(10, Math.round(score)));
  }
  /**
   * Calculate resource requirements score based on cost and time
   */
  calculateResourceScore(estimates) {
    let score = 5;
    const devCost = this.extractCostValue(estimates.costEstimate.development);
    if (devCost < 2e4) {
      score += 3;
    } else if (devCost < 5e4) {
      score += 2;
    } else if (devCost < 1e5) {
      score += 0;
    } else if (devCost < 2e5) {
      score -= 2;
    } else {
      score -= 3;
    }
    const infraCost = this.extractMonthlyCost(estimates.costEstimate.infrastructure);
    if (infraCost < 100) {
      score += 1;
    } else if (infraCost < 500) {
      score += 0;
    } else if (infraCost < 2e3) {
      score -= 1;
    } else {
      score -= 2;
    }
    if (estimates.teamSize.minimum === 1) {
      score += 1;
    } else if (estimates.teamSize.minimum >= 3) {
      score -= 1;
    }
    return Math.max(1, Math.min(10, Math.round(score)));
  }
  /**
   * Calculate time to market score based on development timeline
   */
  calculateTimeScore(estimates) {
    let score = 5;
    const timeInWeeks = this.parseTimeToWeeks(estimates.timeEstimate.realistic);
    if (timeInWeeks <= 4) {
      score = 10;
    } else if (timeInWeeks <= 12) {
      score = 8;
    } else if (timeInWeeks <= 24) {
      score = 6;
    } else if (timeInWeeks <= 48) {
      score = 4;
    } else {
      score = 2;
    }
    return score;
  }
  /**
   * Extract cost value from cost string
   */
  extractCostValue(costString) {
    const match = costString.match(/\$([0-9,]+)/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ""));
    }
    return 5e4;
  }
  /**
   * Extract monthly cost from cost string
   */
  extractMonthlyCost(costString) {
    const match = costString.match(/\$([0-9,]+)/);
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ""));
    }
    return 200;
  }
  /**
   * Parse time estimate to weeks
   */
  parseTimeToWeeks(timeString) {
    const lowerTime = timeString.toLowerCase();
    const numberMatch = lowerTime.match(/(\d+)/);
    if (!numberMatch || !numberMatch[1]) {
      return 24;
    }
    const value = parseInt(numberMatch[1]);
    if (lowerTime.includes("week")) {
      return value;
    } else if (lowerTime.includes("month")) {
      return value * 4;
    } else if (lowerTime.includes("year")) {
      return value * 52;
    }
    return 24;
  }
  /**
   * Map score to rating
   */
  getRating(score) {
    if (score >= 9) return "very-easy";
    if (score >= 7) return "easy";
    if (score >= 5) return "moderate";
    if (score >= 3) return "difficult";
    return "very-difficult";
  }
  /**
   * Generate actionable recommendation based on score
   */
  getRecommendation(score, techScore, marketScore) {
    if (score >= 9) {
      return "Excellent cloning opportunity! This business has low technical complexity, good market opportunity, and reasonable resource requirements. Start with an MVP to validate the concept quickly.";
    }
    if (score >= 7) {
      return "Good cloning opportunity. The business is feasible to clone with moderate effort. Focus on building an MVP first and leverage SaaS solutions to reduce complexity.";
    }
    if (score >= 5) {
      return "Moderate cloning opportunity. This will require significant effort and resources. Consider starting with a simplified version focusing on core features, and evaluate if you have the necessary skills and budget.";
    }
    if (score >= 3) {
      if (techScore <= 4) {
        return "Challenging opportunity due to high technical complexity. Consider partnering with experienced developers or finding a simpler business to clone. If you proceed, plan for a longer timeline and higher costs.";
      }
      if (marketScore <= 4) {
        return "Challenging opportunity due to difficult market conditions. The market may be crowded or have significant barriers. Consider if you can bring unique value or find a niche angle before proceeding.";
      }
      return "Challenging opportunity. This business will require substantial resources, time, and expertise. Carefully evaluate if you have the necessary commitment before proceeding.";
    }
    return "Not recommended for cloning. This business has very high complexity, significant resource requirements, or unfavorable market conditions. Consider finding a simpler opportunity that better matches your resources and timeline.";
  }
  /**
   * Calculate confidence score based on data availability
   */
  calculateConfidence(marketData, resourceEstimates) {
    let confidence = 0.5;
    if (marketData?.market) {
      confidence += 0.2;
      const swot = marketData.market.swot;
      const totalSwotItems = swot.strengths.length + swot.weaknesses.length + swot.opportunities.length + swot.threats.length;
      if (totalSwotItems >= 12) {
        confidence += 0.1;
      }
      if (marketData.market.competitors.length > 0) {
        confidence += 0.1;
      }
    }
    confidence += 0.1;
    return Math.max(0, Math.min(1, confidence));
  }
};
var clonabilityScoreService = new ClonabilityScoreService();

// server/routes.ts
var userProviderPreferences = /* @__PURE__ */ new Map();
function getActiveAIProvider(userId) {
  if (userId && userProviderPreferences.has(userId)) {
    const preferredProvider = userProviderPreferences.get(userId);
    const apiKey = getApiKeyForProvider(preferredProvider);
    if (apiKey) {
      return { provider: preferredProvider, apiKey };
    }
  }
  if (process.env.GEMINI_API_KEY) {
    return { provider: "gemini", apiKey: process.env.GEMINI_API_KEY };
  } else if (process.env.GROK_API_KEY) {
    return { provider: "grok", apiKey: process.env.GROK_API_KEY };
  } else if (process.env.OPENAI_API_KEY) {
    return { provider: "openai", apiKey: process.env.OPENAI_API_KEY };
  }
  return null;
}
function getApiKeyForProvider(provider) {
  switch (provider) {
    case "gemini":
      return process.env.GEMINI_API_KEY || null;
    case "grok":
      return process.env.GROK_API_KEY || null;
    case "openai":
      return process.env.OPENAI_API_KEY || null;
    case "gpt5":
      return process.env.GPT5_API_KEY || null;
    default:
      return null;
  }
}
var analysisQueue = /* @__PURE__ */ new Map();
var MAX_CONCURRENT_ANALYSES = 5;
var activeAnalyses = 0;
async function analyzeUrlWithProvider(url, provider, firstPartyData) {
  const apiKey = provider === "gemini" ? process.env.GEMINI_API_KEY : provider === "openai" ? process.env.OPENAI_API_KEY : process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error(`${provider.toUpperCase()}_API_KEY missing`);
  }
  const aiService = new AIProviderService(apiKey, provider, 12e4);
  const structuredPrompt = aiService.createEnhancedAnalysisPrompt(url, firstPartyData);
  const systemPrompt = aiService.createEvidenceBasedSystemPrompt();
  const schema = {
    type: "object",
    properties: {
      overview: {
        type: "object",
        properties: {
          valueProposition: { type: "string" },
          targetAudience: { type: "string" },
          monetization: { type: "string" }
        },
        required: ["valueProposition", "targetAudience", "monetization"]
      },
      market: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                url: { type: "string" },
                notes: { type: "string" }
              },
              required: ["name"]
            }
          },
          swot: {
            type: "object",
            properties: {
              strengths: { type: "array", items: { type: "string" } },
              weaknesses: { type: "array", items: { type: "string" } },
              opportunities: { type: "array", items: { type: "string" } },
              threats: { type: "array", items: { type: "string" } }
            }
          }
        }
      },
      technical: {
        type: "object",
        properties: {
          techStack: { type: "array", items: { type: "string" } },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          uiColors: { type: "array", items: { type: "string" } },
          keyPages: { type: "array", items: { type: "string" } }
        }
      },
      data: {
        type: "object",
        properties: {
          trafficEstimates: {
            type: "object",
            properties: {
              value: { type: "string" },
              source: { type: "string", format: "uri" }
            }
          },
          keyMetrics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "string" },
                source: { type: "string", format: "uri" },
                asOf: { type: "string" }
              },
              required: ["name", "value"]
            }
          }
        }
      },
      synthesis: {
        type: "object",
        properties: {
          summary: { type: "string" },
          keyInsights: { type: "array", items: { type: "string" } },
          nextActions: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "keyInsights", "nextActions"]
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            url: { type: "string", format: "uri" },
            excerpt: { type: "string", minLength: 10, maxLength: 300 }
          },
          required: ["url", "excerpt"]
        },
        default: []
      }
    },
    required: ["overview", "synthesis"]
  };
  try {
    console.log(`Calling ${provider} generateStructuredContent...`);
    const result = await aiService.generateStructuredContent(structuredPrompt, schema, systemPrompt);
    console.log(`${provider} generateStructuredContent returned successfully`);
    let validated;
    try {
      validated = ValidationService.validateEnhancedAnalysis(result, url, firstPartyData);
      validated = enhancedStructuredAnalysisSchema.parse(validated);
    } catch (enhancedError) {
      console.warn("Enhanced validation failed, falling back to original schema:", enhancedError);
      try {
        validated = structuredAnalysisSchema.parse(result);
      } catch (originalError) {
        console.error("Both enhanced and original schema validation failed:", { enhancedError, originalError });
        throw new Error(`Analysis validation failed: ${originalError instanceof Error ? originalError.message : "Unknown error"}`);
      }
    }
    const summary = `${validated.overview.valueProposition}

Target Audience: ${validated.overview.targetAudience}

Monetization: ${validated.overview.monetization}

Key Insights: ${validated.synthesis.keyInsights.join(", ")}`;
    const modelName = provider === "gemini" ? "gemini:gemini-2.5-pro" : provider === "openai" ? "openai:gpt-4o" : "grok:grok-4-fast-reasoning";
    return { content: summary, model: modelName, structured: validated };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    console.error(`${provider} structured analysis failed:`, errorMessage);
    console.error(`Error details:`, { errorMessage, errorStack });
    if (error instanceof Error) {
      if (error.message.includes("Confidence score")) {
        throw new AppError(`Invalid confidence score in AI response: ${error.message}`, 502, "AI_VALIDATION_ERROR");
      }
      if (error.message.includes("source") || error.message.includes("Source")) {
        throw new AppError(`Invalid source attribution in AI response: ${error.message}`, 502, "AI_VALIDATION_ERROR");
      }
      if (error.message.includes("schema")) {
        throw new AppError(`Schema validation error: ${error.message}`, 502, "AI_VALIDATION_ERROR");
      }
    }
    throw new AppError(`${provider} analysis failed: ${errorMessage}`, 502, "AI_PROVIDER_DOWN");
  }
}
async function manageConcurrentAnalysis(key, analysisFunction) {
  if (analysisQueue.has(key)) {
    console.log(`Reusing existing analysis for ${key}`);
    return analysisQueue.get(key);
  }
  if (activeAnalyses >= MAX_CONCURRENT_ANALYSES) {
    throw new AppError("System is currently processing maximum concurrent analyses. Please try again in a moment.", 429, "RATE_LIMITED");
  }
  const analysisPromise = (async () => {
    activeAnalyses++;
    try {
      return await analysisFunction();
    } finally {
      activeAnalyses--;
      analysisQueue.delete(key);
    }
  })();
  analysisQueue.set(key, analysisPromise);
  return analysisPromise;
}
function mergeAnalysisResults(aiAnalysis, techDetection) {
  if (!techDetection || !techDetection.success) {
    console.log("No tech detection results to merge, returning AI-only analysis");
    return aiAnalysis;
  }
  console.log("Merging AI analysis with tech detection results...");
  const complexityCalculator = new ComplexityCalculator();
  const complexityResult = complexityCalculator.calculateComplexity(techDetection.technologies);
  const detectedTechNames = techDetection.technologies.map((t) => t.name);
  const aiTechStack = aiAnalysis.technical?.techStack || [];
  const mergedTechStack = Array.from(/* @__PURE__ */ new Set([...aiTechStack, ...detectedTechNames]));
  const enhancedTechnical = {
    ...aiAnalysis.technical || {},
    // Preserve AI-inferred tech stack
    techStack: aiTechStack,
    // Add Wappalyzer detection results
    actualDetected: {
      technologies: techDetection.technologies,
      contentType: techDetection.contentType,
      detectedAt: techDetection.detectedAt
    },
    // Add complexity analysis
    complexityScore: complexityResult.score,
    complexityFactors: complexityResult.factors,
    // Add merged tech stack
    detectedTechStack: mergedTechStack
  };
  console.log("Merge complete:", {
    aiTechCount: aiTechStack.length,
    detectedTechCount: detectedTechNames.length,
    mergedTechCount: mergedTechStack.length,
    complexityScore: complexityResult.score
  });
  return {
    ...aiAnalysis,
    technical: enhancedTechnical
  };
}
async function analyzeUrlWithAI(url, firstPartyData) {
  const analysisKey = `${url}-${firstPartyData ? "with-fp" : "no-fp"}`;
  return manageConcurrentAnalysis(analysisKey, async () => {
    const startTime = Date.now();
    const techDetectionEnabled = process.env.ENABLE_TECH_DETECTION !== "false";
    const [aiResult, techResult] = await Promise.allSettled([
      // AI Analysis
      (async () => {
        try {
          console.log("Attempting enhanced analysis with Grok...");
          return await analyzeUrlWithProvider(url, "grok", firstPartyData);
        } catch (grokError) {
          console.warn("Grok analysis failed, falling back to Gemini:", grokError);
          try {
            console.log("Attempting enhanced analysis with Gemini (gemini-2.5-flash)...");
            return await analyzeUrlWithProvider(url, "gemini", firstPartyData);
          } catch (geminiError) {
            console.error("Both Grok and Gemini failed:", { grokError, geminiError });
            if (geminiError instanceof Error && geminiError.message.includes("timeout")) {
              throw new AppError("AI provider request timeout. The analysis is taking longer than expected. Please try again.", 504, "GATEWAY_TIMEOUT");
            }
            const grokErrorMsg = grokError instanceof Error ? grokError.message : "Unknown error";
            const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : "Unknown error";
            console.error("Detailed errors:", {
              grok: grokErrorMsg,
              gemini: geminiErrorMsg
            });
            throw new AppError(
              `Both AI providers failed. Grok: ${grokErrorMsg}. Gemini: ${geminiErrorMsg}`,
              502,
              "AI_PROVIDER_DOWN"
            );
          }
        }
      })(),
      // Tech Detection (only if enabled)
      techDetectionEnabled ? (async () => {
        try {
          console.log("Starting parallel tech detection...");
          const techService = new TechDetectionService();
          const detection = await techService.detectTechnologies(url);
          console.log("Tech detection completed:", detection ? `${detection.technologies.length} technologies detected` : "failed");
          return detection;
        } catch (techError) {
          console.warn("Tech detection failed with exception:", techError);
          return null;
        }
      })() : Promise.resolve(null)
    ]);
    const totalTime = Date.now() - startTime;
    console.log(`Parallel analysis completed in ${totalTime}ms`);
    if (aiResult.status === "rejected") {
      console.error("AI analysis failed:", aiResult.reason);
      throw aiResult.reason;
    }
    const aiAnalysis = aiResult.value;
    const performanceMonitor2 = PerformanceMonitor.getInstance();
    let techDetection = null;
    if (techResult.status === "fulfilled") {
      techDetection = techResult.value;
      if (techDetection) {
        console.log("Tech detection succeeded, will merge with AI analysis");
      } else {
        console.warn("Tech detection returned null, using AI-only analysis");
        performanceMonitor2.recordDetection(totalTime, false, 0, true);
      }
    } else {
      console.warn("Tech detection failed:", techResult.reason);
      performanceMonitor2.recordDetection(totalTime, false, 0, true);
    }
    return {
      ...aiAnalysis,
      techDetection
    };
  });
}
async function registerRoutes(app2) {
  console.log("=== REGISTERING MINIMAL ROUTES ===");
  app2.get("/api/healthz", healthzHandler);
  app2.get("/api/tech-detection/stats", async (req, res) => {
    try {
      const performanceMonitor2 = PerformanceMonitor.getInstance();
      const stats = performanceMonitor2.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching tech detection stats:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });
  app2.get("/docs/SCORING_METHODOLOGY.md", async (req, res, next) => {
    try {
      const fs2 = await import("fs/promises");
      const path3 = await import("path");
      const filePath = path3.join(process.cwd(), "docs", "SCORING_METHODOLOGY.md");
      const content = await fs2.readFile(filePath, "utf-8");
      res.setHeader("Content-Type", "text/markdown; charset=utf-8");
      res.send(content);
    } catch (error) {
      console.error("Error serving documentation:", error);
      next(new AppError("Documentation not found", 404, "NOT_FOUND"));
    }
  });
  app2.get("/api/ai-providers", async (req, res, next) => {
    try {
      const providers = [];
      if (process.env.GEMINI_API_KEY) {
        providers.push({
          id: "gemini",
          provider: "gemini",
          apiKey: "***",
          isActive: true,
          userId: req.userId
        });
      }
      if (process.env.OPENAI_API_KEY) {
        providers.push({
          id: "openai",
          provider: "openai",
          apiKey: "***",
          isActive: !process.env.GEMINI_API_KEY,
          userId: req.userId
        });
      }
      if (process.env.GPT5_API_KEY) {
        providers.push({
          id: "gpt5",
          provider: "gpt5",
          apiKey: "***",
          isActive: !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY,
          userId: req.userId
        });
      }
      if (process.env.GROK_API_KEY) {
        providers.push({
          id: "grok",
          provider: "grok",
          apiKey: "***",
          isActive: !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GPT5_API_KEY,
          userId: req.userId
        });
      }
      res.json(providers);
    } catch (error) {
      console.error("Failed to fetch AI providers:", error);
      next(new AppError("Failed to fetch AI providers", 500, "INTERNAL"));
    }
  });
  app2.get("/api/ai-providers/active", async (req, res, next) => {
    try {
      const activeProvider = getActiveAIProvider(req.userId);
      if (activeProvider) {
        res.json({
          id: activeProvider.provider,
          provider: activeProvider.provider,
          apiKey: "***",
          isActive: true,
          userId: req.userId
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Failed to fetch active AI provider:", error);
      next(new AppError("Failed to fetch active AI provider", 500, "INTERNAL"));
    }
  });
  app2.post("/api/ai-providers", async (req, res, next) => {
    try {
      console.log("POST /api/ai-providers - Request body:", req.body);
      const { provider } = req.body;
      if (!req.userId) {
        console.error("POST /api/ai-providers - No userId");
        return res.status(401).json({ error: "Unauthorized" });
      }
      console.log("POST /api/ai-providers - Provider:", provider, "UserId:", req.userId);
      const apiKey = getApiKeyForProvider(provider);
      console.log("POST /api/ai-providers - API key found:", !!apiKey);
      if (!apiKey) {
        console.error(`POST /api/ai-providers - No API key for ${provider}`);
        return res.status(400).json({ error: `${provider} API key not configured in environment` });
      }
      userProviderPreferences.set(req.userId, provider);
      console.log("POST /api/ai-providers - Saved preference for user:", req.userId);
      res.json({
        id: provider,
        provider,
        apiKey: "***",
        isActive: true,
        userId: req.userId
      });
    } catch (error) {
      console.error("Failed to save AI provider:", error);
      next(new AppError("Failed to save AI provider", 500, "INTERNAL"));
    }
  });
  app2.patch("/api/ai-providers/:id", async (req, res, next) => {
    try {
      const provider = req.params.id;
      if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const apiKey = getApiKeyForProvider(provider);
      if (!apiKey) {
        return res.status(400).json({ error: `${provider} API key not configured in environment` });
      }
      userProviderPreferences.set(req.userId, provider);
      res.json({
        id: provider,
        provider,
        apiKey: "***",
        isActive: true,
        userId: req.userId
      });
    } catch (error) {
      console.error("Failed to update AI provider:", error);
      next(new AppError("Failed to update AI provider", 500, "INTERNAL"));
    }
  });
  app2.post("/api/ai-providers/test", async (req, res, next) => {
    try {
      const { provider, apiKey } = req.body;
      const keyToTest = apiKey || (provider === "gemini" ? process.env.GEMINI_API_KEY : provider === "openai" ? process.env.OPENAI_API_KEY : process.env.GROK_API_KEY);
      if (!keyToTest) {
        res.json({ success: false });
        return;
      }
      const aiService = new AIProviderService(keyToTest, provider, 1e4);
      const isConnected = await aiService.testConnection();
      res.json({ success: isConnected });
    } catch (error) {
      console.error("Failed to test AI provider connection:", error);
      res.json({ success: false });
    }
  });
  app2.get("/api/business-analyses", async (req, res, next) => {
    console.log("GET /api/business-analyses hit");
    try {
      const analyses = await minimalStorage.listAnalyses(req.userId);
      res.json(analyses);
    } catch (error) {
      console.error("Failed to fetch analyses:", error);
      next(new AppError("Failed to fetch business analyses", 500, "INTERNAL"));
    }
  });
  app2.post("/api/business-analyses/analyze", rateLimit, async (req, res, next) => {
    console.log("=== NEW MINIMAL ROUTE HIT ===", req.body);
    try {
      let validatedInput;
      try {
        validatedInput = ValidationService.validateAnalysisRequest(req.body);
      } catch (validationError) {
        console.log("Analysis request validation failed:", validationError);
        throw AppError.validation(
          validationError instanceof Error ? validationError.message : "Invalid request data",
          validationError instanceof Error ? validationError.message : "Invalid request data"
        );
      }
      const { url } = validatedInput;
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError(
          "At least one AI provider API key is required",
          500,
          "CONFIG_MISSING",
          "AI service is not configured. Please contact support.",
          void 0,
          { missingKeys: ["GEMINI_API_KEY", "OPENAI_API_KEY", "GROK_API_KEY"] }
        );
      }
      let firstPartyData = null;
      const firstPartyPromise = (async () => {
        try {
          console.log("Attempting to fetch first-party data from:", url);
          const extractionResult = await fetchFirstPartyWithRetry(url, {
            timeoutMs: 8e3,
            // Reduced from 10s to 8s for better performance
            validateFirst: false,
            retryCount: 0,
            // No retries for better performance
            retryDelayMs: 0
          });
          if (extractionResult.success && extractionResult.data) {
            firstPartyData = extractionResult.data;
            console.log("Successfully extracted first-party data:", {
              title: firstPartyData.title,
              hasDescription: !!firstPartyData.description,
              hasH1: !!firstPartyData.h1,
              textSnippetLength: firstPartyData.textSnippet.length,
              elapsedMs: extractionResult.metadata.elapsedMs,
              attempts: extractionResult.metadata.attempts
            });
            return firstPartyData;
          } else {
            console.log("First-party data extraction failed:", {
              error: extractionResult.error,
              metadata: extractionResult.metadata
            });
            if (extractionResult.error?.type === "TIMEOUT") {
              console.warn(`First-party extraction timeout for ${url}: ${extractionResult.error.message}`);
            } else if (extractionResult.error?.type === "NETWORK") {
              console.warn(`First-party extraction network error for ${url}: ${extractionResult.error.message}`);
            }
            return null;
          }
        } catch (firstPartyError) {
          console.warn("First-party data extraction failed with exception:", firstPartyError);
          return null;
        }
      })();
      const firstPartyTimeout = new Promise((resolve) => {
        setTimeout(() => {
          console.log("First-party extraction taking too long, proceeding without it");
          resolve(null);
        }, 6e3);
      });
      firstPartyData = await Promise.race([firstPartyPromise, firstPartyTimeout]);
      const analysisResult = await analyzeUrlWithAI(url, firstPartyData || void 0);
      let mergedStructured = analysisResult.structured;
      let detectionStatus = "disabled";
      if (analysisResult.structured && analysisResult.techDetection) {
        console.log("Merging tech detection results with AI analysis...");
        mergedStructured = mergeAnalysisResults(analysisResult.structured, analysisResult.techDetection);
        detectionStatus = "success";
      } else if (process.env.ENABLE_TECH_DETECTION !== "false") {
        console.warn("Tech detection was enabled but failed, using AI-only analysis");
        detectionStatus = "failed";
        if (mergedStructured && mergedStructured.technical) {
          mergedStructured = {
            ...mergedStructured,
            technical: {
              ...mergedStructured.technical,
              detectionAttempted: true,
              detectionFailed: true
            }
          };
        }
      } else {
        console.log("Tech detection disabled via feature flag");
      }
      let technologyInsights;
      let clonabilityScore;
      let enhancedComplexity;
      let insightsGeneratedAt;
      if (detectionStatus === "success" && analysisResult.techDetection && mergedStructured?.technical?.actualDetected) {
        try {
          console.log("Generating technology insights...");
          const insightsStartTime = Date.now();
          const complexityCalculator = new ComplexityCalculator();
          enhancedComplexity = complexityCalculator.calculateEnhancedComplexity(
            analysisResult.techDetection.technologies
          );
          technologyInsights = technologyInsightsService.generateInsights(
            analysisResult.techDetection.technologies,
            enhancedComplexity.score
          );
          clonabilityScore = clonabilityScoreService.calculateClonability(
            enhancedComplexity.score,
            mergedStructured,
            // Cast to EnhancedStructuredAnalysis
            technologyInsights.estimates
          );
          insightsGeneratedAt = /* @__PURE__ */ new Date();
          const insightsTime = Date.now() - insightsStartTime;
          console.log(JSON.stringify({
            service: "analysis-flow",
            action: "insights-generated",
            status: "success",
            duration: insightsTime,
            complexityScore: enhancedComplexity.score,
            clonabilityScore: clonabilityScore.score,
            recommendationsCount: technologyInsights.recommendations.length,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }));
        } catch (insightsError) {
          const errorMessage = insightsError instanceof Error ? insightsError.message : String(insightsError);
          const errorStack = insightsError instanceof Error ? insightsError.stack : void 0;
          console.error(JSON.stringify({
            service: "analysis-flow",
            action: "insights-generation-failed",
            status: "error",
            error: errorMessage,
            stack: errorStack,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }));
          console.warn("Continuing with analysis without insights");
          technologyInsights = void 0;
          clonabilityScore = void 0;
          enhancedComplexity = void 0;
          insightsGeneratedAt = void 0;
        }
      } else {
        console.log(JSON.stringify({
          service: "analysis-flow",
          action: "insights-skipped",
          reason: detectionStatus !== "success" ? "detection-failed" : "no-tech-detected",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
      try {
        const analysisInput = {
          url,
          summary: analysisResult.content,
          model: analysisResult.model
        };
        if (mergedStructured) {
          analysisInput.structured = mergedStructured;
        }
        if (firstPartyData) {
          analysisInput.firstPartyData = firstPartyData;
        }
        if (technologyInsights) {
          analysisInput.technologyInsights = technologyInsights;
        }
        if (clonabilityScore) {
          analysisInput.clonabilityScore = clonabilityScore;
        }
        if (enhancedComplexity) {
          analysisInput.enhancedComplexity = enhancedComplexity;
        }
        if (insightsGeneratedAt) {
          analysisInput.insightsGeneratedAt = insightsGeneratedAt;
        }
        const analysis = await minimalStorage.createAnalysis(req.userId, analysisInput);
        console.log(`Analysis created with tech detection status: ${detectionStatus}`, {
          hasInsights: !!technologyInsights,
          hasClonabilityScore: !!clonabilityScore,
          hasEnhancedComplexity: !!enhancedComplexity
        });
        res.json(analysis);
      } catch (storageError) {
        console.error("Storage error:", storageError);
        throw new AppError("Failed to create business analysis", 500, "INTERNAL");
      }
    } catch (error) {
      console.error("Analysis creation failed:", error);
      next(error);
    }
  });
  app2.post("/api/business-analyses/:id/improve", rateLimit, async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/improve hit", { id: req.params.id, body: req.body });
    try {
      let validatedId;
      let validatedInput;
      try {
        if (!req.params.id) {
          throw new Error("Analysis ID is required");
        }
        validatedId = ValidationService.validateAnalysisId(req.params.id);
        validatedInput = ValidationService.validateImprovementRequest(req.body);
      } catch (validationError) {
        console.log("Improvement request validation failed:", validationError);
        throw AppError.validation(
          validationError instanceof Error ? validationError.message : "Invalid request data",
          validationError instanceof Error ? validationError.message : "Invalid request data"
        );
      }
      const { goal } = validatedInput;
      const analysis = await minimalStorage.getAnalysis(req.userId, validatedId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found. It may have been deleted or you may not have permission to access it."
        );
      }
      if (!analysis.structured) {
        throw new AppError(
          "Analysis does not have structured data required for improvement generation",
          400,
          "BAD_REQUEST",
          "This analysis does not contain the structured data needed to generate improvements. Please run a new analysis."
        );
      }
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError(
          "At least one AI provider API key is required",
          500,
          "CONFIG_MISSING",
          "AI service is not configured. Please contact support.",
          void 0,
          { missingKeys: ["GEMINI_API_KEY", "OPENAI_API_KEY", "GROK_API_KEY"] }
        );
      }
      let enhancedAnalysis;
      try {
        enhancedAnalysis = enhancedStructuredAnalysisSchema.parse(analysis.structured);
      } catch (parseError) {
        console.warn("Analysis structured data is not in enhanced format, attempting conversion:", parseError);
        try {
          const originalAnalysis = structuredAnalysisSchema.parse(analysis.structured);
          enhancedAnalysis = {
            ...originalAnalysis,
            sources: []
            // Add empty sources array for compatibility
          };
        } catch (conversionError) {
          console.error("Failed to parse analysis structured data:", conversionError);
          throw new AppError("Analysis structured data is invalid", 400, "BAD_REQUEST");
        }
      }
      const activeProvider = getActiveAIProvider(req.userId);
      if (!activeProvider) {
        throw new AppError("No AI provider API key available", 500, "CONFIG_MISSING");
      }
      const aiProvider = new AIProviderService(activeProvider.apiKey, activeProvider.provider, 12e4);
      const improvementService = new BusinessImprovementService(aiProvider, {
        timeoutMs: 3e4
        // 30 second timeout as per requirement 5.3
      });
      let improvement;
      try {
        improvement = await improvementService.generateImprovement(
          enhancedAnalysis,
          goal ?? void 0
        );
      } catch (improvementError) {
        console.error("Business improvement generation failed:", improvementError);
        if (improvementError instanceof Error) {
          if (improvementError.message.includes("timeout")) {
            throw AppError.timeout(
              improvementError.message,
              "Business improvement generation timed out. Please try again.",
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes("validation")) {
            throw AppError.validation(
              improvementError.message,
              "The generated improvement data is invalid. Please try again.",
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes("AI generation")) {
            throw AppError.aiProvider(
              improvementError.message,
              "AI service failed to generate improvements. Please try again.",
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes("network") || improvementError.message.includes("fetch")) {
            throw AppError.aiProvider(
              improvementError.message,
              "Network error while generating improvements. Please check your connection and try again.",
              { analysisId: validatedId, goal }
            );
          }
          if (improvementError.message.includes("rate limit")) {
            throw new AppError(
              improvementError.message,
              429,
              "RATE_LIMITED",
              "AI service rate limit exceeded. Please wait a few minutes before trying again.",
              void 0,
              { analysisId: validatedId, goal },
              true
            );
          }
        }
        throw AppError.improvementGeneration(
          improvementError instanceof Error ? improvementError.message : "Unknown error",
          "Failed to generate business improvements. Please try again.",
          { analysisId: validatedId, goal }
        );
      }
      try {
        const updatedAnalysis = await minimalStorage.updateAnalysisImprovements(req.userId, validatedId, improvement);
        if (!updatedAnalysis) {
          console.warn("Failed to store improvement data for analysis:", validatedId);
        }
      } catch (storageError) {
        console.error("Storage error while saving improvements:", storageError);
      }
      res.json({
        analysisId: validatedId,
        improvement,
        generatedAt: improvement.generatedAt
      });
    } catch (error) {
      console.error("Business improvement generation failed:", error);
      next(error);
    }
  });
  app2.post("/api/business-analyses/:id/improvements/export", rateLimit, async (req, res, next) => {
    try {
      const analysisId = req.params.id;
      const { format } = req.body;
      if (!req.userId) {
        throw new AppError("User ID is required", 401, "UNAUTHORIZED");
      }
      const userId = req.userId;
      if (!["pdf", "html", "json"].includes(format)) {
        throw new AppError(
          "Invalid export format",
          400,
          "BAD_REQUEST",
          "Export format must be one of: pdf, html, json"
        );
      }
      const analysis = await minimalStorage.getAnalysis(userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found"
        );
      }
      const improvements = await minimalStorage.getAnalysisImprovements(userId, analysisId);
      if (!improvements) {
        throw new AppError(
          "No improvements found",
          404,
          "NOT_FOUND",
          "No improvement plan found for this analysis. Please generate improvements first."
        );
      }
      const exportService = new ExportService(minimalStorage);
      let exportData = "";
      let contentType = "application/json";
      let filename = "business-improvement-plan.json";
      switch (format) {
        case "json":
          exportData = JSON.stringify(improvements, null, 2);
          contentType = "application/json";
          filename = "business-improvement-plan.json";
          break;
        case "html":
          exportData = exportService.generateImprovementHTML(improvements, analysis);
          contentType = "text/html";
          filename = "business-improvement-plan.html";
          break;
        case "pdf":
          exportData = await exportService.generateImprovementPDF(improvements, analysis);
          contentType = "application/pdf";
          filename = "business-improvement-plan.pdf";
          break;
      }
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      if (Buffer.isBuffer(exportData)) {
        res.send(exportData);
      } else {
        res.send(exportData);
      }
    } catch (error) {
      console.error("Improvement export failed:", error);
      next(error);
    }
  });
  app2.post("/api/business-analyses/:id/stages/:stageNumber", rateLimit, async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/stages/:stageNumber hit", {
      id: req.params.id,
      stageNumber: req.params.stageNumber,
      regenerate: req.body.regenerate
    });
    try {
      const analysisId = req.params.id;
      const stageNumber = parseInt(req.params.stageNumber || "0", 10);
      const regenerate = req.body.regenerate === true;
      if (isNaN(stageNumber) || stageNumber < 2 || stageNumber > 6) {
        throw new AppError(
          "Invalid stage number. Must be between 2 and 6.",
          400,
          "BAD_REQUEST",
          "Stage number must be between 2 and 6. Stage 1 is auto-completed after analysis."
        );
      }
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, "BAD_REQUEST");
      }
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found. It may have been deleted or you may not have permission to access it."
        );
      }
      if (!analysis.structured) {
        throw new AppError(
          "Analysis does not have structured data required for stage generation",
          400,
          "BAD_REQUEST",
          "This analysis does not contain the structured data needed to generate stages."
        );
      }
      const { WorkflowService: WorkflowService2 } = await Promise.resolve().then(() => (init_workflow(), workflow_exports));
      const workflowService = new WorkflowService2(minimalStorage);
      const progressionCheck = await workflowService.validateStageProgression(
        req.userId,
        analysisId,
        stageNumber,
        regenerate
      );
      if (!progressionCheck.valid) {
        throw new AppError(
          progressionCheck.reason || "Cannot progress to this stage",
          400,
          "BAD_REQUEST",
          progressionCheck.reason || "You must complete previous stages first."
        );
      }
      if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY && !process.env.GROK_API_KEY) {
        throw new AppError(
          "At least one AI provider API key is required",
          500,
          "CONFIG_MISSING",
          "AI service is not configured. Please contact support."
        );
      }
      const activeProvider = getActiveAIProvider(req.userId);
      if (!activeProvider) {
        throw new AppError("No AI provider API key available", 500, "CONFIG_MISSING");
      }
      const timeout = 12e4;
      const aiProvider = new AIProviderService(activeProvider.apiKey, activeProvider.provider, timeout);
      let prompt;
      let systemPrompt;
      let schema;
      let zodSchema;
      let stageName;
      const {
        stage2ContentSchema: stage2ContentSchema2,
        stage3ContentSchema: stage3ContentSchema2,
        stage4ContentSchema: stage4ContentSchema2,
        stage5ContentSchema: stage5ContentSchema2,
        stage6ContentSchema: stage6ContentSchema2
      } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      switch (stageNumber) {
        case 2:
          ({ prompt, systemPrompt } = workflowService.getStage2Prompt(analysis));
          zodSchema = stage2ContentSchema2;
          stageName = "Lazy-Entrepreneur Filter";
          schema = {
            type: "object",
            properties: {
              effortScore: { type: "number", minimum: 1, maximum: 10 },
              rewardScore: { type: "number", minimum: 1, maximum: 10 },
              recommendation: { type: "string", enum: ["go", "no-go", "maybe"] },
              reasoning: { type: "string" },
              automationPotential: {
                type: "object",
                properties: {
                  score: { type: "number", minimum: 0, maximum: 1 },
                  opportunities: { type: "array", items: { type: "string" } }
                },
                required: ["score", "opportunities"]
              },
              resourceRequirements: {
                type: "object",
                properties: {
                  time: { type: "string" },
                  money: { type: "string" },
                  skills: { type: "array", items: { type: "string" } }
                },
                required: ["time", "money", "skills"]
              },
              nextSteps: { type: "array", items: { type: "string" } }
            },
            required: ["effortScore", "rewardScore", "recommendation", "reasoning", "automationPotential", "resourceRequirements", "nextSteps"]
          };
          break;
        case 3:
          ({ prompt, systemPrompt } = workflowService.getStage3Prompt(analysis));
          zodSchema = stage3ContentSchema2;
          stageName = "MVP Launch Planning";
          schema = {
            type: "object",
            properties: {
              coreFeatures: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              niceToHaves: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
              techStack: {
                type: "object",
                properties: {
                  frontend: { type: "array", items: { type: "string" }, minItems: 1 },
                  backend: { type: "array", items: { type: "string" }, minItems: 1 },
                  infrastructure: { type: "array", items: { type: "string" }, minItems: 1 }
                },
                required: ["frontend", "backend", "infrastructure"]
              },
              timeline: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    duration: { type: "string" },
                    deliverables: { type: "array", items: { type: "string" }, minItems: 3 }
                  },
                  required: ["phase", "duration", "deliverables"]
                },
                minItems: 3,
                maxItems: 4
              },
              estimatedCost: { type: "string" }
            },
            required: ["coreFeatures", "niceToHaves", "techStack", "timeline", "estimatedCost"]
          };
          break;
        case 4:
          ({ prompt, systemPrompt } = workflowService.getStage4Prompt(analysis));
          zodSchema = stage4ContentSchema2;
          stageName = "Demand Testing Strategy";
          schema = {
            type: "object",
            properties: {
              testingMethods: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    method: { type: "string" },
                    description: { type: "string" },
                    cost: { type: "string" },
                    timeline: { type: "string" }
                  },
                  required: ["method", "description", "cost", "timeline"]
                },
                minItems: 3,
                maxItems: 5
              },
              successMetrics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    metric: { type: "string" },
                    target: { type: "string" },
                    measurement: { type: "string" }
                  },
                  required: ["metric", "target", "measurement"]
                },
                minItems: 3,
                maxItems: 5
              },
              budget: {
                type: "object",
                properties: {
                  total: { type: "string" },
                  breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        cost: { type: "string" }
                      },
                      required: ["item", "cost"]
                    }
                  }
                },
                required: ["total", "breakdown"]
              },
              timeline: { type: "string" }
            },
            required: ["testingMethods", "successMetrics", "budget", "timeline"]
          };
          break;
        case 5:
          ({ prompt, systemPrompt } = workflowService.getStage5Prompt(analysis));
          zodSchema = stage5ContentSchema2;
          stageName = "Scaling & Growth";
          schema = {
            type: "object",
            properties: {
              growthChannels: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    channel: { type: "string" },
                    strategy: { type: "string" },
                    priority: { type: "string", enum: ["high", "medium", "low"] }
                  },
                  required: ["channel", "strategy", "priority"]
                },
                minItems: 3,
                maxItems: 5
              },
              milestones: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    milestone: { type: "string" },
                    timeline: { type: "string" },
                    metrics: { type: "array", items: { type: "string" }, minItems: 3 }
                  },
                  required: ["milestone", "timeline", "metrics"]
                },
                minItems: 3,
                maxItems: 4
              },
              resourceScaling: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    team: { type: "array", items: { type: "string" } },
                    infrastructure: { type: "string" }
                  },
                  required: ["phase", "team", "infrastructure"]
                },
                minItems: 3,
                maxItems: 3
              }
            },
            required: ["growthChannels", "milestones", "resourceScaling"]
          };
          break;
        case 6:
          ({ prompt, systemPrompt } = workflowService.getStage6Prompt(analysis));
          zodSchema = stage6ContentSchema2;
          stageName = "AI Automation Mapping";
          schema = {
            type: "object",
            properties: {
              automationOpportunities: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    process: { type: "string" },
                    tool: { type: "string" },
                    roi: { type: "string" },
                    priority: { type: "number", minimum: 1, maximum: 10 }
                  },
                  required: ["process", "tool", "roi", "priority"]
                },
                minItems: 4,
                maxItems: 6
              },
              implementationPlan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    phase: { type: "string" },
                    automations: { type: "array", items: { type: "string" }, minItems: 3 },
                    timeline: { type: "string" }
                  },
                  required: ["phase", "automations", "timeline"]
                },
                minItems: 3,
                maxItems: 3
              },
              estimatedSavings: { type: "string" }
            },
            required: ["automationOpportunities", "implementationPlan", "estimatedSavings"]
          };
          break;
        default:
          throw new AppError("Invalid stage number", 400, "BAD_REQUEST");
      }
      const { retryWithBackoff: retryWithBackoff2, generateErrorGuidance: generateErrorGuidance2, createPartialResultHandler: createPartialResultHandler2 } = await Promise.resolve().then(() => (init_retry(), retry_exports));
      const partialHandler = createPartialResultHandler2(`stage-${analysisId}-${stageNumber}`);
      let stageContent;
      console.log(`Generating Stage ${stageNumber} content with retry logic...`);
      const retryResult = await retryWithBackoff2(
        async () => {
          const content = await aiProvider.generateStructuredContent(prompt, schema, systemPrompt);
          await partialHandler.save(content);
          return content;
        },
        {
          maxAttempts: 3,
          delayMs: 2e3,
          backoffMultiplier: 2,
          maxDelayMs: 1e4,
          onRetry: (error, attempt) => {
            console.log(`Retry attempt ${attempt} for Stage ${stageNumber} after error:`, error.message);
          }
        }
      );
      if (!retryResult.success) {
        console.error(`AI generation failed for Stage ${stageNumber} after ${retryResult.attempts} attempts:`, retryResult.error);
        const guidance = generateErrorGuidance2(
          retryResult.error,
          `generating ${stageName}`
        );
        const partialResult = await partialHandler.load();
        if (partialResult && Object.keys(partialResult).length > 0) {
          console.log(`Partial result available for Stage ${stageNumber}, but incomplete`);
        }
        let statusCode = 502;
        let errorCode = "AI_PROVIDER_DOWN";
        if (guidance.error.message.includes("timeout")) {
          statusCode = 504;
          errorCode = "GATEWAY_TIMEOUT";
        } else if (guidance.error.message.includes("rate limit") || guidance.error.message.includes("quota")) {
          statusCode = 429;
          errorCode = "RATE_LIMITED";
        }
        throw new AppError(
          `Failed to generate Stage ${stageNumber} content after ${retryResult.attempts} attempts`,
          statusCode,
          errorCode,
          guidance.userMessage,
          void 0,
          {
            stageNumber,
            analysisId,
            attempts: retryResult.attempts,
            totalTimeMs: retryResult.totalTimeMs,
            nextSteps: guidance.nextSteps,
            retryable: guidance.retryable,
            estimatedWaitTime: guidance.estimatedWaitTime,
            error: guidance.error.message
          },
          guidance.retryable
        );
      }
      stageContent = retryResult.data;
      console.log(`Stage ${stageNumber} content generated successfully after ${retryResult.attempts} attempt(s) in ${retryResult.totalTimeMs}ms`);
      await partialHandler.clear();
      try {
        stageContent = zodSchema.parse(stageContent);
        console.log(`Stage ${stageNumber} content validated successfully`);
      } catch (validationError) {
        console.error(`Stage ${stageNumber} content validation failed:`, validationError);
        throw new AppError(
          `Generated Stage ${stageNumber} content is invalid`,
          502,
          "AI_VALIDATION_ERROR",
          "The AI generated invalid data. Please try again.",
          void 0,
          { stageNumber, analysisId, validationError: validationError instanceof Error ? validationError.message : "Unknown" }
        );
      }
      const { ValidationService: ValidationService3 } = await Promise.resolve().then(() => (init_validation(), validation_exports));
      const validationService = new ValidationService3();
      const businessContext = {
        url: analysis.url,
        ...analysis.businessModel && { businessModel: analysis.businessModel }
      };
      const validationResult = validationService.validateStageContent(
        stageNumber,
        stageContent,
        businessContext
      );
      console.log(`Stage ${stageNumber} validation score: ${(validationResult.overallScore * 100).toFixed(1)}%`);
      if (validationResult.structureValidation.warnings.length > 0) {
        console.warn(`Stage ${stageNumber} structure warnings:`, validationResult.structureValidation.warnings);
      }
      if (validationResult.specificityValidation.warnings.length > 0) {
        console.warn(`Stage ${stageNumber} specificity warnings:`, validationResult.specificityValidation.warnings);
      }
      if (!validationResult.actionableCheck.passed) {
        console.warn(`Stage ${stageNumber} actionable check issues:`, validationResult.actionableCheck.issues);
      }
      if (!validationResult.placeholderCheck.passed) {
        console.warn(`Stage ${stageNumber} placeholder check issues:`, validationResult.placeholderCheck.issues);
      }
      if (!validationResult.estimatesCheck.passed) {
        console.warn(`Stage ${stageNumber} estimates check issues:`, validationResult.estimatesCheck.issues);
      }
      if (!validationResult.valid) {
        const allErrors = [
          ...validationResult.structureValidation.errors,
          ...validationResult.fieldsValidation.errors,
          ...validationResult.specificityValidation.errors
        ];
        console.error(`Stage ${stageNumber} quality validation failed:`, allErrors);
        throw new AppError(
          `Generated Stage ${stageNumber} content failed quality checks`,
          502,
          "AI_QUALITY_ERROR",
          "The AI generated content that did not meet quality standards. Please try again.",
          void 0,
          {
            stageNumber,
            analysisId,
            validationScore: validationResult.overallScore,
            errors: allErrors.slice(0, 3)
            // Include first 3 errors
          }
        );
      }
      const stageData = workflowService.createStageData(stageNumber, stageContent, "completed");
      const updatedAnalysis = await minimalStorage.updateAnalysisStageData(
        req.userId,
        analysisId,
        stageNumber,
        stageData
      );
      if (!updatedAnalysis) {
        throw new AppError(
          "Failed to save stage data",
          500,
          "INTERNAL",
          "Could not save the generated stage data. Please try again."
        );
      }
      const nextStage = stageNumber < 6 ? stageNumber + 1 : null;
      res.json({
        stageNumber,
        stageName,
        content: stageContent,
        generatedAt: stageData.generatedAt,
        nextStage
      });
    } catch (error) {
      console.error(`Stage ${req.params.stageNumber || "unknown"} generation failed:`, error);
      next(error);
    }
  });
  app2.get("/api/business-analyses/:id/stages", async (req, res, next) => {
    console.log("GET /api/business-analyses/:id/stages hit", { id: req.params.id });
    try {
      const analysisId = req.params.id;
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, "BAD_REQUEST");
      }
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found. It may have been deleted or you may not have permission to access it."
        );
      }
      const { WorkflowService: WorkflowService2 } = await Promise.resolve().then(() => (init_workflow(), workflow_exports));
      const workflowService = new WorkflowService2(minimalStorage);
      const stages = analysis.stages || {};
      const progressSummary = workflowService.getProgressSummary(stages);
      res.json({
        analysisId,
        currentStage: progressSummary.currentStage,
        completedStages: progressSummary.completedStages,
        totalStages: progressSummary.totalStages,
        isComplete: progressSummary.isComplete,
        nextStage: progressSummary.nextStage,
        stages
      });
    } catch (error) {
      console.error("Failed to fetch stages:", error);
      next(error);
    }
  });
  app2.post("/api/business-analyses/:id/stages/:stageNumber/export", async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/stages/:stageNumber/export hit", {
      id: req.params.id,
      stageNumber: req.params.stageNumber,
      format: req.body.format
    });
    try {
      const analysisId = req.params.id;
      const stageNumber = parseInt(req.params.stageNumber, 10);
      const format = req.body.format || "json";
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, "BAD_REQUEST");
      }
      if (isNaN(stageNumber) || stageNumber < 1 || stageNumber > 6) {
        throw new AppError(
          "Invalid stage number. Must be between 1 and 6.",
          400,
          "BAD_REQUEST"
        );
      }
      if (!["html", "json", "pdf"].includes(format)) {
        throw new AppError(
          "Invalid export format. Must be 'html', 'json', or 'pdf'.",
          400,
          "BAD_REQUEST"
        );
      }
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found."
        );
      }
      const exportService = new ExportService(minimalStorage);
      const result = await exportService.exportStage(
        req.userId || "",
        analysisId,
        stageNumber,
        format
      );
      const businessName = analysis.businessModel || "Business";
      const stageName = exportService["getStageName"](stageNumber).replace(/[^a-z0-9]/gi, "-");
      const filename = `${businessName.replace(/[^a-z0-9]/gi, "-")}-Stage-${stageNumber}-${stageName}.${format}`;
      switch (format) {
        case "pdf":
          res.setHeader("Content-Type", "application/pdf");
          break;
        case "html":
          res.setHeader("Content-Type", "text/html");
          break;
        case "json":
          res.setHeader("Content-Type", "application/json");
          break;
        case "csv":
          res.setHeader("Content-Type", "text/csv");
          break;
      }
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(result);
    } catch (error) {
      console.error("Stage export failed:", error);
      next(error);
    }
  });
  app2.post("/api/business-analyses/:id/export-stage1-csv", async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/export-stage1-csv hit", {
      id: req.params.id
    });
    try {
      const analysisId = req.params.id;
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, "BAD_REQUEST");
      }
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found."
        );
      }
      const { generateCSV: generateCSV2 } = await Promise.resolve().then(() => (init_export_utils(), export_utils_exports));
      const csvData = {
        url: analysis.url,
        businessModel: analysis.businessModel || "",
        revenueStream: analysis.revenueStream || "",
        targetMarket: analysis.targetMarket || "",
        overallScore: analysis.overallScore || "",
        scoreDetails: analysis.scoreDetails || {},
        aiInsights: analysis.aiInsights || {},
        structured: analysis.structured || {},
        currentStage: analysis.currentStage,
        createdAt: new Date(analysis.createdAt).toLocaleString()
      };
      const csvContent = generateCSV2(csvData);
      const filename = `analysis-${analysisId.slice(0, 8)}.csv`;
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting Stage 1 CSV:", error);
      next(error);
    }
  });
  app2.post("/api/business-analyses/:id/export-complete", async (req, res, next) => {
    console.log("POST /api/business-analyses/:id/export-complete hit", {
      id: req.params.id,
      format: req.body.format
    });
    try {
      const analysisId = req.params.id;
      const format = req.body.format || "pdf";
      if (!analysisId) {
        throw new AppError("Analysis ID is required", 400, "BAD_REQUEST");
      }
      if (!["pdf", "html", "json"].includes(format)) {
        throw new AppError(
          "Invalid export format. Must be 'pdf', 'html', or 'json'.",
          400,
          "BAD_REQUEST"
        );
      }
      const analysis = await minimalStorage.getAnalysis(req.userId, analysisId);
      if (!analysis) {
        throw new AppError(
          "Analysis not found",
          404,
          "NOT_FOUND",
          "The requested analysis could not be found."
        );
      }
      const exportService = new ExportService(minimalStorage);
      if (format === "pdf") {
        const pdfBuffer = await exportService.exportPDF(req.userId, analysisId);
        const businessName = analysis.businessModel || "Business-Plan";
        const filename = `${businessName.replace(/[^a-z0-9]/gi, "-")}-Complete-Plan.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(pdfBuffer);
      } else if (format === "html") {
        const htmlContent = await exportService.exportHTML(req.userId, analysisId);
        const businessName = analysis.businessModel || "Business-Plan";
        const filename = `${businessName.replace(/[^a-z0-9]/gi, "-")}-Complete-Plan.html`;
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(htmlContent);
      } else if (format === "json") {
        const jsonContent = await exportService.exportJSON(req.userId, analysisId);
        const businessName = analysis.businessModel || "Business-Plan";
        const filename = `${businessName.replace(/[^a-z0-9]/gi, "-")}-Complete-Plan.json`;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.send(jsonContent);
      }
    } catch (error) {
      console.error("Export generation failed:", error);
      next(error);
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist", "public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid as nanoid2 } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(process.cwd(), "dist/public");
  if (!fs.existsSync(distPath)) {
    console.warn(`Warning: Static files not found at ${distPath}. Running in API-only mode.`);
    console.warn(`Build output may not have been preserved. Check Render's publish directory settings.`);
    app2.use("*", (_req, res) => {
      res.status(503).json({
        error: "Static files not available",
        message: "API is running but frontend assets were not found. This is a deployment configuration issue."
      });
    });
    return;
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/middleware/user.ts
import { randomUUID as randomUUID2 } from "crypto";
var USER_COOKIE_NAME = "venture_user_id";
var COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1e3;
function userMiddleware(req, res, next) {
  let userId = req.cookies?.[USER_COOKIE_NAME];
  if (!userId) {
    userId = randomUUID2();
    res.cookie(USER_COOKIE_NAME, userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // HTTPS only in production
      sameSite: "lax",
      // CSRF protection while allowing normal navigation
      maxAge: COOKIE_MAX_AGE,
      path: "/"
      // Available across the entire application
    });
  }
  req.userId = userId;
  next();
}

// server/middleware/requestId.ts
import { randomUUID as randomUUID3 } from "crypto";
function requestIdMiddleware(req, res, next) {
  const existingId = req.headers["x-request-id"] || req.headers["request-id"];
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const requestId = existingId && uuidPattern.test(existingId) ? existingId : randomUUID3();
  req.requestId = requestId;
  req.startTime = Date.now();
  res.setHeader("X-Request-ID", requestId);
  res.setHeader("X-Request-Start", req.startTime.toString());
  res.on("finish", () => {
    const duration = Date.now() - req.startTime;
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${duration}ms`);
    }
    if (process.env.NODE_ENV === "development" && duration > 1e3) {
      console.log(`Slow request detected: ${req.method} ${req.path} took ${duration}ms [${requestId}]`);
    }
  });
  next();
}

// server/index.ts
dotenv.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(userMiddleware);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  log("Initializing technology knowledge base...");
  const kbStartTime = Date.now();
  technologyKnowledgeBase.loadData();
  const kbDuration = Date.now() - kbStartTime;
  log(`\u2713 Knowledge base loaded in ${kbDuration}ms`);
  performanceMonitor.startMonitoring();
  const server = await registerRoutes(app);
  app.use(errorHandler);
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
