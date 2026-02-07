-- Brand DNA v4.0: Add AI-Powered Brand Intelligence Fields
-- Migration adds comprehensive brand voice, personality, and social media example storage

-- Add brand voice and personality analysis fields
ALTER TABLE brand_scans 
ADD COLUMN IF NOT EXISTS brand_voice TEXT,
ADD COLUMN IF NOT EXISTS tone_score INTEGER CHECK (tone_score >= 1 AND tone_score <= 10),
ADD COLUMN IF NOT EXISTS personality_traits TEXT[],
ADD COLUMN IF NOT EXISTS brand_archetype TEXT,
ADD COLUMN IF NOT EXISTS writing_style JSONB;

-- Add social media examples field
ALTER TABLE brand_scans 
ADD COLUMN IF NOT EXISTS social_media_examples JSONB;

-- Add helpful comments
COMMENT ON COLUMN brand_scans.brand_voice IS 'AI-analyzed brand communication style (e.g., "Warm and welcoming with playful edge")';
COMMENT ON COLUMN brand_scans.tone_score IS 'Formality scale 1-10 where 1=Corporate, 10=Super Casual';
COMMENT ON COLUMN brand_scans.personality_traits IS 'Array of 3-5 personality adjectives (e.g., ["Friendly", "Energetic"])';
COMMENT ON COLUMN brand_scans.brand_archetype IS 'Brand archetype classification (e.g., "The Caregiver", "The Explorer")';
COMMENT ON COLUMN brand_scans.writing_style IS 'JSON object: {sentence_length, vocabulary, uses_emojis, uses_humor}';
COMMENT ON COLUMN brand_scans.social_media_examples IS 'Array of 3 AI-generated example posts matching brand voice';

-- Example social_media_examples structure:
-- [
--   {
--     "type": "product_highlight",
--     "caption": "Fresh cuts, fresh vibes ✨",
--     "visual_description": "Close-up of stylist working on balayage",
--     "cta": "Book Now",
--     "hashtags": ["#hairgoals", "#salonlife"]
--   }
-- ]
