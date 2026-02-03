-- Migration: Extend brand_profiles with Pomelli-style brand DNA fields
-- Description: Add industry, social handles, and brand voice keywords for richer campaign context
-- Author: Taylored Solutions
-- Created: 2026-02-02

-- Add new fields to brand_profiles
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS social_handles JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS brand_voice_keywords TEXT[] DEFAULT '{}';

-- Comments for new fields
COMMENT ON COLUMN brand_profiles.industry IS 'Business industry/category (e.g., Restaurant, Spa, Retail)';
COMMENT ON COLUMN brand_profiles.social_handles IS 'Social media usernames as JSON (e.g., {"instagram": "@brand", "facebook": "BrandPage"})';
COMMENT ON COLUMN brand_profiles.brand_voice_keywords IS 'Brand voice descriptors for AI copy generation (e.g., ["friendly", "professional", "playful"])';
