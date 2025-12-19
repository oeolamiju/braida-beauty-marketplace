-- Add is_removed column to reviews if not exists
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS is_removed BOOLEAN DEFAULT FALSE;

-- Add removal reason
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS removal_reason TEXT,
ADD COLUMN IF NOT EXISTS removed_by VARCHAR(36),
ADD COLUMN IF NOT EXISTS removed_at TIMESTAMP WITH TIME ZONE;
