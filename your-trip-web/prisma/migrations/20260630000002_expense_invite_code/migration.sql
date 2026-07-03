-- Add inviteCode to expense_groups
ALTER TABLE "expense_groups" ADD COLUMN "inviteCode" TEXT;

-- Generate unique codes for existing groups
UPDATE "expense_groups" SET "inviteCode" = gen_random_uuid()::text WHERE "inviteCode" IS NULL;

-- Make NOT NULL and UNIQUE after backfill
ALTER TABLE "expense_groups" ALTER COLUMN "inviteCode" SET NOT NULL;
ALTER TABLE "expense_groups" ADD CONSTRAINT "expense_groups_inviteCode_key" UNIQUE ("inviteCode");
