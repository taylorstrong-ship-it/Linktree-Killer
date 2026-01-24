-- Migration: Add Theme Engine fields to profiles table
-- Date: 2026-01-23
-- Description: Adds background_type and video_background_url columns to support the new Theme Engine feature

-- Add background_type column (mesh or video)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS background_type TEXT DEFAULT 'mesh' CHECK (background_type IN ('mesh', 'video'));

-- Add video_background_url column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS video_background_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.background_type IS 'Theme Engine background type: mesh (animated gradient) or video';
COMMENT ON COLUMN profiles.video_background_url IS 'URL for video background when background_type is set to video';
