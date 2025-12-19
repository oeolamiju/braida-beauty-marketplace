CREATE TABLE IF NOT EXISTS service_images (
  id SERIAL PRIMARY KEY,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(service_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_service_images_service_id ON service_images(service_id);
