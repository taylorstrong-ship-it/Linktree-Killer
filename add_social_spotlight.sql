-- Add social_spotlight_url column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS social_spotlight_url TEXT;

-- Optional: Add a comment describing the column
COMMENT ON COLUMN profiles.social_spotlight_url IS 'URL for featured Instagram or TikTok post';
