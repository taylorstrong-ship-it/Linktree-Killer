-- Migration: Add accent_color column to profiles table
-- Date: 2026-01-23
-- Description: Adds accent_color column to support the Living Gradients feature

-- Add accent_color column for secondary gradient color
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#8b5cf6';

-- Add comment for documentation
COMMENT ON COLUMN profiles.accent_color IS 'Secondary color for Living Gradients animated background';
