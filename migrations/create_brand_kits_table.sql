-- Migration: Create brand_kits table
-- Description: Store user brand configurations (logo, colors) for PostGenerator
-- Author: Taylored Solutions
-- Created: 2026-01-31

CREATE TABLE IF NOT EXISTS brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_brand_kits_user_id ON brand_kits(user_id);
CREATE INDEX idx_brand_kits_is_default ON brand_kits(user_id, is_default) WHERE is_default = true;

-- Row Level Security Policies
ALTER TABLE brand_kits ENABLE ROW LEVEL SECURITY;

-- Users can view their own brand kits
CREATE POLICY "Users can view own brand kits"
  ON brand_kits
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own brand kits
CREATE POLICY "Users can create own brand kits"
  ON brand_kits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own brand kits
CREATE POLICY "Users can update own brand kits"
  ON brand_kits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own brand kits
CREATE POLICY "Users can delete own brand kits"
  ON brand_kits
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to ensure only one default brand kit per user
CREATE OR REPLACE FUNCTION ensure_single_default_brand_kit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE brand_kits
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default
CREATE TRIGGER trigger_ensure_single_default_brand_kit
  BEFORE INSERT OR UPDATE ON brand_kits
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_brand_kit();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_brand_kits_updated_at
  BEFORE UPDATE ON brand_kits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON brand_kits TO authenticated;
