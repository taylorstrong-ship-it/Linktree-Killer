-- Migration: Add Newsletter Fields to Profiles Table
-- Date: 2026-01-23
-- Description: Adds newsletter_active and newsletter_heading columns to support newsletter signup block

-- Add newsletter_active column (boolean flag to enable/disable newsletter block)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS newsletter_active BOOLEAN DEFAULT false;

-- Add newsletter_heading column (customizable heading text)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS newsletter_heading TEXT DEFAULT 'Join my newsletter';

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.newsletter_active IS 'Enable/disable newsletter signup block on profile page';
COMMENT ON COLUMN public.profiles.newsletter_heading IS 'Customizable heading text for newsletter signup form';
