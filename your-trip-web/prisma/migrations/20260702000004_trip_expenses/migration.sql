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
