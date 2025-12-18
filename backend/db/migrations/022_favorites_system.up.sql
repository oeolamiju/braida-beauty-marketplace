-- Favorites/Saved Freelancers System

-- Favorite freelancers table
CREATE TABLE IF NOT EXISTS favorite_freelancers (
  id SERIAL PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_id, freelancer_id)
);

-- Favorite services table
CREATE TABLE IF NOT EXISTS favorite_services (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, service_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_favorite_freelancers_client ON favorite_freelancers(client_id);
CREATE INDEX IF NOT EXISTS idx_favorite_freelancers_freelancer ON favorite_freelancers(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_favorite_services_user ON favorite_services(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_services_service ON favorite_services(service_id);

