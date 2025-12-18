ALTER TABLE notification_preferences 
  ADD COLUMN IF NOT EXISTS review_reminder BOOLEAN NOT NULL DEFAULT true;
