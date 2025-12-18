ALTER TABLE notification_preferences 
  ADD COLUMN IF NOT EXISTS booking_declined BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS booking_expired BOOLEAN NOT NULL DEFAULT true;
