ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declined_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS declined_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS booking_audit_logs (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_booking ON booking_audit_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_audit_logs_created ON booking_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_expires_at ON bookings(expires_at) WHERE status = 'pending';
