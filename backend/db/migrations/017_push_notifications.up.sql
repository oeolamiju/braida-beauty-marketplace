-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

-- Add push_enabled to notification preferences
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT true;

-- Add email preferences categories
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_marketing BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_product_updates BOOLEAN DEFAULT true;

