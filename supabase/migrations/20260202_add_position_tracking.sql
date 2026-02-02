-- Migration: Add position tracking for drag-and-drop sorting
-- Created: 2026-02-02
-- Purpose: Enable drag-and-drop reordering of links in JSONB array
-- Note: Links are stored as JSONB array in profiles.links, not a separate table
-- Position tracking will be handled in the JSONB structure within each link object

-- This migration adds a 'socials' column to profiles for social media links
-- Each social link will have a position property in its JSONB object structure

-- Add socials column if it doesn't exist (separate from links)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT '[]'::jsonb;

-- Add index for JSONB socials column for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_socials ON profiles USING GIN (socials);

-- Create helper function to ensure position exists in JSONB link objects
CREATE OR REPLACE FUNCTION ensure_link_positions()
RETURNS TRIGGER AS $$
DECLARE
  updated_links JSONB := '[]'::jsonb;
  link_item JSONB;
  idx INTEGER := 0;
BEGIN
  -- Loop through each link in the array
  FOR link_item IN SELECT * FROM jsonb_array_elements(NEW.links)
  LOOP
    -- Add position if it doesn't exist
    IF NOT (link_item ? 'position') THEN
      link_item := link_item || jsonb_build_object('position', idx);
    END IF;
    updated_links := updated_links || jsonb_build_array(link_item);
    idx := idx + 1;
  END LOOP;
  
  -- Update the NEW record
  NEW.links := updated_links;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure positions on INSERT/UPDATE
DROP TRIGGER IF EXISTS ensure_links_have_positions ON profiles;
CREATE TRIGGER ensure_links_have_positions
  BEFORE INSERT OR UPDATE OF links ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_link_positions();

-- Backfill existing profiles with position values in links
UPDATE profiles
SET links = (
  SELECT jsonb_agg(
    link || jsonb_build_object('position', row_num - 1)
  )
  FROM (
    SELECT link, ROW_NUMBER() OVER () as row_num
    FROM jsonb_array_elements(links) as link
  ) numbered_links
)
WHERE jsonb_array_length(links) > 0
AND NOT EXISTS (
  SELECT 1 
  FROM jsonb_array_elements(links) link 
  WHERE link ? 'position'
);

-- Add comments for documentation
COMMENT ON COLUMN profiles.socials IS 'Social media links as JSONB array: [{"platform": "instagram", "url": "...", "position": 0}]';
COMMENT ON FUNCTION ensure_link_positions() IS 'Ensures all link objects in profiles.links JSONB array have a position property';

