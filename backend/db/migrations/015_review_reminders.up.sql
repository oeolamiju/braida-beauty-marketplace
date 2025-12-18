-- Review reminders tracking
CREATE TABLE IF NOT EXISTS review_reminders (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id),
    reminder_type VARCHAR(50) NOT NULL, -- 'first', 'second'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_review_reminders_booking ON review_reminders(booking_id);

