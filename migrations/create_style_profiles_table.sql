-- PostGenerator 2.0: Create style_profiles table
-- This table stores AI-analyzed visual styles from example posts

CREATE TABLE IF NOT EXISTS style_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE CASCADE,
  
  -- AI-extracted style data
  dominant_colors JSONB NOT NULL DEFAULT '[]'::jsonb,
  text_style JSONB NOT NULL DEFAULT '{}'::jsonb,
  layout_pattern TEXT,
  visual_style TEXT,
  brand_voice TEXT,
  
  -- Example images used for analysis (URLs)
  example_images JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_style_profiles_user_id ON style_profiles(user_id);
CREATE INDEX idx_style_profiles_brand_kit_id ON style_profiles(brand_kit_id);
CREATE INDEX idx_style_profiles_created_at ON style_profiles(created_at DESC);

-- Enable Row Level Security
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own style profiles"
  ON style_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own style profiles"
  ON style_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own style profiles"
  ON style_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own style profiles"
  ON style_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_style_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER style_profiles_updated_at
  BEFORE UPDATE ON style_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_style_profiles_updated_at();

-- Comments
COMMENT ON TABLE style_profiles IS 'Stores AI-analyzed visual style profiles from example social media posts';
COMMENT ON COLUMN style_profiles.dominant_colors IS 'Array of hex color codes extracted from example posts';
COMMENT ON COLUMN style_profiles.text_style IS 'JSON object describing text placement, weight, alignment';
COMMENT ON COLUMN style_profiles.layout_pattern IS 'Common layout pattern (e.g., text-over-image, split-screen)';
COMMENT ON COLUMN style_profiles.visual_style IS 'Overall visual aesthetic (e.g., minimalist, bold, playful)';
COMMENT ON COLUMN style_profiles.brand_voice IS 'Tone and voice characteristics (e.g., professional yet friendly)';
