-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    -- Cancellation policy
    full_refund_hours INTEGER DEFAULT 48,
    partial_refund_hours INTEGER DEFAULT 24,
    partial_refund_percent INTEGER DEFAULT 50,
    -- Timeouts
    acceptance_timeout_hours INTEGER DEFAULT 24,
    auto_confirm_timeout_hours INTEGER DEFAULT 72,
    dispute_window_days INTEGER DEFAULT 14,
    -- Fees
    commission_percent DECIMAL(5,2) DEFAULT 10.00,
    booking_fee_pence INTEGER DEFAULT 200,
    -- Payouts
    default_payout_schedule VARCHAR(20) DEFAULT 'weekly',
    minimum_payout_pence INTEGER DEFAULT 1000,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure only one row
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO platform_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Add is_removed column to reviews if not exists
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_removed BOOLEAN DEFAULT FALSE;

-- Add removal reason
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS removal_reason TEXT,
ADD COLUMN IF NOT EXISTS removed_by VARCHAR(36),
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE;

