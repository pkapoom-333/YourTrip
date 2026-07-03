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
