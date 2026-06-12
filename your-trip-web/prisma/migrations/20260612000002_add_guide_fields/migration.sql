-- Applied manually via Supabase SQL Editor on 2026-06-12
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isGuide"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerifiedGuide"  BOOLEAN NOT NULL DEFAULT false;
