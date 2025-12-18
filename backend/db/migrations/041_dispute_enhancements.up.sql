-- Enhance disputes table with resolution details
ALTER TABLE disputes 
ADD COLUMN IF NOT EXISTS resolution_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS resolution_refund_amount INTEGER,
ADD COLUMN IF NOT EXISTS resolution_note TEXT,
ADD COLUMN IF NOT EXISTS resolved_by VARCHAR(36) REFERENCES users(id),
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;

-- Dispute notes table for admin communication
CREATE TABLE IF NOT EXISTS dispute_notes (
    id SERIAL PRIMARY KEY,
    dispute_id VARCHAR(36) NOT NULL REFERENCES disputes(id),
    author_id VARCHAR(36) NOT NULL REFERENCES users(id),
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dispute_notes_dispute ON dispute_notes(dispute_id);

