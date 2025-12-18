-- Create types if they don't exist
DO $$ BEGIN
  CREATE TYPE report_issue_type AS ENUM ('safety', 'quality', 'payment', 'harassment', 'fraud', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'warned', 'suspended', 'banned');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to existing users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS account_status account_status,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ;

-- Set default for account_status if it was just added
UPDATE users SET account_status = 'active' WHERE account_status IS NULL;
ALTER TABLE users ALTER COLUMN account_status SET DEFAULT 'active';
ALTER TABLE users ALTER COLUMN account_status SET NOT NULL;

-- Create report_admin_actions table (reports table already exists from migration 001)
CREATE TABLE IF NOT EXISTS report_admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id BIGINT NOT NULL REFERENCES reports(id),
  admin_id TEXT NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  notes TEXT,
  previous_account_status account_status,
  new_account_status account_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_actions_report ON report_admin_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
