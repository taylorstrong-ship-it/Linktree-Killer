-- Migration: Create generated_posts table
-- Description: Store history of generated social media posts
-- Author: Taylored Solutions
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS generated_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
  template TEXT NOT NULL CHECK (template IN ('bold-headline', 'split-screen', 'quote-format', 'product-showcase')),
  headline TEXT NOT NULL,
  body TEXT,
  cta TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_generated_posts_user_id ON generated_posts(user_id);
CREATE INDEX idx_generated_posts_created_at ON generated_posts(created_at DESC);
CREATE INDEX idx_generated_posts_brand_kit_id ON generated_posts(brand_kit_id);

-- Row Level Security Policies
ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

-- Users can view their own generated posts
CREATE POLICY "Users can view own posts"
  ON generated_posts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own generated posts
CREATE POLICY "Users can create own posts"
  ON generated_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generated posts
CREATE POLICY "Users can delete own posts"
  ON generated_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON generated_posts TO authenticated;
