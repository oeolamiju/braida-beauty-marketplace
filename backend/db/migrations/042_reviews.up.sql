-- Add new columns to existing reviews table
ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_removed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS removed_by TEXT REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS removal_reason TEXT;

-- Add unique constraint on booking_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reviews_booking_id_key'
  ) THEN
    ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_key UNIQUE (booking_id);
  END IF;
END $$;

-- Create missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_reviews_client ON reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_removed ON reviews(is_removed, removed_at) WHERE is_removed;

-- Create review moderation logs table
CREATE TABLE IF NOT EXISTS review_moderation_logs (
  id SERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews(id),
  admin_id TEXT NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_moderation_review ON review_moderation_logs(review_id);
CREATE INDEX IF NOT EXISTS idx_review_moderation_admin ON review_moderation_logs(admin_id);
