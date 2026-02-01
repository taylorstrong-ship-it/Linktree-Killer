-- PostGenerator 2.0: Create carousel_posts table
-- This table stores generated carousel posts (2-7 slides)

CREATE TABLE IF NOT EXISTS carousel_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_kit_id UUID REFERENCES brand_kits(id) ON DELETE SET NULL,
  
  -- Carousel data
  slide_count INTEGER NOT NULL CHECK (slide_count BETWEEN 2 AND 7),
  image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  slides_content JSONB NOT NULL DEFAULT '[]'::jsonb,
  template_used TEXT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_carousel_posts_user_id ON carousel_posts(user_id);
CREATE INDEX idx_carousel_posts_brand_kit_id ON carousel_posts(brand_kit_id);
CREATE INDEX idx_carousel_posts_created_at ON carousel_posts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE carousel_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own carousel posts"
  ON carousel_posts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own carousel posts"
  ON carousel_posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own carousel posts"
  ON carousel_posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own carousel posts"
  ON carousel_posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Validation function to ensure image_urls array length matches slide_count
CREATE OR REPLACE FUNCTION validate_carousel_slides()
RETURNS TRIGGER AS $$
BEGIN
  IF jsonb_array_length(NEW.image_urls) != NEW.slide_count THEN
    RAISE EXCEPTION 'image_urls array length must match slide_count';
  END IF;
  
  IF jsonb_array_length(NEW.slides_content) != NEW.slide_count THEN
    RAISE EXCEPTION 'slides_content array length must match slide_count';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carousel_posts_validate_slides
  BEFORE INSERT OR UPDATE ON carousel_posts
  FOR EACH ROW
  EXECUTE FUNCTION validate_carousel_slides();

-- Comments
COMMENT ON TABLE carousel_posts IS 'Stores generated Instagram carousel posts with 2-7 slides';
COMMENT ON COLUMN carousel_posts.slide_count IS 'Number of slides in the carousel (2-7)';
COMMENT ON COLUMN carousel_posts.image_urls IS 'Array of public URLs for generated slide images';
COMMENT ON COLUMN carousel_posts.slides_content IS 'Array of slide content objects {headline, body, cta}';
COMMENT ON COLUMN carousel_posts.template_used IS 'Template type used for generation (square, portrait, etc.)';
