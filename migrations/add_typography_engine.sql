-- Migration: Add font_style column to profiles table
-- Date: 2026-01-23
-- Description: Adds font_style column to support the Typography Engine feature

-- Add font_style column (modern, elegant, or brutal)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS font_style TEXT DEFAULT 'modern' CHECK (font_style IN ('modern', 'elegant', 'brutal'));

-- Add comment for documentation
COMMENT ON COLUMN profiles.font_style IS 'Typography Engine font style: modern (Inter), elegant (Playfair Display), or brutal (Space Mono)';
