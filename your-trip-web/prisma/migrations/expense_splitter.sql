-- Expense Splitter Migration
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS expense_groups (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT NOT NULL,
  description  TEXT,
  emoji        TEXT NOT NULL DEFAULT '💰',
  trip_id      TEXT,
  created_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_group_members (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id     TEXT NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
  user_id      TEXT REFERENCES users(id),
  name         TEXT NOT NULL,
  avatar_url   TEXT,
  prompt_pay   TEXT,
  bank_account TEXT,
  bank_name    TEXT,
  color        TEXT NOT NULL DEFAULT '#398AB9'
);

CREATE TABLE IF NOT EXISTS expenses (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id   TEXT NOT NULL REFERENCES expense_groups(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  amount     DOUBLE PRECISION NOT NULL,
  currency   TEXT NOT NULL DEFAULT 'THB',
  paid_by_id TEXT NOT NULL REFERENCES expense_group_members(id),
  split_type TEXT NOT NULL DEFAULT 'equal',
  notes      TEXT,
  category   TEXT NOT NULL DEFAULT 'general',
  date       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_splits (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  member_id  TEXT NOT NULL REFERENCES expense_group_members(id) ON DELETE CASCADE,
  amount     DOUBLE PRECISION NOT NULL,
  is_paid    BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (expense_id, member_id)
);

CREATE TABLE IF NOT EXISTS payment_records (
  id       TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  group_id TEXT NOT NULL,
  from_id  TEXT NOT NULL REFERENCES expense_group_members(id),
  to_id    TEXT NOT NULL REFERENCES expense_group_members(id),
  amount   DOUBLE PRECISION NOT NULL,
  note     TEXT,
  paid_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE expense_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies (open for authenticated users for now — tighten in Phase 2)
CREATE POLICY "auth can do all on expense_groups" ON expense_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth can do all on expense_group_members" ON expense_group_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth can do all on expenses" ON expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth can do all on expense_splits" ON expense_splits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth can do all on payment_records" ON payment_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
