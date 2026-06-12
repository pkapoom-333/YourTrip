-- Applied manually via Supabase SQL Editor on 2026-06-12
ALTER TABLE "trip_items"
  ADD COLUMN IF NOT EXISTS "googlePlaceId" TEXT,
  ADD COLUMN IF NOT EXISTS "travelTimeTo"  INTEGER,
  ADD COLUMN IF NOT EXISTS "lat"           DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "lng"           DOUBLE PRECISION;
