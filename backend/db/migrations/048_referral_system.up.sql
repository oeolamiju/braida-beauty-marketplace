-- Referral System

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  reward_amount DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  reward_type VARCHAR(20) NOT NULL DEFAULT 'credit' CHECK (reward_type IN ('credit', 'discount_percent', 'discount_fixed')),
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id SERIAL PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_code_id INTEGER NOT NULL REFERENCES referral_codes(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded', 'expired')),
  referrer_reward_amount DECIMAL(10, 2),
  referee_reward_amount DECIMAL(10, 2),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (referee_id)
);

-- User credits/wallet table (for referral rewards)
CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  type VARCHAR(30) NOT NULL CHECK (type IN ('referral_reward', 'promotional', 'refund', 'compensation')),
  description TEXT,
  expires_at TIMESTAMPTZ,
  used_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referral_codes_user ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referee ON referrals(referee_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

