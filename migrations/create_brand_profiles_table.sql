-- Create brand_profiles table for centralized brand identity
-- This table is shared across all Taylored Solutions apps

CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Brand Identity
  company_name TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#10B981',
  fonts JSONB DEFAULT '["Inter"]'::jsonb,
  tone TEXT DEFAULT 'professional',
  
  -- Metadata
  source_app TEXT, -- Which app created this profile (e.g., 'post_generator', 'stitch_my_vibe')
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT brand_profiles_user_id_unique UNIQUE (user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_profiles_created_at ON brand_profiles(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own brand profiles
CREATE POLICY "Users can read own brand profile"
  ON brand_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own brand profiles
CREATE POLICY "Users can insert own brand profile"
  ON brand_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own brand profiles
CREATE POLICY "Users can update own brand profile"
  ON brand_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own brand profiles
CREATE POLICY "Users can delete own brand profile"
  ON brand_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update updated_at on row update
DROP TRIGGER IF EXISTS update_brand_profiles_updated_at ON brand_profiles;
CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE brand_profiles IS 'Centralized brand identity storage for all Taylored Solutions apps';
COMMENT ON COLUMN brand_profiles.source_app IS 'App that created this profile (e.g., post_generator, stitch_my_vibe)';
COMMENT ON COLUMN brand_profiles.fonts IS 'Array of font names in JSON format';
COMMENT ON COLUMN brand_profiles.tone IS 'Brand voice/tone (e.g., professional, casual, friendly)';
