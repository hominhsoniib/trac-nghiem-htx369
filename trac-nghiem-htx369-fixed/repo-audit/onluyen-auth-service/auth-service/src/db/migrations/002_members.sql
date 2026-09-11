-- 002_members.sql
-- HTX 369 member records. Admin-only access at the API layer (see members.routes.ts).
-- This is the fix for PII that was previously hard-coded in the client bundle.

CREATE TABLE IF NOT EXISTS members (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code      TEXT NOT NULL UNIQUE,
  member_type      TEXT NOT NULL DEFAULT 'ca_nhan' CHECK (member_type IN ('ca_nhan', 'phap_nhan')),
  name             TEXT NOT NULL,
  phone            TEXT,
  email            TEXT,
  tax_code         TEXT,
  representative   TEXT,
  role_label       TEXT NOT NULL DEFAULT 'Thành viên HTX 369',
  progress_count   INTEGER NOT NULL DEFAULT 0,
  exam_score       INTEGER,
  status           TEXT NOT NULL DEFAULT 'STUDYING' CHECK (status IN ('STUDYING', 'PASSED')),
  cert_id          TEXT,
  joined_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);
