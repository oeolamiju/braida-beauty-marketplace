-- Booking shares for safety feature
CREATE TABLE IF NOT EXISTS booking_shares (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    share_code VARCHAR(64) UNIQUE NOT NULL,
    shared_by VARCHAR(36) NOT NULL REFERENCES users(id),
    recipient_name VARCHAR(255) NOT NULL,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(50),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_booking_shares_code ON booking_shares(share_code);
CREATE INDEX IF NOT EXISTS idx_booking_shares_booking ON booking_shares(booking_id);

-- User emergency contacts
CREATE TABLE IF NOT EXISTS user_emergency_contacts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    relationship VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user ON user_emergency_contacts(user_id);

-- Safety alerts log
CREATE TABLE IF NOT EXISTS safety_alerts (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    triggered_by VARCHAR(36) NOT NULL REFERENCES users(id),
    alert_type VARCHAR(50) NOT NULL, -- 'emergency', 'help', 'check_in'
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    message TEXT,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'resolved', 'false_alarm'
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(36) REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_safety_alerts_booking ON safety_alerts(booking_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_user ON safety_alerts(triggered_by);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON safety_alerts(status);

-- Add Onfido fields to freelancer_profiles
ALTER TABLE freelancer_profiles 
ADD COLUMN IF NOT EXISTS onfido_applicant_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS onfido_check_id VARCHAR(255);

