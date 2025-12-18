CREATE TABLE freelancer_portfolio (
  id BIGSERIAL PRIMARY KEY,
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_freelancer_portfolio_freelancer ON freelancer_portfolio(freelancer_id);
CREATE INDEX idx_freelancer_portfolio_order ON freelancer_portfolio(freelancer_id, display_order);
