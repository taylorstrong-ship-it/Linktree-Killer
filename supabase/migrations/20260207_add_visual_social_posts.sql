-- Add visual_social_posts column to brand_scans table
-- Stores enhanced Instagram posts with design overlays

ALTER TABLE public.brand_scans
ADD COLUMN IF NOT EXISTS visual_social_posts JSONB;

COMMENT ON COLUMN public.brand_scans.visual_social_posts IS 'AI-enhanced social media posts with Gemini 3 design overlays (images + text)';
