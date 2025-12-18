-- Cancellation policy configuration
CREATE TABLE cancellation_policies (
  id SERIAL PRIMARY KEY,
  policy_type VARCHAR(50) NOT NULL,
  hours_threshold INTEGER NOT NULL,
  refund_percentage INTEGER NOT NULL CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default client cancellation policies
INSERT INTO cancellation_policies (policy_type, hours_threshold, refund_percentage) VALUES
('client_cancel', 48, 100),
('client_cancel', 24, 50),
('client_cancel', 0, 0);

-- Freelancer cancellation penalty thresholds
CREATE TABLE freelancer_reliability_config (
  id SERIAL PRIMARY KEY,
  warning_threshold INTEGER NOT NULL DEFAULT 2,
  suspension_threshold INTEGER NOT NULL DEFAULT 5,
  time_window_days INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO freelancer_reliability_config (warning_threshold, suspension_threshold, time_window_days) 
VALUES (2, 5, 30);

-- Track freelancer cancellations for reliability scoring
CREATE TABLE freelancer_cancellation_log (
  id SERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  cancelled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  hours_before_service INTEGER NOT NULL,
  is_last_minute BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_freelancer_cancellation_log_freelancer ON freelancer_cancellation_log(freelancer_id, cancelled_at);

-- Add reschedule functionality to bookings
CREATE TABLE reschedule_requests (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  new_start_time TIMESTAMPTZ NOT NULL,
  new_end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  responded_at TIMESTAMPTZ,
  responded_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  response_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reschedule_requests_booking ON reschedule_requests(booking_id);
CREATE INDEX idx_reschedule_requests_status ON reschedule_requests(status);

-- Add cancellation tracking to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by TEXT REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS refund_percentage INTEGER;

-- Create index for cancelled bookings
CREATE INDEX idx_bookings_cancelled_by ON bookings(cancelled_by) WHERE cancelled_by IS NOT NULL;
