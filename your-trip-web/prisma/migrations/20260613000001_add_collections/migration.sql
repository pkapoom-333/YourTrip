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
