CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE TABLE notification_preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  new_booking_request BOOLEAN NOT NULL DEFAULT true,
  booking_confirmed BOOLEAN NOT NULL DEFAULT true,
  booking_cancelled BOOLEAN NOT NULL DEFAULT true,
  booking_reminder BOOLEAN NOT NULL DEFAULT true,
  message_received BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
