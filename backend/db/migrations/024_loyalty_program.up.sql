-- Loyalty Program System

-- Loyalty tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  min_points INTEGER NOT NULL,
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  benefits JSONB NOT NULL DEFAULT '[]',
  badge_color VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO loyalty_tiers (name, min_points, discount_percent, benefits, badge_color) VALUES
  ('Bronze', 0, 0, '["Priority support"]', '#CD7F32'),
  ('Silver', 500, 2, '["Priority support", "Early access to new stylists"]', '#C0C0C0'),
  ('Gold', 2000, 5, '["Priority support", "Early access to new stylists", "Free rescheduling"]', '#FFD700'),
  ('Platinum', 5000, 10, '["Priority support", "Early access to new stylists", "Free rescheduling", "Exclusive offers"]', '#E5E4E2')
ON CONFLICT (name) DO NOTHING;

-- User loyalty points
CREATE TABLE IF NOT EXISTS user_loyalty (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_points INTEGER NOT NULL DEFAULT 0,
  tier_id INTEGER REFERENCES loyalty_tiers(id),
  tier_achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Points transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('earned_booking', 'earned_review', 'earned_referral', 'spent', 'expired', 'bonus', 'adjustment')),
  description TEXT,
  booking_id INTEGER REFERENCES bookings(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_loyalty_user ON user_loyalty(user_id);
CREATE INDEX IF NOT EXISTS idx_user_loyalty_tier ON user_loyalty(tier_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(type);

