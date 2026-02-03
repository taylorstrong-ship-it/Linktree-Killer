-- Migration: Create campaigns table for Pomelli-style multi-format campaign bundles
-- Description: Stores 3-piece content drops (Story 9:16, Feed 1:1, Info 1:1) + AI-generated copy
-- Author: Taylored Solutions
-- Created: 2026-02-02

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  
  -- Campaign Metadata
  campaign_name TEXT NOT NULL,
  user_prompt TEXT NOT NULL, -- Original user input (e.g., "Pizza special $12 tonight")
  
  -- Generated Assets (3-piece bundle)
  story_image_url TEXT NOT NULL,  -- 9:16 vertical "The Hype"
  feed_image_url TEXT NOT NULL,   -- 1:1 square "The Hero"
  info_image_url TEXT NOT NULL,   -- 1:1 text overlay "The Details"
  
  -- AI-Generated Copy
  caption TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  vibe TEXT, -- Store for regeneration (industrial, luxury, street)
  reference_image_url TEXT, -- Optional user-uploaded reference
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_profile_id ON campaigns(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Row Level Security Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Users can view their own campaigns
CREATE POLICY "Users can view own campaigns"
  ON campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own campaigns
CREATE POLICY "Users can create own campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own campaigns
CREATE POLICY "Users can delete own campaigns"
  ON campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON campaigns TO authenticated;

-- Comments
COMMENT ON TABLE campaigns IS 'Pomelli-style multi-format campaign bundles (Story + Feed + Info)';
COMMENT ON COLUMN campaigns.story_image_url IS '9:16 vertical image for Instagram Stories';
COMMENT ON COLUMN campaigns.feed_image_url IS '1:1 square image for Instagram Feed';
COMMENT ON COLUMN campaigns.info_image_url IS '1:1 text-heavy info slide';
COMMENT ON COLUMN campaigns.caption IS 'AI-generated scroll-stopping caption';
COMMENT ON COLUMN campaigns.hashtags IS 'Array of relevant hashtags';
