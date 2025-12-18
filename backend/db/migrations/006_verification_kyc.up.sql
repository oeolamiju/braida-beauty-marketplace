-- KYC Verification tables and fields

-- Add verification fields to freelancer_profiles
ALTER TABLE freelancer_profiles
  ADD COLUMN verification_legal_name TEXT,
  ADD COLUMN verification_date_of_birth DATE,
  ADD COLUMN verification_address_line1 TEXT,
  ADD COLUMN verification_address_line2 TEXT,
  ADD COLUMN verification_city TEXT,
  ADD COLUMN verification_postcode TEXT,
  ADD COLUMN verification_id_document_path TEXT,
  ADD COLUMN verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN verification_reviewed_at TIMESTAMPTZ,
  ADD COLUMN verification_reviewed_by TEXT REFERENCES users(id),
  ADD COLUMN verification_rejection_note TEXT;

-- Create index for verification status queries
CREATE INDEX idx_freelancer_verification_pending ON freelancer_profiles(verification_status, verification_submitted_at) 
  WHERE verification_status = 'pending';

-- Create verification action logs table for audit trail
CREATE TABLE verification_action_logs (
  id BIGSERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id),
  admin_id TEXT REFERENCES users(id),
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'resubmitted')),
  previous_status verification_status,
  new_status verification_status NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_logs_freelancer ON verification_action_logs(freelancer_id);
CREATE INDEX idx_verification_logs_admin ON verification_action_logs(admin_id);
CREATE INDEX idx_verification_logs_created_at ON verification_action_logs(created_at DESC);
