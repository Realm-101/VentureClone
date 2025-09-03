
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

CREATE TABLE IF NOT EXISTS "ai_providers" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" varchar NOT NULL,
	"provider" text NOT NULL,
	"api_key" text NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "business_analyses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" varchar NOT NULL,
	"url" text NOT NULL,
	"business_model" text,
	"revenue_stream" text,
	"target_market" text,
	"overall_score" integer,
	"score_details" jsonb,
	"ai_insights" jsonb,
	"current_stage" integer DEFAULT 1,
	"stage_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "workflow_stages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"analysis_id" varchar NOT NULL,
	"stage_number" integer NOT NULL,
	"stage_name" text NOT NULL,
	"status" text DEFAULT 'pending',
	"data" jsonb,
	"ai_generated_content" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
