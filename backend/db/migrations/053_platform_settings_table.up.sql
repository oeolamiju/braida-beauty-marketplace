-- Create platform_settings table for admin settings
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  -- Cancellation policy
  full_refund_hours INTEGER NOT NULL DEFAULT 48,
  partial_refund_hours INTEGER NOT NULL DEFAULT 24,
  partial_refund_percent INTEGER NOT NULL DEFAULT 50,
  -- Timeouts
  acceptance_timeout_hours INTEGER NOT NULL DEFAULT 24,
  auto_confirm_timeout_hours INTEGER NOT NULL DEFAULT 72,
  dispute_window_days INTEGER NOT NULL DEFAULT 14,
  -- Fees
  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  booking_fee_pence INTEGER NOT NULL DEFAULT 200,
  -- Payouts
  default_payout_schedule VARCHAR(20) NOT NULL DEFAULT 'weekly',
  minimum_payout_pence INTEGER NOT NULL DEFAULT 1000,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Create admin_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);

