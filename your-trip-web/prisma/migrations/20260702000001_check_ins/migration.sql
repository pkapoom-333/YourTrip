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
