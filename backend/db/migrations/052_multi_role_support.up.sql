-- Migration 052: Multi-role support for users
-- Allows users to have both CLIENT and FREELANCER roles simultaneously

-- Add roles array column (stores multiple roles as JSONB array)
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles JSONB DEFAULT '["CLIENT"]'::jsonb;

-- Add active_role column to track which role is currently active
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_role VARCHAR(20) DEFAULT 'CLIENT';

-- Add freelancer_onboarding_status to track freelancer upgrade progress
ALTER TABLE users ADD COLUMN IF NOT EXISTS freelancer_onboarding_status VARCHAR(20) DEFAULT NULL;

-- Add freelancer_onboarding_completed_at timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS freelancer_onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- Migrate existing data: populate roles array from existing role column
UPDATE users 
SET roles = CASE 
  WHEN role = 'ADMIN' THEN '["CLIENT", "FREELANCER", "ADMIN"]'::jsonb
  WHEN role = 'FREELANCER' THEN '["CLIENT", "FREELANCER"]'::jsonb
  ELSE '["CLIENT"]'::jsonb
END,
active_role = role::VARCHAR
WHERE roles IS NULL OR roles = '["CLIENT"]'::jsonb;

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN (roles);
CREATE INDEX IF NOT EXISTS idx_users_active_role ON users (active_role);

-- Add function to check if user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(user_roles JSONB, role_to_check VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_roles ? role_to_check;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment for documentation
COMMENT ON COLUMN users.roles IS 'Array of roles the user has: CLIENT, FREELANCER, ADMIN';
COMMENT ON COLUMN users.active_role IS 'Currently active role for the session';
COMMENT ON COLUMN users.freelancer_onboarding_status IS 'Status of freelancer upgrade: pending, in_progress, completed, rejected';

