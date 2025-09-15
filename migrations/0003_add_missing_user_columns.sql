-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_login_at" timestamp;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "inactivity_threshold" integer DEFAULT 30;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notes" text;