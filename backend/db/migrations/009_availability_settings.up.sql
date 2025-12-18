-- Add freelancer availability settings table
CREATE TABLE freelancer_availability_settings (
  freelancer_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  min_lead_time_hours INTEGER NOT NULL DEFAULT 0,
  max_bookings_per_day INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index on updated_at for tracking changes
CREATE INDEX idx_availability_settings_updated ON freelancer_availability_settings(updated_at);
