-- Add onboarding fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isOnboarded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT '{}';
