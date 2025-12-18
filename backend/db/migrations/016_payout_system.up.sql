-- Drop old payouts table and indexes from migration 001
DROP INDEX IF EXISTS idx_payouts_freelancer;
DROP INDEX IF EXISTS idx_payouts_status;
DROP TABLE IF EXISTS payouts;

CREATE TABLE payout_accounts (
  id SERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_account_id VARCHAR(255) NOT NULL,
  account_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  details_submitted BOOLEAN NOT NULL DEFAULT false,
  requirements_due JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(freelancer_id),
  UNIQUE(stripe_account_id)
);

CREATE TABLE payout_settings (
  id SERIAL PRIMARY KEY,
  platform_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 15.00,
  booking_fee_fixed DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  auto_confirmation_timeout_hours INTEGER NOT NULL DEFAULT 72,
  default_payout_schedule VARCHAR(20) NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO payout_settings (id) VALUES (1);

CREATE TABLE payout_schedules (
  id SERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  schedule_type VARCHAR(20) NOT NULL DEFAULT 'weekly',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(freelancer_id)
);

CREATE TABLE payouts (
  id SERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payout_id VARCHAR(255),
  amount DECIMAL(10,2) NOT NULL,
  service_amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  booking_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  scheduled_date DATE,
  processed_date TIMESTAMP,
  error_message TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id)
);

CREATE TABLE payout_batches (
  id SERIAL PRIMARY KEY,
  batch_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payout_count INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payout_batch_items (
  id SERIAL PRIMARY KEY,
  batch_id INTEGER NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  payout_id INTEGER NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE payout_audit_logs (
  id SERIAL PRIMARY KEY,
  payout_id INTEGER NOT NULL REFERENCES payouts(id) ON DELETE CASCADE,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payout_accounts_freelancer ON payout_accounts(freelancer_id);
CREATE INDEX idx_payout_accounts_stripe ON payout_accounts(stripe_account_id);
CREATE INDEX idx_payouts_freelancer ON payouts(freelancer_id);
CREATE INDEX idx_payouts_booking ON payouts(booking_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_scheduled_date ON payouts(scheduled_date);
CREATE INDEX idx_payout_audit_logs_payout ON payout_audit_logs(payout_id);
CREATE INDEX idx_payout_audit_logs_actor ON payout_audit_logs(actor_id);
CREATE INDEX idx_payout_batch_items_batch ON payout_batch_items(batch_id);
