-- Admin roles for RBAC
ALTER TABLE users
ADD COLUMN IF NOT EXISTS admin_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Admin audit log for tracking actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL, -- 'user', 'service', 'booking', 'dispute', etc.
    target_id VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_log(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at);

-- User last login tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- City index for multi-city support
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_city ON freelancer_profiles(city);
CREATE INDEX IF NOT EXISTS idx_freelancer_profiles_postcode ON freelancer_profiles(postcode);

-- Add indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings(created_at);

