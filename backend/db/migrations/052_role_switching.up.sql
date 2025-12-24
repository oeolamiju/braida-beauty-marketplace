-- Add roles array column to support multiple roles per account
-- This allows users to have both CLIENT and FREELANCER roles simultaneously

-- Add new columns
ALTER TABLE users ADD COLUMN roles TEXT[] DEFAULT ARRAY['CLIENT']::TEXT[];
ALTER TABLE users ADD COLUMN active_role TEXT DEFAULT 'CLIENT';

-- Migrate existing data: convert single role to array
UPDATE users SET roles = ARRAY[role::TEXT]::TEXT[];

-- Add constraints
ALTER TABLE users ADD CONSTRAINT check_active_role_in_roles 
  CHECK (active_role = ANY(roles));

-- Create index for role queries
CREATE INDEX idx_users_roles ON users USING GIN(roles);
CREATE INDEX idx_users_active_role ON users(active_role);

-- Add role history tracking
CREATE TABLE role_changes (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_role TEXT,
  to_role TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by TEXT
);

CREATE INDEX idx_role_changes_user ON role_changes(user_id);
CREATE INDEX idx_role_changes_date ON role_changes(changed_at);

-- Add freelancer onboarding status tracking
CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'pending_approval', 'completed', 'rejected');

ALTER TABLE freelancer_profiles ADD COLUMN onboarding_status onboarding_status DEFAULT 'not_started';
ALTER TABLE freelancer_profiles ADD COLUMN onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE freelancer_profiles ADD COLUMN onboarding_notes TEXT;
