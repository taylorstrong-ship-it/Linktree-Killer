-- PostGenerator 2.0: Update brand_kits table
-- Add style_profile_id column to link brand kits with style profiles

-- Add the new column
ALTER TABLE brand_kits
ADD COLUMN IF NOT EXISTS style_profile_id UUID REFERENCES style_profiles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_brand_kits_style_profile_id ON brand_kits(style_profile_id);

-- Comment
COMMENT ON COLUMN brand_kits.style_profile_id IS 'Optional reference to AI-analyzed style profile';
