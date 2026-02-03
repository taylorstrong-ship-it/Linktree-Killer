# Database Migration Instructions - Pomelli Campaign Generator

## Quick Setup (3 minutes)

### Step 1: Access Supabase SQL Editor

1. Open your browser and go to: **https://supabase.com/dashboard/project/qxkicdhsrlpehgcsapsh**
2. Log in if needed
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

---

### Step 2: Apply Migration 1 - Campaigns Table

Copy and paste the entire contents below into the SQL Editor, then click **"Run"**:

```sql
-- Migration: Create campaigns table for Pomelli-style multi-format campaign bundles
-- Description: Stores 3-piece content drops (Story 9:16, Feed 1:1, Info 1:1) + AI-generated copy

CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_profile_id UUID REFERENCES brand_profiles(id) ON DELETE SET NULL,
  
  -- Campaign Metadata
  campaign_name TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  
  -- Generated Assets (3-piece bundle)
  story_image_url TEXT NOT NULL,
  feed_image_url TEXT NOT NULL,
  info_image_url TEXT NOT NULL,
  
  -- AI-Generated Copy
  caption TEXT NOT NULL,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Metadata
  vibe TEXT,
  reference_image_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_profile_id ON campaigns(brand_profile_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Row Level Security Policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns"
  ON campaigns
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON campaigns
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns
  FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON campaigns TO authenticated;
```

✅ **Expected Result:** "Success. No rows returned"

---

### Step 3: Apply Migration 2 - Extend Brand Profiles

Click **"New query"** again, then copy and paste:

```sql
-- Migration: Extend brand_profiles for Pomelli-style deep brand DNA
-- Adds fields for richer AI campaign generation

-- Add new columns
ALTER TABLE brand_profiles
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS social_handles JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS brand_voice_keywords TEXT[] DEFAULT '{}';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_industry ON brand_profiles(industry);

-- Comments
COMMENT ON COLUMN brand_profiles.industry IS 'Business type (e.g., "Restaurant", "E-commerce", "SaaS")';
COMMENT ON COLUMN brand_profiles.social_handles IS 'Social media handles {"instagram": "@handle", "tiktok": "@handle"}';
COMMENT ON COLUMN brand_profiles.brand_voice_keywords IS 'Array of brand voice attributes ["Playful", "Professional", "Bold"]';
```

✅ **Expected Result:** "Success. No rows returned"

---

### Step 4: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('campaigns', 'brand_profiles');
```

✅ **Expected Result:** Should show both tables

---

## ✅ You're Done!

Once both migrations are applied successfully, you can test the campaign generator at:

**http://localhost:3000/apps/post-generator/**

Test with:
- **Campaign Name:** "Tuesday Night Special"
- **Prompt:** "Margherita pizza special - $12 tonight only"

The system will generate 3 images + caption + hashtags in ~20-30 seconds.
