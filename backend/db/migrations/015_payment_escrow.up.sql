CREATE TYPE escrow_status AS ENUM ('held', 'released', 'refunded', 'disputed');
CREATE TYPE booking_payment_status AS ENUM ('unpaid', 'payment_pending', 'payment_failed', 'paid', 'refunded', 'partially_refunded');

ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS escrow_status escrow_status NOT NULL DEFAULT 'held';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS escrow_released_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_id TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_status TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount_pence INTEGER;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_fee_pence INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS freelancer_payout_pence INTEGER;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status booking_payment_status NOT NULL DEFAULT 'unpaid';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS auto_confirm_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_escrow_status ON payments(escrow_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_auto_confirm ON bookings(auto_confirm_at) WHERE auto_confirm_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_webhooks (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id ON payment_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed) WHERE NOT processed;
