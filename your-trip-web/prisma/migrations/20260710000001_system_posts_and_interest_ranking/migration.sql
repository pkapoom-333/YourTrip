-- System Posts + Interest Ranking (Sprint S16 — 2026-07-10)

-- ── users: system account flag ──────────────────────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isSystemAccount" BOOLEAN NOT NULL DEFAULT false;

-- ── posts: PostType enum + system post fields ───────────────────────────────
DO $$ BEGIN
  CREATE TYPE "PostType" AS ENUM ('user', 'place_highlight', 'trip_idea');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "postType" "PostType" NOT NULL DEFAULT 'user';
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "isSystemPost" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "posts_isSystemPost_postType_idx" ON "posts"("isSystemPost", "postType");

-- ── trips: interest tags for ranking ─────────────────────────────────────────
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';

-- ── expense_groups: invite code + 1:1 trip link ─────────────────────────────
-- (expense_groups uses snake_case columns — created via Management API, not Prisma migrate)
ALTER TABLE "expense_groups" ADD COLUMN IF NOT EXISTS "invite_code" TEXT;
DO $$ BEGIN
  ALTER TABLE "expense_groups" ADD CONSTRAINT "expense_groups_invite_code_key" UNIQUE ("invite_code");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "expense_groups" ADD CONSTRAINT "expense_groups_trip_id_key" UNIQUE ("trip_id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
