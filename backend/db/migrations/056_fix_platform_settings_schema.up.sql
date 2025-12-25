-- Drop the old key-value platform_settings table
DROP TABLE IF EXISTS platform_settings CASCADE;

-- Create new platform_settings table with expected columns
CREATE TABLE platform_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  full_refund_hours INTEGER NOT NULL DEFAULT 48,
  partial_refund_hours INTEGER NOT NULL DEFAULT 24,
  partial_refund_percent INTEGER NOT NULL DEFAULT 50,
  acceptance_timeout_hours INTEGER NOT NULL DEFAULT 24,
  auto_confirm_timeout_hours INTEGER NOT NULL DEFAULT 72,
  dispute_window_days INTEGER NOT NULL DEFAULT 14,
  commission_percent DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  booking_fee_pence INTEGER NOT NULL DEFAULT 200,
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
  safety_tips TEXT,
  
  -- Social Media
  facebook_url VARCHAR(255),
  instagram_url VARCHAR(255),
  twitter_url VARCHAR(255),
  tiktok_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  youtube_url VARCHAR(255),
  
  -- Support Contact
  support_email VARCHAR(255),
  support_phone VARCHAR(50),
  business_hours VARCHAR(255),
  
  -- App Configuration
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  maintenance_message TEXT,
  min_app_version VARCHAR(20),
  featured_categories TEXT,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT REFERENCES users(id),
  
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO platform_settings (id) VALUES (1);
