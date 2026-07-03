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
