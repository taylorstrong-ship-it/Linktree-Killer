-- Migration: Add social links and business type to brand_profiles
-- Created: 2026-02-02

-- Add new columns for comprehensive brand DNA
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS business_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS suggested_ctas JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS color_scheme TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS typography JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS accent_color TEXT,
ADD COLUMN IF NOT EXISTS background_color TEXT,
ADD COLUMN IF NOT EXISTS text_primary_color TEXT,
ADD COLUMN IF NOT EXISTS text_secondary_color TEXT;

-- Update existing records with empty arrays/defaults
UPDATE brand_profiles
SET 
    social_links = COALESCE(social_links, '[]'::jsonb),
    business_type = COALESCE(business_type, 'general'),
    suggested_ctas = COALESCE(suggested_ctas, '[]'::jsonb),
    color_scheme = COALESCE(color_scheme, 'light'),
    typography = COALESCE(typography, '{}'::jsonb)
WHERE social_links IS NULL 
   OR business_type IS NULL 
   OR suggested_ctas IS NULL;

-- Add index for business_type queries
CREATE INDEX IF NOT EXISTS idx_brand_profiles_business_type ON brand_profiles(business_type);

-- Add comment
COMMENT ON COLUMN brand_profiles.social_links IS 'Array of social media platform links: [{"platform": "instagram", "url": "..."}]';
COMMENT ON COLUMN brand_profiles.business_type IS 'Detected business type: salon, restaurant, ecommerce, services, portfolio, general';
COMMENT ON COLUMN brand_profiles.suggested_ctas IS 'Smart CTAs based on business type: [{"label": "Book Now", "url": "...", "icon": "fa-calendar"}]';
