CREATE TABLE IF NOT EXISTS "anti_craving_strategies" (
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
ALTER TABLE "anti_craving_strategies" ADD CONSTRAINT "anti_craving_strategies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;