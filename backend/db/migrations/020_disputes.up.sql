-- Add new columns to existing disputes table
ALTER TABLE disputes
  ADD COLUMN IF NOT EXISTS resolution_type TEXT CHECK (resolution_type IN ('full_refund', 'partial_refund', 'release_to_freelancer', 'no_action')),
  ADD COLUMN IF NOT EXISTS resolution_amount INTEGER,
  ADD COLUMN IF NOT EXISTS resolution_notes TEXT,
  ADD COLUMN IF NOT EXISTS resolved_by TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Create new dispute-related tables
CREATE TABLE IF NOT EXISTS dispute_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id BIGINT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  content_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispute_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id BIGINT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  admin_id TEXT NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dispute_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id BIGINT NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL REFERENCES users(id),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON disputes(raised_by_id);
CREATE INDEX IF NOT EXISTS idx_dispute_attachments_dispute ON dispute_attachments(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_notes_dispute ON dispute_notes(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_audit_logs_dispute ON dispute_audit_logs(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_audit_logs_created ON dispute_audit_logs(created_at DESC);
