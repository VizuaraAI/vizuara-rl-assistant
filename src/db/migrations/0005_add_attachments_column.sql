-- Add attachments column to messages table
-- This stores file attachments as JSONB array

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN messages.attachments IS 'Array of file attachments: [{filename, url, mimeType, storagePath}]';
