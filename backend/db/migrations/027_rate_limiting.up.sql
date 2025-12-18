CREATE TABLE IF NOT EXISTS rate_limit_events (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rate_limit_events_key_created ON rate_limit_events(key, created_at);
