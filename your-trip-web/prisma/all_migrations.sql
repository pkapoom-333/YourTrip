-- ============================================================
-- YourTrip — Incremental Migrations for Supabase SQL Editor
-- Run AFTER initial `npx prisma migrate dev --name init`
-- These add columns/tables that weren't in the initial schema
-- Safe to re-run: uses IF NOT EXISTS / DO NOTHING guards
-- ============================================================

-- ── 20260612000001_add_travel_fields ──────────────────────────────────────────────
-- Applied manually via Supabase SQL Editor on 2026-06-12
ALTER TABLE "trip_items"
  ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "travelTimeTo"  INTEGER,
  ADD COLUMN IF NOT EXISTS "lat"           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "lng"           DOUBLE PRECISION;

-- ── 20260612000002_add_guide_fields ──────────────────────────────────────────────
-- Applied manually via Supabase SQL Editor on 2026-06-12
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "isGuide"         BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerifiedGuide"  BOOLEAN NOT NULL DEFAULT false;

-- ── 20260613000001_add_collections ──────────────────────────────────────────────
-- Applied manually via Supabase SQL Editor on 2026-06-13
-- Creates collections and collection_places tables

CREATE TABLE IF NOT EXISTS "collections" (
  "id"          TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "title"       TEXT        NOT NULL,
  "description" TEXT,
  "emoji"       TEXT        DEFAULT '📍',
  "isPublic"    BOOLEAN     NOT NULL DEFAULT true,
  "userId"      TEXT        NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "collections_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "collection_places" (
  "id"           TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  "collectionId" TEXT        NOT NULL,
  "placeId"      TEXT        NOT NULL,
  "note"         TEXT,
  "order"        INTEGER     NOT NULL DEFAULT 0,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "collection_places_collectionId_fkey"
    FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE,
  CONSTRAINT "collection_places_placeId_fkey"
    FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE,
  UNIQUE ("collectionId", "placeId")
);

-- ── 20260630000001_add_site_config ──────────────────────────────────────────────
-- CreateTable
CREATE TABLE "site_configs" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("key")
);

-- Seed default config
INSERT INTO "site_configs" ("key", "value", "updatedAt") VALUES
  ('siteName', 'Your Trip', NOW()),
  ('siteDescription', 'สังคมแห่งการท่องเที่ยว', NOW()),
  ('autoHideReportThreshold', '5', NOW()),
  ('maxFeaturedPlaces', '10', NOW()),
  ('allowNewRegistrations', 'true', NOW()),
  ('maintenanceMode', 'false', NOW()),
  ('maintenanceMessage', 'ขณะนี้ระบบอยู่ระหว่างการปรับปรุง กรุณากลับมาใหม่ภายหลัง', NOW()),
  ('postsPerPage', '20', NOW()),
  ('maxImageSizeMB', '10', NOW()),
  ('allowedImageTypes', 'image/jpeg,image/png,image/webp', NOW()),
  ('guideApplicationOpen', 'true', NOW()),
  ('contactEmail', 'pakpoomtee24@gmail.com', NOW()),
  ('socialInstagram', '', NOW()),
  ('socialFacebook', '', NOW()),
  ('socialTwitter', '', NOW())
ON CONFLICT ("key") DO NOTHING;

-- ── 20260630000002_expense_invite_code ──────────────────────────────────────────────
-- Add inviteCode to expense_groups
ALTER TABLE "expense_groups" ADD COLUMN "inviteCode" TEXT;

-- Generate unique codes for existing groups
UPDATE "expense_groups" SET "inviteCode" = gen_random_uuid()::text WHERE "inviteCode" IS NULL;

-- Make NOT NULL and UNIQUE after backfill
ALTER TABLE "expense_groups" ALTER COLUMN "inviteCode" SET NOT NULL;
ALTER TABLE "expense_groups" ADD CONSTRAINT "expense_groups_inviteCode_key" UNIQUE ("inviteCode");

-- ── 20260701000001_user_onboarding ──────────────────────────────────────────────
-- Add onboarding fields to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isOnboarded" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "interests" TEXT[] DEFAULT '{}';

-- ── 20260701000002_trip_collaborators ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "trip_collaborators" (
  "id"      TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tripId"  TEXT NOT NULL,
  "userId"  TEXT NOT NULL,
  "role"    TEXT NOT NULL DEFAULT 'editor',
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trip_collaborators_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "trip_collaborators_tripId_userId_key" UNIQUE ("tripId", "userId"),
  CONSTRAINT "trip_collaborators_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "trip_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ── 20260702000001_check_ins ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "check_ins" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId"    TEXT NOT NULL,
  "placeId"   TEXT NOT NULL,
  "note"      TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "check_ins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "check_ins_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "check_ins_userId_idx" ON "check_ins"("userId");
CREATE INDEX IF NOT EXISTS "check_ins_placeId_idx" ON "check_ins"("placeId");

-- ── 20260702000002_packing_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "packing_items" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tripId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "category"  TEXT NOT NULL DEFAULT 'other',
  "isPacked"  BOOLEAN NOT NULL DEFAULT false,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "packing_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "packing_items_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "packing_items_tripId_idx" ON "packing_items"("tripId");

-- ── 20260702000003_post_is_pinned ──────────────────────────────────────────────
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- ── 20260702000004_trip_expenses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "trip_expenses" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "tripId"    TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "amount"    DOUBLE PRECISION NOT NULL,
  "category"  TEXT NOT NULL DEFAULT 'other',
  "paidBy"    TEXT,
  "date"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "trip_expenses_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "trip_expenses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "trip_expenses_tripId_idx" ON "trip_expenses"("tripId");

-- ── 20260702000005_place_submissions ──────────────────────────────────────────────
-- Migration: place_submissions table for community-submitted places
CREATE TABLE IF NOT EXISTS place_submissions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  name_en       TEXT,
  category      TEXT        NOT NULL DEFAULT 'attraction',
  province      TEXT        NOT NULL,
  address       TEXT,
  phone         TEXT,
  website       TEXT,
  description   TEXT,
  google_maps_url TEXT,
  submitter_note  TEXT,
  submitted_by  TEXT,          -- Supabase user ID (nullable for anon)
  status        TEXT        NOT NULL DEFAULT 'pending',   -- pending | approved | rejected
  admin_note    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_place_submissions_status ON place_submissions(status);
CREATE INDEX IF NOT EXISTS idx_place_submissions_province ON place_submissions(province);


-- ── Performance Indexes (Day 35 — 2026-07-03) ────────────────────────────────
-- NOTE: places/posts/notifications use Prisma's default camelCase columns
-- (unlike the expense_* tables) — index definitions below were originally
-- written with snake_case names that don't exist and would fail; fixed here.
-- Place queries (explore, province, category filter)
CREATE INDEX IF NOT EXISTS idx_places_province_category ON places("province", "category");
CREATE INDEX IF NOT EXISTS idx_places_featured_published ON places("isFeatured", "isPublished");
CREATE INDEX IF NOT EXISTS idx_places_category_published ON places("category", "isPublished");

-- Post feed queries (ordered by date per user)
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_posts_place ON posts("placeId");
CREATE INDEX IF NOT EXISTS idx_posts_public_created ON posts("isPublic", "createdAt" DESC);

-- Notification unread queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_date ON notifications("userId", "isRead", "createdAt" DESC);

-- ── 20260710000001_system_posts_and_interest_ranking (Sprint S16 — 2026-07-10) ──

-- users: system account flag
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "isSystemAccount" BOOLEAN NOT NULL DEFAULT false;

-- posts: PostType enum + system post fields
DO $$ BEGIN
  CREATE TYPE "PostType" AS ENUM ('user', 'place_highlight', 'trip_idea');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "postType" "PostType" NOT NULL DEFAULT 'user';
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "isSystemPost" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "posts_isSystemPost_postType_idx" ON "posts"("isSystemPost", "postType");

-- trips: interest tags for ranking
ALTER TABLE "trips" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';

-- expense_groups: invite code + 1:1 trip link
-- (expense_groups/expense_group_members/expenses/expense_splits/payment_records use
--  snake_case columns — created via Management API, not `prisma migrate`. schema.prisma
--  now has explicit @map(...) on every field in those 5 models to match.)
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

-- ─── Sprint S17: group_chat_schema ───────────────────────────────────────────
-- Migration: 20260710000002_group_chat_schema
-- Adds name, avatarUrl, tripId to conversations for 1:1 trip group chat support

ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "name"       TEXT,
  ADD COLUMN IF NOT EXISTS "avatar_url" TEXT,
  ADD COLUMN IF NOT EXISTS "tripId"     TEXT;

-- Unique constraint: 1 trip → 1 group conversation
DO $$ BEGIN
  ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tripId_key" UNIQUE ("tripId");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- FK: conversations.tripId → trips.id (SET NULL on delete so chat persists after trip delete)
DO $$ BEGIN
  ALTER TABLE "conversations"
    ADD CONSTRAINT "conversations_tripId_fkey"
    FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ── S22: Push Notifications ──────────────────────────────────────────────────
-- 20260714000001_push_subscriptions
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pushSubscription" TEXT;

-- ── S23: Story Reactions ──────────────────────────────────────────────────────
-- 20260714000002_story_reactions
CREATE TABLE IF NOT EXISTS "story_reactions" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "storyId"   TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "emoji"     TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "story_reactions_storyId_fkey"
    FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE,
  CONSTRAINT "story_reactions_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "story_reactions_storyId_userId_key"
    UNIQUE ("storyId", "userId")
);

CREATE INDEX IF NOT EXISTS "idx_story_reactions_storyId" ON "story_reactions"("storyId");
CREATE INDEX IF NOT EXISTS "idx_story_reactions_userId" ON "story_reactions"("userId");
