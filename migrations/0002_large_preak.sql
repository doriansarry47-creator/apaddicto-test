CREATE TABLE "anti_craving_strategies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"context" varchar NOT NULL,
	"exercise" text NOT NULL,
	"effort" varchar NOT NULL,
	"duration" integer NOT NULL,
	"craving_before" integer NOT NULL,
	"craving_after" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "emergency_routines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"steps" jsonb NOT NULL,
	"duration" integer,
	"category" varchar DEFAULT 'general',
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quick_resources" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" varchar NOT NULL,
	"type" varchar DEFAULT 'tip',
	"icon" varchar,
	"color" varchar DEFAULT 'blue',
	"is_active" boolean DEFAULT true,
	"is_pinned" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_stats" ADD COLUMN "beck_analyses_completed" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "anti_craving_strategies" ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;