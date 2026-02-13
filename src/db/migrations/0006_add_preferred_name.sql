-- Add preferred_name column to users table
-- This stores how the student prefers to be addressed (e.g., "Raj" instead of "Rajesh Kumar")

ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_name VARCHAR(100);

-- Add comment for documentation
COMMENT ON COLUMN users.preferred_name IS 'How the student prefers to be addressed in conversations';
