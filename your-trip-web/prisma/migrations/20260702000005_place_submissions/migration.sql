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
