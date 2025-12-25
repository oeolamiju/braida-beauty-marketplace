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
  
  -- Legal & Policy Content
  terms_and_conditions TEXT,
  privacy_policy TEXT,
  refund_policy TEXT,
  cancellation_policy TEXT,
  community_guidelines TEXT,
  
  -- Safety Settings
  safety_guidelines TEXT,
  emergency_contact_email VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  safety_tips JSONB DEFAULT '[]',
  
  -- Social Media Handles
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  twitter_url VARCHAR(255),
  tiktok_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  
  -- Support Contact
  support_email VARCHAR(255) DEFAULT 'support@braida.co.uk',
  support_phone VARCHAR(50),
  business_hours VARCHAR(255) DEFAULT 'Mon-Fri 9am-6pm GMT',
  
  -- App Configuration
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT,
  min_app_version VARCHAR(20),
  featured_categories JSONB DEFAULT '["hair", "makeup", "gele", "tailoring"]',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default settings row
INSERT INTO platform_settings (id, terms_and_conditions, privacy_policy, safety_guidelines) 
VALUES (1, 
  'Welcome to Braida Beauty Marketplace. By using our platform, you agree to these terms...',
  'Your privacy is important to us. This policy describes how we collect and use your data...',
  'Safety is our priority. Always meet in public places for first appointments...'
) ON CONFLICT (id) DO NOTHING;

-- Create admin_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON admin_audit_log(created_at DESC);

