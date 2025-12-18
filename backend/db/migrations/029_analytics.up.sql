CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  event_name VARCHAR(255) NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_event ON analytics_events(user_id, event_name, created_at DESC);
CREATE INDEX idx_analytics_events_name_created ON analytics_events(event_name, created_at DESC);
