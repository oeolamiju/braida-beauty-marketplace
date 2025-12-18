-- Service videos table
CREATE TABLE IF NOT EXISTS service_videos (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    title VARCHAR(255),
    duration_seconds INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_videos_service ON service_videos(service_id);

