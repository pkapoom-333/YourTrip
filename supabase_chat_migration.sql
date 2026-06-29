-- ============================================================
-- YourTrip Chat Migration
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/wujunlagtipvbzappuwx/sql
-- ============================================================

-- 1. conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
  "id"        TEXT NOT NULL,
  "type"      TEXT NOT NULL DEFAULT 'direct',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- 2. conversation_participants table
CREATE TABLE IF NOT EXISTS "conversation_participants" (
  "conversationId" TEXT NOT NULL,
  "userId"         TEXT NOT NULL,
  "lastReadAt"     TIMESTAMP(3),
  CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("conversationId", "userId")
);

-- 3. messages table
CREATE TABLE IF NOT EXISTS "messages" (
  "id"             TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderId"       TEXT NOT NULL,
  "content"        TEXT NOT NULL,
  "type"           TEXT NOT NULL DEFAULT 'text',
  "mediaUrl"       TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- 4. Foreign key constraints
ALTER TABLE "conversation_participants"
  ADD CONSTRAINT IF NOT EXISTS "conversation_participants_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "conversation_participants"
  ADD CONSTRAINT IF NOT EXISTS "conversation_participants_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages"
  ADD CONSTRAINT IF NOT EXISTS "messages_conversationId_fkey"
    FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages"
  ADD CONSTRAINT IF NOT EXISTS "messages_senderId_fkey"
    FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS "messages_conversationId_createdAt_idx" ON "messages" ("conversationId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "conversation_participants_userId_idx" ON "conversation_participants" ("userId");

-- 6. Enable Row Level Security
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversation_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;

-- 7. RLS policies (allow all — Prisma handles auth logic)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'allow_all_conversations') THEN
    CREATE POLICY "allow_all_conversations" ON "conversations" FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_participants' AND policyname = 'allow_all_participants') THEN
    CREATE POLICY "allow_all_participants" ON "conversation_participants" FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'allow_all_messages') THEN
    CREATE POLICY "allow_all_messages" ON "messages" FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 8. Enable Realtime for messages (so Supabase Realtime subscriptions work)
ALTER PUBLICATION supabase_realtime ADD TABLE "messages";
