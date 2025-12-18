CREATE TABLE platform_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT REFERENCES users(id)
);

INSERT INTO platform_settings (key, value, description) VALUES
  ('commission_percentage', '{"value": 15}', 'Platform commission percentage (0-100)'),
  ('booking_fee_amount', '{"value": 2.00}', 'Fixed booking fee amount in GBP'),
  ('auto_confirm_hours', '{"value": 72}', 'Hours after which a booking is auto-confirmed if not accepted'),
  ('cancellation_free_hours', '{"value": 48}', 'Hours before booking when cancellation is free'),
  ('cancellation_partial_refund_hours', '{"value": 24}', 'Hours before booking when partial refund applies'),
  ('cancellation_partial_refund_percentage', '{"value": 50}', 'Percentage refunded for partial refunds (0-100)'),
  ('dispute_window_days', '{"value": 7}', 'Days after booking completion when disputes can be opened'),
  ('acceptance_timeout_hours', '{"value": 48}', 'Hours freelancer has to accept a booking before it auto-declines')
ON CONFLICT (key) DO NOTHING;
