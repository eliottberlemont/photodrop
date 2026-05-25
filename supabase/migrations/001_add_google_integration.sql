-- ============================================================
-- Run this in your Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- 1. Add retention_days to existing businesses table
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS retention_days INTEGER NOT NULL DEFAULT 30;

-- Allow photographers to read their own businesses
-- (skip if you already have this policy)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'businesses' AND policyname = 'owner_select'
  ) THEN
    ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "owner_select" ON businesses
      FOR SELECT USING (auth.uid() = owner_id);
  END IF;
END $$;

-- ============================================================
-- 2. Google OAuth tokens (one row per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS google_tokens (
  user_id       UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token  TEXT        NOT NULL,
  refresh_token TEXT        NOT NULL,
  token_expiry  TIMESTAMPTZ NOT NULL,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select" ON google_tokens
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON google_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update" ON google_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- 3. Track every uploaded file for retention enforcement
-- ============================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES auth.users(id),
  business_id       UUID        REFERENCES businesses(id),
  drive_file_id     TEXT        NOT NULL,
  file_name         TEXT        NOT NULL,
  drive_folder_path TEXT,
  customer_email    TEXT,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ
);

ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select" ON uploaded_files
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_insert" ON uploaded_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index so the cleanup query stays fast as the table grows
CREATE INDEX IF NOT EXISTS idx_uploaded_files_expires
  ON uploaded_files (expires_at)
  WHERE deleted_at IS NULL;
