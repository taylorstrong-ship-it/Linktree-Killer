-- Migration: Add socials field to profiles table
-- This allows separate storage of social media profiles (Instagram, TikTok, Facebook, Email)
-- Separated from custom action links for better organization

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS socials jsonb DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.socials IS 'Social media profiles stored as JSON: {instagram, tiktok, facebook, email}';
