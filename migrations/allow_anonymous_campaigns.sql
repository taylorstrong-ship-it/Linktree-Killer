-- Migration: Make user_id nullable in campaigns table for anonymous usage
-- Description: Allows campaign generation without requiring authentication
-- Author: Taylored Solutions  
-- Created: 2026-02-02

ALTER TABLE campaigns ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow anonymous inserts
DROP POLICY IF EXISTS "Users can create own campaigns" ON campaigns;
CREATE POLICY "Allow anonymous campaign creation"
  ON campaigns
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts (service role key handles auth in Edge Function)

-- Grant permissions for anonymous access
GRANT INSERT ON campaigns TO anon;

COMMENT ON COLUMN campaigns.user_id IS 'Optional user ID. NULL for anonymous/guest generations';
