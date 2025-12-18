CREATE TABLE freelancer_styles (
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style_id BIGINT NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (freelancer_id, style_id)
);

CREATE INDEX idx_freelancer_styles_freelancer ON freelancer_styles(freelancer_id);
CREATE INDEX idx_freelancer_styles_style ON freelancer_styles(style_id);
