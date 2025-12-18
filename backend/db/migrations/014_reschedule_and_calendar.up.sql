-- Reschedule requests table
CREATE TABLE IF NOT EXISTS reschedule_requests (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    requested_by VARCHAR(36) NOT NULL REFERENCES users(id),
    original_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    original_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    proposed_start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    proposed_end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, declined, counter_proposed, expired
    responded_by VARCHAR(36) REFERENCES users(id),
    responded_at TIMESTAMP WITH TIME ZONE,
    counter_proposed_start TIMESTAMP WITH TIME ZONE,
    counter_proposed_end TIMESTAMP WITH TIME ZONE,
    response_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reschedule_booking ON reschedule_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_reschedule_status ON reschedule_requests(status);

-- Add booking_group_id to bookings for multi-service bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_group_id VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_bookings_group ON bookings(booking_group_id) WHERE booking_group_id IS NOT NULL;

